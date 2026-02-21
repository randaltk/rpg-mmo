"use client";

import React from "react";
import { Sphere, Box, Cylinder } from "@react-three/drei";

interface HelmetMeshProps {
  color?: string;
}

export default function HelmetMesh({ color = "#8899AA" }: HelmetMeshProps) {
  return (
    <group position={[0, 0.05, 0]}>
      <Sphere args={[0.34, 12, 12]} scale={[1, 0.9, 1]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.8} />
      </Sphere>
      <Box args={[0.35, 0.02, 0.08]} position={[0, 0, 0.3]}>
        <meshStandardMaterial color="#111" roughness={0.9} />
      </Box>
      <Box args={[0.025, 0.15, 0.05]} position={[0, -0.03, 0.32]}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.8} />
      </Box>
      <Cylinder args={[0.34, 0.36, 0.04, 16]} position={[0, -0.12, 0]}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.75} />
      </Cylinder>
      <Box args={[0.02, 0.08, 0.3]} position={[0, 0.28, -0.05]}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </Box>
    </group>
  );
}
