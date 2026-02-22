import type { GameMap, MapObject, MonsterSpawn, PortalTier, Item } from '@/types/game';
import { createSeededRNG, hashCoord } from './seed';

const TILE_SIZE = 2;

interface DungeonConfig {
  gridW: number;
  gridH: number;
  walkSteps: number;
  roomMinSize: number;
  monsterDensity: number;
  chestCount: number;
  levelRange: [number, number];
}

const TIER_CONFIG: Record<PortalTier, DungeonConfig> = {
  easy:   { gridW: 30, gridH: 30, walkSteps: 300,  roomMinSize: 6,  monsterDensity: 0.04, chestCount: 2, levelRange: [2, 4] },
  medium: { gridW: 40, gridH: 40, walkSteps: 550,  roomMinSize: 8,  monsterDensity: 0.05, chestCount: 3, levelRange: [4, 7] },
  hard:   { gridW: 50, gridH: 50, walkSteps: 800,  roomMinSize: 10, monsterDensity: 0.06, chestCount: 4, levelRange: [7, 10] },
  boss:   { gridW: 50, gridH: 50, walkSteps: 900,  roomMinSize: 12, monsterDensity: 0.07, chestCount: 5, levelRange: [10, 15] },
};

const TIER_LOOT: Record<PortalTier, Item[]> = {
  easy: [
    { id: 'dg_hp_pot', name: 'Poção de Vida', type: 'consumable', rarity: 'common', stats: { hp: 30 }, description: 'Restaura 30 HP.', icon: '💊' },
    { id: 'dg_iron_sword', name: 'Espada de Ferro', type: 'weapon', rarity: 'uncommon', stats: { attack: 6 }, description: 'Uma espada simples.', icon: '⚔️' },
  ],
  medium: [
    { id: 'dg_hp_pot_m', name: 'Poção de Vida+', type: 'consumable', rarity: 'uncommon', stats: { hp: 60 }, description: 'Restaura 60 HP.', icon: '💊' },
    { id: 'dg_steel_sword', name: 'Espada de Aço', type: 'weapon', rarity: 'rare', stats: { attack: 12 }, description: 'Lâmina afiada.', icon: '⚔️' },
    { id: 'dg_chain_armor', name: 'Cota de Malha', type: 'armor', rarity: 'uncommon', stats: { defense: 8 }, description: 'Proteção moderada.', icon: '🛡️' },
  ],
  hard: [
    { id: 'dg_elixir', name: 'Elixir Vital', type: 'consumable', rarity: 'rare', stats: { hp: 100 }, description: 'Restaura 100 HP.', icon: '💊' },
    { id: 'dg_flame_blade', name: 'Lâmina Flamejante', type: 'weapon', rarity: 'epic', stats: { attack: 20 }, description: 'Arde com fogo antigo.', icon: '🔥' },
    { id: 'dg_plate_armor', name: 'Armadura de Placas', type: 'armor', rarity: 'rare', stats: { defense: 14 }, description: 'Proteção pesada.', icon: '🛡️' },
  ],
  boss: [
    { id: 'dg_legendary_pot', name: 'Lágrima de Fênix', type: 'consumable', rarity: 'epic', stats: { hp: 200 }, description: 'Cura lendária.', icon: '✨' },
    { id: 'dg_shadow_blade', name: 'Espada das Sombras', type: 'weapon', rarity: 'legendary', stats: { attack: 30 }, description: 'Forjada na escuridão.', icon: '⚔️' },
    { id: 'dg_dragon_armor', name: 'Armadura Dracônica', type: 'armor', rarity: 'legendary', stats: { defense: 22 }, description: 'Escamas de dragão.', icon: '🐉' },
    { id: 'dg_kings_ring', name: 'Anel do Rei Morto', type: 'accessory', rarity: 'legendary', stats: { attack: 10, defense: 10 }, description: 'Poder antigo.', icon: '💍' },
  ],
};

const MONSTER_TABLES: Record<PortalTier, { type: 'slime' | 'goblin' | 'wolf' | 'skeleton'; weight: number }[]> = {
  easy: [
    { type: 'slime', weight: 50 },
    { type: 'goblin', weight: 30 },
    { type: 'wolf', weight: 20 },
  ],
  medium: [
    { type: 'goblin', weight: 35 },
    { type: 'wolf', weight: 30 },
    { type: 'skeleton', weight: 35 },
  ],
  hard: [
    { type: 'skeleton', weight: 45 },
    { type: 'goblin', weight: 25 },
    { type: 'wolf', weight: 30 },
  ],
  boss: [
    { type: 'skeleton', weight: 60 },
    { type: 'goblin', weight: 20 },
    { type: 'wolf', weight: 20 },
  ],
};

interface Room {
  id: number;
  tiles: { gx: number; gz: number }[];
  cx: number;
  cz: number;
}

function pickWeighted<T extends { weight: number }>(items: T[], rng: () => number): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export function generateDungeon(
  caveSeed: number,
  tier: PortalTier,
  dungeonOrigin?: { x: number; z: number },
): GameMap {
  const cfg = TIER_CONFIG[tier];
  const rng = createSeededRNG(caveSeed);
  const { gridW, gridH } = cfg;

  // Grid: 0 = wall, 1 = floor
  const grid: number[] = new Array(gridW * gridH).fill(0);
  const idx = (gx: number, gz: number) => gz * gridW + gx;
  const inBounds = (gx: number, gz: number) => gx >= 1 && gx < gridW - 1 && gz >= 1 && gz < gridH - 1;

  // Random walk to carve floors
  let wx = Math.floor(gridW / 2);
  let wz = Math.floor(gridH / 2);
  grid[idx(wx, wz)] = 1;

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let step = 0; step < cfg.walkSteps; step++) {
    const [dx, dz] = dirs[Math.floor(rng() * 4)];
    const nx = wx + dx;
    const nz = wz + dz;
    if (inBounds(nx, nz)) {
      wx = nx;
      wz = nz;
      grid[idx(wx, wz)] = 1;
    }
  }

  // Widen corridors by occasionally carving neighbors
  for (let gz = 2; gz < gridH - 2; gz++) {
    for (let gx = 2; gx < gridW - 2; gx++) {
      if (grid[idx(gx, gz)] === 1) {
        for (const [dx, dz] of dirs) {
          if (rng() < 0.3 && inBounds(gx + dx, gz + dz)) {
            grid[idx(gx + dx, gz + dz)] = 1;
          }
        }
      }
    }
  }

  // Flood fill to find rooms (connected components)
  const visited = new Array(gridW * gridH).fill(false);
  const rooms: Room[] = [];

  for (let gz = 1; gz < gridH - 1; gz++) {
    for (let gx = 1; gx < gridW - 1; gx++) {
      if (grid[idx(gx, gz)] === 1 && !visited[idx(gx, gz)]) {
        const tiles: { gx: number; gz: number }[] = [];
        const queue = [{ gx, gz }];
        visited[idx(gx, gz)] = true;

        while (queue.length > 0) {
          const cur = queue.shift()!;
          tiles.push(cur);
          for (const [dx, dz] of dirs) {
            const nx = cur.gx + dx;
            const nz = cur.gz + dz;
            if (inBounds(nx, nz) && grid[idx(nx, nz)] === 1 && !visited[idx(nx, nz)]) {
              visited[idx(nx, nz)] = true;
              queue.push({ gx: nx, gz: nz });
            }
          }
        }

        if (tiles.length >= cfg.roomMinSize) {
          const cx = tiles.reduce((s, t) => s + t.gx, 0) / tiles.length;
          const cz = tiles.reduce((s, t) => s + t.gz, 0) / tiles.length;
          rooms.push({ id: rooms.length, tiles, cx, cz });
        }
      }
    }
  }

  // If no rooms, carve a big room around center
  if (rooms.length === 0) {
    const halfR = 5;
    const cg = Math.floor(gridW / 2);
    const tiles: { gx: number; gz: number }[] = [];
    for (let dz = -halfR; dz <= halfR; dz++) {
      for (let dx = -halfR; dx <= halfR; dx++) {
        const gx = cg + dx;
        const gz = cg + dz;
        if (inBounds(gx, gz)) {
          grid[idx(gx, gz)] = 1;
          tiles.push({ gx, gz });
        }
      }
    }
    rooms.push({ id: 0, tiles, cx: cg, cz: cg });
  }

  // Connect disconnected rooms (ensure the main room connects to all others)
  if (rooms.length > 1) {
    for (let i = 1; i < rooms.length; i++) {
      let ax = Math.round(rooms[0].cx);
      let az = Math.round(rooms[0].cz);
      const bx = Math.round(rooms[i].cx);
      const bz = Math.round(rooms[i].cz);

      while (ax !== bx) {
        ax += ax < bx ? 1 : -1;
        if (inBounds(ax, az)) grid[idx(ax, az)] = 1;
        if (inBounds(ax, az + 1)) grid[idx(ax, az + 1)] = 1;
      }
      while (az !== bz) {
        az += az < bz ? 1 : -1;
        if (inBounds(ax, az)) grid[idx(ax, az)] = 1;
        if (inBounds(ax + 1, az)) grid[idx(ax + 1, az)] = 1;
      }
    }
  }

  // Convert grid to world coordinates
  const mapW = gridW * TILE_SIZE;
  const mapH = gridH * TILE_SIZE;
  const halfW = mapW / 2;
  const halfH = mapH / 2;
  const toWorldX = (gx: number) => gx * TILE_SIZE - halfW + TILE_SIZE / 2;
  const toWorldZ = (gz: number) => gz * TILE_SIZE - halfH + TILE_SIZE / 2;

  // Build wall objects from grid boundaries
  const objects: MapObject[] = [];
  let wallId = 0;
  for (let gz = 0; gz < gridH; gz++) {
    for (let gx = 0; gx < gridW; gx++) {
      if (grid[idx(gx, gz)] === 0) {
        let hasFloorNeighbor = false;
        for (const [dx, dz] of dirs) {
          const nx = gx + dx;
          const nz = gz + dz;
          if (nx >= 0 && nx < gridW && nz >= 0 && nz < gridH && grid[idx(nx, nz)] === 1) {
            hasFloorNeighbor = true;
            break;
          }
        }
        if (hasFloorNeighbor) {
          objects.push({
            id: `dg_wall_${wallId++}`,
            type: 'wall',
            x: toWorldX(gx),
            y: 0,
            z: toWorldZ(gz),
            width: TILE_SIZE,
            height: 3,
            depth: TILE_SIZE,
            solid: true,
          });
        }
      }
    }
  }

  // Find start room (closest to center) and end room (farthest from start)
  const startRoom = rooms.reduce((best, r) => {
    const d = (r.cx - gridW / 2) ** 2 + (r.cz - gridH / 2) ** 2;
    const bd = (best.cx - gridW / 2) ** 2 + (best.cz - gridH / 2) ** 2;
    return d < bd ? r : best;
  });

  const endRoom = rooms.reduce((best, r) => {
    const d = (r.cx - startRoom.cx) ** 2 + (r.cz - startRoom.cz) ** 2;
    const bd = (best.cx - startRoom.cx) ** 2 + (best.cz - startRoom.cz) ** 2;
    return d > bd ? r : best;
  });

  const entryX = toWorldX(Math.round(startRoom.cx));
  const entryZ = toWorldZ(Math.round(startRoom.cz));
  const exitX = toWorldX(Math.round(endRoom.cx));
  const exitZ = toWorldZ(Math.round(endRoom.cz));

  const mapId = `dungeon_${caveSeed}`;

  // Offset the return spawn away from the dungeon world portal so the player
  // doesn't immediately re-enter the dungeon when exiting.
  const returnSpawn = dungeonOrigin
    ? { x: dungeonOrigin.x + 5, y: 0, z: dungeonOrigin.z + 5 }
    : { x: 0, y: 0, z: 5 };

  // Entry portal (back to town) — placed at the edge of the start room,
  // away from the player spawn point.
  const entryPortalZ = entryZ - 4;
  objects.push({
    id: `${mapId}_portal_entry`,
    type: 'portal',
    x: entryX, y: 0, z: entryPortalZ,
    width: 2, height: 3, depth: 1,
    solid: false,
    portalTo: 'town',
    portalSpawn: returnSpawn,
  });

  // Exit portal (in the farthest room)
  if (endRoom.id !== startRoom.id) {
    objects.push({
      id: `${mapId}_portal_exit`,
      type: 'portal',
      x: exitX, y: 0, z: exitZ,
      width: 2, height: 3, depth: 1,
      solid: false,
      portalTo: 'town',
      portalSpawn: returnSpawn,
    });
  }

  // Chests in rooms (skip start and end)
  const chestRooms = rooms.filter(r => r.id !== startRoom.id && r.id !== endRoom.id);
  const lootTable = TIER_LOOT[tier];
  const chestCount = Math.min(cfg.chestCount, chestRooms.length);
  for (let i = 0; i < chestCount; i++) {
    const room = chestRooms[i % chestRooms.length];
    const item = lootTable[Math.floor(rng() * lootTable.length)];
    const tile = room.tiles[Math.floor(rng() * room.tiles.length)];
    objects.push({
      id: `${mapId}_chest_${i}`,
      type: 'chest',
      x: toWorldX(tile.gx), y: 0, z: toWorldZ(tile.gz),
      width: 1, height: 1, depth: 1,
      solid: false,
      item: { ...item, id: `${item.id}_${caveSeed}_${i}` },
    });
  }

  // Crystal decorations
  for (let i = 0; i < 6; i++) {
    const room = rooms[Math.floor(rng() * rooms.length)];
    const tile = room.tiles[Math.floor(rng() * room.tiles.length)];
    const colors = ['#00CED1', '#9B30FF', '#00FF7F', '#FF6347'];
    objects.push({
      id: `${mapId}_crystal_${i}`,
      type: 'rock',
      x: toWorldX(tile.gx), y: 0, z: toWorldZ(tile.gz),
      width: 0.3, height: 0.8 + rng() * 0.5, depth: 0.3,
      solid: false,
      variant: 'crystal',
      colorOverride: colors[Math.floor(rng() * colors.length)],
    });
  }

  // Monster spawns
  const monsterSpawns: MonsterSpawn[] = [];
  const monsterTable = MONSTER_TABLES[tier];
  const [minLv, maxLv] = cfg.levelRange;

  for (const room of rooms) {
    if (room.id === startRoom.id) continue;

    const isBossRoom = tier === 'boss' && room.id === endRoom.id;

    if (isBossRoom) {
      monsterSpawns.push({
        id: `${mapId}_boss`,
        type: 'skeleton',
        x: toWorldX(Math.round(room.cx)),
        z: toWorldZ(Math.round(room.cz)),
        count: 1,
        radius: 3,
        level: maxLv,
        color: '#FFD700',
        variant: 'chief',
      });
      continue;
    }

    const spawnCount = Math.max(1, Math.floor(room.tiles.length * cfg.monsterDensity));
    for (let i = 0; i < spawnCount; i++) {
      const tile = room.tiles[Math.floor(rng() * room.tiles.length)];
      const entry = pickWeighted(monsterTable, rng);
      const level = minLv + Math.floor(rng() * (maxLv - minLv + 1));

      const colorMap: Record<string, string> = {
        slime: '#4CAF50', goblin: '#5D8C3E', wolf: '#5A5A5A', skeleton: '#E8E0D0',
      };

      monsterSpawns.push({
        id: `${mapId}_spawn_${room.id}_${i}`,
        type: entry.type,
        x: toWorldX(tile.gx),
        z: toWorldZ(tile.gz),
        count: 1,
        radius: 2,
        level,
        color: colorMap[entry.type],
      });
    }
  }

  return {
    id: mapId,
    name: `Caverna ${tier === 'easy' ? 'Fácil' : tier === 'medium' ? 'Média' : tier === 'hard' ? 'Difícil' : 'do Boss'}`,
    width: mapW,
    height: mapH,
    objects,
    npcs: [],
    spawnPoints: [{ x: entryX, y: 0, z: entryZ + 3 }],
    monsterSpawns,
    dungeonOrigin,
  };
}
