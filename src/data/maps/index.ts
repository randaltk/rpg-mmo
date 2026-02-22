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
