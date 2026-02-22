'use client';

import { memo } from 'react';
import { Sphere } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const RockObject = memo(function RockObject({ obj }: { obj: MapObject }) {
  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <Sphere args={[obj.width * 0.55, 7, 5]} position={[0, obj.height * 0.35, 0]} scale={[1, 0.7, 0.9]} castShadow>
        <meshStandardMaterial color="#7A7A7A" roughness={0.95} metalness={0.05} />
      </Sphere>
      <Sphere args={[obj.width * 0.35, 6, 4]} position={[obj.width * 0.25, obj.height * 0.2, obj.width * 0.15]} scale={[1, 0.6, 0.8]}>
        <meshStandardMaterial color="#666666" roughness={0.9} metalness={0.08} />
      </Sphere>
      <Sphere args={[obj.width * 0.2, 5, 4]} position={[-obj.width * 0.2, obj.height * 0.15, -obj.width * 0.1]}>
        <meshStandardMaterial color="#888888" roughness={0.85} />
      </Sphere>
    </group>
  );
});
