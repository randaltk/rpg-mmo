import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let players = {};

function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join", ({ nickname }) => {
      const color =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");

      players[socket.id] = {
        id: socket.id,
        nickname,
        x: 0,
        y: 0,
        z: 0,
        color,
        level: 1,
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        experience: 0,
        inventory: [
          {
            id: "potion1",
            name: "Poção de Cura",
            type: "consumable",
            rarity: "common",
            stats: { hp: 50 },
            description: "Restaura 50 pontos de vida",
            icon: "🧪",
          },
        ],
        equipped: { weapon: null, armor: null, accessory: null },
      };

      socket.emit("currentPlayers", players);
      socket.broadcast.emit("newPlayer", players[socket.id]);
    });

    socket.on("move", (pos) => {
      if (players[socket.id]) {
        players[socket.id] = { ...players[socket.id], ...pos };
        socket.broadcast.emit("playerMoved", players[socket.id]);
      }
    });

    socket.on("chat", (msg) => {
      io.emit("chat", { id: socket.id, msg, type: "normal" });
    });

    socket.on("interact", () => {
      socket.emit("interactionResult", {
        success: true,
        message: "Interação realizada!",
      });
    });

    socket.on("equipItem", ({ itemId, slot }) => {
      if (players[socket.id]) {
        const player = players[socket.id];
        const item = player.inventory.find((i) => i.id === itemId);

        if (
          item &&
          (item.type === "weapon" ||
            item.type === "armor" ||
            item.type === "accessory")
        ) {
          player.inventory = player.inventory.filter((i) => i.id !== itemId);
          player.equipped[slot] = item;

          if (item.stats.attack) player.attack += item.stats.attack;
          if (item.stats.defense) player.defense += item.stats.defense;
          if (item.stats.hp) player.maxHp += item.stats.hp;

          socket.emit("playerUpdated", player);
          socket.broadcast.emit("playerMoved", player);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Player left:", socket.id);
      delete players[socket.id];
      io.emit("removePlayer", socket.id);
    });
  });

  return io;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  setupSocketIO(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`> Server running at http://localhost:${port}`);
    console.log(`> Next.js + Socket.io unified`);
    console.log(`> Mode: ${dev ? "development" : "production"}`);
  });
});
