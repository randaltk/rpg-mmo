import { Server } from "socket.io";
import type { MonsterSpawn, CombatEvent, Monster, PortalTier } from "@/types/game";
import type { ServerMonster } from "./types";
import {
  players, monsters, nextMonsterId,
  DEFAULT_MAP, MONSTER_MAP, MONSTER_BASE_STATS, MONSTER_NAMES,
  VARIANT_MODIFIERS, VARIANT_NAMES,
  mapRoom, distanceBetween, getPlayersOnMap, getMonstersOnMap,
  getMonsterTerrainY, worldSeed, townTerrainSampler,
} from "./state";
import { createBiomeSampler, type BiomeSampler } from "@/lib/worldgen/biomes";
import { BIOME_CONFIGS } from "@/lib/worldgen/biome-configs";
import { createSeededRNG, hashCoord } from "@/lib/worldgen/seed";
import { generateDungeon } from "@/lib/worldgen/dungeon";

const REGION_SIZE = 100;
const SPAWN_SAFE_RADIUS = 40;
const SPAWNS_PER_REGION = 6;
const MIN_DIST_BETWEEN_SPAWNS = 18;

function monsterTerrainY(mapId: string, x: number, z: number): number {
  if (mapId.startsWith('dungeon_')) return 0;
  return getMonsterTerrainY(x, z);
}

let biomeSampler: BiomeSampler;
const regionSpawns = new Map<string, MonsterSpawn[]>();
const activeRegions = new Set<string>();

function weightedPick<T>(items: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function generateRegionSpawns(regionX: number, regionZ: number): MonsterSpawn[] {
  const regionSeed = hashCoord(regionX, regionZ, worldSeed.base + 777);
  const rng = createSeededRNG(regionSeed);
  const spawns: MonsterSpawn[] = [];

  const baseX = regionX * REGION_SIZE;
  const baseZ = regionZ * REGION_SIZE;
  const placed: { x: number; z: number }[] = [];

  for (let i = 0; i < SPAWNS_PER_REGION; i++) {
    let attempts = 0;
    while (attempts < 20) {
      attempts++;
      const x = baseX + rng() * REGION_SIZE;
      const z = baseZ + rng() * REGION_SIZE;

      if (Math.sqrt(x * x + z * z) < SPAWN_SAFE_RADIUS) continue;

      const h = townTerrainSampler(x, z);
      if (h > 8) continue;

      let tooClose = false;
      for (const p of placed) {
        const dx = p.x - x;
        const dz = p.z - z;
        if (dx * dx + dz * dz < MIN_DIST_BETWEEN_SPAWNS * MIN_DIST_BETWEEN_SPAWNS) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      const biome = biomeSampler(x, z);
      const biomeConfig = BIOME_CONFIGS[biome];
      const table = biomeConfig.monsterTable;
      if (table.length === 0) continue;

      const entry = weightedPick(table, table.map(t => t.weight), rng);

      const distFromCenter = Math.sqrt(x * x + z * z);
      const distScale = Math.min(distFromCenter / 300, 1);
      const [minLv, maxLv] = entry.levelRange;
      const level = Math.max(minLv, Math.min(maxLv, Math.round(minLv + (maxLv - minLv) * distScale)));

      const spawnProfile: Record<Monster['type'], { min: number; max: number; rad: number }> = {
        slime:    { min: 1, max: 1, rad: 3 },
        wolf:     { min: 1, max: 2, rad: 5 },
        goblin:   { min: 1, max: 2, rad: 6 },
        skeleton: { min: 2, max: 4, rad: 8 },
      };
      const profile = spawnProfile[entry.type];
      const count = profile.min + Math.floor(rng() * (profile.max - profile.min + 1));
      const radius = profile.rad + rng() * 3;

      const colorMap: Record<Monster['type'], string> = {
        slime: '#4CAF50',
        goblin: '#5D8C3E',
        wolf: '#5A5A5A',
        skeleton: '#E8E0D0',
      };

      spawns.push({
        id: `spawn_r${regionX}_${regionZ}_${i}`,
        type: entry.type,
        x, z,
        count, radius, level,
        color: colorMap[entry.type],
        variant: entry.variant,
        biome,
      });

      placed.push({ x, z });
      break;
    }
  }

  return spawns;
}

function getOrGenerateRegion(rx: number, rz: number): MonsterSpawn[] {
  const key = `${rx},${rz}`;
  if (regionSpawns.has(key)) return regionSpawns.get(key)!;
  const spawns = generateRegionSpawns(rx, rz);
  regionSpawns.set(key, spawns);
  return spawns;
}

export function spawnMonster(spawn: MonsterSpawn, index: number): ServerMonster {
  const base = MONSTER_BASE_STATS[spawn.type];
  const levelMult = 1 + (spawn.level - 1) * 0.3;
  const angle = (index / spawn.count) * Math.PI * 2 + Math.random() * 0.5;
  const dist = Math.random() * spawn.radius;
  const x = spawn.x + Math.cos(angle) * dist;
  const z = spawn.z + Math.sin(angle) * dist;
  const id = nextMonsterId();

  const terrainY = monsterTerrainY(MONSTER_MAP, x, z);

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

function activateRegion(rx: number, rz: number): void {
  const key = `${rx},${rz}`;
  if (activeRegions.has(key)) return;
  activeRegions.add(key);

  const spawns = getOrGenerateRegion(rx, rz);
  for (const spawn of spawns) {
    const existing = Object.values(monsters).some(m => m.spawnId === spawn.id);
    if (existing) continue;
    for (let i = 0; i < spawn.count; i++) {
      spawnMonster(spawn, i);
    }
  }
}

export function initMonsters(): void {
  biomeSampler = createBiomeSampler(worldSeed.base);

  // Activate a few regions near spawn
  for (let rz = -1; rz <= 1; rz++) {
    for (let rx = -1; rx <= 1; rx++) {
      activateRegion(rx, rz);
    }
  }

  console.log(`[WorldGen] Initial monster regions activated. ${Object.keys(monsters).length} monsters spawned.`);
}

function updateActiveRegions(): void {
  const townPlayers = getPlayersOnMap(MONSTER_MAP);
  if (townPlayers.length === 0) return;

  const neededRegions = new Set<string>();

  for (const p of townPlayers) {
    const prx = Math.floor(p.x / REGION_SIZE);
    const prz = Math.floor(p.z / REGION_SIZE);
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        neededRegions.add(`${prx + dx},${prz + dz}`);
      }
    }
  }

  neededRegions.forEach(key => {
    if (!activeRegions.has(key)) {
      const [rx, rz] = key.split(',').map(Number);
      activateRegion(rx, rz);
    }
  });

  activeRegions.forEach(key => {
    if (!neededRegions.has(key)) {
      activeRegions.delete(key);
    }
  });
}

let regionUpdateTimer = 0;

export function updateMonsters(io: Server): void {
  const now = Date.now();
  const changedMaps = new Set<string>();

  regionUpdateTimer++;
  if (regionUpdateTimer >= 60) {
    regionUpdateTimer = 0;
    updateActiveRegions();
  }

  for (const monster of Object.values(monsters)) {
    const isDungeonMonster = monster.mapId.startsWith('dungeon_');

    if (!isDungeonMonster) {
      const mrx = Math.floor(monster.x / REGION_SIZE);
      const mrz = Math.floor(monster.z / REGION_SIZE);
      if (!activeRegions.has(`${mrx},${mrz}`)) continue;
    } else if (!activeDungeons.has(monster.mapId)) {
      continue;
    }

    if (monster.state === "dead") {
      if (now - monster.deathTime > monster.respawnTime) {
        const spawn = getSpawnById(monster.spawnId);
        if (spawn) {
          const base = MONSTER_BASE_STATS[spawn.type];
          const levelMult = 1 + (spawn.level - 1) * 0.3;
          const vm = spawn.variant ? VARIANT_MODIFIERS[spawn.variant] : null;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * spawn.radius;
          monster.x = spawn.x + Math.cos(angle) * dist;
          monster.z = spawn.z + Math.sin(angle) * dist;
          monster.y = monsterTerrainY(monster.mapId, monster.x, monster.z);
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
          monster.y = monsterTerrainY(monster.mapId, monster.x, monster.z);
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
          monster.y = monsterTerrainY(monster.mapId, monster.x, monster.z);
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
        monster.y = monsterTerrainY(monster.mapId, monster.x, monster.z);
      }
      changedMaps.add(monster.mapId);
    }
  }

  changedMaps.forEach(mapId => {
    io.to(mapRoom(mapId)).emit("monstersUpdate", getMonstersOnMap(mapId));
  });
}

function getSpawnById(spawnId: string): MonsterSpawn | undefined {
  let found: MonsterSpawn | undefined;
  regionSpawns.forEach(spawns => {
    if (found) return;
    for (const spawn of spawns) {
      if (spawn.id === spawnId) { found = spawn; return; }
    }
  });
  if (found) return found;
  dungeonSpawns.forEach(spawns => {
    if (found) return;
    for (const spawn of spawns) {
      if (spawn.id === spawnId) { found = spawn; return; }
    }
  });
  return found;
}

const dungeonSpawns = new Map<string, MonsterSpawn[]>();
const activeDungeons = new Set<string>();

export function spawnDungeonMonsters(mapId: string, caveSeed: number, tier: PortalTier): void {
  if (activeDungeons.has(mapId)) return;
  activeDungeons.add(mapId);

  const dungeonMap = generateDungeon(caveSeed, tier);
  const spawns = dungeonMap.monsterSpawns || [];
  dungeonSpawns.set(mapId, spawns);

  let total = 0;
  for (const spawn of spawns) {
    for (let i = 0; i < spawn.count; i++) {
      const m = spawnMonster(spawn, i);
      m.mapId = mapId;
      m.y = 0;
      total++;
    }
  }
  console.log(`[Dungeon] Spawned ${total} monsters for ${mapId}, tier=${tier}, spawns=${spawns.length}`);
}
