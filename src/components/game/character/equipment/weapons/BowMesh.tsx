"use client";

import React, { useMemo } from "react";
import { Cylinder } from "@react-three/drei";
import * as THREE from "three";

export default function BowMesh() {
  const bowCurve = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(0, 0, 0.15),
      new THREE.Vector3(0, -0.4, 0)
    );
    return new THREE.TubeGeometry(curve, 16, 0.015, 8, false);
  }, []);

  return (
    <group position={[0, -0.5, 0.15]} rotation={[0, 0.3, 0]}>
      <mesh geometry={bowCurve}>
        <meshStandardMaterial color="#6B4226" roughness={0.7} />
      </mesh>
      <Cylinder args={[0.003, 0.003, 0.8, 4]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#C8B898" roughness={0.6} />
      </Cylinder>
      <Cylinder args={[0.025, 0.025, 0.1, 6]} position={[0, 0, 0.04]}>
        <meshStandardMaterial color="#3A1A05" roughness={0.9} />
      </Cylinder>
    </group>
  );
}
