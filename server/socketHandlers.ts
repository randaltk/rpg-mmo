import { createServer } from "http";
import { Server, Socket } from "socket.io";
import type { Item, CharacterClass, CombatEvent } from "@/types/game";
import type { ServerPlayer } from "./types";
import {
  players, monsters,
  DEFAULT_MAP, mapRoom, distanceBetween, getMonstersOnMap,
} from "./state";
import {
  VALID_CLASSES, VALID_MAPS, VALID_EQUIP_SLOTS,
  MAX_NICKNAME_LENGTH, MAX_CHAT_LENGTH,
  isString, sanitizeString, isValidPosition,
} from "./validation";
import { initMonsters, updateMonsters } from "./monsters";

export function setupSocketIO(httpServer: ReturnType<typeof createServer>): Server {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  initMonsters();
  setInterval(() => updateMonsters(io), 250);

  io.on("connection", (socket: Socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const { nickname: rawNick, characterClass: rawClass } = data as Record<string, unknown>;

      if (!isString(rawNick)) return;
      const nickname = sanitizeString(rawNick, MAX_NICKNAME_LENGTH);
      if (nickname.length === 0) return;
      if (players[socket.id]) return;

      const characterClass = (isString(rawClass) && VALID_CLASSES.has(rawClass) ? rawClass : "knight") as CharacterClass;
      const color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

      const player: ServerPlayer = {
        id: socket.id,
        nickname,
        x: 0, y: 0, z: 0,
        color,
        characterClass,
        currentMapId: DEFAULT_MAP,
        level: 1,
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        experience: 0,
        inventory: [{
          id: "potion1",
          name: "Poção de Cura",
          type: "consumable",
          rarity: "common",
          stats: { hp: 50 },
          description: "Restaura 50 pontos de vida",
          icon: "🧪",
        }],
        equipped: { weapon: undefined, armor: undefined, accessory: undefined },
      };

      players[socket.id] = player;
      socket.join(mapRoom(DEFAULT_MAP));

      const mapPlayers: Record<string, ServerPlayer> = {};
      for (const [id, p] of Object.entries(players)) {
        if (p.currentMapId === player.currentMapId) {
          mapPlayers[id] = p;
        }
      }
      socket.emit("currentPlayers", mapPlayers);
      socket.to(mapRoom(player.currentMapId)).emit("newPlayer", player);
      socket.emit("monstersUpdate", getMonstersOnMap(player.currentMapId));
    });

    socket.on("changeMap", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const { mapId } = data as Record<string, unknown>;
      if (!isString(mapId) || !VALID_MAPS.has(mapId)) return;

      const player = players[socket.id];
      if (!player || player.currentMapId === mapId) return;

      const oldMapId = player.currentMapId;
      player.currentMapId = mapId;

      socket.leave(mapRoom(oldMapId));
      socket.join(mapRoom(mapId));

      socket.to(mapRoom(oldMapId)).emit("removePlayer", socket.id);
      socket.to(mapRoom(mapId)).emit("newPlayer", player);

      const mapPlayers: Record<string, ServerPlayer> = {};
      for (const [id, p] of Object.entries(players)) {
        if (p.currentMapId === mapId) {
          mapPlayers[id] = p;
        }
      }
      socket.emit("currentPlayers", mapPlayers);
      socket.emit("monstersUpdate", getMonstersOnMap(mapId));

      for (const m of Object.values(monsters)) {
        if (m.targetPlayerId === socket.id && m.mapId !== mapId) {
          m.targetPlayerId = undefined;
          m.state = "idle";
        }
      }
    });

    socket.on("move", (pos: unknown) => {
      if (!isValidPosition(pos)) return;
      const player = players[socket.id];
      if (!player) return;

      player.x = pos.x;
      player.y = pos.y;
      player.z = pos.z;
      socket.to(mapRoom(player.currentMapId)).emit("playerMoved", player);
    });

    socket.on("attackMonster", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const { monsterId } = data as Record<string, unknown>;
      if (!isString(monsterId)) return;

      const player = players[socket.id];
      const monster = monsters[monsterId];
      if (!player || !monster || monster.state === "dead" || player.hp <= 0) return;
      if (player.currentMapId !== monster.mapId) return;

      const dist = distanceBetween(player, monster);
      if (dist > 3) return;

      const isCrit = Math.random() < 0.15;
      const rawDamage = player.attack - Math.floor(monster.defense * 0.3);
      const variance = 0.8 + Math.random() * 0.4;
      let damage = Math.max(1, Math.floor(rawDamage * variance));
      if (isCrit) damage = Math.floor(damage * 1.5);

      monster.hp = Math.max(0, monster.hp - damage);
      monster.hurtTime = Date.now();
      monster.state = "hurt";
      monster.targetPlayerId = socket.id;

      const room = mapRoom(monster.mapId);

      io.to(room).emit("combatEvent", {
        type: "playerAttack",
        attackerId: socket.id,
        targetId: monsterId,
        damage,
        isCrit,
        targetHp: monster.hp,
        targetMaxHp: monster.maxHp,
        x: monster.x, y: 1.0, z: monster.z,
      } satisfies CombatEvent);

      if (monster.hp <= 0) {
        monster.state = "dead";
        monster.deathTime = Date.now();
        player.experience += monster.expReward;

        const expForLevel = player.level * 100;
        if (player.experience >= expForLevel) {
          player.experience -= expForLevel;
          player.level += 1;
          player.maxHp += 15;
          player.hp = player.maxHp;
          player.attack += 3;
          player.defense += 2;
          io.emit("chat", { id: "system", msg: `${player.nickname} subiu para o nível ${player.level}!`, type: "system" });
        }

        io.to(room).emit("combatEvent", {
          type: "monsterDeath",
          attackerId: socket.id,
          targetId: monsterId,
          damage: 0,
          expGained: monster.expReward,
          x: monster.x, y: 1.0, z: monster.z,
        } satisfies CombatEvent);

        socket.emit("playerUpdated", player);
      }

      io.to(room).emit("monstersUpdate", getMonstersOnMap(monster.mapId));
    });

    socket.on("chat", (raw: unknown) => {
      if (!isString(raw)) return;
      const msg = sanitizeString(raw, MAX_CHAT_LENGTH);
      if (msg.length === 0) return;
      if (!players[socket.id]) return;

      io.emit("chat", { id: socket.id, msg, type: "normal" });
    });

    socket.on("interact", () => {
      socket.emit("interactionResult", { success: true, message: "Interação realizada!" });
    });

    socket.on("equipItem", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const { itemId, slot } = data as Record<string, unknown>;
      if (!isString(itemId) || !isString(slot) || !VALID_EQUIP_SLOTS.has(slot)) return;

      const player = players[socket.id];
      if (!player) return;

      const equipSlot = slot as "weapon" | "armor" | "accessory";
      const item = player.inventory.find((i: Item) => i.id === itemId);
      if (!item || (item.type !== "weapon" && item.type !== "armor" && item.type !== "accessory")) return;

      player.inventory = player.inventory.filter((i: Item) => i.id !== itemId);
      player.equipped[equipSlot] = item;

      if (item.stats.attack) player.attack += item.stats.attack;
      if (item.stats.defense) player.defense += item.stats.defense;
      if (item.stats.hp) player.maxHp += item.stats.hp;

      socket.emit("playerUpdated", player);
      socket.to(mapRoom(player.currentMapId)).emit("playerMoved", player);
    });

    socket.on("disconnect", () => {
      console.log("Player left:", socket.id);
      const player = players[socket.id];
      if (player) {
        io.to(mapRoom(player.currentMapId)).emit("removePlayer", socket.id);
      }
      delete players[socket.id];

      for (const m of Object.values(monsters)) {
        if (m.targetPlayerId === socket.id) {
          m.targetPlayerId = undefined;
          m.state = "idle";
        }
      }
    });
  });

  return io;
}
