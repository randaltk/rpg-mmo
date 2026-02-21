"use client";

import React, { useMemo } from "react";
import { Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";

export default function DaggerMesh() {
  const bladeGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.025, 0.015);
    shape.lineTo(0.02, 0.25);
    shape.lineTo(0.008, 0.3);
    shape.lineTo(0, 0.32);
    shape.lineTo(-0.008, 0.3);
    shape.lineTo(-0.02, 0.25);
    shape.lineTo(-0.025, 0.015);
    shape.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.008,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);

  return (
    <group position={[0, -0.68, 0.06]} rotation={[-0.3, 0, 0]}>
      <Cylinder args={[0.018, 0.02, 0.15, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3A1A05" roughness={0.9} />
      </Cylinder>
      <Box args={[0.12, 0.02, 0.02]} position={[0, -0.08, 0]}>
        <meshStandardMaterial color="#8B7355" roughness={0.3} metalness={0.7} />
      </Box>
      <mesh geometry={bladeGeo} position={[0, -0.24, 0]}>
        <meshStandardMaterial color="#D0D8E0" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}
