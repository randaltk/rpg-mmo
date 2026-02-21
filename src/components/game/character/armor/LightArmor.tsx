"use client";

import React from "react";
import { Box, Cylinder } from "@react-three/drei";
import { CharacterColors } from "../colors";

interface LightArmorProps {
  colors: CharacterColors;
}

export default function LightArmor({ colors }: LightArmorProps) {
  return (
    <>
      {/* Leather cross-straps */}
      <Box args={[0.04, 0.65, 0.015]} position={[-0.1, 0.88, 0.2]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color={colors.secondary} roughness={0.7} metalness={0.1} />
      </Box>
      <Box args={[0.04, 0.65, 0.015]} position={[0.1, 0.88, 0.2]} rotation={[0, 0, -0.3]}>
        <meshStandardMaterial color={colors.secondary} roughness={0.7} metalness={0.1} />
      </Box>

      {/* Small chest protector */}
      <Cylinder args={[0.15, 0.15, 0.3, 8]} position={[0, 0.9, 0.16]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.3, 1]}>
        <meshStandardMaterial color={colors.secondary} roughness={0.6} metalness={0.15} />
      </Cylinder>

      {/* Buckle */}
      <Box args={[0.04, 0.04, 0.01]} position={[0, 0.88, 0.22]}>
        <meshStandardMaterial color={colors.accent} roughness={0.2} metalness={0.8} />
      </Box>
    </>
  );
}
