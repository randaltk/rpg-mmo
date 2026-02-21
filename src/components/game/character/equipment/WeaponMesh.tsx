"use client";

import React from "react";
import { WeaponType } from "../classes/types";
import SwordMesh from "./weapons/SwordMesh";
import DaggerMesh from "./weapons/DaggerMesh";
import BowMesh from "./weapons/BowMesh";
import StaffMesh from "./weapons/StaffMesh";
import LanceMesh from "./weapons/LanceMesh";
import KatarMesh from "./weapons/KatarMesh";
import MaceMesh from "./weapons/MaceMesh";
import FistsMesh from "./weapons/FistsMesh";

const WEAPON_COMPONENTS: Record<WeaponType, React.ComponentType> = {
  sword: SwordMesh,
  dagger: DaggerMesh,
  bow: BowMesh,
  staff: StaffMesh,
  lance: LanceMesh,
  katar: KatarMesh,
  mace: MaceMesh,
  fists: FistsMesh,
};

interface WeaponMeshProps {
  type: WeaponType;
}

export default function WeaponMesh({ type }: WeaponMeshProps) {
  const Component = WEAPON_COMPONENTS[type];
  return Component ? <Component /> : null;
}
