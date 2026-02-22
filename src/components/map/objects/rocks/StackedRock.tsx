'use client';

import { memo } from 'react';
import { Sphere } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const StackedRock = memo(function StackedRock({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const color = obj.colorOverride ?? '#78909C';

  const stones = [
    { y: 0.15, r: obj.width * 0.4, sy: 0.5 },
    { y: obj.height * 0.35, r: obj.width * 0.32, sy: 0.55 },
    { y: obj.height * 0.6, r: obj.width * 0.25, sy: 0.5 },
    { y: obj.height * 0.8, r: obj.width * 0.18, sy: 0.6 },
    { y: obj.height * 0.95, r: obj.width * 0.1, sy: 0.7 },
  ];

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      {stones.map((st, i) => (
        <Sphere key={`stone-${i}`} args={[st.r, 6, 5]} position={[0, st.y, 0]} scale={[1, st.sy, 1]} castShadow={i < 2}>
          <meshStandardMaterial color={i % 2 === 0 ? color : '#90A4AE'} roughness={0.92} metalness={0.05} />
        </Sphere>
      ))}
    </group>
  );
});
