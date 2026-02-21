import { Map } from "@/types/game";
import { castleMap } from "./castle";
import { townMap } from "./town";
import { caveMap } from "./cave";

export const allMaps: Record<string, Map> = {
  castle: castleMap,
  town: townMap,
  cave: caveMap,
};

export const defaultMap = castleMap;
