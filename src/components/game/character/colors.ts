import * as THREE from "three";

export interface CharacterColors {
  skinColor: string;
  shirtColor: string;
  shirtDark: string;
  armorColor: string;
  armorHighlight: string;
  pantsColor: string;
  bootColor: string;
  bootTrim: string;
  hairColor: string;
  capeColor: string;
  capeBorder: string;
}

export function deriveCharacterColors(playerColor: string): CharacterColors {
  return {
    skinColor: "#EDCBA0",
    shirtColor: playerColor,
    shirtDark: new THREE.Color(playerColor).multiplyScalar(0.7).getStyle(),
    armorColor: new THREE.Color(playerColor).multiplyScalar(0.55).getStyle(),
    armorHighlight: new THREE.Color(playerColor).lerp(new THREE.Color("#ffffff"), 0.2).getStyle(),
    pantsColor: "#3B2F2F",
    bootColor: "#5C3A1E",
    bootTrim: "#8B6914",
    hairColor: "#2A1F1A",
    capeColor: new THREE.Color(playerColor).multiplyScalar(0.45).getStyle(),
    capeBorder: new THREE.Color(playerColor).multiplyScalar(0.3).getStyle(),
  };
}
