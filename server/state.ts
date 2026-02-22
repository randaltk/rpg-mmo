import type { Monster, MonsterVariant } from "@/types/game";
import type { ServerPlayer, ServerMonster, MonsterBaseStats, Position } from "./types";
import { createWorldSeed, type WorldSeed } from "@/lib/worldgen/seed";
import { generateHeightmap, getHeightAt, DEFAULT_TERRAIN_CONFIG } from "@/lib/worldgen/terrain";

export let players: Record<string, ServerPlayer> = {};
export let monsters: Record<string, ServerMonster> = {};
export let monsterIdCounter = 0;

export function nextMonsterId(): string {
  return `monster_${monsterIdCounter++}`;
}

export const DEFAULT_MAP = "castle";
export const MONSTER_MAP = "town";

const WORLD_BASE_SEED = 42;
export let worldSeed: WorldSeed = createWorldSeed(WORLD_BASE_SEED);

const townTerrainConfig = { ...DEFAULT_TERRAIN_CONFIG, width: 400, height: 400 };
export const townHeightmap = generateHeightmap(WORLD_BASE_SEED, townTerrainConfig);
export const townTerrainMeta = {
  width: townTerrainConfig.width,
  height: townTerrainConfig.height,
  resolution: townTerrainConfig.resolution,
};

export function getMonsterTerrainY(x: number, z: number): number {
  return getHeightAt(x, z, townHeightmap, townTerrainMeta.width, townTerrainMeta.height, townTerrainMeta.resolution);
}

export function refreshSeasonalSeed(): void {
  worldSeed = createWorldSeed(WORLD_BASE_SEED);
  console.log(`[WorldGen] Seed refreshed — base: ${worldSeed.base}, seasonal: ${worldSeed.seasonal}`);
}

export const MONSTER_BASE_STATS: Record<Monster["type"], MonsterBaseStats> = {
  slime:    { hp: 40,  attack: 5,  defense: 2, expReward: 15, aggroRange: 5, attackRange: 1.5, moveSpeed: 0.02,  attackCooldown: 2000 },
  goblin:   { hp: 70,  attack: 10, defense: 5, expReward: 30, aggroRange: 7, attackRange: 1.8, moveSpeed: 0.03,  attackCooldown: 1500 },
  wolf:     { hp: 55,  attack: 12, defense: 3, expReward: 25, aggroRange: 9, attackRange: 1.5, moveSpeed: 0.04,  attackCooldown: 1200 },
  skeleton: { hp: 80,  attack: 14, defense: 7, expReward: 40, aggroRange: 8, attackRange: 2.0, moveSpeed: 0.025, attackCooldown: 1800 },
};

export const MONSTER_NAMES: Record<Monster["type"], string> = {
  slime: "Slime",
  goblin: "Goblin",
  wolf: "Wolf",
  skeleton: "Skeleton",
};

export const VARIANT_MODIFIERS: Record<MonsterVariant, { attack: number; defense: number; hp: number; expReward: number }> = {
  fire:    { attack: 1.3, defense: 0.9, hp: 1.0, expReward: 1.3 },
  ice:     { attack: 1.0, defense: 1.3, hp: 1.1, expReward: 1.3 },
  poison:  { attack: 1.1, defense: 1.0, hp: 0.9, expReward: 1.2 },
  golden:  { attack: 1.0, defense: 1.5, hp: 2.0, expReward: 3.0 },
  warrior: { attack: 1.2, defense: 1.5, hp: 1.3, expReward: 1.5 },
  archer:  { attack: 1.5, defense: 0.7, hp: 0.8, expReward: 1.4 },
  shaman:  { attack: 0.8, defense: 1.0, hp: 1.0, expReward: 1.6 },
  chief:   { attack: 1.8, defense: 2.0, hp: 3.0, expReward: 5.0 },
};

export const VARIANT_NAMES: Partial<Record<MonsterVariant, string>> = {
  fire: 'Flame',
  ice: 'Frost',
  poison: 'Venom',
  golden: 'Golden',
  warrior: 'Warrior',
  archer: 'Archer',
  shaman: 'Shaman',
  chief: 'Chief',
};

export function mapRoom(mapId: string): string {
  return `map:${mapId}`;
}

export function distanceBetween(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
}

export function getPlayersOnMap(mapId: string): ServerPlayer[] {
  return Object.values(players).filter(p => p.currentMapId === mapId);
}

export function getMonstersOnMap(mapId: string): ServerMonster[] {
  return Object.values(monsters).filter(m => m.mapId === mapId);
}
