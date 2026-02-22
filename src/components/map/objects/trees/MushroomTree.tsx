'use client';

import { memo } from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const MushroomTree = memo(function MushroomTree({ obj }: { obj: MapObject }) {
  const h = obj.height;
  const s = obj.scale ?? 1;
  const capColor = obj.colorOverride ?? '#E53935';

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.15, 0.25, h * 0.6, 8]} position={[0, h * 0.3, 0]} castShadow>
        <meshStandardMaterial color="#D7CCC8" roughness={0.8} />
      </Cylinder>
      <Sphere args={[h * 0.55, 10, 8]} position={[0, h * 0.7, 0]} scale={[1, 0.5, 1]} castShadow>
        <meshStandardMaterial color={capColor} roughness={0.7} />
      </Sphere>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2 + 0.5;
        return (
          <Sphere key={`dot-${i}`} args={[h * 0.06, 5, 4]} position={[Math.cos(angle) * h * 0.35, h * 0.78, Math.sin(angle) * h * 0.35]}>
            <meshStandardMaterial color="#FFECB3" roughness={0.6} emissive="#FFECB3" emissiveIntensity={0.1} />
          </Sphere>
        );
      })}
      <pointLight color={capColor} intensity={0.3} distance={4} position={[0, h * 0.8, 0]} />
    </group>
  );
});
