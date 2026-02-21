"use client";

import React from "react";
import { Box, Sphere } from "@react-three/drei";

interface MaskMeshProps {
  color?: string;
}

export default function MaskMesh({ color = "#1A1A2E" }: MaskMeshProps) {
  return (
    <group position={[0, -0.08, 0.22]}>
      <Sphere args={[0.24, 10, 8]} scale={[1.1, 0.5, 0.4]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.8} />
      </Sphere>
      <Box args={[0.5, 0.08, 0.02]} position={[0, 0.02, -0.1]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Box>
    </group>
  );
}
