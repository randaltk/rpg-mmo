"use client";

import React from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import { CharacterColors } from "../colors";

interface MediumArmorProps {
  colors: CharacterColors;
}

export default function MediumArmor({ colors }: MediumArmorProps) {
  return (
    <>
      {/* Leather vest */}
      <Cylinder args={[0.32, 0.35, 0.5, 10]} position={[0, 0.88, 0.02]}>
        <meshStandardMaterial color={colors.secondary} roughness={colors.armorRoughness} metalness={colors.armorMetalness} />
      </Cylinder>
      <Box args={[0.02, 0.4, 0.01]} position={[0, 0.88, 0.24]}>
        <meshStandardMaterial color={colors.accent} roughness={0.6} />
      </Box>

      {/* Small shoulder guards */}
      <Sphere args={[0.13, 8, 6]} position={[-0.44, 1.2, 0]} scale={[1, 0.6, 0.8]}>
        <meshStandardMaterial color={colors.secondary} roughness={colors.armorRoughness} metalness={colors.armorMetalness} />
      </Sphere>
      <Sphere args={[0.13, 8, 6]} position={[0.44, 1.2, 0]} scale={[1, 0.6, 0.8]}>
        <meshStandardMaterial color={colors.secondary} roughness={colors.armorRoughness} metalness={colors.armorMetalness} />
      </Sphere>

      {/* Chest strap */}
      <mesh position={[0, 1.0, 0.05]}>
        <torusGeometry args={[0.3, 0.015, 4, 16]} />
        <meshStandardMaterial color={colors.accent} roughness={0.5} metalness={0.3} />
      </mesh>
    </>
  );
}
