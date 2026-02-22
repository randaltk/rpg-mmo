import { GameMap, MapObject, MonsterSpawn } from "@/types/game";
import { seededRandom } from "@/utils/seededRandom";
import { MONSTER_SPAWNS } from "@/shared/monsterSpawns";

function generateTrees(): MapObject[] {
  const trees: MapObject[] = [];
  for (let i = 0; i < 60; i++) {
    const angle = seededRandom(i * 3.7 + 10) * Math.PI * 2;
    const dist = 8 + seededRandom(i * 5.3 + 20) * 55;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const h = 3 + seededRandom(i * 2.1 + 30) * 3;
    trees.push({
      id: `tree_${i}`, type: "tree", x, y: 0, z,
      width: 1, height: h, depth: 1, solid: false,
    });
  }
  return trees;
}

function generateRocks(): MapObject[] {
  const rocks: MapObject[] = [];
  for (let i = 0; i < 25; i++) {
    const angle = seededRandom(i * 7.1 + 50) * Math.PI * 2;
    const dist = 10 + seededRandom(i * 4.9 + 60) * 50;
    rocks.push({
      id: `rock_${i}`, type: "rock",
      x: Math.cos(angle) * dist, y: 0, z: Math.sin(angle) * dist,
      width: 0.8 + seededRandom(i * 3.3 + 70) * 1.5,
      height: 0.5 + seededRandom(i * 2.7 + 80) * 1.5,
      depth: 0.8 + seededRandom(i * 3.3 + 90) * 1.5,
      solid: false,
    });
  }
  return rocks;
}

export const townMap: GameMap = {
  id: "town",
  name: "Planícies de Aldoria",
  width: 150,
  height: 150,
  objects: [
    ...generateTrees(),
    ...generateRocks(),

    // Chests scattered around
    {
      id: "town_chest1", type: "chest", x: -20, y: 0, z: 15, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "gold_coin", name: "Moeda de Ouro", type: "consumable", rarity: "common", stats: { hp: 10 }, description: "Uma moeda de ouro valiosa.", icon: "💰" },
    },
    {
      id: "town_chest2", type: "chest", x: 25, y: 0, z: -18, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "health_potion", name: "Poção de Vida", type: "consumable", rarity: "uncommon", stats: { hp: 50 }, description: "Restaura 50 de HP.", icon: "💊" },
    },
    {
      id: "town_chest3", type: "chest", x: -35, y: 0, z: -30, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "iron_sword", name: "Espada de Ferro", type: "weapon", rarity: "uncommon", stats: { attack: 8 }, description: "Uma espada sólida de ferro.", icon: "⚔️" },
    },
    {
      id: "town_chest4", type: "chest", x: 40, y: 0, z: 35, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "leather_armor", name: "Armadura de Couro", type: "armor", rarity: "uncommon", stats: { defense: 5 }, description: "Proteção leve e flexível.", icon: "🛡️" },
    },

    // Portal back to castle
    {
      id: "portal_castle", type: "portal", x: 0, y: 0, z: 0, width: 2, height: 3, depth: 1, solid: false,
      portalTo: "castle", portalSpawn: { x: 8, y: 0, z: 5 },
    },
  ],
  npcs: [
    { id: "town_merchant", name: "Comerciante Viajante", x: 5, y: 0, z: 8, type: "merchant", dialogue: ["Trago mercadorias de terras distantes!", "Olhe minhas ofertas especiais!"], isMoving: false, movementPattern: "static" },
    { id: "town_quest", name: "Fazendeiro Aflito", x: -10, y: 0, z: -5, type: "quest", dialogue: ["Monstros estão destruindo minha fazenda!", "Por favor, me ajude aventureiro!"], isMoving: false, movementPattern: "static" },
    { id: "town_guard", name: "Patrulheiro", x: 15, y: 0, z: -10, type: "guard", dialogue: ["As planícies são perigosas à noite.", "Cuidado com os lobos."], isMoving: false, movementPattern: "static" },
    { id: "town_wanderer", name: "Bardo Andarilho", x: -20, y: 0, z: 20, type: "wanderer", dialogue: ["♪ Uma canção sobre heróis antigos... ♪", "Quer ouvir uma história?"], isMoving: false, movementPattern: "static" },
    { id: "town_healer", name: "Curandeira", x: 12, y: 0, z: 15, type: "quest", dialogue: ["Posso curar suas feridas.", "Traga ervas e preparo uma poção."], isMoving: false, movementPattern: "static" },
  ],
  spawnPoints: [{ x: 0, y: 0, z: 0 }],
  monsterSpawns: MONSTER_SPAWNS as MonsterSpawn[],
};
