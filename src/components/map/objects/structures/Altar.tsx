'use client';

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sparkles } from '@react-three/drei';
import { MapObject } from '@/types/game';
import * as THREE from 'three';

export const Altar = memo(function Altar({ obj }: { obj: MapObject }) {
  const s = obj.scale ?? 1;
  const runeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (runeRef.current) {
      (runeRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
    }
  });

  return (
    <group position={[obj.x, obj.y, obj.z]} scale={[s, s, s]}>
      {/* Base platform */}
      <Cylinder args={[1.5, 1.8, 0.15, 8]} position={[0, 0.08, 0]}>
        <meshStandardMaterial color="#616161" roughness={0.95} />
      </Cylinder>

      {/* Table */}
      <Box args={[1.8, 0.2, 1]} position={[0, 0.7, 0]} castShadow>
        <meshStandardMaterial color="#757575" roughness={0.92} />
      </Box>
      {/* Legs */}
      {[[-0.7, 0, -0.35], [0.7, 0, -0.35], [-0.7, 0, 0.35], [0.7, 0, 0.35]].map((pos, i) => (
        <Box key={`leg-${i}`} args={[0.15, 0.6, 0.15]} position={[pos[0], 0.3, pos[2]]}>
          <meshStandardMaterial color="#616161" roughness={0.95} />
        </Box>
      ))}

      {/* Rune surface */}
      <mesh ref={runeRef} position={[0, 0.81, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 0.7]} />
        <meshStandardMaterial
          color="#9C27B0"
          emissive="#9C27B0"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      <Sparkles count={10} scale={[2, 1.5, 1.5]} position={[0, 1.2, 0]} size={2} speed={0.4} color="#CE93D8" opacity={0.6} />
      <pointLight color="#9C27B0" intensity={0.6} distance={6} position={[0, 1.5, 0]} />
    </group>
  );
});
