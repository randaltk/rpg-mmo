import { ClassColorPalette } from "./classes/types";

export interface CharacterColors {
  skinColor: string;
  hairColor: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  pantsColor: string;
  bootColor: string;
  bootTrim: string;
  capeColor: string;
  capeBorder: string;
  armorMetalness: number;
  armorRoughness: number;
}

export function deriveCharacterColors(classColors: ClassColorPalette): CharacterColors {
  return {
    skinColor: "#EDCBA0",
    hairColor: "#2A1F1A",
    ...classColors,
  };
}
