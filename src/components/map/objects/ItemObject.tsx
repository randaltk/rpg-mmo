'use client';

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { MapObject } from '@/types/game';
import * as THREE from 'three';

export const ItemObject = memo(function ItemObject({ obj }: { obj: MapObject }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = obj.height / 2 + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      groupRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <group ref={groupRef}>
        <mesh>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} transparent opacity={0.85} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      <pointLight position={[0, 0.5, 0]} color="#00E5FF" intensity={0.5} distance={4} />
      <Text position={[0, obj.height + 0.8, 0]} fontSize={0.22} color="#00E5FF" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {obj.item?.name || 'Item'}
      </Text>
    </group>
  );
});
