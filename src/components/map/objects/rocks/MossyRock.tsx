'use client';

import { memo } from 'react';
import { Sphere } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const MossyRock = memo(function MossyRock({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const color = obj.colorOverride ?? '#6D6D6D';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Sphere args={[obj.width * 0.5, 7, 5]} position={[0, obj.height * 0.3, 0]} scale={[1, 0.65, 0.95]} castShadow>
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.05} />
      </Sphere>
      <Sphere args={[obj.width * 0.52, 7, 5]} position={[0, obj.height * 0.35, 0]} scale={[0.95, 0.6, 0.9]}>
        <meshStandardMaterial color="#4CAF50" roughness={0.9} transparent opacity={0.5} />
      </Sphere>
      <Sphere args={[obj.width * 0.3, 5, 4]} position={[obj.width * 0.2, obj.height * 0.15, obj.width * 0.15]} scale={[1, 0.5, 0.8]}>
        <meshStandardMaterial color="#5A5A5A" roughness={0.9} />
      </Sphere>
      <Sphere args={[obj.width * 0.32, 5, 4]} position={[obj.width * 0.22, obj.height * 0.2, obj.width * 0.17]} scale={[0.95, 0.45, 0.75]}>
        <meshStandardMaterial color="#66BB6A" roughness={0.9} transparent opacity={0.4} />
      </Sphere>
    </group>
  );
});
