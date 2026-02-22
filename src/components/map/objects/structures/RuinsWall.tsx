'use client';

import { memo } from 'react';
import { Box } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const RuinsWall = memo(function RuinsWall({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const h = obj.height;
  const w = obj.width;

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Box args={[w * 1.5, h * 0.6, 0.4]} position={[0, h * 0.3, 0]} castShadow>
        <meshStandardMaterial color="#8D8D8D" roughness={0.95} />
      </Box>
      <Box args={[w * 0.5, h * 0.35, 0.4]} position={[-w * 0.5, h * 0.77, 0]}>
        <meshStandardMaterial color="#9A9A9A" roughness={0.95} />
      </Box>
      <Box args={[w * 0.3, h * 0.2, 0.35]} position={[w * 0.4, h * 0.7, 0]} rotation={[0, 0, 0.1]}>
        <meshStandardMaterial color="#8A8A8A" roughness={0.95} />
      </Box>
      <Box args={[0.3, 0.2, 0.3]} position={[w * 0.6, 0.1, 0.3]} rotation={[0.1, 0.3, 0]}>
        <meshStandardMaterial color="#7A7A7A" roughness={0.95} />
      </Box>
      <Box args={[0.4, 0.15, 0.25]} position={[-w * 0.3, 0.08, -0.4]} rotation={[0, 0.5, 0.05]}>
        <meshStandardMaterial color="#757575" roughness={0.95} />
      </Box>
    </group>
  );
});
