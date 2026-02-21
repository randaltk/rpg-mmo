"use client";

import React from "react";
import { Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { CharacterColors } from "../colors";

interface ClothArmorProps {
  colors: CharacterColors;
}

export default function ClothArmor({ colors }: ClothArmorProps) {
  return (
    <>
      {/* Extended robe collar */}
      <Cylinder args={[0.2, 0.28, 0.12, 10]} position={[0, 1.26, 0]}>
        <meshStandardMaterial color={colors.primaryDark} roughness={0.9} />
      </Cylinder>

      {/* Chest emblem */}
      <Box args={[0.12, 0.12, 0.01]} position={[0, 0.95, 0.22]}>
        <meshStandardMaterial
          color={colors.accent}
          roughness={0.3}
          metalness={0.5}
          emissive={colors.accent}
          emissiveIntensity={0.15}
        />
      </Box>

      {/* Robe sash */}
      <Box args={[0.06, 0.5, 0.02]} position={[0.12, 0.65, 0.2]} rotation={[0, 0, -0.1]}>
        <meshStandardMaterial color={colors.secondary} roughness={0.8} side={THREE.DoubleSide} />
      </Box>

      {/* Extended robe bottom */}
      <Cylinder args={[0.35, 0.38, 0.4, 10]} position={[0, 0.28, 0]}>
        <meshStandardMaterial color={colors.primary} roughness={0.85} />
      </Cylinder>

      {/* Robe front opening */}
      <mesh position={[0, 0.28, 0.3]}>
        <planeGeometry args={[0.15, 0.4]} />
        <meshStandardMaterial color={colors.primaryDark} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}
