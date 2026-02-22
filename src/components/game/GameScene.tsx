"use client";

import React, { useRef, useMemo, useCallback, useEffect, useState, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sphere, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useSocket } from "@/hooks/useSocket";
import { useGameControls } from "@/hooks/useGameControls";
import PlayerCharacter from "./character";
import MonsterCharacter from "./MonsterCharacter";
import DamageNumber from "./DamageNumber";
import FollowCamera from "./FollowCamera";
import FloatingParticles from "./FloatingParticles";
import MapSystem from "@/components/map/MapSystem";
import { useGameStore } from "@/stores/gameStore";
import * as THREE from "three";

import { PerfMonitor } from "@/utils/perfMonitor";
import { BIOME_CONFIGS } from "@/lib/worldgen/biome-configs";
import type { BiomeType } from "@/types/game";

const perfLog = new PerfMonitor("GameScene");

const SkyDome = memo(function SkyDome({ isCave }: { isCave: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    topColor: { value: isCave ? new THREE.Color("#050510") : new THREE.Color("#1e90ff") },
    bottomColor: { value: isCave ? new THREE.Color("#0a0a1a") : new THREE.Color("#87CEEB") },
    horizonColor: { value: isCave ? new THREE.Color("#1a1a2e") : new THREE.Color("#ffe4b5") },
    offset: { value: 20 },
    exponent: { value: 0.6 },
  }), [isCave]);

  const vertexShader = `
    varying vec3 vLocalPosition;
    void main() {
      vLocalPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform vec3 horizonColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vLocalPosition;
    void main() {
      float h = normalize(vLocalPosition + offset).y;
      float t = max(pow(max(h, 0.0), exponent), 0.0);
      vec3 sky = mix(horizonColor, topColor, t);
      float b = max(pow(max(-h, 0.0), exponent * 2.0), 0.0);
      vec3 color = mix(sky, bottomColor, b);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = useGameStore.getState().localPlayerPos;
    if (pos) {
      meshRef.current.position.set(pos.x, 0, pos.z);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[500, 16, 16]} />
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
});

const SUN_OFFSET = new THREE.Vector3(40, 35, -30);

const Sun = memo(function Sun() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const pos = useGameStore.getState().localPlayerPos;
    if (pos) {
      groupRef.current.position.set(
        pos.x + SUN_OFFSET.x,
        SUN_OFFSET.y,
        pos.z + SUN_OFFSET.z,
      );
    }
  });

  return (
    <group ref={groupRef} position={[SUN_OFFSET.x, SUN_OFFSET.y, SUN_OFFSET.z]}>
      <mesh>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#FFF5D4" />
      </mesh>
      <mesh>
        <sphereGeometry args={[7, 16, 16]} />
        <meshBasicMaterial color="#FFF5D4" transparent opacity={0.15} />
      </mesh>
    </group>
  );
});

const Clouds = memo(function Clouds() {
  const cloudsData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 40 + Math.sin(i * 3.7) * 30;
      data.push({
        x: Math.cos(angle) * radius,
        y: 25 + Math.sin(i * 2.3) * 8,
        z: Math.sin(angle) * radius,
        scaleX: 4 + Math.sin(i * 1.7) * 3,
        scaleY: 0.6 + Math.sin(i * 2.9) * 0.3,
        scaleZ: 3 + Math.cos(i * 1.3) * 2,
        opacity: 0.3 + Math.sin(i * 4.1) * 0.12,
      });
    }
    return data;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const pos = useGameStore.getState().localPlayerPos;
    if (pos) {
      groupRef.current.position.set(pos.x, 0, pos.z);
    }
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.003;
  });

  return (
    <group ref={groupRef}>
      {cloudsData.map((c, i) => (
        <Sphere key={i} args={[1, 6, 6]} position={[c.x, c.y, c.z]} scale={[c.scaleX, c.scaleY, c.scaleZ]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={c.opacity} roughness={1} />
        </Sphere>
      ))}
    </group>
  );
});

const _fogTargetColor = new THREE.Color();

const BiomeFog = memo(function BiomeFog({ biome }: { biome: BiomeType }) {
  const fogRef = useRef<THREE.Fog>(null);
  const config = BIOME_CONFIGS[biome];

  useFrame((_, delta) => {
    if (!fogRef.current) return;
    _fogTargetColor.set(config.fogColor);
    const t = Math.min(1, delta * 2);
    fogRef.current.color.lerp(_fogTargetColor, t);
    fogRef.current.near += (config.fogNear - fogRef.current.near) * t;
    fogRef.current.far += (config.fogFar - fogRef.current.far) * t;
  });

  return <fog ref={fogRef} attach="fog" args={[config.fogColor, config.fogNear, config.fogFar]} />;
});

const _ambientTargetColor = new THREE.Color();

const BiomeAmbient = memo(function BiomeAmbient({ biome }: { biome: BiomeType }) {
  const lightRef = useRef<THREE.AmbientLight>(null);
  const config = BIOME_CONFIGS[biome];

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    _ambientTargetColor.set(config.ambientColor);
    const t = Math.min(1, delta * 2);
    lightRef.current.color.lerp(_ambientTargetColor, t);
    lightRef.current.intensity += (config.ambientIntensity - lightRef.current.intensity) * t;
  });

  return <ambientLight ref={lightRef} intensity={config.ambientIntensity} color={config.ambientColor} />;
});

const FollowDirectionalLight = memo(function FollowDirectionalLight({
  offset, intensity, color, castShadow,
}: {
  offset: [number, number, number];
  intensity: number;
  color: string;
  castShadow?: boolean;
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    if (!lightRef.current) return;
    const light = lightRef.current;
    light.parent?.add(light.target);
    return () => {
      light.parent?.remove(light.target);
    };
  }, []);

  useFrame(() => {
    const pos = useGameStore.getState().localPlayerPos;
    if (!pos || !lightRef.current) return;
    lightRef.current.position.set(pos.x + offset[0], offset[1], pos.z + offset[2]);
    lightRef.current.target.position.set(pos.x, pos.y ?? 0, pos.z);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      position={[offset[0], offset[1], offset[2]]}
      intensity={intensity}
      color={color}
      castShadow={castShadow}
      shadow-mapSize-width={castShadow ? 1024 : undefined}
      shadow-mapSize-height={castShadow ? 1024 : undefined}
      shadow-camera-far={castShadow ? 50 : undefined}
      shadow-camera-left={castShadow ? -20 : undefined}
      shadow-camera-right={castShadow ? 20 : undefined}
      shadow-camera-top={castShadow ? 20 : undefined}
      shadow-camera-bottom={castShadow ? -20 : undefined}
    />
  );
});

const SceneEnvironment = memo(function SceneEnvironment({ isCave, isCastle, isTown, isIndoor, playerBiome }: { isCave: boolean; isCastle: boolean; isTown: boolean; isIndoor: boolean; playerBiome: BiomeType }) {
  return (
    <>
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

      {isTown ? (
        <>
          <FollowDirectionalLight
            offset={[15, 20, 10]}
            intensity={1.5}
            color="#FFF0D0"
            castShadow
          />
          <FollowDirectionalLight
            offset={[-10, 8, -8]}
            intensity={0.4}
            color="#FFE4C4"
          />
        </>
      ) : (
        <>
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
        </>
      )}

      {isTown ? (
        <BiomeAmbient biome={playerBiome} />
      ) : (
        <ambientLight
          intensity={isCastle ? 0.12 : isCave ? 0.08 : 0.25}
          color={isCastle ? "#2A1A0A" : isCave ? "#0d0d2b" : "#FFF8F0"}
        />
      )}

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

      {isTown ? (
        <BiomeFog biome={playerBiome} />
      ) : (
        <fog
          attach="fog"
          args={[
            isCastle ? "#1A1510" : isCave ? "#0a0a1a" : "#c8ddf0",
            isCastle ? 8 : isCave ? 20 : 40,
            isCastle ? 30 : isCave ? 65 : 160,
          ]}
        />
      )}

      {isIndoor && <FloatingParticles isCave={isIndoor} />}

      {isIndoor && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={isCave ? 0.3 : 0.4}
          scale={30}
          blur={1.5}
          far={4}
          resolution={256}
          color={isCastle ? "#1A0A00" : "#000020"}
        />
      )}
    </>
  );
});

const PostProcessing = memo(function PostProcessing({ isCave, isCastle }: { isCave: boolean; isCastle: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={isCave ? 1.2 : isCastle ? 0.8 : 0.3}
        luminanceThreshold={isCave ? 0.6 : 0.85}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={isCave ? 0.7 : isCastle ? 0.6 : 0.35}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
});

const MemoizedMapSystem = memo(function MemoizedMapSystem({ currentMap }: { currentMap: any }) {
  return <MapSystem currentMap={currentMap} />;
});

const DamageNumberManager = memo(function DamageNumberManager() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const drained = useGameStore.getState().drainCombatEvents();
      if (drained.length > 0) {
        setEvents(prev => [...prev, ...drained]);
      }
      setEvents(prev => {
        const now = performance.now();
        const filtered = prev.filter((e: any) => now - e._spawnTime < 1500);
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {events.map((event: any, i: number) => (
        <DamageNumber key={`${event._spawnTime}-${i}`} event={event} />
      ))}
    </>
  );
});

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
      useGameStore.getState().setCombatTarget(null);
      return;
    }

    const monster = monstersRef.current.find(m => m.id === targetMonsterId);
    if (!monster || monster.state === "dead") {
      useGameStore.getState().setCombatTarget(null);
      return;
    }

    useGameStore.getState().setCombatTarget({ id: targetMonsterId });

    const attackInterval = setInterval(() => {
      const tid = targetMonsterId;
      const liveMonsters = useGameStore.getState().monstersData;
      const m = liveMonsters?.find(m => m.id === tid);
      if (!m || m.state === "dead") return;

      const localPos = useGameStore.getState().localPlayerPos;
      if (!localPos) return;

      const dist = Math.sqrt((localPos.x - m.x) ** 2 + (localPos.z - m.z) ** 2);
      if (dist <= 2.5) {
        attackRef.current(tid);
      }
    }, 700);

    return () => {
      clearInterval(attackInterval);
      useGameStore.getState().setCombatTarget(null);
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
  const { players, currentPlayer, movePlayer, emitMove, emitChangeMap, emitEnterDungeon, monsters, targetMonsterId, setTargetMonsterId } = useSocket();

  const prevMonsters = useRef(monsters);
  const prevPlayers = useRef(players);
  if (monsters !== prevMonsters.current) { perfLog.reason("monsters"); prevMonsters.current = monsters; }
  if (players !== prevPlayers.current) { perfLog.reason("players"); prevPlayers.current = players; }
  perfLog.tick();

  const { currentMap } = useGameControls({
    currentPlayer,
    movePlayer,
    emitMove,
    emitChangeMap,
    emitEnterDungeon,
    onInventoryToggle,
    onInteractionMessage,
  });

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
    useGameStore.getState().setClearTarget(() => setTargetMonsterId(null));
    return () => { useGameStore.getState().setClearTarget(null); };
  }, [setTargetMonsterId]);

  const isCave = currentMap.id === "cave" || currentMap.id.startsWith("dungeon_");
  const isCastle = currentMap.id === "castle";
  const isTown = currentMap.id === "town";
  const isIndoor = isCave || isCastle;
  const playerBiome = useGameStore((s) => s.playerBiome);

  const cameraTarget = currentPlayer
    ? { x: currentPlayer.x, y: currentPlayer.y, z: currentPlayer.z }
    : { x: 0, y: 0, z: 0 };

  const targetMonster = targetMonsterId ? monsters.find(m => m.id === targetMonsterId) : null;
  const targetPos = targetMonster ? { x: targetMonster.x, z: targetMonster.z } : null;

  return (
    <>
      <FollowCamera target={cameraTarget} />
      <CombatController />

      <SceneEnvironment isCave={isCave} isCastle={isCastle} isTown={isTown} isIndoor={isIndoor} playerBiome={playerBiome} />

      <MemoizedMapSystem currentMap={currentMap} />

      {/* Players */}
      {Object.values(players).map((player) => (
        <PlayerCharacter
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === currentPlayer?.id}
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

      {/* Monsters — view distance culled */}
      {monsters.map((monster) => {
        if (currentPlayer) {
          const dx = monster.x - currentPlayer.x;
          const dz = monster.z - currentPlayer.z;
          if (dx * dx + dz * dz > 4900 && monster.id !== targetMonsterId) return null;
        }
        return (
          <MonsterCharacter
            key={monster.id}
            monster={monster}
            isTarget={monster.id === targetMonsterId}
            onClick={handleMonsterClick}
          />
        );
      })}

      <DamageNumberManager />

      <PostProcessing isCave={isCave} isCastle={isCastle} />
    </>
  );
}
