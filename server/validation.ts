import type { CharacterClass } from "@/types/game";

export const VALID_CLASSES: ReadonlySet<string> = new Set<CharacterClass>([
  "knight", "paladin", "rogue", "assassin", "ranger", "wizard", "sorcerer", "priest", "monk",
]);

export const VALID_MAPS: ReadonlySet<string> = new Set(["castle", "town", "cave"]);

export function isValidDungeonMapId(id: string): boolean {
  return /^dungeon_\d+$/.test(id);
}

export function isValidMapId(id: string): boolean {
  return VALID_MAPS.has(id) || isValidDungeonMapId(id);
}

export const VALID_EQUIP_SLOTS: ReadonlySet<string> = new Set(["weapon", "armor", "accessory"]);

export const MAX_NICKNAME_LENGTH = 20;
export const MAX_CHAT_LENGTH = 200;
export const MAX_COORDINATE = 50000;

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function sanitizeString(s: string, maxLength: number): string {
  return s.trim().slice(0, maxLength);
}

export function isValidPosition(pos: unknown): pos is { x: number; y: number; z: number } {
  if (!pos || typeof pos !== "object") return false;
  const p = pos as Record<string, unknown>;
  return isFiniteNumber(p.x) && isFiniteNumber(p.y) && isFiniteNumber(p.z)
    && Math.abs(p.x as number) <= MAX_COORDINATE
    && Math.abs(p.y as number) <= MAX_COORDINATE
    && Math.abs(p.z as number) <= MAX_COORDINATE;
}
