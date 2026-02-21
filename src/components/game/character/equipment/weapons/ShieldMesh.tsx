"use client";

import React from "react";
import { Sphere, Box } from "@react-three/drei";

interface ShieldMeshProps {
  color?: string;
  accentColor?: string;
}

export default function ShieldMesh({ color = "#6A5A4A", accentColor = "#C0A030" }: ShieldMeshProps) {
  return (
    <group position={[0.05, -0.5, 0.15]} rotation={[0, 0.8, 0]}>
      <Sphere args={[0.3, 12, 12]} scale={[0.7, 1, 0.15]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </Sphere>
      <mesh position={[0, 0, 0.02]}>
        <torusGeometry args={[0.28, 0.02, 4, 24]} />
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.8} />
      </mesh>
      <Sphere args={[0.05, 8, 8]} position={[0, 0, 0.05]}>
        <meshStandardMaterial color={accentColor} roughness={0.15} metalness={0.9} />
      </Sphere>
      <Box args={[0.03, 0.35, 0.01]} position={[0, 0, 0.04]}>
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.7} />
      </Box>
      <Box args={[0.2, 0.03, 0.01]} position={[0, 0, 0.04]}>
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.7} />
      </Box>
    </group>
  );
}
