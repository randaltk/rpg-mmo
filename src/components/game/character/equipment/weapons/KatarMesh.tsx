"use client";

import React, { useMemo } from "react";
import { Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";

export default function KatarMesh() {
  const bladeGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.04, 0);
    shape.lineTo(0.02, 0.35);
    shape.lineTo(0, 0.4);
    shape.lineTo(-0.02, 0.35);
    shape.lineTo(-0.04, 0);
    shape.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.006,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 1,
    });
    geo.center();
    return geo;
  }, []);

  return (
    <group position={[0, -0.7, 0.08]} rotation={[-0.3, 0, 0]}>
      {/* H-handle */}
      <Box args={[0.1, 0.015, 0.015]} position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.8} />
      </Box>
      <Box args={[0.1, 0.015, 0.015]} position={[0, -0.04, 0]}>
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.8} />
      </Box>
      <Cylinder args={[0.01, 0.01, 0.1, 4]} position={[0.045, 0, 0]}>
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.7} />
      </Cylinder>
      <Cylinder args={[0.01, 0.01, 0.1, 4]} position={[-0.045, 0, 0]}>
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.7} />
      </Cylinder>
      <Cylinder args={[0.015, 0.015, 0.1, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2A1A05" roughness={0.9} />
      </Cylinder>
      <mesh geometry={bladeGeo} position={[0, -0.28, -0.003]}>
        <meshStandardMaterial color="#C8D0D8" roughness={0.08} metalness={0.95} />
      </mesh>
    </group>
  );
}
