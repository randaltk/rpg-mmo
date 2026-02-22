'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Torus } from '@react-three/drei';
import { MapObject } from '@/types/game';
import * as THREE from 'three';

export function ChestObject({ obj }: { obj: MapObject }) {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.position.y = obj.height + 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <Box args={[0.8, 0.5, 0.6]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.3} />
      </Box>
      <Box args={[0.85, 0.15, 0.65]} position={[0, 0.55, 0]}>
        <meshStandardMaterial color="#A67C28" roughness={0.4} metalness={0.35} />
      </Box>
      <Box args={[0.82, 0.04, 0.62]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#8B7355" roughness={0.4} metalness={0.6} />
      </Box>
      <Torus args={[0.06, 0.02, 6, 8]} position={[0, 0.35, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.15} />
      </Torus>
      <mesh ref={glowRef} position={[0, obj.height + 0.5, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 0.6, 0]} color="#FFD700" intensity={0.4} distance={3} />
    </group>
  );
}
