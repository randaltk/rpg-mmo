"use client";

import React from "react";
import { Cone, Cylinder } from "@react-three/drei";

interface WizardHatMeshProps {
  color?: string;
  accentColor?: string;
}

export default function WizardHatMesh({ color = "#2244AA", accentColor = "#C0A030" }: WizardHatMeshProps) {
  return (
    <group position={[0, 0.2, 0]}>
      <Cylinder args={[0.5, 0.48, 0.04, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.85} />
      </Cylinder>
      <Cone args={[0.22, 0.6, 12]} position={[0, 0.32, 0]} rotation={[0, 0, 0.05]}>
        <meshStandardMaterial color={color} roughness={0.85} />
      </Cone>
      <Cylinder args={[0.24, 0.24, 0.04, 16]} position={[0, 0.03, 0]}>
        <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.6} />
      </Cylinder>
      <mesh position={[0, 0.08, 0.22]}>
        <circleGeometry args={[0.04, 5]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.3} roughness={0.2} metalness={0.7} />
      </mesh>
    </group>
  );
}
