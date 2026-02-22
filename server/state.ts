import type { Monster } from "@/types/game";
import type { ServerPlayer, ServerMonster, MonsterBaseStats, Position } from "./types";

export let players: Record<string, ServerPlayer> = {};
export let monsters: Record<string, ServerMonster> = {};
export let monsterIdCounter = 0;

export function nextMonsterId(): string {
  return `monster_${monsterIdCounter++}`;
}

export const DEFAULT_MAP = "castle";
export const MONSTER_MAP = "town";

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
