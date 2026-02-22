'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Torus, Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';
import * as THREE from 'three';

const portalLabels: Record<string, string> = {
  cave: 'Caverna',
  town: 'Planícies',
  castle: 'Castelo',
};

export function PortalObject({ obj }: { obj: MapObject }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.8;
    if (innerRef.current) innerRef.current.rotation.z = -t * 1.2;
  });

  const label = obj.portalTo ? portalLabels[obj.portalTo] || obj.portalTo : 'Portal';

  return (
    <group position={[obj.x, obj.y + obj.height / 2, obj.z]}>
      <Torus args={[1.3, 0.2, 8, 24, Math.PI]} position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#555" roughness={0.9} />
      </Torus>
      <Cylinder args={[0.2, 0.25, obj.height, 6]} position={[-1.3, -0.3, 0]}>
        <meshStandardMaterial color="#555" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.2, 0.25, obj.height, 6]} position={[1.3, -0.3, 0]}>
        <meshStandardMaterial color="#555" roughness={0.9} />
      </Cylinder>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.0, 0.03, 8, 48]} />
        <meshStandardMaterial color="#9B30FF" emissive="#9B30FF" emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[0.7, 0.02, 8, 48]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.9, 32]} />
        <meshStandardMaterial color="#6A0DAD" emissive="#6A0DAD" emissiveIntensity={0.5} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#9B30FF" intensity={1} distance={8} />
      <pointLight color="#00E5FF" intensity={0.5} distance={5} />
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#E0B0FF" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {label}
      </Text>
    </group>
  );
}
