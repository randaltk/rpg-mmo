// backend/server.js
import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Estado dos jogadores em memória
let players = {};

// Sistema de mapas
const maps = {
  town: {
    id: 'town',
    name: 'Vila Inicial',
    width: 20,
    height: 20,
    objects: [
      { id: 'wall1', type: 'wall', x: -8, y: 0, z: 0, width: 1, height: 3, depth: 20, solid: true },
      { id: 'wall2', type: 'wall', x: 8, y: 0, z: 0, width: 1, height: 3, depth: 20, solid: true },
      { id: 'wall3', type: 'wall', x: 0, y: 0, z: -8, width: 20, height: 3, depth: 1, solid: true },
      { id: 'wall4', type: 'wall', x: 0, y: 0, z: 8, width: 20, height: 3, depth: 1, solid: true },
    ],
    npcs: [
      {
        id: 'merchant1',
        name: 'Mercador',
        x: -3, y: 0, z: -3,
        type: 'merchant',
        dialogue: ['Bem-vindo à minha loja!', 'O que posso fazer por você?'],
        isMoving: false,
        movementPattern: 'static'
      }
    ],
    spawnPoints: [{ x: 0, y: 0, z: 0 }]
  }
};

io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);

  // Jogador entra
  socket.on("join", ({ nickname }) => {
    // Gera uma cor hexadecimal válida (6 dígitos)
    const color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    
    players[socket.id] = {
      id: socket.id,
      nickname,
      x: 0,
      y: 0,
      z: 0,
      color: color,
      // Atributos de RPG
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      experience: 0,
      // Inventário
      inventory: [
        {
          id: 'potion1',
          name: 'Poção de Cura',
          type: 'consumable',
          rarity: 'common',
          stats: { hp: 50 },
          description: 'Restaura 50 pontos de vida',
          icon: '🧪'
        }
      ],
      equipped: {
        weapon: null,
        armor: null,
        accessory: null
      }
    };

    console.log("Jogador criado:", players[socket.id]);

    // Envia estado inicial
    socket.emit("currentPlayers", players);
    socket.emit("currentMap", maps.town);
    // Notifica outros
    socket.broadcast.emit("newPlayer", players[socket.id]);
  });

  // Movimentação
  socket.on("move", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...pos };
      console.log("Jogador movido:", players[socket.id]);
      socket.broadcast.emit("playerMoved", players[socket.id]);
    }
  });

  // Chat
  socket.on("chat", (msg) => {
    io.emit("chat", { id: socket.id, msg, type: 'normal' });
  });

  // Interação
  socket.on("interact", (interactionData) => {
    console.log("Interação recebida:", interactionData);
    // Aqui você implementaria a lógica de interação
    socket.emit("interactionResult", { success: true, message: "Interação realizada!" });
  });

  // Equipar item
  socket.on("equipItem", ({ itemId, slot }) => {
    if (players[socket.id]) {
      const player = players[socket.id];
      const item = player.inventory.find(item => item.id === itemId);
      
      if (item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
        // Remove item do inventário
        player.inventory = player.inventory.filter(i => i.id !== itemId);
        
        // Equipa o item
        player.equipped[slot] = item;
        
        // Atualiza atributos
        if (item.stats.attack) player.attack += item.stats.attack;
        if (item.stats.defense) player.defense += item.stats.defense;
        if (item.stats.hp) player.maxHp += item.stats.hp;
        
        socket.emit("playerUpdated", player);
        socket.broadcast.emit("playerMoved", player);
      }
    }
  });

  // Desconectar
  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});
