"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sphere } from "@react-three/drei";
import { useSocket } from "@/hooks/useSocket";
import { useGameControls } from "@/hooks/useGameControls";
import PlayerCharacter from "./PlayerCharacter";
import MonsterCharacter from "./MonsterCharacter";
import DamageNumber from "./DamageNumber";
import FollowCamera from "./FollowCamera";
import FloatingParticles from "./FloatingParticles";
import MapSystem from "../MapSystem";
import * as THREE from "three";

function SkyDome({ isCave }: { isCave: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    topColor: { value: isCave ? new THREE.Color("#050510") : new THREE.Color("#1e90ff") },
    bottomColor: { value: isCave ? new THREE.Color("#0a0a1a") : new THREE.Color("#87CEEB") },
    horizonColor: { value: isCave ? new THREE.Color("#1a1a2e") : new THREE.Color("#ffe4b5") },
    offset: { value: 20 },
    exponent: { value: 0.6 },
  }), [isCave]);

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform vec3 horizonColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      float t = max(pow(max(h, 0.0), exponent), 0.0);
      vec3 sky = mix(horizonColor, topColor, t);
      float b = max(pow(max(-h, 0.0), exponent * 2.0), 0.0);
      vec3 color = mix(sky, bottomColor, b);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh>
      <sphereGeometry args={[400, 16, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[40, 35, -30]}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#FFF5D4" />
      </mesh>
      <mesh>
        <sphereGeometry args={[7, 16, 16]} />
        <meshBasicMaterial color="#FFF5D4" transparent opacity={0.15} />
      </mesh>
      <pointLight color="#FFF0D0" intensity={0.6} distance={200} />
    </group>
  );
}

function Clouds() {
  const cloudsData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 30 + Math.sin(i * 3.7) * 15;
      data.push({
        x: Math.cos(angle) * radius,
        y: 18 + Math.sin(i * 2.3) * 5,
        z: Math.sin(angle) * radius,
        scaleX: 3 + Math.sin(i * 1.7) * 2,
        scaleY: 0.6 + Math.sin(i * 2.9) * 0.3,
        scaleZ: 2 + Math.cos(i * 1.3) * 1,
        opacity: 0.35 + Math.sin(i * 4.1) * 0.15,
      });
    }
    return data;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {cloudsData.map((c, i) => (
        <Sphere key={i} args={[1, 8, 8]} position={[c.x, c.y, c.z]} scale={[c.scaleX, c.scaleY, c.scaleZ]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={c.opacity} roughness={1} />
        </Sphere>
      ))}
    </group>
  );
}

interface GameSceneProps {
  inventoryOpen: boolean;
  onInventoryToggle: () => void;
  interactionMessage: string | null;
  onInteractionMessage: (message: string | null) => void;
}

function CombatController() {
  const { monsters, targetMonsterId, attackMonster } = useSocket();
  const monstersRef = useRef(monsters);
  monstersRef.current = monsters;
  const attackRef = useRef(attackMonster);
  attackRef.current = attackMonster;

  useEffect(() => {
    if (!targetMonsterId) {
      (window as any).__combatTarget = null;
      return;
    }

    const monster = monstersRef.current.find(m => m.id === targetMonsterId);
    if (!monster || monster.state === "dead") {
      (window as any).__combatTarget = null;
      return;
    }

    (window as any).__combatTarget = { id: targetMonsterId };

    const attackInterval = setInterval(() => {
      const tid = targetMonsterId;
      const m = monstersRef.current.find(m => m.id === tid);
      if (!m || m.state === "dead") return;

      const localPos = (window as any).__localPlayerPos as { x: number; y: number; z: number } | null;
      if (!localPos) return;

      const dist = Math.sqrt((localPos.x - m.x) ** 2 + (localPos.z - m.z) ** 2);
      if (dist <= 2.5) {
        attackRef.current(tid);
      }
    }, 700);

    return () => {
      clearInterval(attackInterval);
      (window as any).__combatTarget = null;
    };
  }, [targetMonsterId]);

  return null;
}

export default function GameScene({
  inventoryOpen,
  onInventoryToggle,
  interactionMessage,
  onInteractionMessage,
}: GameSceneProps) {
  const { players, currentPlayer, movePlayer, emitMove, monsters, combatEvents, targetMonsterId, setTargetMonsterId, attackMonster } = useSocket();
  const [attackingPlayers, setAttackingPlayers] = useState<Record<string, boolean>>({});

  const { currentMap } = useGameControls({
    currentPlayer,
    movePlayer,
    emitMove,
    onInventoryToggle,
    onInteractionMessage,
  });

  useEffect(() => {
    for (const event of combatEvents) {
      if (event.type === "playerAttack") {
        setAttackingPlayers(prev => ({ ...prev, [event.attackerId]: true }));
        setTimeout(() => {
          setAttackingPlayers(prev => ({ ...prev, [event.attackerId]: false }));
        }, 400);
      }
    }
  }, [combatEvents]);

  useEffect(() => {
    if (targetMonsterId) {
      const monster = monsters.find(m => m.id === targetMonsterId);
      if (!monster || monster.state === "dead") {
        setTargetMonsterId(null);
      }
    }
  }, [monsters, targetMonsterId, setTargetMonsterId]);

  const handleMonsterClick = useCallback((monsterId: string) => {
    setTargetMonsterId(monsterId);
  }, [setTargetMonsterId]);

  useEffect(() => {
    (window as any).__clearTarget = () => setTargetMonsterId(null);
    return () => { delete (window as any).__clearTarget; };
  }, [setTargetMonsterId]);

  const isCave = currentMap.id === "cave";
  const isCastle = currentMap.id === "castle";
  const isTown = currentMap.id === "town";
  const isIndoor = isCave || isCastle;

  const cameraTarget = currentPlayer
    ? { x: currentPlayer.x, y: currentPlayer.y, z: currentPlayer.z }
    : { x: 0, y: 0, z: 0 };

  const targetMonster = targetMonsterId ? monsters.find(m => m.id === targetMonsterId) : null;
  const targetPos = targetMonster ? { x: targetMonster.x, z: targetMonster.z } : null;

  return (
    <>
      <FollowCamera target={cameraTarget} />
      <CombatController />

      {!isCastle && <SkyDome isCave={isCave} />}

      {isTown && (
        <>
          <Sun />
          <Clouds />
        </>
      )}

      {isCave && (
        <Stars radius={80} depth={30} count={2000} factor={3} saturation={0.5} fade speed={0.5} />
      )}

      <hemisphereLight
        args={[
          isCastle ? "#FFE4C4" : isCave ? "#1a1a3e" : "#87CEEB",
          isCastle ? "#3A3530" : isCave ? "#0a0a15" : "#5a8a3a",
          isCastle ? 0.15 : isCave ? 0.2 : 0.6,
        ]}
      />

      <directionalLight
        position={isCastle ? [0, 6, 0] : [15, 20, 10]}
        intensity={isCastle ? 0.3 : isCave ? 0.15 : 1.5}
        color={isCastle ? "#FF8C00" : isCave ? "#3a3a6e" : "#FFF0D0"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      <directionalLight
        position={isCastle ? [0, 5, 10] : [-10, 8, -8]}
        intensity={isCastle ? 0.15 : isCave ? 0.05 : 0.4}
        color={isCastle ? "#FFD0A0" : isCave ? "#1a1a3a" : "#FFE4C4"}
      />

      <ambientLight
        intensity={isCastle ? 0.12 : isCave ? 0.08 : 0.25}
        color={isCastle ? "#2A1A0A" : isCave ? "#0d0d2b" : "#FFF8F0"}
      />

      {isCave && (
        <>
          <pointLight position={[-12, 1.5, -8]} intensity={0.7} color="#00CED1" distance={20} />
          <pointLight position={[14, 1.5, -5]} intensity={0.6} color="#9B30FF" distance={18} />
          <pointLight position={[0, 3, 0]} intensity={0.8} color="#6A5ACD" distance={30} />
          <pointLight position={[0, 2, 15]} intensity={0.6} color="#7B68EE" distance={18} />
        </>
      )}

      {isCastle && (
        <>
          <pointLight position={[0, 5, -10]} intensity={1} color="#FF8C00" distance={20} decay={1.5} />
          <pointLight position={[0, 5, 10]} intensity={0.8} color="#FF8C00" distance={20} decay={1.5} />
          <pointLight position={[-8, 4, 0]} intensity={0.6} color="#FFB347" distance={15} decay={2} />
          <pointLight position={[8, 4, 0]} intensity={0.6} color="#FFB347" distance={15} decay={2} />
        </>
      )}

      <fog
        attach="fog"
        args={[
          isCastle ? "#1A1510" : isCave ? "#0a0a1a" : "#c8ddf0",
          isCastle ? 8 : isCave ? 20 : 40,
          isCastle ? 30 : isCave ? 65 : 160,
        ]}
      />

      <FloatingParticles isCave={isIndoor} />

      <MapSystem
        currentMap={currentMap}
        onPlayerMove={(x: number, y: number, z: number) => {
          const canMove = (window as any).checkCollision(x, y, z);
          if (canMove) {
            movePlayer({ x, y, z });
            return true;
          }
          return false;
        }}
      />

      {/* Players */}
      {Object.values(players).map((player) => (
        <PlayerCharacter
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === currentPlayer?.id}
          isAttacking={attackingPlayers[player.id] || false}
          targetPosition={player.id === currentPlayer?.id ? targetPos : null}
        />
      ))}

      {(!currentPlayer || Object.keys(players).length === 0) && (
        <PlayerCharacter
          key="test-player"
          player={{
            id: "test",
            nickname: currentPlayer?.nickname || "Conectando...",
            x: 0, y: 0, z: 0,
            color: "#FF6B6B",
            level: 1,
            hp: 100, maxHp: 100,
            attack: 10, defense: 5,
            experience: 0,
            inventory: [],
            equipped: { weapon: undefined, armor: undefined, accessory: undefined },
          }}
          isCurrentPlayer={true}
        />
      )}

      {/* Monsters */}
      {monsters.map((monster) => (
        <MonsterCharacter
          key={monster.id}
          monster={monster}
          isTarget={monster.id === targetMonsterId}
          onClick={handleMonsterClick}
        />
      ))}

      {/* Damage Numbers */}
      {combatEvents.map((event, i) => (
        <DamageNumber key={`${event.type}-${event.attackerId}-${event.targetId}-${i}`} event={event} />
      ))}
    </>
  );
}
