import type { WorldSeed } from '@/lib/worldgen/seed';

export type CharacterClass = 'knight' | 'paladin' | 'rogue' | 'assassin' | 'ranger' | 'wizard' | 'sorcerer' | 'priest' | 'monk';

// --- Procedural World Types ---

export type BiomeType = 'plains' | 'forest' | 'swamp' | 'rocky' | 'ruins';

export type TreeVariant = 'oak' | 'pine' | 'willow' | 'dead' | 'mushroom' | 'cherry' | 'baobab';
export type RockVariant = 'boulder' | 'crystal' | 'stacked' | 'mossy' | 'flat';
export type StructureVariant = 'ruins_pillar' | 'ruins_wall' | 'camp' | 'totem' | 'altar';
export type MonsterVariant = 'fire' | 'ice' | 'poison' | 'golden' | 'warrior' | 'archer' | 'shaman' | 'chief';

export interface Player {
  id: string;
  nickname: string;
  x: number;
  y: number;
  z: number;
  color: string;
  characterClass?: CharacterClass;
  currentMapId?: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  experience: number;
  // Inventário
  inventory: Item[];
  equipped: {
    weapon?: Item;
    armor?: Item;
    accessory?: Item;
  };
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack?: number;
    defense?: number;
    hp?: number;
  };
  description: string;
  icon: string;
}

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  type: 'merchant' | 'guard' | 'quest' | 'wanderer';
  dialogue: string[];
  isMoving: boolean;
  movementPattern?: 'random' | 'patrol' | 'static';
}

export interface MapObject {
  id: string;
  type: 'wall' | 'tree' | 'rock' | 'chest' | 'door' | 'item' | 'portal' | 'structure';
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  solid: boolean;
  item?: Item;
  portalTo?: string;
  portalSpawn?: { x: number; y: number; z: number };
  variant?: TreeVariant | RockVariant | StructureVariant;
  biome?: BiomeType;
  scale?: number;
  colorOverride?: string;
}

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  objects: MapObject[];
  npcs: NPC[];
  spawnPoints: { x: number; y: number; z: number }[];
  monsterSpawns?: MonsterSpawn[];
  seed?: WorldSeed;
  heightmap?: Float32Array;
  heightmapResolution?: number;
  biomeMap?: BiomeType[];
  biomeMapResolution?: number;
}

export interface GameState {
  players: Record<string, Player>;
  currentPlayer: Player | null;
  isConnected: boolean;
  isLoggedIn: boolean;
  currentMap: GameMap;
  availableMaps: GameMap[];
  allMaps: Record<string, GameMap>;
}

export interface ChatMessage {
  id: string;
  msg: string;
  timestamp?: number;
  type: 'normal' | 'system' | 'trade' | 'guild';
  playerId?: string;
}

export interface MovementData {
  x: number;
  y: number;
  z: number;
}

export interface Monster {
  id: string;
  name: string;
  type: 'slime' | 'goblin' | 'wolf' | 'skeleton';
  x: number;
  y: number;
  z: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  level: number;
  expReward: number;
  color: string;
  state: 'idle' | 'wandering' | 'chasing' | 'attacking' | 'hurt' | 'dead';
  targetPlayerId?: string;
  spawnX: number;
  spawnZ: number;
  respawnTime: number;
  variant?: MonsterVariant;
  biome?: BiomeType;
}

export interface MonsterSpawn {
  id: string;
  type: Monster['type'];
  x: number;
  z: number;
  count: number;
  radius: number;
  level: number;
  color?: string;
  variant?: MonsterVariant;
  biome?: BiomeType;
}

export interface CombatEvent {
  type: 'playerAttack' | 'monsterAttack' | 'monsterDeath' | 'playerDeath';
  attackerId: string;
  targetId: string;
  damage: number;
  isCrit?: boolean;
  targetHp?: number;
  targetMaxHp?: number;
  expGained?: number;
  x: number;
  y: number;
  z: number;
}

export interface InteractionData {
  type: 'talk' | 'trade' | 'attack' | 'collect' | 'use';
  targetId: string;
  targetType: 'player' | 'npc' | 'object' | 'monster';
  data?: any;
}

