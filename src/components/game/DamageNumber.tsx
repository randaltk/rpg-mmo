"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { CombatEvent } from "@/types/game";
import * as THREE from "three";

interface DamageNumberProps {
  event: CombatEvent & { _spawnTime: number };
}

export default function DamageNumber({ event }: DamageNumberProps) {
  const groupRef = useRef<THREE.Group>(null);
  const life = useRef(0);
  const offset = useRef((Math.random() - 0.5) * 0.6);
  const startScale = useRef(event.isCrit ? 2.2 : 1.6);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    life.current += delta;
    const t = life.current;

    groupRef.current.position.y += delta * (1.8 - t * 0.5);
    groupRef.current.position.x += offset.current * delta * 0.3;

    const popScale = t < 0.12
      ? THREE.MathUtils.lerp(startScale.current, 1, t / 0.12)
      : 1;
    const fadeScale = t > 0.8 ? Math.max(0.3, 1 - (t - 0.8) * 1.5) : 1;
    const s = popScale * fadeScale;
    groupRef.current.scale.set(s, s, s);

    groupRef.current.children.forEach((child) => {
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material as THREE.Material;
        if ('fillOpacity' in mat) {
          (mat as any).fillOpacity = Math.max(0, 1 - t * 0.7);
        }
      }
    });
  });

  if (event.type === "monsterDeath") {
    return (
      <group ref={groupRef} position={[event.x, event.y + 0.8, event.z]}>
        <Text
          fontSize={0.3}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#000"
          fontWeight="bold"
        >
          {`+${event.expGained} EXP`}
        </Text>
      </group>
    );
  }

  const isPlayerAttack = event.type === "playerAttack";
  const isMonsterAttack = event.type === "monsterAttack";

  const color = event.isCrit
    ? "#FFD700"
    : isPlayerAttack
      ? "#FFFFFF"
      : "#FF4444";

  const size = event.isCrit ? 0.4 : isMonsterAttack ? 0.28 : 0.26;
  const yOffset = isMonsterAttack ? 1.5 : 0.5;

  return (
    <group ref={groupRef} position={[event.x + offset.current * 0.3, event.y + yOffset, event.z]}>
      {event.isCrit && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.2}
          color="#FF6600"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
          fontWeight="bold"
        >
          CRITICAL!
        </Text>
      )}
      <Text
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#000"
        fontWeight="bold"
      >
        {event.damage > 0 ? `-${event.damage}` : "MISS"}
      </Text>
    </group>
  );
}
