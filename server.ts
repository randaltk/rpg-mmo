import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import type { Player, Item, Monster, MonsterSpawn, CharacterClass, CombatEvent } from "@/types/game";
import { MONSTER_SPAWNS } from "@/shared/monsterSpawns";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// --- Server-specific types ---

interface ServerPlayer extends Player {
  currentMapId: string;
}

interface ServerMonster extends Monster {
  mapId: string;
  spawnId: string;
  spawnIndex: number;
  lastAttackTime: number;
  wanderTarget: { x: number; z: number } | null;
  wanderCooldown: number;
  hurtTime: number;
  deathTime: number;
}

interface MonsterBaseStats {
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  aggroRange: number;
  attackRange: number;
  moveSpeed: number;
  attackCooldown: number;
}

interface Position {
  x: number;
  z: number;
}

// --- State ---

let players: Record<string, ServerPlayer> = {};
let monsters: Record<string, ServerMonster> = {};
let monsterIdCounter = 0;

const DEFAULT_MAP = "castle";
const MONSTER_MAP = "town";

const MONSTER_BASE_STATS: Record<Monster["type"], MonsterBaseStats> = {
  slime:    { hp: 40,  attack: 5,  defense: 2, expReward: 15, aggroRange: 5, attackRange: 1.5, moveSpeed: 0.02,  attackCooldown: 2000 },
  goblin:   { hp: 70,  attack: 10, defense: 5, expReward: 30, aggroRange: 7, attackRange: 1.8, moveSpeed: 0.03,  attackCooldown: 1500 },
  wolf:     { hp: 55,  attack: 12, defense: 3, expReward: 25, aggroRange: 9, attackRange: 1.5, moveSpeed: 0.04,  attackCooldown: 1200 },
  skeleton: { hp: 80,  attack: 14, defense: 7, expReward: 40, aggroRange: 8, attackRange: 2.0, moveSpeed: 0.025, attackCooldown: 1800 },
};

const MONSTER_NAMES: Record<Monster["type"], string> = {
  slime: "Slime",
  goblin: "Goblin",
  wolf: "Wolf",
  skeleton: "Skeleton",
};

// --- Validation ---

const VALID_CLASSES: ReadonlySet<string> = new Set<CharacterClass>([
  "knight", "paladin", "rogue", "assassin", "ranger", "wizard", "sorcerer", "priest", "monk",
]);

const VALID_MAPS: ReadonlySet<string> = new Set(["castle", "town", "cave"]);

const VALID_EQUIP_SLOTS: ReadonlySet<string> = new Set(["weapon", "armor", "accessory"]);

const MAX_NICKNAME_LENGTH = 20;
const MAX_CHAT_LENGTH = 200;
const MAX_COORDINATE = 500;

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function sanitizeString(s: string, maxLength: number): string {
  return s.trim().slice(0, maxLength);
}

function isValidPosition(pos: unknown): pos is { x: number; y: number; z: number } {
  if (!pos || typeof pos !== "object") return false;
  const p = pos as Record<string, unknown>;
  return isFiniteNumber(p.x) && isFiniteNumber(p.y) && isFiniteNumber(p.z)
    && Math.abs(p.x as number) <= MAX_COORDINATE
    && Math.abs(p.y as number) <= MAX_COORDINATE
    && Math.abs(p.z as number) <= MAX_COORDINATE;
}

// --- Helpers ---

function mapRoom(mapId: string): string {
  return `map:${mapId}`;
}

function distanceBetween(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
}

function getPlayersOnMap(mapId: string): ServerPlayer[] {
  return Object.values(players).filter(p => p.currentMapId === mapId);
}

function getMonstersOnMap(mapId: string): ServerMonster[] {
  return Object.values(monsters).filter(m => m.mapId === mapId);
}

// --- Monster Spawning ---

function spawnMonster(spawn: MonsterSpawn, index: number): ServerMonster {
  const base = MONSTER_BASE_STATS[spawn.type];
  const levelMult = 1 + (spawn.level - 1) * 0.3;
  const angle = (index / spawn.count) * Math.PI * 2 + Math.random() * 0.5;
  const dist = Math.random() * spawn.radius;
  const x = spawn.x + Math.cos(angle) * dist;
  const z = spawn.z + Math.sin(angle) * dist;
  const id = `monster_${monsterIdCounter++}`;

  const monster: ServerMonster = {
    id,
    name: MONSTER_NAMES[spawn.type],
    type: spawn.type,
    mapId: MONSTER_MAP,
    x, y: 0, z,
    hp: Math.floor(base.hp * levelMult),
    maxHp: Math.floor(base.hp * levelMult),
    attack: Math.floor(base.attack * levelMult),
    defense: Math.floor(base.defense * levelMult),
    level: spawn.level,
    expReward: Math.floor(base.expReward * levelMult),
    color: spawn.color || "#4CAF50",
    state: "idle",
    targetPlayerId: undefined,
    spawnX: spawn.x,
    spawnZ: spawn.z,
    spawnId: spawn.id,
    spawnIndex: index,
    respawnTime: 10000,
    lastAttackTime: 0,
    wanderTarget: null,
    wanderCooldown: 0,
    hurtTime: 0,
    deathTime: 0,
  };

  monsters[id] = monster;
  return monster;
}

function initMonsters(): void {
  for (const spawn of MONSTER_SPAWNS) {
    for (let i = 0; i < spawn.count; i++) {
      spawnMonster(spawn, i);
    }
  }
  console.log(`Spawned ${Object.keys(monsters).length} monsters`);
}

// --- Monster AI Loop ---

function updateMonsters(io: Server): void {
  const now = Date.now();
  const changedMaps = new Set<string>();

  for (const monster of Object.values(monsters)) {
    if (monster.state === "dead") {
      if (now - monster.deathTime > monster.respawnTime) {
        const spawn = MONSTER_SPAWNS.find(s => s.id === monster.spawnId);
        if (spawn) {
          const base = MONSTER_BASE_STATS[spawn.type];
          const levelMult = 1 + (spawn.level - 1) * 0.3;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * spawn.radius;
          monster.x = spawn.x + Math.cos(angle) * dist;
          monster.z = spawn.z + Math.sin(angle) * dist;
          monster.y = 0;
          monster.hp = Math.floor(base.hp * levelMult);
          monster.maxHp = Math.floor(base.hp * levelMult);
          monster.state = "idle";
          monster.targetPlayerId = undefined;
          monster.hurtTime = 0;
          changedMaps.add(monster.mapId);
        }
      }
      continue;
    }

    if (monster.state === "hurt" && now - monster.hurtTime > 300) {
      monster.state = monster.targetPlayerId ? "chasing" : "idle";
    }

    if (monster.state === "hurt") continue;

    const base = MONSTER_BASE_STATS[monster.type];
    const mapPlayers = getPlayersOnMap(monster.mapId);

    let nearestPlayer: ServerPlayer | null = null;
    let nearestDist = Infinity;
    for (const p of mapPlayers) {
      if (p.hp <= 0) continue;
      const d = distanceBetween(monster, p);
      if (d < nearestDist) { nearestDist = d; nearestPlayer = p; }
    }

    if (nearestPlayer && nearestDist < base.aggroRange) {
      monster.targetPlayerId = nearestPlayer.id;
      monster.state = nearestDist <= base.attackRange ? "attacking" : "chasing";
    } else {
      if (monster.targetPlayerId) {
        monster.targetPlayerId = undefined;
        monster.state = "idle";
        changedMaps.add(monster.mapId);
      }
    }

    if (monster.state === "chasing" && monster.targetPlayerId) {
      const target = players[monster.targetPlayerId];
      if (target && target.hp > 0 && target.currentMapId === monster.mapId) {
        const dx = target.x - monster.x;
        const dz = target.z - monster.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) {
          monster.x += (dx / dist) * base.moveSpeed;
          monster.z += (dz / dist) * base.moveSpeed;
          changedMaps.add(monster.mapId);
        }
        if (dist <= base.attackRange) {
          monster.state = "attacking";
        }
      } else {
        monster.targetPlayerId = undefined;
        monster.state = "idle";
      }
    }

    if (monster.state === "attacking" && monster.targetPlayerId) {
      const target = players[monster.targetPlayerId];
      if (!target || target.hp <= 0 || target.currentMapId !== monster.mapId) {
        monster.targetPlayerId = undefined;
        monster.state = "idle";
        continue;
      }

      const dist = distanceBetween(monster, target);
      if (dist > base.attackRange * 1.2) {
        monster.state = "chasing";
        continue;
      }

      if (now - monster.lastAttackTime >= base.attackCooldown) {
        monster.lastAttackTime = now;
        const rawDamage = monster.attack - Math.floor(target.defense * 0.3);
        const variance = 0.8 + Math.random() * 0.4;
        const damage = Math.max(1, Math.floor(rawDamage * variance));

        target.hp = Math.max(0, target.hp - damage);

        const room = mapRoom(monster.mapId);
        io.to(room).emit("combatEvent", {
          type: "monsterAttack",
          attackerId: monster.id,
          targetId: target.id,
          damage,
          isCrit: false,
          targetHp: target.hp,
          targetMaxHp: target.maxHp,
          x: target.x, y: target.y + 1.5, z: target.z,
        } satisfies CombatEvent);
        io.to(room).emit("playerMoved", target);

        if (target.hp <= 0) {
          monster.targetPlayerId = undefined;
          monster.state = "idle";
          io.to(room).emit("combatEvent", {
            type: "playerDeath",
            attackerId: monster.id,
            targetId: target.id,
            damage: 0,
            x: target.x, y: target.y + 1.5, z: target.z,
          } satisfies CombatEvent);

          target.hp = target.maxHp;
          target.x = 0; target.y = 0; target.z = 0;

          const targetSocket = io.sockets.sockets.get(target.id);
          if (targetSocket && target.currentMapId !== DEFAULT_MAP) {
            const oldRoom = mapRoom(target.currentMapId);
            target.currentMapId = DEFAULT_MAP;
            targetSocket.leave(oldRoom);
            targetSocket.join(mapRoom(DEFAULT_MAP));
            io.to(oldRoom).emit("removePlayer", target.id);
            io.to(mapRoom(DEFAULT_MAP)).emit("newPlayer", target);
          }

          setTimeout(() => {
            io.to(mapRoom(target.currentMapId)).emit("playerMoved", target);
          }, 2000);
        }
      }
    }

    if (monster.state === "idle") {
      if (now > monster.wanderCooldown) {
        if (!monster.wanderTarget) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 2 + Math.random() * 4;
          monster.wanderTarget = {
            x: monster.spawnX + Math.cos(angle) * dist,
            z: monster.spawnZ + Math.sin(angle) * dist,
          };
        }
        const dx = monster.wanderTarget.x - monster.x;
        const dz = monster.wanderTarget.z - monster.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < 0.3) {
          monster.wanderTarget = null;
          monster.wanderCooldown = now + 2000 + Math.random() * 3000;
          monster.state = "idle";
        } else {
          monster.x += (dx / d) * base.moveSpeed * 0.5;
          monster.z += (dz / d) * base.moveSpeed * 0.5;
          monster.state = "wandering";
        }
        changedMaps.add(monster.mapId);
      }
    }

    if (monster.state === "wandering" && monster.wanderTarget) {
      const dx = monster.wanderTarget.x - monster.x;
      const dz = monster.wanderTarget.z - monster.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < 0.3) {
        monster.wanderTarget = null;
        monster.wanderCooldown = now + 2000 + Math.random() * 3000;
        monster.state = "idle";
      } else {
        monster.x += (dx / d) * base.moveSpeed * 0.5;
        monster.z += (dz / d) * base.moveSpeed * 0.5;
      }
      changedMaps.add(monster.mapId);
    }
  }

  changedMaps.forEach(mapId => {
    io.to(mapRoom(mapId)).emit("monstersUpdate", getMonstersOnMap(mapId));
  });
}

// --- Socket.IO Setup ---

function setupSocketIO(httpServer: ReturnType<typeof createServer>): Server {
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

// --- Server Start ---

app.prepare().then(() => {
  const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  setupSocketIO(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`> Server running at http://localhost:${port}`);
    console.log(`> Next.js + Socket.io unified`);
    console.log(`> Mode: ${dev ? "development" : "production"}`);
  });
});
