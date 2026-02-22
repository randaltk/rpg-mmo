export interface WorldSeed {
  base: number;
  seasonal: number;
  timestamp: number;
}

/**
 * Creates a deterministic pseudo-random number generator from a seed.
 * Uses a mulberry32 algorithm — fast, small, and good distribution.
 */
export function createSeededRNG(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hashes a 2D coordinate + seed into a deterministic integer.
 * Useful for per-tile decisions without needing a full RNG stream.
 */
export function hashCoord(x: number, z: number, seed: number): number {
  let h = seed | 0;
  h = (Math.imul(h ^ (x | 0), 0x45d9f3b) + 0x27d4eb2d) | 0;
  h = (Math.imul(h ^ (z | 0), 0x45d9f3b) + 0x27d4eb2d) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

/**
 * Generates a base seed from a string (e.g. server name).
 * Uses djb2 hash.
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Returns the ISO week number for a given date.
 */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Computes the seasonal seed based on the current ISO week.
 * Changes every Monday at 00:00 UTC.
 */
export function getSeasonalSeed(): { seasonal: number; timestamp: number } {
  const now = new Date();
  const week = getISOWeek(now);
  const year = now.getFullYear();
  const seasonal = hashString(`${year}-W${week}`);
  const timestamp = Date.now();
  return { seasonal, timestamp };
}

/**
 * Creates a full WorldSeed with a fixed base and a rotating seasonal component.
 */
export function createWorldSeed(baseSeed?: number): WorldSeed {
  const base = baseSeed ?? (Date.now() >>> 0);
  const { seasonal, timestamp } = getSeasonalSeed();
  return { base, seasonal, timestamp };
}
