"use client";

import React from "react";
import { Sphere, Cylinder } from "@react-three/drei";

export default function StaffMesh() {
  return (
    <group position={[0, -0.4, 0.1]} rotation={[-0.15, 0, 0]}>
      <Cylinder args={[0.025, 0.02, 1.6, 8]} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.03, 0.025, 0.08, 6]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#4A3A1E" roughness={0.7} metalness={0.2} />
      </Cylinder>
      <Sphere args={[0.06, 8, 8]} position={[0, 0.58, 0]}>
        <meshStandardMaterial
          color="#4488FF"
          emissive="#2244AA"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </Sphere>
      <Sphere args={[0.04, 6, 6]} position={[0, 0.58, 0]}>
        <meshStandardMaterial
          color="#AACCFF"
          emissive="#4488FF"
          emissiveIntensity={1.0}
          transparent
          opacity={0.4}
        />
      </Sphere>
      <Sphere args={[0.025, 6, 6]} position={[0, -1.1, 0]}>
        <meshStandardMaterial color="#4A3A1E" roughness={0.6} metalness={0.3} />
      </Sphere>
    </group>
  );
}
