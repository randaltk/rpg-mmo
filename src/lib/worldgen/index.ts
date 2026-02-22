import type { GameMap, BiomeType } from '@/types/game';
import type { WorldSeed } from './seed';

export interface WorldConfig {
  width: number;
  height: number;
  terrainScale: number;
  terrainAmplitude: number;
  biomeScale: number;
  objectDensity: number;
  monsterDensity: number;
  portalCount: { min: number; max: number };
}

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  width: 150,
  height: 150,
  terrainScale: 0.02,
  terrainAmplitude: 8.0,
  biomeScale: 0.015,
  objectDensity: 0.6,
  monsterDensity: 0.4,
  portalCount: { min: 3, max: 6 },
};

/**
 * Main world generation orchestrator.
 * Currently a scaffold — each phase will plug in its generator here:
 *   Phase 1: terrain (heightmap)
 *   Phase 2: objects (trees, rocks, structures)
 *   Phase 3: biomes (biome map + per-biome rules)
 *   Phase 4: monsters (spawn generation)
 *   Phase 5: portals & dungeons
 */
export function generateWorld(
  seed: WorldSeed,
  config: WorldConfig = DEFAULT_WORLD_CONFIG,
): GameMap {
  const map: GameMap = {
    id: 'procedural-world',
    name: 'Planícies de Aldoria',
    width: config.width,
    height: config.height,
    objects: [],
    npcs: [],
    spawnPoints: [{ x: 0, y: 0, z: 0 }],
    monsterSpawns: [],
    seed,
  };

  // Phase 1 will add: heightmap generation
  // Phase 2 will add: procedural object placement
  // Phase 3 will add: biome map generation + biome-aware colors
  // Phase 4 will add: monster spawn generation
  // Phase 5 will add: portal placement

  return map;
}
