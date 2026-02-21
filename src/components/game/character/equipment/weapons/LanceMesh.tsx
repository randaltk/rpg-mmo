"use client";

import React from "react";
import { Cylinder, Cone } from "@react-three/drei";

export default function LanceMesh() {
  return (
    <group position={[0, -0.4, 0.1]} rotation={[-0.2, 0, 0]}>
      <Cylinder args={[0.025, 0.022, 1.8, 8]} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.75} />
      </Cylinder>
      <Cone args={[0.04, 0.25, 6]} position={[0, 0.65, 0]}>
        <meshStandardMaterial color="#C0C8D0" roughness={0.1} metalness={0.9} />
      </Cone>
      <Cylinder args={[0.04, 0.03, 0.04, 8]} position={[0, 0.52, 0]}>
        <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
      </Cylinder>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.04, 0.008, 4, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.4} metalness={0.5} />
      </mesh>
      <Cylinder args={[0.025, 0.015, 0.04, 6]} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
      </Cylinder>
    </group>
  );
}
