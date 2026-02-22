'use client';

import { Box } from '@react-three/drei';
import { MapObject } from '@/types/game';

export function WallObject({ obj }: { obj: MapObject }) {
  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <Box args={[obj.width, obj.height, obj.depth]} position={[0, obj.height / 2, 0]}>
        <meshStandardMaterial color="#8B7355" roughness={0.9} metalness={0.05} />
      </Box>
      <Box args={[obj.width + 0.2, 0.15, obj.depth + 0.2]} position={[0, obj.height, 0]}>
        <meshStandardMaterial color="#6B5335" roughness={0.85} />
      </Box>
    </group>
  );
}
