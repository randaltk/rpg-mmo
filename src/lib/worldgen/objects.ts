import type { MapObject, BiomeType, TreeVariant, RockVariant, StructureVariant } from '@/types/game';
import { createSeededRNG } from './seed';
import { getHeightAt } from './terrain';
import { getBiomeAt } from './biomes';
import { BIOME_CONFIGS } from './biome-configs';

export interface ObjectGenerationConfig {
  mapWidth: number;
  mapHeight: number;
  treeCount: number;
  rockCount: number;
  structureCount: number;
  safeRadius: number;
  edgeMargin: number;
}

export const DEFAULT_OBJECT_CONFIG: ObjectGenerationConfig = {
  mapWidth: 400,
  mapHeight: 400,
  treeCount: 250,
  rockCount: 100,
  structureCount: 25,
  safeRadius: 30,
  edgeMargin: 15,
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

/**
 * Generates a set of scattered points avoiding minimum distance constraints.
 * Simple rejection-based approach (good enough for ~100 points).
 */
function scatterPoints(
  count: number,
  halfW: number,
  halfH: number,
  minDist: number,
  safeRadius: number,
  edgeMargin: number,
  rng: () => number,
): { x: number; z: number }[] {
  const points: { x: number; z: number }[] = [];
  const maxAttempts = count * 10;
  let attempts = 0;

  while (points.length < count && attempts < maxAttempts) {
    attempts++;
    const x = (rng() - 0.5) * (halfW * 2 - edgeMargin * 2);
    const z = (rng() - 0.5) * (halfH * 2 - edgeMargin * 2);

    const centerDist = Math.sqrt(x * x + z * z);
    if (centerDist < safeRadius) continue;

    let tooClose = false;
    for (const p of points) {
      const dx = p.x - x;
      const dz = p.z - z;
      if (dx * dx + dz * dz < minDist * minDist) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    points.push({ x, z });
  }

  return points;
}

export function generateObjects(
  heightmap: Float32Array,
  seed: number,
  config: ObjectGenerationConfig = DEFAULT_OBJECT_CONFIG,
  biomeMap?: BiomeType[],
): MapObject[] {
  const rng = createSeededRNG(seed);
  const objects: MapObject[] = [];
  const halfW = config.mapWidth / 2;
  const halfH = config.mapHeight / 2;
  const resolution = Math.round(Math.sqrt(heightmap.length)) - 1;

  function biomeAt(x: number, z: number): BiomeType {
    if (!biomeMap) return 'plains';
    return getBiomeAt(x, z, biomeMap, config.mapWidth, config.mapHeight, resolution);
  }

  // Trees — minimum 3 units apart, density scaled by biome
  const treePositions = scatterPoints(
    config.treeCount, halfW, halfH, 3, config.safeRadius, config.edgeMargin, rng,
  );

  for (let i = 0; i < treePositions.length; i++) {
    const pos = treePositions[i];
    const y = getHeightAt(pos.x, pos.z, heightmap, config.mapWidth, config.mapHeight, resolution);
    if (y > 9) continue;

    const biome = biomeAt(pos.x, pos.z);
    const bc = BIOME_CONFIGS[biome];

    if (rng() > bc.treeDensity) continue;

    const variant = weightedPick(bc.treeVariants, bc.treeVariantWeights, rng);
    const scale = 0.7 + rng() * 0.6;
    const h = 3 + rng() * 3;

    objects.push({
      id: `tree_${i}`,
      type: 'tree',
      x: pos.x, y, z: pos.z,
      width: 1, height: h, depth: 1,
      solid: false,
      variant, scale, biome,
    });
  }

  // Rocks — minimum 2.5 units apart
  const rockPositions = scatterPoints(
    config.rockCount, halfW, halfH, 2.5, config.safeRadius * 0.8, config.edgeMargin, rng,
  );

  for (let i = 0; i < rockPositions.length; i++) {
    const pos = rockPositions[i];
    const y = getHeightAt(pos.x, pos.z, heightmap, config.mapWidth, config.mapHeight, resolution);

    const biome = biomeAt(pos.x, pos.z);
    const bc = BIOME_CONFIGS[biome];

    if (rng() > bc.rockDensity) continue;

    const variant = weightedPick(bc.rockVariants, bc.rockVariantWeights, rng);
    const scale = 0.6 + rng() * 0.8;

    objects.push({
      id: `rock_${i}`,
      type: 'rock',
      x: pos.x, y, z: pos.z,
      width: 0.8 + rng() * 1.5,
      height: 0.5 + rng() * 1.5,
      depth: 0.8 + rng() * 1.5,
      solid: false,
      variant, scale, biome,
    });
  }

  // Structures — minimum 15 units apart, further from center
  const structPositions = scatterPoints(
    config.structureCount, halfW, halfH, 15, config.safeRadius * 2, config.edgeMargin + 5, rng,
  );

  for (let i = 0; i < structPositions.length; i++) {
    const pos = structPositions[i];
    const y = getHeightAt(pos.x, pos.z, heightmap, config.mapWidth, config.mapHeight, resolution);
    if (y > 9) continue;

    const biome = biomeAt(pos.x, pos.z);
    const bc = BIOME_CONFIGS[biome];

    if (rng() > bc.structureDensity) continue;

    const variant = weightedPick(bc.structureVariants, bc.structureVariantWeights, rng);
    const scale = 0.8 + rng() * 0.4;

    objects.push({
      id: `struct_${i}`,
      type: 'structure',
      x: pos.x, y, z: pos.z,
      width: 2, height: 2 + rng() * 2, depth: 2,
      solid: false,
      variant, scale, biome,
    });
  }

  return objects;
}
