import type { MonsterSpawn } from "@/types/game";

export const MONSTER_SPAWNS: MonsterSpawn[] = [
  { id: "spawn_slime_1", type: "slime", x: 15, z: 20, count: 3, radius: 8, level: 1, color: "#4CAF50" },
  { id: "spawn_slime_2", type: "slime", x: -25, z: -15, count: 3, radius: 8, level: 2, color: "#2196F3" },
  { id: "spawn_slime_3", type: "slime", x: 30, z: -25, count: 2, radius: 6, level: 3, color: "#E91E63" },
  { id: "spawn_goblin_1", type: "goblin", x: -35, z: 25, count: 2, radius: 6, level: 3, color: "#5D8C3E" },
  { id: "spawn_goblin_2", type: "goblin", x: 40, z: 10, count: 2, radius: 6, level: 4, color: "#7A6A3A" },
];
