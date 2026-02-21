import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let players = {};
let monsters = {};
let monsterIdCounter = 0;

const MONSTER_BASE_STATS = {
  slime: { hp: 40, attack: 5, defense: 2, expReward: 15, aggroRange: 5, attackRange: 1.5, moveSpeed: 0.02, attackCooldown: 2000 },
  goblin: { hp: 70, attack: 10, defense: 5, expReward: 30, aggroRange: 7, attackRange: 1.8, moveSpeed: 0.03, attackCooldown: 1500 },
  wolf: { hp: 55, attack: 12, defense: 3, expReward: 25, aggroRange: 9, attackRange: 1.5, moveSpeed: 0.04, attackCooldown: 1200 },
  skeleton: { hp: 80, attack: 14, defense: 7, expReward: 40, aggroRange: 8, attackRange: 2.0, moveSpeed: 0.025, attackCooldown: 1800 },
};

const MONSTER_SPAWNS = [
  { id: "spawn_slime_1", type: "slime", x: 15, z: 20, count: 3, radius: 8, level: 1, color: "#4CAF50" },
  { id: "spawn_slime_2", type: "slime", x: -25, z: -15, count: 3, radius: 8, level: 2, color: "#2196F3" },
  { id: "spawn_slime_3", type: "slime", x: 30, z: -25, count: 2, radius: 6, level: 3, color: "#E91E63" },
  { id: "spawn_goblin_1", type: "goblin", x: -35, z: 25, count: 2, radius: 6, level: 3, color: "#5D8C3E" },
  { id: "spawn_goblin_2", type: "goblin", x: 40, z: 10, count: 2, radius: 6, level: 4, color: "#7A6A3A" },
];

function spawnMonster(spawn, index) {
  const base = MONSTER_BASE_STATS[spawn.type];
  const levelMult = 1 + (spawn.level - 1) * 0.3;
  const angle = (index / spawn.count) * Math.PI * 2 + Math.random() * 0.5;
  const dist = Math.random() * spawn.radius;
  const x = spawn.x + Math.cos(angle) * dist;
  const z = spawn.z + Math.sin(angle) * dist;
  const id = `monster_${monsterIdCounter++}`;

  const monster = {
    id,
    name: spawn.type === "slime" ? "Slime" : spawn.type === "goblin" ? "Goblin" : spawn.type.charAt(0).toUpperCase() + spawn.type.slice(1),
    type: spawn.type,
    x, y: 0, z,
    hp: Math.floor(base.hp * levelMult),
    maxHp: Math.floor(base.hp * levelMult),
    attack: Math.floor(base.attack * levelMult),
    defense: Math.floor(base.defense * levelMult),
    level: spawn.level,
    expReward: Math.floor(base.expReward * levelMult),
    color: spawn.color || "#4CAF50",
    state: "idle",
    targetPlayerId: null,
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

function initMonsters() {
  for (const spawn of MONSTER_SPAWNS) {
    for (let i = 0; i < spawn.count; i++) {
      spawnMonster(spawn, i);
    }
  }
  console.log(`Spawned ${Object.keys(monsters).length} monsters`);
}

function distanceBetween(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
}

function updateMonsters(io) {
  const now = Date.now();
  const playerList = Object.values(players);
  const changed = [];

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
          monster.targetPlayerId = null;
          monster.hurtTime = 0;
          changed.push(monster);
        }
      }
      continue;
    }

    if (monster.state === "hurt" && now - monster.hurtTime > 300) {
      monster.state = monster.targetPlayerId ? "chasing" : "idle";
    }

    if (monster.state === "hurt") continue;

    const base = MONSTER_BASE_STATS[monster.type];

    let nearestPlayer = null;
    let nearestDist = Infinity;
    for (const p of playerList) {
      if (p.hp <= 0) continue;
      const d = distanceBetween(monster, p);
      if (d < nearestDist) { nearestDist = d; nearestPlayer = p; }
    }

    if (nearestPlayer && nearestDist < base.aggroRange) {
      monster.targetPlayerId = nearestPlayer.id;
      monster.state = nearestDist <= base.attackRange ? "attacking" : "chasing";
    } else {
      if (monster.targetPlayerId) {
        monster.targetPlayerId = null;
        monster.state = "idle";
        changed.push(monster);
      }
    }

    if (monster.state === "chasing" && monster.targetPlayerId) {
      const target = players[monster.targetPlayerId];
      if (target && target.hp > 0) {
        const dx = target.x - monster.x;
        const dz = target.z - monster.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) {
          monster.x += (dx / dist) * base.moveSpeed;
          monster.z += (dz / dist) * base.moveSpeed;
          changed.push(monster);
        }
        if (dist <= base.attackRange) {
          monster.state = "attacking";
        }
      } else {
        monster.targetPlayerId = null;
        monster.state = "idle";
      }
    }

    if (monster.state === "attacking" && monster.targetPlayerId) {
      const target = players[monster.targetPlayerId];
      if (!target || target.hp <= 0) {
        monster.targetPlayerId = null;
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

        const combatEvent = {
          type: "monsterAttack",
          attackerId: monster.id,
          targetId: target.id,
          damage,
          isCrit: false,
          targetHp: target.hp,
          targetMaxHp: target.maxHp,
          x: target.x, y: target.y + 1.5, z: target.z,
        };
        io.emit("combatEvent", combatEvent);
        io.emit("playerMoved", target);

        if (target.hp <= 0) {
          monster.targetPlayerId = null;
          monster.state = "idle";
          io.emit("combatEvent", {
            type: "playerDeath",
            attackerId: monster.id,
            targetId: target.id,
            damage: 0,
            x: target.x, y: target.y + 1.5, z: target.z,
          });
          target.hp = target.maxHp;
          target.x = 0; target.y = 0; target.z = 0;
          setTimeout(() => {
            io.emit("playerMoved", target);
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
        changed.push(monster);
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
      changed.push(monster);
    }
  }

  if (changed.length > 0) {
    io.emit("monstersUpdate", Object.values(monsters));
  }
}

function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  initMonsters();

  setInterval(() => updateMonsters(io), 250);

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join", ({ nickname, characterClass }) => {
      const color =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");

      players[socket.id] = {
        id: socket.id,
        nickname,
        x: 0,
        y: 0,
        z: 0,
        color,
        characterClass: characterClass || "knight",
        level: 1,
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        experience: 0,
        inventory: [
          {
            id: "potion1",
            name: "Poção de Cura",
            type: "consumable",
            rarity: "common",
            stats: { hp: 50 },
            description: "Restaura 50 pontos de vida",
            icon: "🧪",
          },
        ],
        equipped: { weapon: null, armor: null, accessory: null },
      };

      socket.emit("currentPlayers", players);
      socket.broadcast.emit("newPlayer", players[socket.id]);
      socket.emit("monstersUpdate", Object.values(monsters));
    });

    socket.on("move", (pos) => {
      if (players[socket.id]) {
        players[socket.id] = { ...players[socket.id], ...pos };
        socket.broadcast.emit("playerMoved", players[socket.id]);
      }
    });

    socket.on("attackMonster", ({ monsterId }) => {
      const player = players[socket.id];
      const monster = monsters[monsterId];
      if (!player || !monster || monster.state === "dead" || player.hp <= 0) return;

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

      const combatEvent = {
        type: "playerAttack",
        attackerId: socket.id,
        targetId: monsterId,
        damage,
        isCrit,
        targetHp: monster.hp,
        targetMaxHp: monster.maxHp,
        x: monster.x, y: 1.0, z: monster.z,
      };
      io.emit("combatEvent", combatEvent);

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

        io.emit("combatEvent", {
          type: "monsterDeath",
          attackerId: socket.id,
          targetId: monsterId,
          damage: 0,
          expGained: monster.expReward,
          x: monster.x, y: 1.0, z: monster.z,
        });

        socket.emit("playerUpdated", player);
      }

      io.emit("monstersUpdate", Object.values(monsters));
    });

    socket.on("chat", (msg) => {
      io.emit("chat", { id: socket.id, msg, type: "normal" });
    });

    socket.on("interact", () => {
      socket.emit("interactionResult", {
        success: true,
        message: "Interação realizada!",
      });
    });

    socket.on("equipItem", ({ itemId, slot }) => {
      if (players[socket.id]) {
        const player = players[socket.id];
        const item = player.inventory.find((i) => i.id === itemId);

        if (
          item &&
          (item.type === "weapon" ||
            item.type === "armor" ||
            item.type === "accessory")
        ) {
          player.inventory = player.inventory.filter((i) => i.id !== itemId);
          player.equipped[slot] = item;

          if (item.stats.attack) player.attack += item.stats.attack;
          if (item.stats.defense) player.defense += item.stats.defense;
          if (item.stats.hp) player.maxHp += item.stats.hp;

          socket.emit("playerUpdated", player);
          socket.broadcast.emit("playerMoved", player);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Player left:", socket.id);
      delete players[socket.id];
      io.emit("removePlayer", socket.id);

      for (const m of Object.values(monsters)) {
        if (m.targetPlayerId === socket.id) {
          m.targetPlayerId = null;
          m.state = "idle";
        }
      }
    });
  });

  return io;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  setupSocketIO(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`> Server running at http://localhost:${port}`);
    console.log(`> Next.js + Socket.io unified`);
    console.log(`> Mode: ${dev ? "development" : "production"}`);
  });
});
