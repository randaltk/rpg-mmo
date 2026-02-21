"use client";

import React from "react";
import { Box } from "@react-three/drei";

export default function FistsMesh() {
  return (
    <group position={[0, -0.7, 0.04]}>
      <Box args={[0.09, 0.03, 0.06]} position={[0, -0.02, 0.02]} rotation={[0.15, 0, 0]}>
        <meshStandardMaterial color="#8B6914" roughness={0.7} metalness={0.2} />
      </Box>
      {[0, 1, 2].map(i => (
        <mesh key={`wrap-${i}`} position={[0, 0.01 - i * 0.025, 0.02]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.042, 0.005, 4, 8]} />
          <meshStandardMaterial color="#C8B088" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
