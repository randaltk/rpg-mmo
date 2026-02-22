import { createNoise2D } from 'simplex-noise';
import type { BiomeType } from '@/types/game';
import { createSeededRNG, hashCoord } from './seed';

export interface BiomeMapConfig {
  width: number;
  height: number;
  resolution: number;
  biomeScale: number;
  ruinsNodeCount: number;
  ruinsNodeRadius: number;
}

export const DEFAULT_BIOME_CONFIG: BiomeMapConfig = {
  width: 400,
  height: 400,
  resolution: 128,
  biomeScale: 0.009,
  ruinsNodeCount: 4,
  ruinsNodeRadius: 15,
};

/**
 * Generates a biome map using noise-based moisture/temperature with radial difficulty gradient.
 * Returns a BiomeType[] of size (resolution+1)^2, same layout as the heightmap.
 */
export function generateBiomeMap(
  seed: number,
  config: BiomeMapConfig = DEFAULT_BIOME_CONFIG,
): BiomeType[] {
  const rng = createSeededRNG(seed + 5000);
  const moistureNoise = createNoise2D(createSeededRNG(seed + 1000));
  const temperatureNoise = createNoise2D(createSeededRNG(seed + 2000));

  const res = config.resolution + 1;
  const biomeMap: BiomeType[] = new Array(res * res);

  const halfW = config.width / 2;
  const halfH = config.height / 2;
  const mapRadius = Math.min(halfW, halfH);

  // Pre-generate ruins node positions
  const ruinsNodes: { x: number; z: number }[] = [];
  for (let i = 0; i < config.ruinsNodeCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = mapRadius * 0.55 + rng() * mapRadius * 0.25;
    ruinsNodes.push({
      x: Math.cos(angle) * dist,
      z: Math.sin(angle) * dist,
    });
  }

  for (let iz = 0; iz < res; iz++) {
    for (let ix = 0; ix < res; ix++) {
      const worldX = (ix / config.resolution) * config.width - halfW;
      const worldZ = (iz / config.resolution) * config.height - halfH;

      const moisture = moistureNoise(worldX * config.biomeScale, worldZ * config.biomeScale);
      const temperature = temperatureNoise(worldX * config.biomeScale * 0.7, worldZ * config.biomeScale * 0.7);

      const distFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ);
      const difficulty = Math.min(1, distFromCenter / mapRadius);

      let biome: BiomeType;

      // Check ruins nodes first
      let nearRuins = false;
      for (const node of ruinsNodes) {
        const dx = worldX - node.x;
        const dz = worldZ - node.z;
        if (dx * dx + dz * dz < config.ruinsNodeRadius * config.ruinsNodeRadius) {
          nearRuins = true;
          break;
        }
      }

      if (difficulty < 0.3) {
        biome = 'plains';
      } else if (nearRuins) {
        biome = 'ruins';
      } else if (difficulty > 0.75) {
        biome = 'rocky';
      } else if (moisture > 0.15 && temperature > 0.05) {
        biome = 'forest';
      } else if (moisture > 0.15 && temperature <= 0.05) {
        biome = 'swamp';
      } else {
        biome = 'plains';
      }

      biomeMap[iz * res + ix] = biome;
    }
  }

  return biomeMap;
}

/**
 * Samples the biome at arbitrary world coordinates using nearest-neighbor lookup.
 */
export function getBiomeAt(
  worldX: number,
  worldZ: number,
  biomeMap: BiomeType[],
  mapWidth: number,
  mapHeight: number,
  resolution: number,
): BiomeType {
  const halfW = mapWidth / 2;
  const halfH = mapHeight / 2;

  const nx = (worldX + halfW) / mapWidth;
  const nz = (worldZ + halfH) / mapHeight;

  const ix = Math.max(0, Math.min(resolution, Math.round(nx * resolution)));
  const iz = Math.max(0, Math.min(resolution, Math.round(nz * resolution)));

  const res = resolution + 1;
  return biomeMap[iz * res + ix] ?? 'plains';
}
