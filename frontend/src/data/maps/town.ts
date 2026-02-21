import { Map } from "@/types/game";

export const townMap: Map = {
  id: "town",
  name: "Vila Inicial",
  width: 40,
  height: 40,
  objects: [
    // Paredes externas
    { id: "wall1", type: "wall", x: -18, y: 0, z: 0, width: 1, height: 4, depth: 40, solid: true },
    { id: "wall2", type: "wall", x: 18, y: 0, z: 0, width: 1, height: 4, depth: 40, solid: true },
    { id: "wall3", type: "wall", x: 0, y: 0, z: -18, width: 40, height: 4, depth: 1, solid: true },
    { id: "wall4", type: "wall", x: 0, y: 0, z: 18, width: 40, height: 4, depth: 1, solid: true },

    // Árvores
    { id: "tree1", type: "tree", x: -15, y: 0, z: -15, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree2", type: "tree", x: 15, y: 0, z: -15, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree3", type: "tree", x: -15, y: 0, z: 15, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree4", type: "tree", x: 15, y: 0, z: 15, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree5", type: "tree", x: -10, y: 0, z: -10, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree6", type: "tree", x: 10, y: 0, z: -10, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree7", type: "tree", x: -10, y: 0, z: 10, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree8", type: "tree", x: 10, y: 0, z: 10, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree9", type: "tree", x: 0, y: 0, z: -12, width: 1, height: 4, depth: 1, solid: false },
    { id: "tree10", type: "tree", x: 0, y: 0, z: 12, width: 1, height: 4, depth: 1, solid: false },

    // Rochas
    { id: "rock1", type: "rock", x: -12, y: 0, z: -12, width: 1, height: 1, depth: 1, solid: false },
    { id: "rock2", type: "rock", x: 12, y: 0, z: -12, width: 1, height: 1, depth: 1, solid: false },
    { id: "rock3", type: "rock", x: -12, y: 0, z: 12, width: 1, height: 1, depth: 1, solid: false },
    { id: "rock4", type: "rock", x: 12, y: 0, z: 12, width: 1, height: 1, depth: 1, solid: false },

    // Baús
    {
      id: "chest1", type: "chest", x: -15, y: 0, z: 0, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "gold_coin", name: "Moeda de Ouro", type: "consumable", rarity: "common", stats: { hp: 10 }, description: "Uma moeda de ouro valiosa.", icon: "💰" },
    },
    {
      id: "chest2", type: "chest", x: 15, y: 0, z: 0, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "health_potion", name: "Poção de Vida", type: "consumable", rarity: "uncommon", stats: { hp: 50 }, description: "Restaura 50 de HP.", icon: "💊" },
    },
    {
      id: "chest3", type: "chest", x: 0, y: 0, z: 15, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "sword", name: "Espada de Madeira", type: "weapon", rarity: "common", stats: { attack: 5 }, description: "Uma espada simples para iniciantes.", icon: "⚔️" },
    },
    {
      id: "chest4", type: "chest", x: 0, y: 0, z: -15, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "shield", name: "Escudo de Madeira", type: "armor", rarity: "common", stats: { defense: 3 }, description: "Um escudo leve para defender.", icon: "🛡️" },
    },

    // Portal para a caverna
    {
      id: "portal1", type: "portal", x: 0, y: 0, z: -16, width: 2, height: 3, depth: 1, solid: false,
      portalTo: "cave", portalSpawn: { x: 0, y: 0, z: 25 },
    },
  ],
  npcs: [
    { id: "merchant1", name: "Mercador", x: -8, y: 0, z: 8, type: "merchant", dialogue: ["Olá! Como posso ajudar?", "Vem comprar algo!"], isMoving: false, movementPattern: "static" },
    { id: "guard1", name: "Guarda", x: 8, y: 0, z: -8, type: "guard", dialogue: ["Quem é você?", "Não se aproxime!"], isMoving: false, movementPattern: "static" },
    { id: "quest1", name: "Guia de Missão", x: 0, y: 0, z: 0, type: "quest", dialogue: ["Preciso de ajuda para derrotar o dragão!"], isMoving: false, movementPattern: "static" },
    { id: "wanderer1", name: "Vagabundo", x: -12, y: 0, z: 0, type: "wanderer", dialogue: ["Onde está a cidade?", "Preciso de um guia."], isMoving: false, movementPattern: "static" },
  ],
  spawnPoints: [{ x: 0, y: 0, z: 0 }],
};
