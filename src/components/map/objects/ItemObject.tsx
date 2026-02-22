'use client';

import { memo } from 'react';
import { Text, Float, Sparkles } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const ItemObject = memo(function ItemObject({ obj }: { obj: MapObject }) {
  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <Float speed={3} rotationIntensity={1.5} floatIntensity={0.6} floatingRange={[0.1, 0.4]}>
        <mesh position={[0, obj.height / 2 + 0.3, 0]}>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.2} transparent opacity={0.85} metalness={0.9} roughness={0.1} />
        </mesh>
      </Float>
      <Sparkles count={10} scale={1.5} size={2} speed={0.4} color="#00E5FF" opacity={0.6} />
      <pointLight position={[0, 0.5, 0]} color="#00E5FF" intensity={0.5} distance={4} />
      <Text position={[0, obj.height + 0.8, 0]} fontSize={0.22} color="#00E5FF" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {obj.item?.name || 'Item'}
      </Text>
    </group>
  );
});
