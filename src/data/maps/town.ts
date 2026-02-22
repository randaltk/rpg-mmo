import { GameMap } from "@/types/game";
import { generateHeightmap, getHeightAt, DEFAULT_TERRAIN_CONFIG } from "@/lib/worldgen/terrain";
import { generateBiomeMap, DEFAULT_BIOME_CONFIG } from "@/lib/worldgen/biomes";
import { generateObjects } from "@/lib/worldgen/objects";
import { generateMonsterSpawns, DEFAULT_MONSTER_CONFIG } from "@/lib/worldgen/monsters";

const TOWN_SEED = 42;
const MAP_W = 400;
const MAP_H = 400;
const RES = 128;
const terrainConfig = { ...DEFAULT_TERRAIN_CONFIG, width: MAP_W, height: MAP_H, resolution: RES };
const townHeightmap = generateHeightmap(TOWN_SEED, terrainConfig);
const townBiomeMap = generateBiomeMap(TOWN_SEED, { ...DEFAULT_BIOME_CONFIG, width: MAP_W, height: MAP_H, resolution: RES });

function terrainY(x: number, z: number): number {
  return getHeightAt(x, z, townHeightmap, MAP_W, MAP_H, RES);
}

const proceduralObjects = generateObjects(townHeightmap, TOWN_SEED, undefined, townBiomeMap);
const proceduralSpawns = generateMonsterSpawns(
  townBiomeMap,
  townHeightmap,
  TOWN_SEED,
  { ...DEFAULT_MONSTER_CONFIG, mapWidth: MAP_W, mapHeight: MAP_H, heightmapResolution: RES },
);

export const townMap: GameMap = {
  id: "town",
  name: "Planícies de Aldoria",
  width: MAP_W,
  height: MAP_H,
  heightmap: townHeightmap,
  heightmapResolution: RES,
  biomeMap: townBiomeMap,
  biomeMapResolution: RES,
  objects: [
    ...proceduralObjects,

    {
      id: "town_chest1", type: "chest", x: -20, y: terrainY(-20, 15), z: 15, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "gold_coin", name: "Moeda de Ouro", type: "consumable", rarity: "common", stats: { hp: 10 }, description: "Uma moeda de ouro valiosa.", icon: "💰" },
    },
    {
      id: "town_chest2", type: "chest", x: 25, y: terrainY(25, -18), z: -18, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "health_potion", name: "Poção de Vida", type: "consumable", rarity: "uncommon", stats: { hp: 50 }, description: "Restaura 50 de HP.", icon: "💊" },
    },
    {
      id: "town_chest3", type: "chest", x: -35, y: terrainY(-35, -30), z: -30, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "iron_sword", name: "Espada de Ferro", type: "weapon", rarity: "uncommon", stats: { attack: 8 }, description: "Uma espada sólida de ferro.", icon: "⚔️" },
    },
    {
      id: "town_chest4", type: "chest", x: 40, y: terrainY(40, 35), z: 35, width: 1, height: 1, depth: 1, solid: false,
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
  monsterSpawns: proceduralSpawns,
};
