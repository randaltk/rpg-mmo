'use client';

import { memo } from 'react';
import { Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const DeadTree = memo(function DeadTree({ obj }: { obj: MapObject }) {
  const h = obj.height;
  const s = obj.scale ?? 1;
  const trunkColor = obj.colorOverride ?? '#3E2723';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.12, 0.25, h, 6]} position={[0, h / 2, 0]} castShadow rotation={[0.05, 0, 0.03]}>
        <meshStandardMaterial color={trunkColor} roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.04, 0.1, h * 0.5, 4]} position={[0.2, h * 0.85, 0.1]} rotation={[0.3, 0.2, 0.6]}>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.03, 0.08, h * 0.4, 4]} position={[-0.15, h * 0.9, -0.05]} rotation={[-0.4, 0, -0.5]}>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.03, 0.06, h * 0.3, 4]} position={[0.05, h * 0.95, -0.15]} rotation={[-0.2, 0.3, 0.3]}>
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.02, 0.05, h * 0.25, 3]} position={[-0.1, h * 0.7, 0.2]} rotation={[0.5, 0, -0.7]}>
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.02, 0.04, h * 0.2, 3]} position={[0.18, h * 0.6, -0.1]} rotation={[-0.3, 0, 0.8]}>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>
    </group>
  );
});
