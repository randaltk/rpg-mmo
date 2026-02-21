"use client";

import React from "react";
import { Sphere, Cone } from "@react-three/drei";

interface HoodMeshProps {
  color?: string;
}

export default function HoodMesh({ color = "#3A3020" }: HoodMeshProps) {
  return (
    <group position={[0, 0.05, -0.02]}>
      <Sphere args={[0.36, 12, 10]} scale={[1, 0.95, 1.1]} position={[0, 0.03, -0.02]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Sphere>
      <Cone args={[0.25, 0.3, 8]} position={[0, -0.15, -0.2]} rotation={[0.3, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Cone>
      <Sphere args={[0.37, 10, 4]} scale={[1, 0.3, 0.6]} position={[0, 0.12, 0.15]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Sphere>
    </group>
  );
}
