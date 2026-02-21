"use client";

import React from "react";
import { HeadgearType } from "../classes/types";
import HelmetMesh from "./headgear/HelmetMesh";
import HoodMesh from "./headgear/HoodMesh";
import WizardHatMesh from "./headgear/WizardHatMesh";
import MaskMesh from "./headgear/MaskMesh";
import HeadbandMesh from "./headgear/HeadbandMesh";

interface HeadgearMeshProps {
  type: HeadgearType;
  primaryColor?: string;
  accentColor?: string;
}

export default function HeadgearMesh({ type, primaryColor, accentColor }: HeadgearMeshProps) {
  switch (type) {
    case "helmet":
      return <HelmetMesh color={primaryColor} />;
    case "hood":
      return <HoodMesh color={primaryColor} />;
    case "wizard_hat":
      return <WizardHatMesh color={primaryColor} accentColor={accentColor} />;
    case "mask":
      return <MaskMesh color={primaryColor} />;
    case "headband":
      return <HeadbandMesh color={accentColor} />;
    case "none":
      return null;
  }
}
