import { Map } from "@/types/game";

export const caveMap: Map = {
  id: "cave",
  name: "Caverna Cristalina",
  width: 60,
  height: 60,
  objects: [
    // Bordas naturais com rochas (sem paredes retas - espaco aberto)
    // Norte
    { id: "border_n1", type: "rock", x: -20, y: 0, z: -28, width: 3, height: 3, depth: 3, solid: true },
    { id: "border_n2", type: "rock", x: -12, y: 0, z: -27, width: 4, height: 2.5, depth: 3, solid: true },
    { id: "border_n3", type: "rock", x: -4, y: 0, z: -29, width: 3, height: 3.5, depth: 2, solid: true },
    { id: "border_n4", type: "rock", x: 5, y: 0, z: -28, width: 4, height: 2, depth: 3, solid: true },
    { id: "border_n5", type: "rock", x: 14, y: 0, z: -27, width: 3, height: 3, depth: 3, solid: true },
    { id: "border_n6", type: "rock", x: 22, y: 0, z: -28, width: 4, height: 2.5, depth: 2, solid: true },
    // Sul
    { id: "border_s1", type: "rock", x: -18, y: 0, z: 28, width: 4, height: 2.5, depth: 3, solid: true },
    { id: "border_s2", type: "rock", x: -8, y: 0, z: 27, width: 3, height: 3, depth: 2, solid: true },
    { id: "border_s3", type: "rock", x: 3, y: 0, z: 29, width: 4, height: 2, depth: 3, solid: true },
    { id: "border_s4", type: "rock", x: 15, y: 0, z: 28, width: 3, height: 3.5, depth: 2, solid: true },
    { id: "border_s5", type: "rock", x: 24, y: 0, z: 27, width: 4, height: 2.5, depth: 3, solid: true },
    // Leste
    { id: "border_e1", type: "rock", x: 28, y: 0, z: -20, width: 3, height: 3, depth: 4, solid: true },
    { id: "border_e2", type: "rock", x: 27, y: 0, z: -10, width: 3, height: 2.5, depth: 3, solid: true },
    { id: "border_e3", type: "rock", x: 29, y: 0, z: 0, width: 2, height: 3.5, depth: 4, solid: true },
    { id: "border_e4", type: "rock", x: 28, y: 0, z: 12, width: 3, height: 2, depth: 3, solid: true },
    { id: "border_e5", type: "rock", x: 27, y: 0, z: 22, width: 3, height: 3, depth: 4, solid: true },
    // Oeste
    { id: "border_w1", type: "rock", x: -28, y: 0, z: -18, width: 3, height: 2.5, depth: 4, solid: true },
    { id: "border_w2", type: "rock", x: -27, y: 0, z: -6, width: 3, height: 3, depth: 3, solid: true },
    { id: "border_w3", type: "rock", x: -29, y: 0, z: 5, width: 2, height: 3.5, depth: 4, solid: true },
    { id: "border_w4", type: "rock", x: -28, y: 0, z: 16, width: 3, height: 2, depth: 3, solid: true },
    { id: "border_w5", type: "rock", x: -27, y: 0, z: 25, width: 3, height: 3, depth: 4, solid: true },

    // Formacoes rochosas internas (decorativas)
    { id: "rock_cluster1", type: "rock", x: -15, y: 0, z: -15, width: 2, height: 2, depth: 2, solid: false },
    { id: "rock_cluster2", type: "rock", x: 18, y: 0, z: -12, width: 1.5, height: 2.5, depth: 1.5, solid: false },
    { id: "rock_cluster3", type: "rock", x: -20, y: 0, z: 10, width: 2, height: 1.5, depth: 2, solid: false },
    { id: "rock_cluster4", type: "rock", x: 20, y: 0, z: 15, width: 1.5, height: 3, depth: 1.5, solid: false },

    // Estalagmites grandes
    { id: "stalagmite1", type: "rock", x: -10, y: 0, z: -20, width: 1, height: 4, depth: 1, solid: false },
    { id: "stalagmite2", type: "rock", x: 12, y: 0, z: -18, width: 0.8, height: 3.5, depth: 0.8, solid: false },
    { id: "stalagmite3", type: "rock", x: -18, y: 0, z: 0, width: 1, height: 5, depth: 1, solid: false },
    { id: "stalagmite4", type: "rock", x: 22, y: 0, z: 5, width: 0.8, height: 4, depth: 0.8, solid: false },
    { id: "stalagmite5", type: "rock", x: -8, y: 0, z: 18, width: 1, height: 3, depth: 1, solid: false },
    { id: "stalagmite6", type: "rock", x: 15, y: 0, z: 20, width: 0.8, height: 4.5, depth: 0.8, solid: false },

    // Cristais magicos (coletaveis)
    {
      id: "crystal1", type: "item", x: -12, y: 0, z: -8, width: 0.5, height: 1.2, depth: 0.5, solid: false,
      item: { id: "blue_crystal", name: "Cristal Azul", type: "consumable", rarity: "rare", stats: { hp: 100 }, description: "Um cristal pulsante com energia mágica azul.", icon: "💎" },
    },
    {
      id: "crystal2", type: "item", x: 14, y: 0, z: -5, width: 0.5, height: 1.2, depth: 0.5, solid: false,
      item: { id: "purple_crystal", name: "Cristal Púrpura", type: "consumable", rarity: "epic", stats: { hp: 150 }, description: "Um cristal raro com poder ancestral.", icon: "💎" },
    },
    {
      id: "crystal3", type: "item", x: 0, y: 0, z: -20, width: 0.5, height: 1.2, depth: 0.5, solid: false,
      item: { id: "green_crystal", name: "Cristal Verde", type: "material", rarity: "rare", stats: {}, description: "Material de forja valioso encontrado nas profundezas.", icon: "💎" },
    },

    // Baus espalhados
    {
      id: "cave_chest1", type: "chest", x: -20, y: 0, z: -20, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "cave_sword", name: "Lâmina Cristalina", type: "weapon", rarity: "epic", stats: { attack: 15 }, description: "Uma espada forjada com cristais da caverna.", icon: "⚔️" },
    },
    {
      id: "cave_chest2", type: "chest", x: 20, y: 0, z: -18, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "cave_armor", name: "Armadura de Pedra", type: "armor", rarity: "rare", stats: { defense: 10 }, description: "Armadura resistente feita de rocha encantada.", icon: "🛡️" },
    },
    {
      id: "cave_chest3", type: "chest", x: 0, y: 0, z: 15, width: 1, height: 1, depth: 1, solid: false,
      item: { id: "cave_treasure", name: "Tesouro Ancestral", type: "consumable", rarity: "legendary", stats: { hp: 500 }, description: "Um artefato lendário das profundezas.", icon: "🏺" },
    },

    // Portal de volta para o castelo
    {
      id: "portal_back", type: "portal", x: 0, y: 0, z: 27, width: 2, height: 3, depth: 1, solid: false,
      portalTo: "castle", portalSpawn: { x: -8, y: 0, z: 2 },
    },
  ],
  npcs: [
    {
      id: "cave_miner", name: "Mineiro Durão", x: -10, y: 0, z: 5,
      type: "merchant",
      dialogue: [
        "Ei, garoto! Quer comprar minerais?",
        "Esses cristais valem uma fortuna lá em cima!",
        "Cuidado com as sombras... elas se movem.",
      ],
      isMoving: false, movementPattern: "static",
    },
    {
      id: "cave_sage", name: "Sábia das Profundezas", x: 8, y: 0, z: -10,
      type: "quest",
      dialogue: [
        "Você busca poder? Os cristais podem te dar o que procura...",
        "Mas cuidado, jovem. O poder tem um preço.",
        "Traga-me 3 Cristais Azuis e te revelarei um segredo.",
      ],
      isMoving: false, movementPattern: "static",
    },
    {
      id: "cave_blacksmith", name: "Ferreiro das Profundezas", x: -5, y: 0, z: -15,
      type: "merchant",
      dialogue: [
        "Forjo as melhores armas com cristais da caverna!",
        "Traga materiais e faço algo especial pra você.",
      ],
      isMoving: false, movementPattern: "static",
    },
    {
      id: "cave_explorer", name: "Explorador Perdido", x: 18, y: 0, z: 10,
      type: "wanderer",
      dialogue: [
        "Estou perdido há dias...",
        "Você conhece o caminho de volta?",
        "Ouvi rugidos vindos do fundo da caverna...",
      ],
      isMoving: false, movementPattern: "static",
    },
    {
      id: "cave_guardian", name: "Guardião de Pedra", x: 0, y: 0, z: 0,
      type: "guard",
      dialogue: [
        "Halt! Somente os dignos podem passar.",
        "Prove seu valor, aventureiro.",
      ],
      isMoving: false, movementPattern: "static",
    },
  ],
  spawnPoints: [{ x: 0, y: 0, z: 25 }],
};
