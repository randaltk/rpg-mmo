import { create } from "zustand";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface MonsterLiveData {
  id: string;
  x: number;
  z: number;
  state: string;
}

export interface CombatEventEntry {
  type: string;
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
  _spawnTime: number;
}

interface GameState {
  localPlayerPos: Position3D | null;
  moveDirection: { x: number; z: number } | null;
  combatTarget: { id: string } | null;
  clearTarget: (() => void) | null;
  combatEvents: CombatEventEntry[];
  monstersData: MonsterLiveData[] | null;
  attackingPlayers: Set<string>;
  cameraYaw: { current: number } | null;
  teleportTo: Position3D | null;
  checkCollision: ((x: number, y: number, z: number) => boolean) | null;
}

interface GameActions {
  setLocalPlayerPos: (pos: Position3D | null) => void;
  setMoveDirection: (dir: { x: number; z: number } | null) => void;
  setCombatTarget: (target: { id: string } | null) => void;
  setClearTarget: (fn: (() => void) | null) => void;
  pushCombatEvent: (event: CombatEventEntry) => void;
  drainCombatEvents: () => CombatEventEntry[];
  setMonstersData: (data: MonsterLiveData[]) => void;
  addAttackingPlayer: (id: string) => void;
  removeAttackingPlayer: (id: string) => void;
  setCameraYaw: (ref: { current: number }) => void;
  setTeleportTo: (pos: Position3D | null) => void;
  setCheckCollision: (fn: (x: number, y: number, z: number) => boolean) => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  localPlayerPos: null,
  moveDirection: null,
  combatTarget: null,
  clearTarget: null,
  combatEvents: [],
  monstersData: null,
  attackingPlayers: new Set(),
  cameraYaw: null,
  teleportTo: null,
  checkCollision: null,

  setLocalPlayerPos: (pos) => set({ localPlayerPos: pos }),
  setMoveDirection: (dir) => set({ moveDirection: dir }),
  setCombatTarget: (target) => set({ combatTarget: target }),
  setClearTarget: (fn) => set({ clearTarget: fn }),

  pushCombatEvent: (event) =>
    set((s) => ({ combatEvents: [...s.combatEvents, event] })),

  drainCombatEvents: () => {
    const events = get().combatEvents;
    if (events.length === 0) return events;
    set({ combatEvents: [] });
    return events;
  },

  setMonstersData: (data) => set({ monstersData: data }),

  addAttackingPlayer: (id) =>
    set((s) => {
      const next = new Set(s.attackingPlayers);
      next.add(id);
      return { attackingPlayers: next };
    }),

  removeAttackingPlayer: (id) =>
    set((s) => {
      const next = new Set(s.attackingPlayers);
      next.delete(id);
      return { attackingPlayers: next };
    }),

  setCameraYaw: (ref) => set({ cameraYaw: ref }),
  setTeleportTo: (pos) => set({ teleportTo: pos }),
  setCheckCollision: (fn) => set({ checkCollision: fn }),
}));
