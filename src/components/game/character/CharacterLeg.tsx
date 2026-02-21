"use client";

import React, { useMemo } from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { createBootGeometry } from "./geometries";

interface CharacterLegProps {
  side: "left" | "right";
  legRef: React.RefObject<THREE.Group>;
  pantsColor: string;
  bootColor: string;
  bootTrim: string;
}

export default function CharacterLeg({
  side,
  legRef,
  pantsColor,
  bootColor,
  bootTrim,
}: CharacterLegProps) {
  const bootGeo = useMemo(() => createBootGeometry(), []);
  const x = side === "left" ? -0.18 : 0.18;

  return (
    <group ref={legRef} position={[x, 0.32, 0]}>
      <Sphere args={[0.1, 8, 8]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Sphere>
      <Cylinder args={[0.12, 0.1, 0.24, 8]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Cylinder>
      <Sphere args={[0.09, 8, 8]} position={[0, -0.24, 0.02]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Sphere>
      <Cylinder args={[0.095, 0.08, 0.22, 8]} position={[0, -0.38, 0]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Cylinder>
      <mesh geometry={bootGeo} position={[0, -0.58, -0.06]}>
        <meshStandardMaterial color={bootColor} roughness={0.65} />
      </mesh>
      <mesh position={[0.01, -0.49, 0.02]}>
        <torusGeometry args={[0.09, 0.012, 4, 12]} />
        <meshStandardMaterial color={bootTrim} roughness={0.4} metalness={0.45} />
      </mesh>
      <Box args={[0.04, 0.035, 0.02]} position={[0, -0.54, 0.1]}>
        <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
      </Box>
      <Box args={[0.15, 0.025, 0.22]} position={[0.01, -0.59, 0.02]}>
        <meshStandardMaterial color="#1A0A00" roughness={0.95} />
      </Box>
    </group>
  );
}
