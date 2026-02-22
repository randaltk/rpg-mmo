import type { Player, Monster } from "@/types/game";

export interface ServerPlayer extends Player {
  currentMapId: string;
}

export interface ServerMonster extends Monster {
  mapId: string;
  spawnId: string;
  spawnIndex: number;
  lastAttackTime: number;
  wanderTarget: { x: number; z: number } | null;
  wanderCooldown: number;
  hurtTime: number;
  deathTime: number;
}

export interface MonsterBaseStats {
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  aggroRange: number;
  attackRange: number;
  moveSpeed: number;
  attackCooldown: number;
}

export interface Position {
  x: number;
  z: number;
}
