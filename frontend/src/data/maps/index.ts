import { Map } from "@/types/game";
import { townMap } from "./town";
import { caveMap } from "./cave";

export const allMaps: Record<string, Map> = {
  town: townMap,
  cave: caveMap,
};

export const defaultMap = townMap;
