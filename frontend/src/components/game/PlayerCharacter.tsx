"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder } from "@react-three/drei";
import { Player } from "@/types/game";
import * as THREE from "three";

interface PlayerCharacterProps {
  player: Player;
  isCurrentPlayer?: boolean;
}

export default function PlayerCharacter({ player, isCurrentPlayer = false }: PlayerCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const prevPos = useRef({ x: player.x, z: player.z });
  const targetRotation = useRef(0);
  const walkCycle = useRef(0);
  const isMoving = useRef(false);
  const smoothSpeed = useRef(0);

  const skinColor = "#F5CBA7";
  const hairColor = "#3B2F2F";
  const shirtColor = player.color;
  const pantsColor = "#2C3E50";
  const shoeColor = "#1A1A1A";

  useFrame((_, delta) => {
    const dx = player.x - prevPos.current.x;
    const dz = player.z - prevPos.current.z;
    const distMoved = Math.sqrt(dx * dx + dz * dz);

    isMoving.current = distMoved > 0.001;

    if (isMoving.current) {
      targetRotation.current = Math.atan2(dx, dz);
    }

    const targetSpeed = isMoving.current ? 1 : 0;
    smoothSpeed.current = THREE.MathUtils.lerp(smoothSpeed.current, targetSpeed, delta * 8);

    prevPos.current = { x: player.x, z: player.z };

    if (!groupRef.current) return;

    groupRef.current.position.x = player.x;
    groupRef.current.position.z = player.z;

    let currentRot = groupRef.current.rotation.y;
    let diff = targetRotation.current - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y = currentRot + diff * Math.min(delta * 10, 1);

    const speed = smoothSpeed.current;
    if (speed > 0.01) {
      walkCycle.current += delta * 10 * speed;
    } else {
      walkCycle.current *= 0.9;
    }

    const swing = Math.sin(walkCycle.current) * 0.6 * speed;
    const bob = Math.abs(Math.sin(walkCycle.current)) * 0.06 * speed;

    groupRef.current.position.y = player.y + bob;

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = swing;
      rightLegRef.current.rotation.x = -swing;
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -swing * 0.7;
      rightArmRef.current.rotation.x = swing * 0.7;
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(walkCycle.current) * 0.03 * speed;
    }
  });

  return (
    <group ref={groupRef} position={[player.x, player.y, player.z]}>
      <group ref={bodyRef}>
        {/* Torso */}
        <Cylinder args={[0.28, 0.32, 0.8, 8]} position={[0, 0.9, 0]}>
          <meshStandardMaterial color={shirtColor} roughness={0.8} metalness={0.05} />
        </Cylinder>
        <Cylinder args={[0.29, 0.28, 0.08, 8]} position={[0, 1.28, 0]}>
          <meshStandardMaterial color={shirtColor} roughness={0.9} />
        </Cylinder>
        {/* Belt */}
        <Cylinder args={[0.33, 0.33, 0.06, 8]} position={[0, 0.52, 0]}>
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.3} />
        </Cylinder>
        <Box args={[0.08, 0.06, 0.02]} position={[0, 0.52, 0.33]}>
          <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.8} />
        </Box>

        {/* Head */}
        <group position={[0, 1.55, 0]}>
          <Sphere args={[0.22, 16, 16]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
          {/* Hair */}
          <Sphere args={[0.23, 16, 16]} position={[0, 0.04, -0.02]} scale={[1, 0.9, 1]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Sphere>
          <Box args={[0.36, 0.06, 0.12]} position={[0, 0.15, 0.12]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>
          {/* Eyes */}
          <Sphere args={[0.04, 8, 8]} position={[-0.08, 0.03, 0.18]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Sphere>
          <Sphere args={[0.04, 8, 8]} position={[0.08, 0.03, 0.18]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Sphere>
          <Sphere args={[0.025, 8, 8]} position={[-0.08, 0.03, 0.21]}>
            <meshStandardMaterial color="#4A90D9" />
          </Sphere>
          <Sphere args={[0.025, 8, 8]} position={[0.08, 0.03, 0.21]}>
            <meshStandardMaterial color="#4A90D9" />
          </Sphere>
          <Sphere args={[0.012, 6, 6]} position={[-0.08, 0.03, 0.225]}>
            <meshStandardMaterial color="#000000" />
          </Sphere>
          <Sphere args={[0.012, 6, 6]} position={[0.08, 0.03, 0.225]}>
            <meshStandardMaterial color="#000000" />
          </Sphere>
          {/* Eyebrows */}
          <Box args={[0.08, 0.015, 0.02]} position={[-0.08, 0.09, 0.19]} rotation={[0, 0, -0.1]}>
            <meshStandardMaterial color={hairColor} />
          </Box>
          <Box args={[0.08, 0.015, 0.02]} position={[0.08, 0.09, 0.19]} rotation={[0, 0, 0.1]}>
            <meshStandardMaterial color={hairColor} />
          </Box>
          {/* Nose */}
          <Cylinder args={[0.015, 0.025, 0.06, 6]} position={[0, -0.02, 0.22]} rotation={[Math.PI / 2 - 0.3, 0, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Cylinder>
          {/* Mouth */}
          <Box args={[0.06, 0.012, 0.01]} position={[0, -0.08, 0.2]}>
            <meshStandardMaterial color="#C0776E" />
          </Box>
          {/* Ears */}
          <Sphere args={[0.04, 6, 6]} position={[-0.22, 0.0, 0]} scale={[0.4, 1, 0.7]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
          <Sphere args={[0.04, 6, 6]} position={[0.22, 0.0, 0]} scale={[0.4, 1, 0.7]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
        </group>

        {/* Left arm */}
        <group ref={leftArmRef} position={[-0.38, 1.15, 0]}>
          <Cylinder args={[0.06, 0.07, 0.45, 6]} position={[0, -0.22, 0]}>
            <meshStandardMaterial color={shirtColor} roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.05, 0.06, 0.35, 6]} position={[0, -0.57, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Cylinder>
          <Sphere args={[0.05, 6, 6]} position={[0, -0.76, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
        </group>

        {/* Right arm */}
        <group ref={rightArmRef} position={[0.38, 1.15, 0]}>
          <Cylinder args={[0.06, 0.07, 0.45, 6]} position={[0, -0.22, 0]}>
            <meshStandardMaterial color={shirtColor} roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.05, 0.06, 0.35, 6]} position={[0, -0.57, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Cylinder>
          <Sphere args={[0.05, 6, 6]} position={[0, -0.76, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
        </group>
      </group>

      {/* Left leg */}
      <group ref={leftLegRef} position={[-0.13, 0.5, 0]}>
        <Cylinder args={[0.09, 0.08, 0.4, 6]} position={[0, -0.2, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </Cylinder>
        <Cylinder args={[0.07, 0.06, 0.35, 6]} position={[0, -0.55, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </Cylinder>
        <Box args={[0.1, 0.06, 0.16]} position={[0, -0.75, 0.03]}>
          <meshStandardMaterial color={shoeColor} roughness={0.6} />
        </Box>
      </group>

      {/* Right leg */}
      <group ref={rightLegRef} position={[0.13, 0.5, 0]}>
        <Cylinder args={[0.09, 0.08, 0.4, 6]} position={[0, -0.2, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </Cylinder>
        <Cylinder args={[0.07, 0.06, 0.35, 6]} position={[0, -0.55, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </Cylinder>
        <Box args={[0.1, 0.06, 0.16]} position={[0, -0.75, 0.03]}>
          <meshStandardMaterial color={shoeColor} roughness={0.6} />
        </Box>
      </group>

      {/* Name */}
      <Text position={[0, 2.1, 0]} fontSize={0.22} color="white" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {player.nickname}
      </Text>

      {/* Level */}
      <Text position={[0, 1.92, 0]} fontSize={0.14} color="#FFD700" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#000">
        {`Lv.${player.level}`}
      </Text>

      {/* HP bar */}
      <Box position={[0, 2.3, 0]} args={[1.0, 0.1, 0.05]}>
        <meshStandardMaterial color="#222" />
      </Box>
      <Box
        position={[-(1.0 - (player.hp / player.maxHp) * 1.0) / 2, 2.3, 0.03]}
        args={[Math.max((player.hp / player.maxHp) * 1.0, 0.01), 0.08, 0.03]}
      >
        <meshStandardMaterial
          color={player.hp / player.maxHp > 0.5 ? "#2ECC71" : player.hp / player.maxHp > 0.25 ? "#F1C40F" : "#E74C3C"}
          emissive={player.hp / player.maxHp > 0.5 ? "#2ECC71" : player.hp / player.maxHp > 0.25 ? "#F1C40F" : "#E74C3C"}
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Current player indicator */}
      {isCurrentPlayer && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
