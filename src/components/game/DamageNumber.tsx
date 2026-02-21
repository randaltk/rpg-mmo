"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { CombatEvent } from "@/types/game";
import * as THREE from "three";

interface DamageNumberProps {
  event: CombatEvent;
}

export default function DamageNumber({ event }: DamageNumberProps) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(1);
  const startY = useRef(event.y);
  const offset = useRef((Math.random() - 0.5) * 0.5);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y += delta * 1.5;
    groupRef.current.position.x += offset.current * delta;
    opacityRef.current = Math.max(0, opacityRef.current - delta * 0.8);
  });

  if (event.type === "monsterDeath") {
    return (
      <group ref={groupRef} position={[event.x, event.y + 0.5, event.z]}>
        <Text
          fontSize={0.25}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {`+${event.expGained} EXP`}
        </Text>
      </group>
    );
  }

  const isPlayerAttack = event.type === "playerAttack";
  const color = event.isCrit ? "#FFD700" : isPlayerAttack ? "#FFFFFF" : "#FF4444";
  const size = event.isCrit ? 0.35 : 0.25;

  return (
    <group ref={groupRef} position={[event.x + offset.current, event.y + 0.3, event.z]}>
      {event.isCrit && (
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.18}
          color="#FF6600"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000"
        >
          CRITICAL!
        </Text>
      )}
      <Text
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
        fontWeight="bold"
      >
        {event.damage > 0 ? `-${event.damage}` : "MISS"}
      </Text>
    </group>
  );
}
