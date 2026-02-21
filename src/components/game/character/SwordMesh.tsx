"use client";

import React, { useMemo } from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import {
  createSwordBladeGeometry,
  createCrossGuardGeometry,
  createPommelGeometry,
} from "./geometries";

export default function SwordMesh() {
  const bladeGeo = useMemo(() => createSwordBladeGeometry(), []);
  const guardGeo = useMemo(() => createCrossGuardGeometry(), []);
  const pommelGeo = useMemo(() => createPommelGeometry(), []);

  return (
    <group position={[0, -0.7, 0.08]} rotation={[-0.3, 0, 0]}>
      <mesh geometry={pommelGeo} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#C0A030" roughness={0.25} metalness={0.85} />
      </mesh>
      <Cylinder args={[0.022, 0.026, 0.2, 8]} position={[0, -0.01, 0]}>
        <meshStandardMaterial color="#3A1A05" roughness={0.9} />
      </Cylinder>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={`wrap-${i}`} position={[0, 0.06 - i * 0.035, 0]} rotation={[0, i * 0.3, 0]}>
          <torusGeometry args={[0.027, 0.004, 4, 8]} />
          <meshStandardMaterial color="#5A3A15" roughness={0.8} />
        </mesh>
      ))}
      <mesh geometry={guardGeo} position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 4.5, 1]}>
        <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.9} />
      </mesh>
      <Sphere args={[0.02, 8, 8]} position={[0, -0.12, 0.02]}>
        <meshStandardMaterial color="#FF2222" emissive="#FF0000" emissiveIntensity={0.5} roughness={0.1} metalness={0.3} />
      </Sphere>
      <mesh geometry={bladeGeo} position={[0, -0.44, -0.006]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#D0D8E0" roughness={0.08} metalness={0.95} />
      </mesh>
      <Box args={[0.008, 0.4, 0.004]} position={[0, -0.38, 0.002]}>
        <meshStandardMaterial color="#A0A8B0" roughness={0.15} metalness={0.9} />
      </Box>
      <Box args={[0.003, 0.48, 0.018]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#E8F0FF" roughness={0.05} metalness={1} emissive="#8899BB" emissiveIntensity={0.15} />
      </Box>
    </group>
  );
}
