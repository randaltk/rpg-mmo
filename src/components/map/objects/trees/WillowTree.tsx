'use client';

import { memo } from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const WillowTree = memo(function WillowTree({ obj }: { obj: MapObject }) {
  const h = obj.height;
  const s = obj.scale ?? 1;
  const foliageColor = obj.colorOverride ?? '#4CAF50';

  const vines = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const radius = h * 0.35;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      length: h * 0.5 + (i % 3) * h * 0.15,
    };
  });

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.15, 0.3, h * 0.8, 8]} position={[0, h * 0.4, 0]} castShadow rotation={[0.05, 0, 0.08]}>
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.1, 0.15, h * 0.3, 6]} position={[0.2, h * 0.7, 0.1]} rotation={[0.3, 0, 0.4]}>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.1, 0.15, h * 0.3, 6]} position={[-0.15, h * 0.7, -0.1]} rotation={[-0.2, 0, -0.3]}>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>
      <Sphere args={[h * 0.4, 8, 8]} position={[0, h * 0.85, 0]}>
        <meshStandardMaterial color={foliageColor} roughness={0.9} transparent opacity={0.7} />
      </Sphere>
      {vines.map((v, i) => (
        <Cylinder key={`vine-${i}`} args={[0.015, 0.01, v.length, 3]} position={[v.x, h * 0.7 - v.length / 2, v.z]}>
          <meshStandardMaterial color={foliageColor} roughness={0.9} transparent opacity={0.8} />
        </Cylinder>
      ))}
    </group>
  );
});
