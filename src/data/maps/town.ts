import { GameMap } from "@/types/game";
import { createTerrainSampler } from "@/lib/worldgen/terrain";
import { createBiomeSampler } from "@/lib/worldgen/biomes";

export const TOWN_SEED = 42;

const terrainSampler = createTerrainSampler(TOWN_SEED);
const biomeSampler = createBiomeSampler(TOWN_SEED);

export const townMap: GameMap = {
  id: "town",
  name: "Planícies de Aldoria",
  width: 0,
  height: 0,
  infinite: true,
  terrainSampler,
  biomeSampler,
  objects: [
    {
      id: "town_chest1", type: "chest", x: -20, y: terrainSampler(-20, 15), z: 15, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "gold_coin", name: "Moeda de Ouro", type: "consumable", rarity: "common", stats: { hp: 10 }, description: "Uma moeda de ouro valiosa.", icon: "💰" },
    },
    {
      id: "town_chest2", type: "chest", x: 25, y: terrainSampler(25, -18), z: -18, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "health_potion", name: "Poção de Vida", type: "consumable", rarity: "uncommon", stats: { hp: 50 }, description: "Restaura 50 de HP.", icon: "💊" },
    },
    {
      id: "town_chest3", type: "chest", x: -35, y: terrainSampler(-35, -30), z: -30, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "iron_sword", name: "Espada de Ferro", type: "weapon", rarity: "uncommon", stats: { attack: 8 }, description: "Uma espada sólida de ferro.", icon: "⚔️" },
    },
    {
      id: "town_chest4", type: "chest", x: 40, y: terrainSampler(40, 35), z: 35, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "leather_armor", name: "Armadura de Couro", type: "armor", rarity: "uncommon", stats: { defense: 5 }, description: "Proteção leve e flexível.", icon: "🛡️" },
    },

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
  monsterSpawns: [],
};
