"use client";

import React from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { CharacterColors } from "./colors";

interface CharacterArmProps {
  side: "left" | "right";
  armRef: React.RefObject<THREE.Group>;
  colors: CharacterColors;
  children?: React.ReactNode;
}

export default function CharacterArm({
  side,
  armRef,
  colors,
  children,
}: CharacterArmProps) {
  const x = side === "left" ? -0.48 : 0.48;
  return (
    <group ref={armRef} position={[x, 1.12, 0]}>
      <Sphere args={[0.1, 8, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={colors.primary} roughness={0.8} />
      </Sphere>
      <Cylinder args={[0.1, 0.09, 0.32, 8]} position={[0, -0.19, 0]}>
        <meshStandardMaterial color={colors.primary} roughness={0.75} />
      </Cylinder>
      <Sphere args={[0.075, 8, 8]} position={[0, -0.37, 0]}>
        <meshStandardMaterial color={colors.skinColor} roughness={0.85} />
      </Sphere>
      <Cylinder args={[0.08, 0.065, 0.28, 8]} position={[0, -0.52, 0]}>
        <meshStandardMaterial color={colors.skinColor} roughness={0.85} />
      </Cylinder>
      <Cylinder args={[0.085, 0.075, 0.1, 8]} position={[0, -0.44, 0]}>
        <meshStandardMaterial color={colors.secondary} roughness={0.5} metalness={0.35} />
      </Cylinder>
      <mesh position={[0, -0.44, 0]}>
        <torusGeometry args={[0.086, 0.006, 4, 12]} />
        <meshStandardMaterial color={colors.accent} roughness={0.4} metalness={0.5} />
      </mesh>
      <Sphere args={[0.055, 6, 6]} position={[0, -0.67, 0]}>
        <meshStandardMaterial color={colors.skinColor} roughness={0.85} />
      </Sphere>
      <group position={[0, -0.72, 0.02]}>
        <Box args={[0.08, 0.06, 0.07]} position={[0, 0, 0]} rotation={[0.15, 0, 0]}>
          <meshStandardMaterial color={colors.skinColor} roughness={0.85} />
        </Box>
        {[-0.025, -0.008, 0.008, 0.025].map((fx, i) => (
          <Cylinder key={`finger-${i}`} args={[0.012, 0.01, 0.05, 4]} position={[fx, -0.02, 0.04]} rotation={[0.4, 0, 0]}>
            <meshStandardMaterial color={colors.skinColor} roughness={0.85} />
          </Cylinder>
        ))}
        <Cylinder args={[0.014, 0.012, 0.04, 4]} position={[side === "left" ? 0.04 : -0.04, 0, -0.02]} rotation={[0, 0, side === "left" ? 0.5 : -0.5]}>
          <meshStandardMaterial color={colors.skinColor} roughness={0.85} />
        </Cylinder>
      </group>
      {children}
    </group>
  );
}
