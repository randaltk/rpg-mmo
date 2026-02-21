"use client";

import React from "react";
import { Sphere, Cylinder, Box } from "@react-three/drei";

export default function MaceMesh() {
  return (
    <group position={[0, -0.68, 0.08]} rotation={[-0.3, 0, 0]}>
      <Cylinder args={[0.022, 0.025, 0.25, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3A1A05" roughness={0.9} />
      </Cylinder>
      <Sphere args={[0.03, 6, 6]} position={[0, 0.13, 0]}>
        <meshStandardMaterial color="#8B7355" roughness={0.3} metalness={0.6} />
      </Sphere>
      <Sphere args={[0.08, 8, 8]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#888" roughness={0.25} metalness={0.8} />
      </Sphere>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <Box
            key={`flange-${i}`}
            args={[0.03, 0.06, 0.015]}
            position={[Math.cos(angle) * 0.08, -0.2, Math.sin(angle) * 0.08]}
            rotation={[0, -angle, 0]}
          >
            <meshStandardMaterial color="#777" roughness={0.2} metalness={0.85} />
          </Box>
        );
      })}
      <Cylinder args={[0.035, 0.03, 0.03, 8]} position={[0, -0.12, 0]}>
        <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
      </Cylinder>
    </group>
  );
}
