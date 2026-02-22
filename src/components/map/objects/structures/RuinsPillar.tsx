'use client';

import { memo } from 'react';
import { Cylinder, Sphere, Box } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const RuinsPillar = memo(function RuinsPillar({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const h = obj.height;

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.35, 0.4, h * 0.7, 8]} position={[0, h * 0.35, 0]} castShadow>
        <meshStandardMaterial color="#9E9E9E" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.42, 0.42, h * 0.08, 8]} position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#8A8A8A" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.3, 0.35, h * 0.12, 6]} position={[0, h * 0.72, 0]} rotation={[0.1, 0, 0.05]}>
        <meshStandardMaterial color="#A0A0A0" roughness={0.95} />
      </Cylinder>
      <Box args={[0.4, 0.25, 0.3]} position={[0.5, 0.12, 0.3]} rotation={[0.1, 0.4, 0.2]}>
        <meshStandardMaterial color="#8A8A8A" roughness={0.95} />
      </Box>
      <Sphere args={[0.2, 5, 4]} position={[-0.4, 0.12, -0.2]} scale={[1, 0.5, 1]}>
        <meshStandardMaterial color="#7A7A7A" roughness={0.95} />
      </Sphere>
    </group>
  );
});
