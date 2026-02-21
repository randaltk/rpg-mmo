"use client";

import React from "react";
import { Box } from "@react-three/drei";

interface HeadbandMeshProps {
  color?: string;
}

export default function HeadbandMesh({ color = "#C0A030" }: HeadbandMeshProps) {
  return (
    <group position={[0, 0.15, 0]}>
      <mesh>
        <torusGeometry args={[0.33, 0.02, 4, 24]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <Box args={[0.06, 0.15, 0.015]} position={[0, -0.06, -0.33]} rotation={[0.2, 0, 0.1]}>
        <meshStandardMaterial color={color} roughness={0.8} />
      </Box>
      <Box args={[0.05, 0.12, 0.015]} position={[0.03, -0.08, -0.33]} rotation={[0.3, 0, -0.2]}>
        <meshStandardMaterial color={color} roughness={0.8} />
      </Box>
    </group>
  );
}
