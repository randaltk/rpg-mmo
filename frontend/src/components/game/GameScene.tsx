"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sphere } from "@react-three/drei";
import { useSocket } from "@/hooks/useSocket";
import { useGameControls } from "@/hooks/useGameControls";
import PlayerCharacter from "./PlayerCharacter";
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
      <sphereGeometry args={[200, 32, 32]} />
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
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
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

export default function GameScene({
  inventoryOpen,
  onInventoryToggle,
  interactionMessage,
  onInteractionMessage,
}: GameSceneProps) {
  const { players, currentPlayer, movePlayer } = useSocket();

  const { currentMap } = useGameControls({
    currentPlayer,
    movePlayer,
    onInventoryToggle,
    onInteractionMessage,
  });

  const isCave = currentMap.id === "cave";

  const cameraTarget = currentPlayer
    ? { x: currentPlayer.x, y: currentPlayer.y, z: currentPlayer.z }
    : { x: 0, y: 0, z: 0 };

  return (
    <>
      <FollowCamera target={cameraTarget} />

      <SkyDome isCave={isCave} />

      {!isCave && (
        <>
          <Sun />
          <Clouds />
        </>
      )}

      {isCave && (
        <Stars radius={80} depth={30} count={2000} factor={3} saturation={0.5} fade speed={0.5} />
      )}

      {/* Hemisphere light: sky color from above, ground bounce from below */}
      <hemisphereLight
        args={[
          isCave ? "#1a1a3e" : "#87CEEB",
          isCave ? "#0a0a15" : "#5a8a3a",
          isCave ? 0.2 : 0.6,
        ]}
      />

      {/* Main sun/directional */}
      <directionalLight
        position={[15, 20, 10]}
        intensity={isCave ? 0.15 : 1.5}
        color={isCave ? "#3a3a6e" : "#FFF0D0"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Warm fill from opposite side */}
      <directionalLight
        position={[-10, 8, -8]}
        intensity={isCave ? 0.05 : 0.4}
        color={isCave ? "#1a1a3a" : "#FFE4C4"}
      />

      {/* Ambient warmth */}
      <ambientLight intensity={isCave ? 0.08 : 0.25} color={isCave ? "#0d0d2b" : "#FFF8F0"} />

      {/* Cave bioluminescent lights */}
      {isCave && (
        <>
          <pointLight position={[-12, 1.5, -8]} intensity={0.6} color="#00CED1" distance={14} />
          <pointLight position={[14, 1.5, -5]} intensity={0.5} color="#9B30FF" distance={12} />
          <pointLight position={[0, 1, -20]} intensity={0.4} color="#00FF7F" distance={12} />
          <pointLight position={[-5, 1.5, -15]} intensity={0.5} color="#4169E1" distance={12} />
          <pointLight position={[18, 1, 10]} intensity={0.4} color="#00CED1" distance={10} />
          <pointLight position={[-20, 1, 10]} intensity={0.4} color="#9B30FF" distance={10} />
          <pointLight position={[0, 2, 15]} intensity={0.5} color="#7B68EE" distance={14} />
          <pointLight position={[0, 3, 0]} intensity={0.6} color="#6A5ACD" distance={20} />
        </>
      )}

      {/* Fog blends with sky */}
      <fog
        attach="fog"
        args={[isCave ? "#0a0a1a" : "#c8ddf0", isCave ? 20 : 25, isCave ? 65 : 80]}
      />

      <FloatingParticles isCave={isCave} />

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

      {Object.values(players).map((player) => (
        <PlayerCharacter
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === currentPlayer?.id}
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
    </>
  );
}
