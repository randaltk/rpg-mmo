'use client';

import { memo } from 'react';
import { Cone, Cylinder, Sphere, Box } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const Camp = memo(function Camp({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      {/* Tent */}
      <Cone args={[1.2, 2, 4]} position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <meshStandardMaterial color="#8D6E4C" roughness={0.9} />
      </Cone>
      <Cone args={[1.25, 0.1, 4]} position={[0, 0.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#6D4C41" roughness={0.95} />
      </Cone>

      {/* Firepit */}
      <group position={[2, 0, 0.5]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <Sphere key={`stone-${i}`} args={[0.12, 5, 4]} position={[Math.cos(angle) * 0.4, 0.06, Math.sin(angle) * 0.4]}>
              <meshStandardMaterial color="#5A5A5A" roughness={0.95} />
            </Sphere>
          );
        })}
        <Cylinder args={[0.25, 0.3, 0.05, 8]} position={[0, 0.02, 0]}>
          <meshStandardMaterial color="#333" roughness={1} />
        </Cylinder>
      </group>

      {/* Log seats */}
      <Cylinder args={[0.12, 0.12, 1.2, 6]} position={[2.3, 0.12, -0.8]} rotation={[0, 0.3, Math.PI / 2]}>
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.12, 0.12, 1, 6]} position={[1.2, 0.12, 1.5]} rotation={[0, -0.5, Math.PI / 2]}>
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </Cylinder>

      {/* Supplies */}
      <Box args={[0.4, 0.3, 0.3]} position={[-1.2, 0.15, 0.8]}>
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </Box>
    </group>
  );
});
