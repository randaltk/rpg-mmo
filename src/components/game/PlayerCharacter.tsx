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
  const capeRef = useRef<THREE.Mesh>(null);

  const prevPos = useRef({ x: player.x, z: player.z });
  const targetRotation = useRef(0);
  const walkCycle = useRef(0);
  const isMoving = useRef(false);
  const smoothSpeed = useRef(0);

  const skinColor = "#EDCBA0";
  const shirtColor = player.color;
  const shirtDark = new THREE.Color(player.color).multiplyScalar(0.7).getStyle();
  const pantsColor = "#3B2F2F";
  const bootColor = "#5C3A1E";
  const bootTrim = "#8B6914";
  const hairColor = "#2A1F1A";
  const capeColor = new THREE.Color(player.color).multiplyScalar(0.5).getStyle();

  useFrame((state, delta) => {
    const dx = player.x - prevPos.current.x;
    const dz = player.z - prevPos.current.z;
    const distMoved = Math.sqrt(dx * dx + dz * dz);

    isMoving.current = distMoved > 0.001;
    if (isMoving.current) targetRotation.current = Math.atan2(dx, dz);

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

    const swing = Math.sin(walkCycle.current) * 0.5 * speed;
    const bob = Math.abs(Math.sin(walkCycle.current)) * 0.08 * speed;

    groupRef.current.position.y = player.y + bob;

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = swing;
      rightLegRef.current.rotation.x = -swing;
    }
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -swing * 0.6;
      rightArmRef.current.rotation.x = swing * 0.6;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(walkCycle.current) * 0.02 * speed;
    }
    if (capeRef.current) {
      capeRef.current.rotation.x = 0.15 + Math.sin(walkCycle.current) * 0.12 * speed + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[player.x, player.y, player.z]}>
      <group ref={bodyRef}>
        {/* === TORSO === */}
        {/* Main chest - wide and stocky */}
        <Box args={[0.7, 0.75, 0.45]} position={[0, 0.88, 0]}>
          <meshStandardMaterial color={shirtColor} roughness={0.75} />
        </Box>
        {/* Chest front detail (tunic fold) */}
        <Box args={[0.15, 0.55, 0.02]} position={[0, 0.88, 0.235]}>
          <meshStandardMaterial color={shirtDark} roughness={0.8} />
        </Box>
        {/* Lower tunic / skirt */}
        <Box args={[0.72, 0.2, 0.47]} position={[0, 0.42, 0]} scale={[1, 1, 1]}>
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </Box>
        {/* Belt */}
        <Box args={[0.73, 0.1, 0.48]} position={[0, 0.53, 0]}>
          <meshStandardMaterial color="#6B4423" roughness={0.5} metalness={0.2} />
        </Box>
        {/* Belt buckle */}
        <Box args={[0.12, 0.1, 0.04]} position={[0, 0.53, 0.26]}>
          <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
        </Box>
        {/* Collar */}
        <Box args={[0.55, 0.08, 0.35]} position={[0, 1.28, 0]}>
          <meshStandardMaterial color={shirtDark} roughness={0.8} />
        </Box>

        {/* === SHOULDER PADS === */}
        <Sphere args={[0.18, 8, 8]} position={[-0.45, 1.2, 0]} scale={[1, 0.7, 0.9]}>
          <meshStandardMaterial color="#7A6A5A" roughness={0.5} metalness={0.4} />
        </Sphere>
        <Sphere args={[0.18, 8, 8]} position={[0.45, 1.2, 0]} scale={[1, 0.7, 0.9]}>
          <meshStandardMaterial color="#7A6A5A" roughness={0.5} metalness={0.4} />
        </Sphere>

        {/* === CAPE === */}
        <mesh ref={capeRef} position={[0, 1.05, -0.25]} rotation={[0.15, 0, 0]}>
          <planeGeometry args={[0.6, 0.9]} />
          <meshStandardMaterial color={capeColor} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>

        {/* === HEAD (chibi - bigger) === */}
        <group position={[0, 1.65, 0]}>
          {/* Head shape - rounder, bigger */}
          <Sphere args={[0.32, 16, 16]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Sphere>

          {/* Hair - thick covering */}
          <Sphere args={[0.33, 16, 16]} position={[0, 0.05, -0.03]} scale={[1.02, 0.95, 1.02]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Sphere>
          {/* Hair front bangs */}
          <Box args={[0.52, 0.08, 0.15]} position={[0, 0.2, 0.15]} rotation={[0.2, 0, 0]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>
          {/* Side hair */}
          <Box args={[0.08, 0.2, 0.12]} position={[-0.3, 0.0, 0.1]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>
          <Box args={[0.08, 0.2, 0.12]} position={[0.3, 0.0, 0.1]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>

          {/* Eyes - big and expressive */}
          <Sphere args={[0.06, 8, 8]} position={[-0.11, 0.02, 0.26]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Sphere>
          <Sphere args={[0.06, 8, 8]} position={[0.11, 0.02, 0.26]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Sphere>
          {/* Iris */}
          <Sphere args={[0.04, 8, 8]} position={[-0.11, 0.02, 0.305]}>
            <meshStandardMaterial color="#3A7BD5" />
          </Sphere>
          <Sphere args={[0.04, 8, 8]} position={[0.11, 0.02, 0.305]}>
            <meshStandardMaterial color="#3A7BD5" />
          </Sphere>
          {/* Pupil */}
          <Sphere args={[0.02, 6, 6]} position={[-0.11, 0.02, 0.33]}>
            <meshStandardMaterial color="#111111" />
          </Sphere>
          <Sphere args={[0.02, 6, 6]} position={[0.11, 0.02, 0.33]}>
            <meshStandardMaterial color="#111111" />
          </Sphere>
          {/* Eye shine */}
          <Sphere args={[0.012, 4, 4]} position={[-0.095, 0.04, 0.335]}>
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </Sphere>
          <Sphere args={[0.012, 4, 4]} position={[0.125, 0.04, 0.335]}>
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </Sphere>

          {/* Eyebrows - thicker */}
          <Box args={[0.1, 0.025, 0.03]} position={[-0.11, 0.1, 0.26]} rotation={[0, 0, -0.1]}>
            <meshStandardMaterial color={hairColor} />
          </Box>
          <Box args={[0.1, 0.025, 0.03]} position={[0.11, 0.1, 0.26]} rotation={[0, 0, 0.1]}>
            <meshStandardMaterial color={hairColor} />
          </Box>

          {/* Nose */}
          <Sphere args={[0.03, 6, 6]} position={[0, -0.04, 0.3]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>

          {/* Mouth - smile */}
          <Box args={[0.08, 0.015, 0.01]} position={[0, -0.12, 0.28]}>
            <meshStandardMaterial color="#B5665A" />
          </Box>

          {/* Ears */}
          <Sphere args={[0.06, 6, 6]} position={[-0.3, -0.02, 0]} scale={[0.4, 0.8, 0.6]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
          <Sphere args={[0.06, 6, 6]} position={[0.3, -0.02, 0]} scale={[0.4, 0.8, 0.6]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
        </group>

        {/* === LEFT ARM === */}
        <group ref={leftArmRef} position={[-0.48, 1.1, 0]}>
          {/* Upper arm (sleeved) */}
          <Cylinder args={[0.1, 0.12, 0.4, 6]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color={shirtColor} roughness={0.8} />
          </Cylinder>
          {/* Forearm */}
          <Cylinder args={[0.08, 0.1, 0.3, 6]} position={[0, -0.5, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Cylinder>
          {/* Hand - chunky */}
          <Sphere args={[0.08, 6, 6]} position={[0, -0.7, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Sphere>
        </group>

        {/* === RIGHT ARM === */}
        <group ref={rightArmRef} position={[0.48, 1.1, 0]}>
          <Cylinder args={[0.1, 0.12, 0.4, 6]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color={shirtColor} roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.08, 0.1, 0.3, 6]} position={[0, -0.5, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Cylinder>
          <Sphere args={[0.08, 6, 6]} position={[0, -0.7, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Sphere>
        </group>
      </group>

      {/* === LEFT LEG === */}
      <group ref={leftLegRef} position={[-0.18, 0.32, 0]}>
        {/* Thigh */}
        <Cylinder args={[0.13, 0.12, 0.35, 6]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </Cylinder>
        {/* Shin */}
        <Cylinder args={[0.11, 0.1, 0.25, 6]} position={[0, -0.43, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </Cylinder>
        {/* Boot */}
        <Box args={[0.18, 0.18, 0.26]} position={[0, -0.63, 0.03]}>
          <meshStandardMaterial color={bootColor} roughness={0.7} />
        </Box>
        {/* Boot top trim */}
        <Box args={[0.19, 0.04, 0.22]} position={[0, -0.54, 0.01]}>
          <meshStandardMaterial color={bootTrim} roughness={0.5} metalness={0.3} />
        </Box>
        {/* Boot sole */}
        <Box args={[0.2, 0.04, 0.28]} position={[0, -0.73, 0.03]}>
          <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
        </Box>
      </group>

      {/* === RIGHT LEG === */}
      <group ref={rightLegRef} position={[0.18, 0.32, 0]}>
        <Cylinder args={[0.13, 0.12, 0.35, 6]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </Cylinder>
        <Cylinder args={[0.11, 0.1, 0.25, 6]} position={[0, -0.43, 0]}>
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </Cylinder>
        <Box args={[0.18, 0.18, 0.26]} position={[0, -0.63, 0.03]}>
          <meshStandardMaterial color={bootColor} roughness={0.7} />
        </Box>
        <Box args={[0.19, 0.04, 0.22]} position={[0, -0.54, 0.01]}>
          <meshStandardMaterial color={bootTrim} roughness={0.5} metalness={0.3} />
        </Box>
        <Box args={[0.2, 0.04, 0.28]} position={[0, -0.73, 0.03]}>
          <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
        </Box>
      </group>

      {/* === UI === */}
      <Text position={[0, 2.45, 0]} fontSize={0.22} color="white" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {player.nickname}
      </Text>
      <Text position={[0, 2.27, 0]} fontSize={0.14} color="#FFD700" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#000">
        {`Lv.${player.level}`}
      </Text>

      {/* HP bar */}
      <Box position={[0, 2.65, 0]} args={[1.0, 0.1, 0.05]}>
        <meshStandardMaterial color="#222" />
      </Box>
      <Box
        position={[-(1.0 - (player.hp / player.maxHp) * 1.0) / 2, 2.65, 0.03]}
        args={[Math.max((player.hp / player.maxHp) * 1.0, 0.01), 0.08, 0.03]}
      >
        <meshStandardMaterial
          color={player.hp / player.maxHp > 0.5 ? "#2ECC71" : player.hp / player.maxHp > 0.25 ? "#F1C40F" : "#E74C3C"}
          emissive={player.hp / player.maxHp > 0.5 ? "#2ECC71" : player.hp / player.maxHp > 0.25 ? "#F1C40F" : "#E74C3C"}
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Current player ring */}
      {isCurrentPlayer && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.72, 32]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
