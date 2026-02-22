'use client';

import { memo } from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const OakTree = memo(function OakTree({ obj }: { obj: MapObject }) {
  const h = obj.height;
  const s = obj.scale ?? 1;
  const foliageColor = obj.colorOverride ?? '#2D8B2D';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + 0.3;
        return (
          <Cylinder key={`root-${i}`} args={[0.08, 0.15, 0.6, 4]} position={[Math.cos(angle) * 0.35, 0.15, Math.sin(angle) * 0.35]} rotation={[Math.sin(angle) * 0.4, 0, Math.cos(angle) * 0.4]}>
            <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
          </Cylinder>
        );
      })}
      <Cylinder args={[0.2, 0.35, h, 8]} position={[0, h / 2, 0]} castShadow>
        <meshStandardMaterial color="#6B3A20" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.18, 0.22, h * 0.3, 6]} position={[0.15, h * 0.7, 0.1]} rotation={[0.2, 0, 0.3]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
      </Cylinder>
      <Sphere args={[h * 0.55, 10, 8]} position={[0, h + 0.3, 0]} castShadow>
        <meshStandardMaterial color={foliageColor} roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.42, 8, 6]} position={[0.4, h + 0.1, 0.3]}>
        <meshStandardMaterial color="#3AA63A" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.38, 8, 6]} position={[-0.3, h + 0.5, -0.2]}>
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.3, 8, 6]} position={[0.2, h + 0.8, -0.3]}>
        <meshStandardMaterial color="#36A336" roughness={0.9} />
      </Sphere>
    </group>
  );
});
