import { Server } from "socket.io";
import type { MonsterSpawn, CombatEvent } from "@/types/game";
import type { ServerMonster } from "./types";
import {
  players, monsters, nextMonsterId,
  DEFAULT_MAP, MONSTER_MAP, MONSTER_BASE_STATS, MONSTER_NAMES,
  VARIANT_MODIFIERS, VARIANT_NAMES,
  mapRoom, distanceBetween, getPlayersOnMap, getMonstersOnMap,
  getMonsterTerrainY,
} from "./state";
import { generateMonsterSpawns, DEFAULT_MONSTER_CONFIG } from "@/lib/worldgen/monsters";
import { townHeightmap, townTerrainMeta, worldSeed } from "./state";
import { generateBiomeMap, DEFAULT_BIOME_CONFIG } from "@/lib/worldgen/biomes";

let MONSTER_SPAWNS: MonsterSpawn[] = [];

export function spawnMonster(spawn: MonsterSpawn, index: number): ServerMonster {
  const base = MONSTER_BASE_STATS[spawn.type];
  const levelMult = 1 + (spawn.level - 1) * 0.3;
  const angle = (index / spawn.count) * Math.PI * 2 + Math.random() * 0.5;
  const dist = Math.random() * spawn.radius;
  const x = spawn.x + Math.cos(angle) * dist;
  const z = spawn.z + Math.sin(angle) * dist;
  const id = nextMonsterId();

  const terrainY = getMonsterTerrainY(x, z);

  const vm = spawn.variant ? VARIANT_MODIFIERS[spawn.variant] : null;
  const hpMult = vm ? vm.hp : 1;
  const atkMult = vm ? vm.attack : 1;
  const defMult = vm ? vm.defense : 1;
  const expMult = vm ? vm.expReward : 1;

  const variantPrefix = spawn.variant && VARIANT_NAMES[spawn.variant] ? `${VARIANT_NAMES[spawn.variant]} ` : '';
  const name = `${variantPrefix}${MONSTER_NAMES[spawn.type]}`;

  const monster: ServerMonster = {
    id,
    name,
    type: spawn.type,
    mapId: MONSTER_MAP,
    x, y: terrainY, z,
    hp: Math.floor(base.hp * levelMult * hpMult),
    maxHp: Math.floor(base.hp * levelMult * hpMult),
    attack: Math.floor(base.attack * levelMult * atkMult),
    defense: Math.floor(base.defense * levelMult * defMult),
    level: spawn.level,
    expReward: Math.floor(base.expReward * levelMult * expMult),
    color: spawn.color || "#4CAF50",
    state: "idle",
    targetPlayerId: undefined,
    spawnX: spawn.x,
    spawnZ: spawn.z,
    spawnId: spawn.id,
    spawnIndex: index,
    respawnTime: spawn.variant === 'chief' ? 30000 : spawn.variant === 'golden' ? 20000 : 10000,
    lastAttackTime: 0,
    wanderTarget: null,
    wanderCooldown: 0,
    hurtTime: 0,
    deathTime: 0,
    variant: spawn.variant,
    biome: spawn.biome,
  };

  monsters[id] = monster;
  return monster;
}

export function initMonsters(): void {
  const biomeConfig = {
    ...DEFAULT_BIOME_CONFIG,
    width: townTerrainMeta.width,
    height: townTerrainMeta.height,
    resolution: townTerrainMeta.resolution,
  };
  const serverBiomeMap = generateBiomeMap(worldSeed.base, biomeConfig);

  MONSTER_SPAWNS = generateMonsterSpawns(
    serverBiomeMap,
    townHeightmap,
    worldSeed.base,
    {
      ...DEFAULT_MONSTER_CONFIG,
      mapWidth: townTerrainMeta.width,
      mapHeight: townTerrainMeta.height,
      heightmapResolution: townTerrainMeta.resolution,
    },
  );

  console.log(`[WorldGen] Generated ${MONSTER_SPAWNS.length} monster spawn points`);

  for (const spawn of MONSTER_SPAWNS) {
    for (let i = 0; i < spawn.count; i++) {
      spawnMonster(spawn, i);
    }
  }
  console.log(`[WorldGen] Spawned ${Object.keys(monsters).length} monsters total`);
}

export function updateMonsters(io: Server): void {
  const now = Date.now();
  const changedMaps = new Set<string>();

  for (const monster of Object.values(monsters)) {
    if (monster.state === "dead") {
      if (now - monster.deathTime > monster.respawnTime) {
        const spawn = MONSTER_SPAWNS.find(s => s.id === monster.spawnId);
        if (spawn) {
          const base = MONSTER_BASE_STATS[spawn.type];
          const levelMult = 1 + (spawn.level - 1) * 0.3;
          const vm = spawn.variant ? VARIANT_MODIFIERS[spawn.variant] : null;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * spawn.radius;
          monster.x = spawn.x + Math.cos(angle) * dist;
          monster.z = spawn.z + Math.sin(angle) * dist;
          monster.y = monster.mapId === MONSTER_MAP ? getMonsterTerrainY(monster.x, monster.z) : 0;
          monster.hp = Math.floor(base.hp * levelMult * (vm ? vm.hp : 1));
          monster.maxHp = Math.floor(base.hp * levelMult * (vm ? vm.hp : 1));
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

    let nearestPlayer = null;
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
          if (monster.mapId === MONSTER_MAP) {
            monster.y = getMonsterTerrainY(monster.x, monster.z);
          }
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

        const targetSocket = io.sockets.sockets.get(target.id);
        if (targetSocket) {
          targetSocket.emit("playerUpdated", target);
        }
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
          if (targetSocket) {
            if (target.currentMapId !== DEFAULT_MAP) {
              const oldRoom = mapRoom(target.currentMapId);
              target.currentMapId = DEFAULT_MAP;
              targetSocket.leave(oldRoom);
              targetSocket.join(mapRoom(DEFAULT_MAP));
              io.to(oldRoom).emit("removePlayer", target.id);
              io.to(mapRoom(DEFAULT_MAP)).emit("newPlayer", target);
            }

            const mapPlayers: Record<string, typeof target> = {};
            for (const [id, p] of Object.entries(players)) {
              if (p.currentMapId === target.currentMapId) {
                mapPlayers[id] = p;
              }
            }
            targetSocket.emit("playerUpdated", target);
            targetSocket.emit("currentPlayers", mapPlayers);
            targetSocket.emit("monstersUpdate", getMonstersOnMap(target.currentMapId));
          }
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
          if (monster.mapId === MONSTER_MAP) {
            monster.y = getMonsterTerrainY(monster.x, monster.z);
          }
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
        if (monster.mapId === MONSTER_MAP) {
          monster.y = getMonsterTerrainY(monster.x, monster.z);
        }
      }
      changedMaps.add(monster.mapId);
    }
  }

  changedMaps.forEach(mapId => {
    io.to(mapRoom(mapId)).emit("monstersUpdate", getMonstersOnMap(mapId));
  });
}
