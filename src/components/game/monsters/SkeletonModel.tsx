'use client';

import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box, Cone } from '@react-three/drei';
import type { Monster } from '@/types/game';
import * as THREE from 'three';

interface SkeletonModelProps {
  monster: Monster;
  hurtFlash: boolean;
}

export const SkeletonModel = memo(function SkeletonModel({ monster, hurtFlash }: SkeletonModelProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const walkCycle = useRef(0);

  const bone = hurtFlash ? '#FFDDDD' : '#E8E0D0';
  const boneDark = hurtFlash ? '#FFCCCC' : '#C8B8A0';
  const eyeColor = '#44FF44';

  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    const t = state.clock.elapsedTime;

    if (monster.state === 'dead') {
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, Math.PI / 2, 0.08);
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, -0.3, 0.08);
      return;
    }

    bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 5);
    bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0, delta * 5);

    const isWalking = monster.state === 'chasing' || monster.state === 'wandering';
    if (isWalking) walkCycle.current += delta * 10;
    else walkCycle.current *= 0.9;

    const swing = Math.sin(walkCycle.current) * 0.5;

    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

    if (leftArmRef.current && rightArmRef.current) {
      if (monster.state === 'attacking') {
        const cycle = (t * 6) % (Math.PI * 2);
        rightArmRef.current.rotation.x = -0.5 + Math.sin(cycle) * 1.5;
        rightArmRef.current.rotation.z = -0.2;
        leftArmRef.current.rotation.x = -0.3;
      } else {
        leftArmRef.current.rotation.x = -swing * 0.5;
        rightArmRef.current.rotation.x = swing * 0.5;
        rightArmRef.current.rotation.z = 0;
      }
    }

    if (jawRef.current) {
      if (monster.state === 'attacking' || monster.state === 'chasing') {
        jawRef.current.rotation.x = Math.sin(t * 5) * 0.1;
      } else {
        jawRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={bodyRef} scale={[0.75, 0.75, 0.75]}>
      {/* Ribcage / Spine */}
      <Cylinder args={[0.04, 0.04, 0.5, 4]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={bone} roughness={0.8} />
      </Cylinder>
      {/* Ribs */}
      {[0, 1, 2].map(i => (
        <group key={`rib-${i}`}>
          <Cylinder args={[0.02, 0.02, 0.25, 4]} position={[-0.08, 0.85 - i * 0.1, 0.04]} rotation={[0.3, 0, -0.6]}>
            <meshStandardMaterial color={boneDark} roughness={0.85} />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.25, 4]} position={[0.08, 0.85 - i * 0.1, 0.04]} rotation={[0.3, 0, 0.6]}>
            <meshStandardMaterial color={boneDark} roughness={0.85} />
          </Cylinder>
        </group>
      ))}
      {/* Pelvis */}
      <Sphere args={[0.12, 6, 5]} position={[0, 0.5, 0]} scale={[1.5, 0.5, 0.8]}>
        <meshStandardMaterial color={bone} roughness={0.8} />
      </Sphere>
      {/* Shoulders */}
      <Cylinder args={[0.025, 0.025, 0.45, 4]} position={[0, 0.98, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color={bone} roughness={0.8} />
      </Cylinder>

      {/* Skull */}
      <group position={[0, 1.2, 0]}>
        <Sphere args={[0.18, 8, 8]} scale={[1, 0.9, 0.95]}>
          <meshStandardMaterial color={bone} roughness={0.7} />
        </Sphere>
        {/* Eye sockets */}
        {[-1, 1].map(s => (
          <group key={`seye-${s}`}>
            <Sphere args={[0.05, 6, 5]} position={[s * 0.07, 0.02, 0.14]}>
              <meshStandardMaterial color="#1A1A1A" roughness={0.95} />
            </Sphere>
            <Sphere args={[0.03, 5, 4]} position={[s * 0.07, 0.02, 0.15]}>
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
            </Sphere>
          </group>
        ))}
        {/* Nose hole */}
        <Sphere args={[0.025, 4, 3]} position={[0, -0.04, 0.16]}>
          <meshStandardMaterial color="#1A1A1A" roughness={0.95} />
        </Sphere>
        {/* Upper teeth */}
        {[-0.04, -0.015, 0.015, 0.04].map((x, i) => (
          <Box key={`utooth-${i}`} args={[0.018, 0.03, 0.015]} position={[x, -0.1, 0.14]}>
            <meshStandardMaterial color={bone} roughness={0.6} />
          </Box>
        ))}
        {/* Jaw */}
        <Box ref={jawRef} args={[0.14, 0.04, 0.1]} position={[0, -0.14, 0.07]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Box>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.25, 0.95, 0]}>
        <Cylinder args={[0.03, 0.025, 0.3, 4]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        <Sphere args={[0.025, 4, 4]} position={[0, -0.31, 0]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Sphere>
        <Cylinder args={[0.025, 0.02, 0.25, 4]} position={[0, -0.44, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        <Sphere args={[0.03, 4, 4]} position={[0, -0.58, 0]} scale={[1.2, 0.6, 0.8]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Sphere>
      </group>

      {/* Right Arm + Sword */}
      <group ref={rightArmRef} position={[0.25, 0.95, 0]}>
        <Cylinder args={[0.03, 0.025, 0.3, 4]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        <Sphere args={[0.025, 4, 4]} position={[0, -0.31, 0]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Sphere>
        <Cylinder args={[0.025, 0.02, 0.25, 4]} position={[0, -0.44, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        {/* Sword */}
        <Box args={[0.04, 0.5, 0.015]} position={[0, -0.7, 0.04]}>
          <meshStandardMaterial color="#8A8A8A" roughness={0.3} metalness={0.7} />
        </Box>
        <Box args={[0.12, 0.02, 0.03]} position={[0, -0.46, 0.04]}>
          <meshStandardMaterial color="#5A4A2A" roughness={0.7} />
        </Box>
        <Cylinder args={[0.02, 0.02, 0.1, 5]} position={[0, -0.4, 0.04]}>
          <meshStandardMaterial color="#4A3A1A" roughness={0.8} />
        </Cylinder>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.1, 0.45, 0]}>
        <Cylinder args={[0.035, 0.03, 0.3, 4]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        <Sphere args={[0.03, 4, 4]} position={[0, -0.31, 0]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Sphere>
        <Cylinder args={[0.03, 0.025, 0.25, 4]} position={[0, -0.44, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        <Box args={[0.05, 0.025, 0.1]} position={[0, -0.57, 0.03]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Box>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.1, 0.45, 0]}>
        <Cylinder args={[0.035, 0.03, 0.3, 4]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        <Sphere args={[0.03, 4, 4]} position={[0, -0.31, 0]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Sphere>
        <Cylinder args={[0.03, 0.025, 0.25, 4]} position={[0, -0.44, 0]}>
          <meshStandardMaterial color={bone} roughness={0.8} />
        </Cylinder>
        <Box args={[0.05, 0.025, 0.1]} position={[0, -0.57, 0.03]}>
          <meshStandardMaterial color={boneDark} roughness={0.8} />
        </Box>
      </group>
    </group>
  );
});
