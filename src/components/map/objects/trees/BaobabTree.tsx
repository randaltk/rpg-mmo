'use client';

import { memo } from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const BaobabTree = memo(function BaobabTree({ obj }: { obj: MapObject }) {
  const h = obj.height;
  const s = obj.scale ?? 1;
  const foliageColor = obj.colorOverride ?? '#558B2F';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.5, 0.7, h * 0.7, 10]} position={[0, h * 0.35, 0]} castShadow>
        <meshStandardMaterial color="#795548" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.35, 0.5, h * 0.2, 8]} position={[0, h * 0.75, 0]}>
        <meshStandardMaterial color="#6D4C41" roughness={0.95} />
      </Cylinder>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const bx = Math.cos(angle) * 0.6;
        const bz = Math.sin(angle) * 0.6;
        return (
          <group key={`branch-${i}`}>
            <Cylinder args={[0.08, 0.12, h * 0.3, 5]} position={[bx * 0.5, h * 0.85, bz * 0.5]} rotation={[Math.sin(angle) * 0.5, 0, Math.cos(angle) * 0.5]}>
              <meshStandardMaterial color="#6D4C41" roughness={0.95} />
            </Cylinder>
            <Sphere args={[h * 0.25, 8, 6]} position={[bx, h * 0.95, bz]} scale={[1, 0.4, 1]}>
              <meshStandardMaterial color={foliageColor} roughness={0.9} />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
});
