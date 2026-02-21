"use client";

import React from "react";
import { ArmorWeight } from "../classes/types";
import { CharacterColors } from "../colors";
import HeavyArmor from "./HeavyArmor";
import MediumArmor from "./MediumArmor";
import LightArmor from "./LightArmor";
import ClothArmor from "./ClothArmor";

interface ArmorOverlayProps {
  weight: ArmorWeight;
  colors: CharacterColors;
}

export default function ArmorOverlay({ weight, colors }: ArmorOverlayProps) {
  switch (weight) {
    case "heavy":
      return <HeavyArmor colors={colors} />;
    case "medium":
      return <MediumArmor colors={colors} />;
    case "light":
      return <LightArmor colors={colors} />;
    case "cloth":
      return <ClothArmor colors={colors} />;
  }
}
