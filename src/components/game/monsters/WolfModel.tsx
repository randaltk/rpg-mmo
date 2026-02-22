'use client';

import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Cone, Box } from '@react-three/drei';
import type { Monster } from '@/types/game';
import * as THREE from 'three';

interface WolfModelProps {
  monster: Monster;
  hurtFlash: boolean;
}

export const WolfModel = memo(function WolfModel({ monster, hurtFlash }: WolfModelProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const frontLeftLeg = useRef<THREE.Group>(null);
  const frontRightLeg = useRef<THREE.Group>(null);
  const backLeftLeg = useRef<THREE.Group>(null);
  const backRightLeg = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const walkCycle = useRef(0);

  const fur = hurtFlash ? '#FFCCCC' : '#5A5A5A';
  const furLight = hurtFlash ? '#FFDDDD' : '#7A7A7A';
  const furDark = hurtFlash ? '#FF9999' : '#3A3A3A';
  const belly = hurtFlash ? '#FFEEEE' : '#8A8A7A';

  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    const t = state.clock.elapsedTime;

    if (monster.state === 'dead') {
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, Math.PI / 2, 0.08);
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, -0.15, 0.08);
      return;
    }

    bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, delta * 5);
    bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0, delta * 5);

    const isMoving = monster.state === 'chasing' || monster.state === 'wandering';
    const speed = monster.state === 'chasing' ? 18 : 10;
    if (isMoving) walkCycle.current += delta * speed;
    else walkCycle.current *= 0.9;

    const swing = Math.sin(walkCycle.current) * 0.6;
    const bob = Math.abs(Math.sin(walkCycle.current)) * 0.05;
    bodyRef.current.position.y = bob;

    if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = swing;
    if (frontRightLeg.current) frontRightLeg.current.rotation.x = -swing;
    if (backLeftLeg.current) backLeftLeg.current.rotation.x = -swing;
    if (backRightLeg.current) backRightLeg.current.rotation.x = swing;

    if (tailRef.current) {
      tailRef.current.rotation.x = -0.4 + Math.sin(t * 4) * 0.3;
      tailRef.current.rotation.z = Math.sin(t * 3) * 0.2;
    }

    if (jawRef.current) {
      if (monster.state === 'attacking') {
        jawRef.current.rotation.x = Math.sin(t * 10) * 0.15;
      } else {
        jawRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={bodyRef} scale={[0.65, 0.65, 0.65]}>
      {/* Body */}
      <Sphere args={[0.35, 8, 6]} position={[0, 0.55, 0]} scale={[0.8, 0.7, 1.3]} castShadow>
        <meshStandardMaterial color={fur} roughness={0.9} />
      </Sphere>
      {/* Belly */}
      <Sphere args={[0.28, 8, 6]} position={[0, 0.48, 0.05]} scale={[0.7, 0.5, 1.1]}>
        <meshStandardMaterial color={belly} roughness={0.9} />
      </Sphere>

      {/* Neck */}
      <Cylinder args={[0.12, 0.18, 0.25, 6]} position={[0, 0.7, 0.35]} rotation={[0.5, 0, 0]}>
        <meshStandardMaterial color={fur} roughness={0.9} />
      </Cylinder>
      {/* Mane */}
      <Sphere args={[0.18, 6, 6]} position={[0, 0.75, 0.3]} scale={[1, 1.2, 0.8]}>
        <meshStandardMaterial color={furDark} roughness={0.95} />
      </Sphere>

      {/* Head */}
      <group position={[0, 0.82, 0.5]}>
        <Sphere args={[0.16, 8, 6]} scale={[1, 0.85, 1.1]}>
          <meshStandardMaterial color={fur} roughness={0.9} />
        </Sphere>
        {/* Snout */}
        <Cone args={[0.08, 0.2, 6]} position={[0, -0.03, 0.15]} rotation={[-Math.PI / 2 + 0.2, 0, 0]}>
          <meshStandardMaterial color={furLight} roughness={0.85} />
        </Cone>
        {/* Nose */}
        <Sphere args={[0.03, 5, 4]} position={[0, -0.01, 0.25]}>
          <meshStandardMaterial color="#111" roughness={0.5} />
        </Sphere>
        {/* Jaw */}
        <Box ref={jawRef} args={[0.1, 0.03, 0.12]} position={[0, -0.08, 0.13]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Box>
        {/* Eyes */}
        {[-1, 1].map(s => (
          <group key={`eye-${s}`}>
            <Sphere args={[0.035, 6, 5]} position={[s * 0.08, 0.05, 0.1]}>
              <meshStandardMaterial color="#DDAA00" emissive="#DDAA00" emissiveIntensity={0.4} />
            </Sphere>
            <Sphere args={[0.018, 4, 3]} position={[s * 0.08, 0.05, 0.13]}>
              <meshStandardMaterial color="#111" />
            </Sphere>
          </group>
        ))}
        {/* Ears */}
        <Cone args={[0.05, 0.12, 4]} position={[-0.1, 0.15, -0.02]} rotation={[0.2, 0, -0.15]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Cone>
        <Cone args={[0.05, 0.12, 4]} position={[0.1, 0.15, -0.02]} rotation={[0.2, 0, 0.15]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Cone>
      </group>

      {/* Front legs */}
      <group ref={frontLeftLeg} position={[-0.15, 0.3, 0.25]}>
        <Cylinder args={[0.05, 0.04, 0.35, 5]} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={fur} roughness={0.9} />
        </Cylinder>
        <Sphere args={[0.04, 4, 4]} position={[0, -0.36, 0.01]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Sphere>
      </group>
      <group ref={frontRightLeg} position={[0.15, 0.3, 0.25]}>
        <Cylinder args={[0.05, 0.04, 0.35, 5]} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={fur} roughness={0.9} />
        </Cylinder>
        <Sphere args={[0.04, 4, 4]} position={[0, -0.36, 0.01]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Sphere>
      </group>

      {/* Back legs */}
      <group ref={backLeftLeg} position={[-0.15, 0.3, -0.25]}>
        <Cylinder args={[0.06, 0.04, 0.35, 5]} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={fur} roughness={0.9} />
        </Cylinder>
        <Sphere args={[0.04, 4, 4]} position={[0, -0.36, 0.01]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Sphere>
      </group>
      <group ref={backRightLeg} position={[0.15, 0.3, -0.25]}>
        <Cylinder args={[0.06, 0.04, 0.35, 5]} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={fur} roughness={0.9} />
        </Cylinder>
        <Sphere args={[0.04, 4, 4]} position={[0, -0.36, 0.01]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Sphere>
      </group>

      {/* Tail */}
      <group ref={tailRef} position={[0, 0.6, -0.4]}>
        <Cylinder args={[0.04, 0.02, 0.35, 5]} position={[0, 0.15, -0.05]} rotation={[0.6, 0, 0]}>
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </Cylinder>
      </group>
    </group>
  );
});
