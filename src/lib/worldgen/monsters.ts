import type { MonsterSpawn, BiomeType, MonsterVariant, Monster } from '@/types/game';
import { createSeededRNG, hashCoord } from './seed';
import { getHeightAt } from './terrain';
import { getBiomeAt } from './biomes';
import { BIOME_CONFIGS, type BiomeConfig } from './biome-configs';

export interface MonsterGenerationConfig {
  mapWidth: number;
  mapHeight: number;
  heightmapResolution: number;
  totalSpawnPoints: number;
  minDistBetweenSpawns: number;
  safeRadius: number;
  edgeMargin: number;
  monstersPerSpawn: [number, number];
  spawnRadius: [number, number];
}

export const DEFAULT_MONSTER_CONFIG: MonsterGenerationConfig = {
  mapWidth: 400,
  mapHeight: 400,
  heightmapResolution: 2,
  totalSpawnPoints: 50,
  minDistBetweenSpawns: 18,
  safeRadius: 40,
  edgeMargin: 15,
  monstersPerSpawn: [2, 4],
  spawnRadius: [5, 10],
};

function weightedPick<T>(items: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function distanceLevelScale(x: number, z: number, mapW: number, mapH: number): number {
  const halfW = mapW / 2;
  const halfH = mapH / 2;
  const dist = Math.sqrt(x * x + z * z);
  const maxDist = Math.sqrt(halfW * halfW + halfH * halfH);
  return Math.min(dist / maxDist, 1);
}

export function generateMonsterSpawns(
  biomeMap: BiomeType[],
  heightmap: Float32Array,
  seed: number,
  config: MonsterGenerationConfig = DEFAULT_MONSTER_CONFIG,
): MonsterSpawn[] {
  const rng = createSeededRNG(seed + 777);
  const { mapWidth, mapHeight, heightmapResolution, totalSpawnPoints, minDistBetweenSpawns, safeRadius, edgeMargin, monstersPerSpawn, spawnRadius } = config;

  const halfW = mapWidth / 2;
  const halfH = mapHeight / 2;
  const placed: { x: number; z: number }[] = [];
  const spawns: MonsterSpawn[] = [];
  let attempts = 0;
  const maxAttempts = totalSpawnPoints * 15;

  while (placed.length < totalSpawnPoints && attempts < maxAttempts) {
    attempts++;
    const x = (rng() - 0.5) * (mapWidth - edgeMargin * 2);
    const z = (rng() - 0.5) * (mapHeight - edgeMargin * 2);

    if (Math.sqrt(x * x + z * z) < safeRadius) continue;

    const h = getHeightAt(x, z, heightmap, mapWidth, mapHeight, heightmapResolution);
    if (h > 8) continue;

    let tooClose = false;
    for (const p of placed) {
      const dx = p.x - x;
      const dz = p.z - z;
      if (Math.sqrt(dx * dx + dz * dz) < minDistBetweenSpawns) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    const biome = getBiomeAt(x, z, biomeMap, mapWidth, mapHeight, heightmapResolution);
    const biomeConfig = BIOME_CONFIGS[biome];
    const table = biomeConfig.monsterTable;

    if (table.length === 0) continue;

    const entry = weightedPick(
      table,
      table.map(t => t.weight),
      rng,
    );

    const distScale = distanceLevelScale(x, z, mapWidth, mapHeight);
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
      id: `spawn_${biome}_${placed.length}`,
      type: entry.type,
      x,
      z,
      count,
      radius,
      level,
      color: colorMap[entry.type],
      variant: entry.variant,
      biome,
    });

    placed.push({ x, z });
  }

  return spawns;
}
