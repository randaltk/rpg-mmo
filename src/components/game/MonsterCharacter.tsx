"use client";

import React, { useRef, useState, useMemo, memo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder, Cone } from "@react-three/drei";
import { Monster } from "@/types/game";
import { useGameStore } from "@/stores/gameStore";
import * as THREE from "three";
import { WolfModel } from "./monsters/WolfModel";
import { SkeletonModel } from "./monsters/SkeletonModel";
import { VariantEffects, getVariantColor, getVariantScale } from "./monsters/VariantEffects";

interface MonsterCharacterProps {
  monster: Monster;
  isTarget: boolean;
  onClick: (monsterId: string) => void;
}

import { PerfMonitor } from "@/utils/perfMonitor";

const monsterPerfLog = new PerfMonitor("Monsters useFrame");

function createSlimeBodyGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.05));
  points.push(new THREE.Vector2(0.35, 0));
  points.push(new THREE.Vector2(0.48, 0.08));
  points.push(new THREE.Vector2(0.52, 0.18));
  points.push(new THREE.Vector2(0.5, 0.3));
  points.push(new THREE.Vector2(0.44, 0.42));
  points.push(new THREE.Vector2(0.35, 0.52));
  points.push(new THREE.Vector2(0.24, 0.6));
  points.push(new THREE.Vector2(0.14, 0.65));
  points.push(new THREE.Vector2(0.06, 0.67));
  points.push(new THREE.Vector2(0, 0.68));
  return new THREE.LatheGeometry(points, 20);
}

function createSlimeInnerGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0.05));
  points.push(new THREE.Vector2(0.2, 0.08));
  points.push(new THREE.Vector2(0.32, 0.15));
  points.push(new THREE.Vector2(0.35, 0.25));
  points.push(new THREE.Vector2(0.3, 0.38));
  points.push(new THREE.Vector2(0.2, 0.48));
  points.push(new THREE.Vector2(0.08, 0.55));
  points.push(new THREE.Vector2(0, 0.57));
  return new THREE.LatheGeometry(points, 16);
}

function createGoblinClubGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.25));
  points.push(new THREE.Vector2(0.025, -0.24));
  points.push(new THREE.Vector2(0.03, -0.15));
  points.push(new THREE.Vector2(0.028, -0.05));
  points.push(new THREE.Vector2(0.035, 0));
  points.push(new THREE.Vector2(0.055, 0.05));
  points.push(new THREE.Vector2(0.07, 0.1));
  points.push(new THREE.Vector2(0.075, 0.15));
  points.push(new THREE.Vector2(0.065, 0.2));
  points.push(new THREE.Vector2(0.04, 0.23));
  points.push(new THREE.Vector2(0, 0.25));
  return new THREE.LatheGeometry(points, 8);
}

function createGoblinEarGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.01));
  points.push(new THREE.Vector2(0.04, 0));
  points.push(new THREE.Vector2(0.05, 0.05));
  points.push(new THREE.Vector2(0.03, 0.1));
  points.push(new THREE.Vector2(0.01, 0.14));
  points.push(new THREE.Vector2(0, 0.15));
  return new THREE.LatheGeometry(points, 6);
}

function SlimeModel({ monster, hurtFlash }: { monster: Monster; hurtFlash: boolean }) {
  const bodyRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const wobbleRef = useRef({ phase: Math.random() * Math.PI * 2 });

  const bodyGeo = useMemo(() => createSlimeBodyGeometry(), []);
  const innerGeo = useMemo(() => createSlimeInnerGeometry(), []);

  const baseColor = new THREE.Color(monster.color);
  const darkColor = baseColor.clone().multiplyScalar(0.5).getStyle();
  const lightColor = baseColor.clone().lerp(new THREE.Color("#ffffff"), 0.35).getStyle();
  const coreColor = baseColor.clone().lerp(new THREE.Color("#ffffff"), 0.6).getStyle();
  const flashColor = "#FFFFFF";

  useFrame((state) => {
    if (!bodyRef.current) return;
    const t = state.clock.elapsedTime + wobbleRef.current.phase;

    if (monster.state === "dead") {
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 0.04, 0.08);
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, 1.8, 0.08);
      bodyRef.current.scale.z = THREE.MathUtils.lerp(bodyRef.current.scale.z, 1.8, 0.08);
      return;
    }

    const squishY = 1 + Math.sin(t * 3) * 0.1 + Math.sin(t * 5.7) * 0.03;
    const squishXZ = 1 - Math.sin(t * 3) * 0.07 - Math.sin(t * 5.7) * 0.02;
    bodyRef.current.scale.set(squishXZ, squishY, squishXZ);

    if (monster.state === "attacking") {
      const cycle = (t * 6) % 1;
      if (cycle < 0.3) {
        // Windup: compress down
        const p = cycle / 0.3;
        bodyRef.current.position.y = 0;
        bodyRef.current.scale.y = squishY * (1 - p * 0.35);
        bodyRef.current.scale.x = squishXZ * (1 + p * 0.2);
        bodyRef.current.scale.z = squishXZ * (1 + p * 0.2);
      } else if (cycle < 0.55) {
        // Launch: spring up
        const p = (cycle - 0.3) / 0.25;
        const jumpHeight = Math.sin(p * Math.PI) * 0.6;
        bodyRef.current.position.y = jumpHeight;
        bodyRef.current.scale.y = squishY * (0.65 + p * 0.7);
        bodyRef.current.scale.x = squishXZ * (1.2 - p * 0.35);
        bodyRef.current.scale.z = squishXZ * (1.2 - p * 0.35);
      } else {
        // Land: squash on impact then recover
        const p = (cycle - 0.55) / 0.45;
        const bounce = Math.sin(p * Math.PI * 2) * 0.08 * (1 - p);
        bodyRef.current.position.y = bounce;
        bodyRef.current.scale.y = squishY * (0.85 + p * 0.15);
        bodyRef.current.scale.x = squishXZ * (1.05 - p * 0.05);
        bodyRef.current.scale.z = squishXZ * (1.05 - p * 0.05);
      }
    } else if (monster.state === "hurt") {
      bodyRef.current.position.y = Math.sin(t * 20) * 0.1 * Math.max(0, 1 - (t % 1) * 2);
      bodyRef.current.scale.x = squishXZ + Math.sin(t * 25) * 0.12;
      bodyRef.current.scale.z = squishXZ + Math.cos(t * 25) * 0.12;
    } else if (monster.state === "chasing" || monster.state === "wandering") {
      const hop = Math.abs(Math.sin(t * 5)) * 0.12;
      bodyRef.current.position.y = hop;
      const hopSquish = hop > 0.05 ? 1.08 : 0.95;
      bodyRef.current.scale.y = squishY * (hop < 0.02 ? 0.9 : hopSquish);
    } else {
      bodyRef.current.position.y = Math.abs(Math.sin(t * 2)) * 0.04;
    }

    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(t * 0.7) > 0.97 ? 0.08 : 1;
      eyeLeftRef.current.scale.y = blink;
      eyeRightRef.current.scale.y = blink;
    }
  });

  const c = hurtFlash ? flashColor : monster.color;
  const cDark = hurtFlash ? "#FFAAAA" : darkColor;
  const cLight = hurtFlash ? "#FFFFFF" : lightColor;
  const cCore = hurtFlash ? "#FFFFFF" : coreColor;

  return (
    <group ref={bodyRef}>
      {/* Main body (LatheGeometry) */}
      <mesh geometry={bodyGeo} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color={c}
          roughness={0.15}
          metalness={0.05}
          transparent
          opacity={0.78}
          transmission={0.15}
          thickness={0.5}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Inner body / nucleus */}
      <mesh geometry={innerGeo} position={[0, 0.02, 0]}>
        <meshStandardMaterial color={cLight} roughness={0.2} transparent opacity={0.35} />
      </mesh>

      {/* Core orb */}
      <Sphere args={[0.12, 10, 10]} position={[0, 0.25, 0]}>
        <meshStandardMaterial
          color={cCore}
          emissive={c}
          emissiveIntensity={1.2}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </Sphere>
      <pointLight position={[0, 0.25, 0]} color={c} intensity={0.3} distance={2.5} />

      {/* Bottom shadow/base */}
      <Cylinder args={[0.4, 0.48, 0.04, 18]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color={cDark} roughness={0.6} transparent opacity={0.6} />
      </Cylinder>

      {/* Surface detail bumps */}
      {[
        [0.3, 0.5, 0.2],
        [-0.25, 0.4, -0.25],
        [0.15, 0.6, -0.2],
        [-0.1, 0.35, 0.35],
      ].map(([x, y, z], i) => (
        <Sphere key={`bump-${i}`} args={[0.04 + i * 0.005, 6, 6]} position={[x, y, z] as [number, number, number]}>
          <meshStandardMaterial color={cLight} transparent opacity={0.25} />
        </Sphere>
      ))}

      {/* Eyes */}
      <group position={[0, 0.42, 0]}>
        {/* Eye whites */}
        <Sphere ref={eyeLeftRef} args={[0.1, 10, 10]} position={[-0.14, 0.08, 0.33]} scale={[0.9, 1, 0.7]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere ref={eyeRightRef} args={[0.1, 10, 10]} position={[0.14, 0.08, 0.33]} scale={[0.9, 1, 0.7]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>
        {/* Irises */}
        <Sphere args={[0.055, 8, 8]} position={[-0.14, 0.08, 0.4]}>
          <meshStandardMaterial color="#222" />
        </Sphere>
        <Sphere args={[0.055, 8, 8]} position={[0.14, 0.08, 0.4]}>
          <meshStandardMaterial color="#222" />
        </Sphere>
        {/* Eye shine */}
        <Sphere args={[0.02, 4, 4]} position={[-0.12, 0.12, 0.41]}>
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.8} />
        </Sphere>
        <Sphere args={[0.02, 4, 4]} position={[0.16, 0.12, 0.41]}>
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.8} />
        </Sphere>
      </group>

      {/* Mouth */}
      <mesh position={[0, 0.3, 0.44]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.07, 10, 6, 0, Math.PI * 2, 0.3, 0.7]} />
        <meshStandardMaterial color="#2A1A2A" side={THREE.DoubleSide} />
      </mesh>

      {/* Highlight sheens */}
      <Sphere args={[0.06, 6, 6]} position={[-0.22, 0.55, 0.2]}>
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} />
      </Sphere>
      <Sphere args={[0.035, 5, 5]} position={[0.18, 0.6, 0.15]}>
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.2} />
      </Sphere>
    </group>
  );
}

function GoblinModel({ monster, hurtFlash }: { monster: Monster; hurtFlash: boolean }) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const walkCycle = useRef(0);
  const breathCycle = useRef(Math.random() * Math.PI * 2);

  const clubGeo = useMemo(() => createGoblinClubGeometry(), []);
  const earGeo = useMemo(() => createGoblinEarGeometry(), []);

  const skin = hurtFlash ? "#FFCCCC" : "#6A8A4A";
  const skinDark = hurtFlash ? "#FF9999" : "#4A6A2A";
  const skinLight = hurtFlash ? "#FFDDDD" : "#8AAA6A";
  const cloth = "#7A5A14";
  const clothDark = "#5A4010";

  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    const t = state.clock.elapsedTime;

    if (monster.state === "dead") {
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, Math.PI / 2, 0.08);
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, -0.25, 0.08);
      return;
    }

    bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 5);
    bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0, delta * 5);

    breathCycle.current += delta * 3;

    const isWalking = monster.state === "chasing" || monster.state === "wandering";
    if (isWalking) {
      walkCycle.current += delta * 14;
    } else if (monster.state === "attacking") {
      walkCycle.current += delta * 6;
    } else {
      walkCycle.current *= 0.92;
    }

    const swing = Math.sin(walkCycle.current) * 0.55 * (isWalking ? 1 : 0);
    const bob = Math.abs(Math.sin(walkCycle.current)) * 0.04 * (isWalking ? 1 : 0);
    const breathBob = Math.sin(breathCycle.current) * 0.006;

    bodyRef.current.position.y = bob + breathBob;

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = swing;
      rightLegRef.current.rotation.x = -swing;
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (monster.state === "attacking") {
        const cycle = (t * 8) % (Math.PI * 2);
        const windUp = cycle < Math.PI * 0.4;
        if (windUp) {
          const p = cycle / (Math.PI * 0.4);
          rightArmRef.current.rotation.x = -0.3 + p * 1.2;
          rightArmRef.current.rotation.z = -0.1 - p * 0.3;
          leftArmRef.current.rotation.x = -0.2 - p * 0.3;
        } else {
          const p = (cycle - Math.PI * 0.4) / (Math.PI * 1.6);
          const smash = Math.sin(p * Math.PI);
          rightArmRef.current.rotation.x = 0.9 - 2.8 * smash;
          rightArmRef.current.rotation.z = -0.4 + 0.3 * smash;
          leftArmRef.current.rotation.x = -0.5 + 0.4 * smash;
        }
        bodyRef.current!.rotation.y = Math.sin(cycle) * 0.15;
      } else if (monster.state === "hurt") {
        const flinch = Math.sin(t * 20) * 0.4;
        leftArmRef.current.rotation.x = -0.6 + flinch;
        rightArmRef.current.rotation.x = -0.6 - flinch;
        leftArmRef.current.rotation.z = 0.3;
        rightArmRef.current.rotation.z = -0.3;
        if (bodyRef.current) bodyRef.current.rotation.z = Math.sin(t * 25) * 0.08;
      } else {
        leftArmRef.current.rotation.x = -swing * 0.6 + Math.sin(breathCycle.current) * 0.02;
        rightArmRef.current.rotation.x = swing * 0.6 + Math.sin(breathCycle.current) * 0.02;
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 5);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, delta * 5);
        if (bodyRef.current) {
          bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 4);
          bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, delta * 5);
        }
      }
    }

    if (headRef.current) {
      if (monster.state === "attacking") {
        const cycle = (t * 8) % (Math.PI * 2);
        headRef.current.rotation.x = -0.2 + Math.sin(cycle) * 0.15;
        headRef.current.rotation.z = Math.sin(cycle * 0.5) * 0.05;
      } else if (monster.state === "hurt") {
        headRef.current.rotation.x = 0.15;
        headRef.current.rotation.z = Math.sin(t * 20) * 0.1;
      } else {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, Math.sin(breathCycle.current * 0.5) * 0.03, delta * 4);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, delta * 4);
      }
    }
  });

  return (
    <group ref={bodyRef} scale={[0.75, 0.75, 0.75]}>
      {/* Torso */}
      <Box args={[0.48, 0.45, 0.32]} position={[0, 0.72, 0]} castShadow>
        <meshStandardMaterial color={cloth} roughness={0.85} />
      </Box>
      {/* Chest musculature suggestion */}
      <Sphere args={[0.15, 8, 8]} position={[-0.08, 0.8, 0.16]} scale={[1, 0.7, 0.5]}>
        <meshStandardMaterial color={skin} roughness={0.85} />
      </Sphere>
      <Sphere args={[0.15, 8, 8]} position={[0.08, 0.8, 0.16]} scale={[1, 0.7, 0.5]}>
        <meshStandardMaterial color={skin} roughness={0.85} />
      </Sphere>
      {/* Collar bone area */}
      <Cylinder args={[0.18, 0.22, 0.06, 8]} position={[0, 0.97, 0]}>
        <meshStandardMaterial color={skin} roughness={0.85} />
      </Cylinder>

      {/* Belt with pouches */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.22, 0.025, 5, 14, Math.PI * 2]} />
        <meshStandardMaterial color="#3A2A08" roughness={0.6} metalness={0.15} />
      </mesh>
      {/* Belt pouch */}
      <Box args={[0.08, 0.07, 0.06]} position={[-0.2, 0.48, 0.12]}>
        <meshStandardMaterial color="#5A4A1A" roughness={0.8} />
      </Box>
      <Box args={[0.06, 0.05, 0.04]} position={[0.18, 0.48, 0.14]}>
        <meshStandardMaterial color="#4A3A0A" roughness={0.85} />
      </Box>

      {/* Loincloth - front and back flaps */}
      <mesh position={[0, 0.38, 0.12]} rotation={[0.15, 0, 0]}>
        <planeGeometry args={[0.25, 0.2]} />
        <meshStandardMaterial color={clothDark} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.38, -0.12]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshStandardMaterial color={clothDark} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 1.2, 0]}>
        {/* Skull - wider than tall */}
        <Sphere args={[0.26, 14, 14]} scale={[1.15, 0.88, 1]}>
          <meshStandardMaterial color={skin} roughness={0.82} />
        </Sphere>
        {/* Brow ridge */}
        <Sphere args={[0.18, 10, 6]} position={[0, 0.08, 0.12]} scale={[1.4, 0.3, 0.5]}>
          <meshStandardMaterial color={skinDark} roughness={0.85} />
        </Sphere>
        {/* Cheek bones */}
        <Sphere args={[0.06, 6, 6]} position={[-0.2, -0.04, 0.15]} scale={[1, 0.6, 0.7]}>
          <meshStandardMaterial color={skinLight} roughness={0.85} />
        </Sphere>
        <Sphere args={[0.06, 6, 6]} position={[0.2, -0.04, 0.15]} scale={[1, 0.6, 0.7]}>
          <meshStandardMaterial color={skinLight} roughness={0.85} />
        </Sphere>

        {/* Ears (LatheGeometry) */}
        <mesh geometry={earGeo} position={[-0.3, 0.02, 0]} rotation={[0, 0, -1.0]} scale={[1.5, 1.5, 1]}>
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        <mesh geometry={earGeo} position={[0.3, 0.02, 0]} rotation={[0, 0, 1.0]} scale={[-1.5, 1.5, 1]}>
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        {/* Ear inner */}
        <Sphere args={[0.03, 4, 4]} position={[-0.35, 0.05, 0.02]} scale={[0.3, 1, 0.5]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Sphere>
        <Sphere args={[0.03, 4, 4]} position={[0.35, 0.05, 0.02]} scale={[0.3, 1, 0.5]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Sphere>

        {/* Eyes */}
        {[-1, 1].map(s => (
          <group key={`geye-${s}`}>
            <Sphere args={[0.065, 8, 8]} position={[s * 0.1, 0.02, 0.2]} scale={[0.9, 1, 0.6]}>
              <meshStandardMaterial color="#EEDD66" emissive="#EEDD66" emissiveIntensity={0.3} />
            </Sphere>
            <Sphere args={[0.04, 6, 6]} position={[s * 0.1, 0.02, 0.24]}>
              <meshStandardMaterial color="#CC2200" emissive="#881100" emissiveIntensity={0.5} />
            </Sphere>
            <Sphere args={[0.02, 4, 4]} position={[s * 0.1, 0.02, 0.26]}>
              <meshStandardMaterial color="#110000" />
            </Sphere>
            <Sphere args={[0.01, 3, 3]} position={[s * 0.1 + s * 0.015, 0.04, 0.265]}>
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.5} />
            </Sphere>
          </group>
        ))}

        {/* Nose - bulbous */}
        <Sphere args={[0.055, 8, 8]} position={[0, -0.06, 0.22]} scale={[1, 0.8, 0.8]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Sphere>
        {/* Nostrils */}
        <Sphere args={[0.018, 4, 4]} position={[-0.02, -0.08, 0.26]}>
          <meshStandardMaterial color="#2A3A1A" roughness={0.95} />
        </Sphere>
        <Sphere args={[0.018, 4, 4]} position={[0.02, -0.08, 0.26]}>
          <meshStandardMaterial color="#2A3A1A" roughness={0.95} />
        </Sphere>

        {/* Mouth / jaw */}
        <Sphere args={[0.12, 8, 6]} position={[0, -0.15, 0.08]} scale={[1, 0.4, 0.7]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Sphere>
        {/* Underbite teeth */}
        {[-0.04, 0, 0.04].map((x, i) => (
          <Cone key={`tooth-${i}`} args={[0.015, 0.04, 3]} position={[x, -0.12, 0.2]} rotation={[Math.PI, 0, 0]}>
            <meshStandardMaterial color="#DDDDAA" roughness={0.5} />
          </Cone>
        ))}

        {/* Warts/bumps */}
        <Sphere args={[0.02, 4, 4]} position={[0.15, 0.1, 0.15]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Sphere>
        <Sphere args={[0.015, 4, 4]} position={[-0.12, -0.05, 0.2]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Sphere>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.34, 0.88, 0]}>
        <Sphere args={[0.065, 6, 6]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.065, 0.055, 0.3, 6]} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Sphere args={[0.045, 5, 5]} position={[0, -0.33, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.05, 0.04, 0.22, 6]} position={[0, -0.45, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        {/* Hand with claws */}
        <Box args={[0.06, 0.04, 0.05]} position={[0, -0.58, 0.01]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Box>
        {[-0.02, 0, 0.02].map((x, i) => (
          <Cone key={`lclaw-${i}`} args={[0.008, 0.035, 3]} position={[x, -0.58, 0.04]} rotation={[0.6, 0, 0]}>
            <meshStandardMaterial color="#3A3A2A" roughness={0.7} />
          </Cone>
        ))}
      </group>

      {/* Right Arm + Club */}
      <group ref={rightArmRef} position={[0.34, 0.88, 0]}>
        <Sphere args={[0.065, 6, 6]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.065, 0.055, 0.3, 6]} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Sphere args={[0.045, 5, 5]} position={[0, -0.33, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.05, 0.04, 0.22, 6]} position={[0, -0.45, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Box args={[0.06, 0.04, 0.05]} position={[0, -0.58, 0.01]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Box>
        {/* Club (LatheGeometry) */}
        <mesh geometry={clubGeo} position={[0, -0.72, 0.06]} rotation={[0.25, 0, 0]}>
          <meshStandardMaterial color="#5A3A12" roughness={0.85} />
        </mesh>
        {/* Club nails/studs */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <Cone key={`stud-${i}`} args={[0.01, 0.025, 3]}
              position={[Math.cos(angle) * 0.06, -0.65 + Math.sin(angle) * 0.04, 0.06 + Math.cos(angle + 1) * 0.02]}
              rotation={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}>
              <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
            </Cone>
          );
        })}
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.32, 0]}>
        <Sphere args={[0.06, 5, 5]} position={[0, 0, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.07, 0.06, 0.25, 6]} position={[0, -0.14, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Sphere args={[0.05, 5, 5]} position={[0, -0.28, 0.01]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.055, 0.05, 0.18, 6]} position={[0, -0.38, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        {/* Foot */}
        <Box args={[0.08, 0.04, 0.13]} position={[0, -0.49, 0.02]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Box>
        {/* Toe claws */}
        {[-0.02, 0.01, 0.04].map((x, i) => (
          <Cone key={`ltclaw-${i}`} args={[0.006, 0.02, 3]} position={[x, -0.5, 0.08]} rotation={[0.8, 0, 0]}>
            <meshStandardMaterial color="#3A3A2A" roughness={0.7} />
          </Cone>
        ))}
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.32, 0]}>
        <Sphere args={[0.06, 5, 5]} position={[0, 0, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.07, 0.06, 0.25, 6]} position={[0, -0.14, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Sphere args={[0.05, 5, 5]} position={[0, -0.28, 0.01]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Cylinder args={[0.055, 0.05, 0.18, 6]} position={[0, -0.38, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Box args={[0.08, 0.04, 0.13]} position={[0, -0.49, 0.02]}>
          <meshStandardMaterial color={skinDark} roughness={0.9} />
        </Box>
        {[-0.02, 0.01, 0.04].map((x, i) => (
          <Cone key={`rtclaw-${i}`} args={[0.006, 0.02, 3]} position={[x, -0.5, 0.08]} rotation={[0.8, 0, 0]}>
            <meshStandardMaterial color="#3A3A2A" roughness={0.7} />
          </Cone>
        ))}
      </group>
    </group>
  );
}

function MonsterModel({ monster, hurtFlash }: { monster: Monster; hurtFlash: boolean }) {
  const variantMonster = useMemo(() => {
    if (!monster.variant || !['fire', 'ice', 'poison', 'golden'].includes(monster.variant)) return monster;
    return { ...monster, color: getVariantColor(monster.color, monster.variant) };
  }, [monster, monster.variant]);

  switch (monster.type) {
    case 'slime':
      return <SlimeModel monster={variantMonster} hurtFlash={hurtFlash} />;
    case 'goblin':
      return <GoblinModel monster={variantMonster} hurtFlash={hurtFlash} />;
    case 'wolf':
      return <WolfModel monster={variantMonster} hurtFlash={hurtFlash} />;
    case 'skeleton':
      return <SkeletonModel monster={variantMonster} hurtFlash={hurtFlash} />;
    default:
      return <SlimeModel monster={variantMonster} hurtFlash={hurtFlash} />;
  }
}

function MonsterCharacter({ monster, isTarget, onClick }: MonsterCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const prevPos = useRef({ x: monster.x, z: monster.z });
  const [hurtFlash, setHurtFlash] = useState(false);
  const lastHurtState = useRef(monster.state);

  useFrame((_, delta) => {
    const fStart = performance.now();
    if (!groupRef.current || monster.state === "dead") return;

    const liveData = useGameStore.getState().monstersData;
    const live = liveData?.find(m => m.id === monster.id);
    const mx = live?.x ?? monster.x;
    const mz = live?.z ?? monster.z;

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mx, delta * 8);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, mz, delta * 8);

    const dx = mx - prevPos.current.x;
    const dz = mz - prevPos.current.z;
    if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
      targetRotation.current = Math.atan2(dx, dz);
    }
    prevPos.current = { x: mx, z: mz };

    let currentRot = groupRef.current.rotation.y;
    let diff = targetRotation.current - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y = currentRot + diff * Math.min(delta * 6, 1);

    if (monster.state === "hurt" && lastHurtState.current !== "hurt") {
      setHurtFlash(true);
      setTimeout(() => setHurtFlash(false), 250);
    }
    lastHurtState.current = monster.state;
    monsterPerfLog.tick(performance.now() - fStart);
  });

  if (monster.state === "dead" && groupRef.current) {
    const scale = groupRef.current.scale.x;
    if (scale < 0.01) return null;
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (monster.state !== "dead") {
      onClick(monster.id);
    }
  };

  const hpPercent = monster.hp / monster.maxHp;
  const variantSc = getVariantScale(monster.variant);
  const baseHeight = monster.type === 'slime' ? 1.3 : monster.type === 'wolf' ? 1.2 : 1.8;
  const uiHeight = baseHeight * variantSc;

  return (
    <group
      ref={groupRef}
      position={[monster.x, monster.y, monster.z]}
      onClick={handleClick}
    >
      <mesh visible={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      <group scale={getVariantScale(monster.variant)}>
        <MonsterModel monster={monster} hurtFlash={hurtFlash} />
        <VariantEffects variant={monster.variant} monsterHeight={monster.type === 'slime' ? 0.8 : monster.type === 'wolf' ? 0.7 : 1.5} />
      </group>

      {monster.state !== "dead" && (
        <>
          <Text
            position={[0, uiHeight, 0]}
            fontSize={0.18}
            color="#FF6B6B"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#000"
          >
            {`${monster.name} Lv.${monster.level}`}
          </Text>

          <Box position={[0, uiHeight - 0.2, 0]} args={[0.8, 0.08, 0.04]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <Box
            position={[-(0.8 - hpPercent * 0.8) / 2, uiHeight - 0.2, 0.025]}
            args={[Math.max(hpPercent * 0.8, 0.01), 0.06, 0.02]}
          >
            <meshStandardMaterial
              color={hpPercent > 0.5 ? "#E74C3C" : hpPercent > 0.25 ? "#F1C40F" : "#C0392B"}
              emissive={hpPercent > 0.5 ? "#E74C3C" : "#C0392B"}
              emissiveIntensity={0.3}
            />
          </Box>
        </>
      )}

      {isTarget && monster.state !== "dead" && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.85, 32]} />
          <meshStandardMaterial
            color="#FF4444"
            emissive="#FF4444"
            emissiveIntensity={1}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export default memo(MonsterCharacter, (prev, next) => {
  return prev.monster.x === next.monster.x &&
    prev.monster.z === next.monster.z &&
    prev.monster.hp === next.monster.hp &&
    prev.monster.state === next.monster.state &&
    prev.monster.targetPlayerId === next.monster.targetPlayerId &&
    prev.isTarget === next.isTarget;
});
