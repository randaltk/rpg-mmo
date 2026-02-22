'use client';

import { memo } from 'react';
import { Cone, Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const PineTree = memo(function PineTree({ obj }: { obj: MapObject }) {
  const h = obj.height;
  const s = obj.scale ?? 1;
  const foliageColor = obj.colorOverride ?? '#1B5E20';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.1, 0.18, h, 6]} position={[0, h / 2, 0]} castShadow>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>
      <Cone args={[h * 0.45, h * 0.4, 8]} position={[0, h * 0.55, 0]} castShadow>
        <meshStandardMaterial color={foliageColor} roughness={0.9} />
      </Cone>
      <Cone args={[h * 0.38, h * 0.35, 8]} position={[0, h * 0.78, 0]}>
        <meshStandardMaterial color="#2E7D32" roughness={0.9} />
      </Cone>
      <Cone args={[h * 0.28, h * 0.3, 8]} position={[0, h * 0.98, 0]}>
        <meshStandardMaterial color="#388E3C" roughness={0.9} />
      </Cone>
      <Cone args={[h * 0.15, h * 0.2, 6]} position={[0, h * 1.13, 0]}>
        <meshStandardMaterial color="#43A047" roughness={0.9} />
      </Cone>
    </group>
  );
});
