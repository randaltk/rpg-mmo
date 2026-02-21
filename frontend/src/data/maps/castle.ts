import { Map } from "@/types/game";

export const castleMap: Map = {
  id: "castle",
  name: "Salão do Castelo",
  width: 24,
  height: 32,
  objects: [
    // Paredes do salão
    { id: "cw_n", type: "wall", x: 0, y: 0, z: -15, width: 24, height: 6, depth: 1, solid: true },
    { id: "cw_s", type: "wall", x: 0, y: 0, z: 15, width: 24, height: 6, depth: 1, solid: true },
    { id: "cw_w", type: "wall", x: -11, y: 0, z: 0, width: 1, height: 6, depth: 32, solid: true },
    { id: "cw_e", type: "wall", x: 11, y: 0, z: 0, width: 1, height: 6, depth: 32, solid: true },

    // Pilares internos
    { id: "pillar1", type: "rock", x: -6, y: 0, z: -8, width: 0.8, height: 5.5, depth: 0.8, solid: true },
    { id: "pillar2", type: "rock", x: 6, y: 0, z: -8, width: 0.8, height: 5.5, depth: 0.8, solid: true },
    { id: "pillar3", type: "rock", x: -6, y: 0, z: 0, width: 0.8, height: 5.5, depth: 0.8, solid: true },
    { id: "pillar4", type: "rock", x: 6, y: 0, z: 0, width: 0.8, height: 5.5, depth: 0.8, solid: true },
    { id: "pillar5", type: "rock", x: -6, y: 0, z: 8, width: 0.8, height: 5.5, depth: 0.8, solid: true },
    { id: "pillar6", type: "rock", x: 6, y: 0, z: 8, width: 0.8, height: 5.5, depth: 0.8, solid: true },

    // Trono (fundo do salão)
    { id: "throne_base", type: "chest", x: 0, y: 0, z: -12, width: 2, height: 1.5, depth: 1.5, solid: true },

    // Tapete vermelho central (usando items como marcadores decorativos)
    { id: "carpet1", type: "rock", x: 0, y: -0.9, z: -5, width: 3, height: 0.05, depth: 20, solid: false },

    // Portal para a Caverna (lado esquerdo)
    {
      id: "portal_cave", type: "portal", x: -8, y: 0, z: 0, width: 2, height: 3, depth: 1, solid: false,
      portalTo: "cave", portalSpawn: { x: 0, y: 0, z: 25 },
    },

    // Portal para a Town (lado direito)
    {
      id: "portal_town", type: "portal", x: 8, y: 0, z: 0, width: 2, height: 3, depth: 1, solid: false,
      portalTo: "town", portalSpawn: { x: 0, y: 0, z: 0 },
    },

    // Baú do tesouro real
    {
      id: "royal_chest", type: "chest", x: 0, y: 0, z: -8, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "royal_sword", name: "Espada Real", type: "weapon", rarity: "legendary", stats: { attack: 25 }, description: "A lendária espada do rei.", icon: "⚔️" },
    },
  ],
  npcs: [
    {
      id: "king_advisor", name: "Conselheiro Real", x: 2, y: 0, z: -11,
      type: "quest",
      dialogue: [
        "Bem-vindo ao Castelo, aventureiro!",
        "O rei precisa de heróis corajosos.",
        "Explore a caverna ou visite a vila pelos portais.",
      ],
      isMoving: false, movementPattern: "static",
    },
    {
      id: "castle_guard1", name: "Guarda Real", x: -4, y: 0, z: 12,
      type: "guard",
      dialogue: ["O castelo está seguro.", "Ninguém passa sem permissão."],
      isMoving: false, movementPattern: "static",
    },
    {
      id: "castle_guard2", name: "Guarda Real", x: 4, y: 0, z: 12,
      type: "guard",
      dialogue: ["Fique alerta, aventureiro.", "Protegemos o rei com nossas vidas."],
      isMoving: false, movementPattern: "static",
    },
    {
      id: "castle_merchant", name: "Armeiro do Rei", x: -8, y: 0, z: -8,
      type: "merchant",
      dialogue: [
        "As melhores armas do reino estão aqui!",
        "Forjadas com aço real.",
      ],
      isMoving: false, movementPattern: "static",
    },
  ],
  spawnPoints: [{ x: 0, y: 0, z: 8 }],
};
