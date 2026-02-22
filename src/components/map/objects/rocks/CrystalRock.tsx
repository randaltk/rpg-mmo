'use client';

import { memo } from 'react';
import { Cone } from '@react-three/drei';
import { MapObject } from '@/types/game';

export const CrystalRock = memo(function CrystalRock({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const color = obj.colorOverride ?? '#7C4DFF';

  const crystals = [
    { x: 0, z: 0, h: obj.height * 1.0, r: obj.width * 0.15, rot: 0.05 },
    { x: obj.width * 0.2, z: obj.width * 0.1, h: obj.height * 0.7, r: obj.width * 0.12, rot: -0.1 },
    { x: -obj.width * 0.15, z: obj.width * 0.15, h: obj.height * 0.8, r: obj.width * 0.1, rot: 0.15 },
    { x: obj.width * 0.1, z: -obj.width * 0.2, h: obj.height * 0.55, r: obj.width * 0.09, rot: -0.08 },
    { x: -obj.width * 0.25, z: -obj.width * 0.05, h: obj.height * 0.6, r: obj.width * 0.11, rot: 0.12 },
  ];

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      {crystals.map((c, i) => (
        <Cone key={`crystal-${i}`} args={[c.r, c.h, 5]} position={[c.x, c.h / 2, c.z]} rotation={[c.rot, 0, -c.rot]} castShadow={i === 0}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.1}
            metalness={0.6}
            transparent
            opacity={0.85}
          />
        </Cone>
      ))}
      <pointLight color={color} intensity={0.5} distance={5} position={[0, obj.height * 0.6, 0]} />
    </group>
  );
});
