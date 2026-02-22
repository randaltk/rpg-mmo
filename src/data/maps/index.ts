import { GameMap } from "@/types/game";
import { castleMap } from "./castle";
import { townMap } from "./town";
import { caveMap } from "./cave";

export const allMaps: Record<string, GameMap> = {
  castle: castleMap,
  town: townMap,
  cave: caveMap,
};

export const defaultMap = castleMap;

const dynamicMaps: Record<string, GameMap> = {};

export function registerDynamicMap(map: GameMap): void {
  dynamicMaps[map.id] = map;
}

export function getMap(id: string): GameMap | undefined {
  return allMaps[id] ?? dynamicMaps[id];
}
