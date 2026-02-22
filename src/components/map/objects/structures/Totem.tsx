'use client';

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Box } from '@react-three/drei';
import { MapObject } from '@/types/game';
import * as THREE from 'three';

export const Totem = memo(function Totem({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const h = obj.height;
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      <Cylinder args={[0.18, 0.25, h, 6]} position={[0, h / 2, 0]} castShadow>
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </Cylinder>

      {/* Face */}
      <Box args={[0.3, 0.2, 0.08]} position={[0, h * 0.8, 0.15]}>
        <meshStandardMaterial color="#4E342E" roughness={0.9} />
      </Box>
      {/* Eyes */}
      <Sphere args={[0.04, 5, 4]} position={[-0.08, h * 0.83, 0.2]}>
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} />
      </Sphere>
      <Sphere args={[0.04, 5, 4]} position={[0.08, h * 0.83, 0.2]}>
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} />
      </Sphere>
      {/* Mouth */}
      <Box args={[0.12, 0.03, 0.05]} position={[0, h * 0.75, 0.18]}>
        <meshStandardMaterial color="#3E2723" roughness={0.95} />
      </Box>

      {/* Top orb */}
      <Sphere args={[0.12, 8, 6]} position={[0, h + 0.15, 0]}>
        <meshStandardMaterial color="#76FF03" emissive="#76FF03" emissiveIntensity={1} />
      </Sphere>
      <pointLight ref={glowRef} color="#76FF03" intensity={0.5} distance={6} position={[0, h + 0.2, 0]} />
    </group>
  );
});
