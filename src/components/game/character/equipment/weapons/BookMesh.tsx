"use client";

import React from "react";
import { Box } from "@react-three/drei";

export default function BookMesh() {
  return (
    <group position={[0, -0.6, 0.1]} rotation={[-0.5, 0.3, 0]}>
      <Box args={[0.18, 0.24, 0.04]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4A1A6A" roughness={0.7} />
      </Box>
      <Box args={[0.16, 0.22, 0.03]} position={[0, 0, 0.005]}>
        <meshStandardMaterial color="#F5F0E0" roughness={0.9} />
      </Box>
      <Box args={[0.02, 0.24, 0.05]} position={[-0.09, 0, 0]}>
        <meshStandardMaterial color="#3A0A4A" roughness={0.6} />
      </Box>
      <Box args={[0.08, 0.08, 0.005]} position={[0.01, 0, 0.025]}>
        <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={0.8} emissive="#DAA520" emissiveIntensity={0.3} />
      </Box>
    </group>
  );
}
