"use client";

import React from "react";
import { Text, Box } from "@react-three/drei";
import * as THREE from "three";
import { Player } from "@/types/game";

interface CharacterUIProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export default function CharacterUI({ player, isCurrentPlayer }: CharacterUIProps) {
  const hpRatio = player.hp / player.maxHp;
  const hpColor = hpRatio > 0.5 ? "#2ECC71" : hpRatio > 0.25 ? "#F1C40F" : "#E74C3C";

  return (
    <>
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
        position={[-(1.0 - hpRatio * 1.0) / 2, 2.65, 0.03]}
        args={[Math.max(hpRatio * 1.0, 0.01), 0.08, 0.03]}
      >
        <meshStandardMaterial
          color={hpColor}
          emissive={hpColor}
          emissiveIntensity={0.3}
        />
      </Box>

      {isCurrentPlayer && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.72, 32]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}
