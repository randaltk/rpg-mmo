'use client';

import { memo } from 'react';
import { Sphere, Cylinder, Sparkles } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const CherryTree = memo(function CherryTree({ obj }: { obj: MapObject }) {
  const h = obj.height;
  const s = obj.scale ?? 1;
  const foliageColor = obj.colorOverride ?? '#F48FB1';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.15, 0.3, h * 0.85, 8]} position={[0, h * 0.42, 0]} castShadow>
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.1, 0.15, h * 0.35, 6]} position={[0.25, h * 0.7, 0.1]} rotation={[0.15, 0, 0.4]}>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>
      <Sphere args={[h * 0.5, 10, 8]} position={[0, h + 0.2, 0]} castShadow>
        <meshStandardMaterial color={foliageColor} roughness={0.85} />
      </Sphere>
      <Sphere args={[h * 0.38, 8, 6]} position={[0.35, h - 0.1, 0.25]}>
        <meshStandardMaterial color="#F8BBD0" roughness={0.85} />
      </Sphere>
      <Sphere args={[h * 0.35, 8, 6]} position={[-0.25, h + 0.4, -0.2]}>
        <meshStandardMaterial color="#EC407A" roughness={0.85} />
      </Sphere>
      <Sparkles count={12} scale={[h * 1.2, h * 0.8, h * 1.2]} position={[0, h * 0.7, 0]} size={1.5} speed={0.3} color="#FFB6C1" opacity={0.6} />
    </group>
  );
});
