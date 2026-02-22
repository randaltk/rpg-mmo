'use client';

import { memo } from 'react';
import { Sphere } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const FlatRock = memo(function FlatRock({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const color = obj.colorOverride ?? '#8D8D8D';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Sphere args={[obj.width * 0.6, 7, 5]} position={[0, obj.height * 0.12, 0]} scale={[1, 0.2, 1.1]} castShadow>
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.03} />
      </Sphere>
      <Sphere args={[obj.width * 0.4, 6, 4]} position={[obj.width * 0.3, obj.height * 0.08, obj.width * 0.1]} scale={[1, 0.18, 0.9]}>
        <meshStandardMaterial color="#7A7A7A" roughness={0.92} />
      </Sphere>
      <Sphere args={[obj.width * 0.35, 6, 4]} position={[-obj.width * 0.2, obj.height * 0.1, -obj.width * 0.2]} scale={[0.9, 0.22, 1]}>
        <meshStandardMaterial color="#929292" roughness={0.9} />
      </Sphere>
    </group>
  );
});
