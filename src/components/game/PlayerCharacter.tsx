"use client";

import React, { useRef, useEffect, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder, Cone } from "@react-three/drei";
import { Player } from "@/types/game";
import * as THREE from "three";

interface PlayerCharacterProps {
  player: Player;
  isCurrentPlayer?: boolean;
  targetPosition?: { x: number; z: number } | null;
}

function createSwordBladeGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.035, 0.02);
  shape.lineTo(0.03, 0.5);
  shape.lineTo(0.015, 0.58);
  shape.lineTo(0, 0.6);
  shape.lineTo(-0.015, 0.58);
  shape.lineTo(-0.03, 0.5);
  shape.lineTo(-0.035, 0.02);
  shape.lineTo(0, 0);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

function createCrossGuardGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.02));
  points.push(new THREE.Vector2(0.015, -0.018));
  points.push(new THREE.Vector2(0.025, -0.01));
  points.push(new THREE.Vector2(0.028, 0));
  points.push(new THREE.Vector2(0.025, 0.01));
  points.push(new THREE.Vector2(0.015, 0.018));
  points.push(new THREE.Vector2(0, 0.02));
  return new THREE.LatheGeometry(points, 8);
}

function createPommelGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.03));
  points.push(new THREE.Vector2(0.02, -0.025));
  points.push(new THREE.Vector2(0.035, -0.01));
  points.push(new THREE.Vector2(0.038, 0));
  points.push(new THREE.Vector2(0.035, 0.01));
  points.push(new THREE.Vector2(0.025, 0.02));
  points.push(new THREE.Vector2(0.01, 0.025));
  points.push(new THREE.Vector2(0, 0.028));
  return new THREE.LatheGeometry(points, 8);
}

function createChestplateGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.32, -0.35);
  shape.quadraticCurveTo(-0.36, -0.1, -0.34, 0.15);
  shape.quadraticCurveTo(-0.3, 0.32, -0.15, 0.36);
  shape.quadraticCurveTo(0, 0.38, 0.15, 0.36);
  shape.quadraticCurveTo(0.3, 0.32, 0.34, 0.15);
  shape.quadraticCurveTo(0.36, -0.1, 0.32, -0.35);
  shape.lineTo(-0.32, -0.35);

  return new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 3,
  });
}

function createShoulderPadGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.12));
  points.push(new THREE.Vector2(0.08, -0.1));
  points.push(new THREE.Vector2(0.14, -0.06));
  points.push(new THREE.Vector2(0.17, 0));
  points.push(new THREE.Vector2(0.16, 0.04));
  points.push(new THREE.Vector2(0.13, 0.07));
  points.push(new THREE.Vector2(0.06, 0.09));
  points.push(new THREE.Vector2(0, 0.1));
  return new THREE.LatheGeometry(points, 10);
}

function createBootGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.07, 0);
  shape.lineTo(-0.08, 0.08);
  shape.quadraticCurveTo(-0.085, 0.15, -0.07, 0.18);
  shape.lineTo(0.07, 0.18);
  shape.quadraticCurveTo(0.085, 0.15, 0.08, 0.08);
  shape.lineTo(0.1, 0.02);
  shape.lineTo(0.12, 0);
  shape.lineTo(-0.07, 0);

  return new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
}

function SwordMesh() {
  const bladeGeo = useMemo(() => createSwordBladeGeometry(), []);
  const guardGeo = useMemo(() => createCrossGuardGeometry(), []);
  const pommelGeo = useMemo(() => createPommelGeometry(), []);

  return (
    <group position={[0, -0.7, 0.08]} rotation={[-0.3, 0, 0]}>
      {/* Pommel */}
      <mesh geometry={pommelGeo} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#C0A030" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Grip - leather wrapped */}
      <Cylinder args={[0.022, 0.026, 0.2, 8]} position={[0, -0.01, 0]}>
        <meshStandardMaterial color="#3A1A05" roughness={0.9} />
      </Cylinder>
      {/* Grip wrap lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={`wrap-${i}`} position={[0, 0.06 - i * 0.035, 0]} rotation={[0, i * 0.3, 0]}>
          <torusGeometry args={[0.027, 0.004, 4, 8]} />
          <meshStandardMaterial color="#5A3A15" roughness={0.8} />
        </mesh>
      ))}
      {/* Cross-guard */}
      <mesh geometry={guardGeo} position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 4.5, 1]}>
        <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Guard gem */}
      <Sphere args={[0.02, 8, 8]} position={[0, -0.12, 0.02]}>
        <meshStandardMaterial color="#FF2222" emissive="#FF0000" emissiveIntensity={0.5} roughness={0.1} metalness={0.3} />
      </Sphere>
      {/* Blade */}
      <mesh geometry={bladeGeo} position={[0, -0.44, -0.006]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#D0D8E0" roughness={0.08} metalness={0.95} />
      </mesh>
      {/* Blade fuller (center groove) */}
      <Box args={[0.008, 0.4, 0.004]} position={[0, -0.38, 0.002]}>
        <meshStandardMaterial color="#A0A8B0" roughness={0.15} metalness={0.9} />
      </Box>
      {/* Edge glow */}
      <Box args={[0.003, 0.48, 0.018]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#E8F0FF" roughness={0.05} metalness={1} emissive="#8899BB" emissiveIntensity={0.15} />
      </Box>
    </group>
  );
}

function Arm({
  side,
  armRef,
  shirtColor,
  skinColor,
  hasSword = false,
}: {
  side: "left" | "right";
  armRef: React.RefObject<THREE.Group>;
  shirtColor: string;
  skinColor: string;
  hasSword?: boolean;
}) {
  const x = side === "left" ? -0.48 : 0.48;
  return (
    <group ref={armRef} position={[x, 1.12, 0]}>
      {/* Shoulder joint sphere */}
      <Sphere args={[0.1, 8, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </Sphere>
      {/* Upper arm */}
      <Cylinder args={[0.1, 0.09, 0.32, 8]} position={[0, -0.19, 0]}>
        <meshStandardMaterial color={shirtColor} roughness={0.75} />
      </Cylinder>
      {/* Elbow joint */}
      <Sphere args={[0.075, 8, 8]} position={[0, -0.37, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Sphere>
      {/* Forearm */}
      <Cylinder args={[0.08, 0.065, 0.28, 8]} position={[0, -0.52, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Cylinder>
      {/* Bracer/wrist guard */}
      <Cylinder args={[0.085, 0.075, 0.1, 8]} position={[0, -0.44, 0]}>
        <meshStandardMaterial color="#6A5A4A" roughness={0.5} metalness={0.35} />
      </Cylinder>
      <mesh position={[0, -0.44, 0]}>
        <torusGeometry args={[0.086, 0.006, 4, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Wrist */}
      <Sphere args={[0.055, 6, 6]} position={[0, -0.67, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Sphere>
      {/* Hand with finger suggestion */}
      <group position={[0, -0.72, 0.02]}>
        <Box args={[0.08, 0.06, 0.07]} position={[0, 0, 0]} rotation={[0.15, 0, 0]}>
          <meshStandardMaterial color={skinColor} roughness={0.85} />
        </Box>
        {/* 4 finger bumps */}
        {[-0.025, -0.008, 0.008, 0.025].map((fx, i) => (
          <Cylinder key={`finger-${i}`} args={[0.012, 0.01, 0.05, 4]} position={[fx, -0.02, 0.04]} rotation={[0.4, 0, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Cylinder>
        ))}
        {/* Thumb */}
        <Cylinder args={[0.014, 0.012, 0.04, 4]} position={[side === "left" ? 0.04 : -0.04, 0, -0.02]} rotation={[0, 0, side === "left" ? 0.5 : -0.5]}>
          <meshStandardMaterial color={skinColor} roughness={0.85} />
        </Cylinder>
      </group>
      {hasSword && <SwordMesh />}
    </group>
  );
}

function Leg({
  side,
  legRef,
  pantsColor,
  bootColor,
  bootTrim,
}: {
  side: "left" | "right";
  legRef: React.RefObject<THREE.Group>;
  pantsColor: string;
  bootColor: string;
  bootTrim: string;
}) {
  const bootGeo = useMemo(() => createBootGeometry(), []);
  const x = side === "left" ? -0.18 : 0.18;

  return (
    <group ref={legRef} position={[x, 0.32, 0]}>
      {/* Hip joint */}
      <Sphere args={[0.1, 8, 8]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Sphere>
      {/* Upper thigh */}
      <Cylinder args={[0.12, 0.1, 0.24, 8]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Cylinder>
      {/* Knee joint */}
      <Sphere args={[0.09, 8, 8]} position={[0, -0.24, 0.02]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Sphere>
      {/* Shin */}
      <Cylinder args={[0.095, 0.08, 0.22, 8]} position={[0, -0.38, 0]}>
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </Cylinder>
      {/* Boot */}
      <mesh geometry={bootGeo} position={[0, -0.58, -0.06]}>
        <meshStandardMaterial color={bootColor} roughness={0.65} />
      </mesh>
      <mesh position={[0.01, -0.49, 0.02]}>
        <torusGeometry args={[0.09, 0.012, 4, 12]} />
        <meshStandardMaterial color={bootTrim} roughness={0.4} metalness={0.45} />
      </mesh>
      <Box args={[0.04, 0.035, 0.02]} position={[0, -0.54, 0.1]}>
        <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
      </Box>
      <Box args={[0.15, 0.025, 0.22]} position={[0.01, -0.59, 0.02]}>
        <meshStandardMaterial color="#1A0A00" roughness={0.95} />
      </Box>
    </group>
  );
}

function PlayerCharacter({
  player,
  isCurrentPlayer = false,
  targetPosition = null,
}: PlayerCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const swordArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const capeRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);

  const prevPos = useRef({ x: player.x, z: player.z });
  const targetRotation = useRef(0);
  const walkCycle = useRef(0);
  const isMoving = useRef(false);
  const smoothSpeed = useRef(0);
  const attackAnim = useRef(0);
  const isAttackingRef = useRef(false);
  const breathCycle = useRef(Math.random() * Math.PI * 2);

  const chestplateGeo = useMemo(() => createChestplateGeometry(), []);
  const shoulderGeoL = useMemo(() => createShoulderPadGeometry(), []);
  const shoulderGeoR = useMemo(() => createShoulderPadGeometry(), []);

  

  const frameTimesRef = useRef<number[]>([]);
  const lastPerfLog = useRef(0);

  const skinColor = "#EDCBA0";
  const shirtColor = player.color;
  const shirtDark = new THREE.Color(player.color).multiplyScalar(0.7).getStyle();
  const armorColor = new THREE.Color(player.color).multiplyScalar(0.55).getStyle();
  const armorHighlight = new THREE.Color(player.color).lerp(new THREE.Color("#ffffff"), 0.2).getStyle();
  const pantsColor = "#3B2F2F";
  const bootColor = "#5C3A1E";
  const bootTrim = "#8B6914";
  const hairColor = "#2A1F1A";
  const capeColor = new THREE.Color(player.color).multiplyScalar(0.45).getStyle();
  const capeBorder = new THREE.Color(player.color).multiplyScalar(0.3).getStyle();

  useFrame((state, delta) => {
    const frameStart = performance.now();

    const atkSet = (window as any).__attackingPlayers as Set<string> | null;
    if (atkSet?.has(player.id) && !isAttackingRef.current) {
      isAttackingRef.current = true;
      attackAnim.current = 1.0;
    }

    const moveDir = (window as any).__moveDirection as { x: number; z: number } | null;
    const localPos = isCurrentPlayer ? (window as any).__localPlayerPos as { x: number; y: number; z: number } | null : null;

    const posX = localPos?.x ?? player.x;
    const posY = localPos?.y ?? player.y;
    const posZ = localPos?.z ?? player.z;

    const moving = isCurrentPlayer ? !!moveDir : (() => {
      const dx = player.x - prevPos.current.x;
      const dz = player.z - prevPos.current.z;
      return Math.sqrt(dx * dx + dz * dz) > 0.002;
    })();
    isMoving.current = moving;

    if (isCurrentPlayer && moveDir) {
      targetRotation.current = Math.atan2(moveDir.x, moveDir.z);
    } else if (moving && !isCurrentPlayer) {
      const dx = player.x - prevPos.current.x;
      const dz = player.z - prevPos.current.z;
      targetRotation.current = Math.atan2(dx, dz);
    } else if (targetPosition) {
      const tdx = targetPosition.x - posX;
      const tdz = targetPosition.z - posZ;
      if (Math.abs(tdx) > 0.1 || Math.abs(tdz) > 0.1) {
        targetRotation.current = Math.atan2(tdx, tdz);
      }
    }
    prevPos.current = { x: player.x, z: player.z };

    smoothSpeed.current = THREE.MathUtils.lerp(
      smoothSpeed.current,
      moving ? 1 : 0,
      delta * (moving ? 14 : 6)
    );

    if (!groupRef.current) return;

    groupRef.current.position.x = posX;
    groupRef.current.position.z = posZ;

    let currentRot = groupRef.current.rotation.y;
    let rotDiff = targetRotation.current - currentRot;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    groupRef.current.rotation.y = currentRot + rotDiff * Math.min(delta * 8, 1);

    const speed = smoothSpeed.current;
    if (speed < 0.001) smoothSpeed.current = 0;

    if (speed > 0.1) {
      walkCycle.current += delta * 11 * speed;
    } else {
      walkCycle.current = 0;
    }

    breathCycle.current += delta * 2.0;
    const t = state.clock.elapsedTime;

    const walkFactor = speed > 0.1 ? speed : 0;
    const legSwing = Math.sin(walkCycle.current) * 0.7 * walkFactor;
    const armSwing = Math.sin(walkCycle.current) * 0.55 * walkFactor;
    const bob = Math.abs(Math.sin(walkCycle.current * 2)) * 0.06 * walkFactor;
    const sideLean = Math.sin(walkCycle.current) * 0.04 * walkFactor;
    const headBob = Math.sin(walkCycle.current * 2) * 0.02 * walkFactor;

    const breathScale = 1 + Math.sin(breathCycle.current) * 0.015;
    const breathY = Math.sin(breathCycle.current) * 0.01;
    const idleShift = Math.sin(t * 0.8) * 0.01;
    const idleHeadTilt = Math.sin(t * 0.6) * 0.03;

    groupRef.current.position.y = posY + bob;

    if (leftLegRef.current && rightLegRef.current) {
      const legLerp = delta * 10;
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, legSwing, legLerp);
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -legSwing, legLerp);
    }

    if (attackAnim.current > 0) {
      attackAnim.current = Math.max(0, attackAnim.current - delta * 3.5);
      if (attackAnim.current <= 0) isAttackingRef.current = false;

      const at = attackAnim.current;
      const phase = at > 0.6 ? (1 - at) / 0.4 : at > 0.3 ? 1 : at / 0.3;
      const swingCurve = Math.sin(phase * Math.PI);

      if (swordArmRef.current) {
        swordArmRef.current.rotation.x = -2.2 * swingCurve;
        swordArmRef.current.rotation.z = -0.8 * swingCurve;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0.4 * swingCurve;
        leftArmRef.current.rotation.z = 0.2 * swingCurve;
      }
      if (bodyRef.current) {
        bodyRef.current.rotation.y = -0.35 * swingCurve;
        bodyRef.current.rotation.z = sideLean;
        bodyRef.current.scale.set(1, 1, 1);
        bodyRef.current.position.y = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.y = -0.15 * swingCurve;
        headRef.current.position.y = 1.65;
      }
    } else {
      if (swordArmRef.current) {
        const targetArmX = speed > 0.1 ? armSwing : -0.1 + Math.sin(breathCycle.current * 0.7) * 0.03;
        swordArmRef.current.rotation.x = THREE.MathUtils.lerp(swordArmRef.current.rotation.x, targetArmX, delta * 6);
        swordArmRef.current.rotation.z = THREE.MathUtils.lerp(swordArmRef.current.rotation.z, 0, delta * 6);
      }
      if (leftArmRef.current) {
        const targetLeftX = speed > 0.1 ? -armSwing : -0.05 + Math.sin(breathCycle.current * 0.7 + 1) * 0.03;
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, targetLeftX, delta * 6);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 6);
      }
      if (bodyRef.current) {
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 5);
        bodyRef.current.rotation.z = sideLean + (speed < 0.1 ? idleShift : 0);
        bodyRef.current.scale.set(breathScale, breathScale, breathScale);
        bodyRef.current.position.y = speed < 0.1 ? breathY : 0;
      }
      if (headRef.current) {
        headRef.current.position.y = 1.65 + headBob + (speed < 0.1 ? breathY * 0.5 : 0);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y ?? 0, 0, delta * 4);
        headRef.current.rotation.z = speed < 0.1 ? idleHeadTilt : sideLean * 0.5;
        headRef.current.rotation.x = speed < 0.1 ? Math.sin(t * 0.4) * 0.02 : 0;
      }
    }

    if (capeRef.current) {
      const capeWind = Math.sin(t * 1.8) * 0.04 + Math.sin(t * 3.1) * 0.02;
      const capeWalk = Math.sin(walkCycle.current) * 0.2 * speed;
      const capeSpeed = speed * 0.15;
      const capeAttack = attackAnim.current > 0 ? Math.sin(attackAnim.current * Math.PI) * 0.4 : 0;
      capeRef.current.rotation.x = 0.1 + capeWalk + capeWind + capeSpeed + capeAttack;
    }

    if (isCurrentPlayer) {
      const frameMs = performance.now() - frameStart;
      frameTimesRef.current.push(frameMs);
      const now = performance.now();
      if (now - lastPerfLog.current > 3000) {
        lastPerfLog.current = now;
        const times = frameTimesRef.current;
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        console.log(`[PERF PlayerChar useFrame] avg: ${avg.toFixed(3)}ms | max: ${max.toFixed(3)}ms | calls/3s: ${times.length}`);
        frameTimesRef.current = [];
      }
    }
  });

  return (
    <group ref={groupRef} position={[player.x, player.y, player.z]}>
      <group ref={bodyRef}>
        {/* === TORSO - rounded chest === */}
        <Cylinder args={[0.3, 0.34, 0.72, 10]} position={[0, 0.88, 0]}>
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </Cylinder>
        {/* Chest volume front */}
        <Sphere args={[0.3, 10, 8]} position={[0, 0.9, 0.08]} scale={[1.1, 0.95, 0.7]}>
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </Sphere>
        {/* Back volume */}
        <Sphere args={[0.25, 8, 8]} position={[0, 0.9, -0.08]} scale={[1.05, 0.9, 0.6]}>
          <meshStandardMaterial color={shirtColor} roughness={0.82} />
        </Sphere>

        {/* === CHEST ARMOR PLATE (ExtrudeGeometry) === */}
        <mesh geometry={chestplateGeo} position={[0, 0.87, 0.18]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color={armorColor} roughness={0.35} metalness={0.55} />
        </mesh>
        <Box args={[0.04, 0.5, 0.02]} position={[0, 0.88, 0.26]}>
          <meshStandardMaterial color={armorHighlight} roughness={0.3} metalness={0.6} />
        </Box>
        <Box args={[0.25, 0.03, 0.02]} position={[0, 0.95, 0.26]}>
          <meshStandardMaterial color={armorHighlight} roughness={0.3} metalness={0.6} />
        </Box>

        {/* Lower tunic / hip area */}
        <Cylinder args={[0.33, 0.3, 0.22, 10]} position={[0, 0.42, 0]}>
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </Cylinder>
        {/* Tunic front flap */}
        <mesh position={[0, 0.38, 0.28]} rotation={[0.1, 0, 0]}>
          <planeGeometry args={[0.25, 0.18]} />
          <meshStandardMaterial color={shirtDark} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>

        {/* Belt */}
        <mesh position={[0, 0.53, 0]}>
          <torusGeometry args={[0.32, 0.04, 6, 16, Math.PI * 2]} />
          <meshStandardMaterial color="#5C3A1E" roughness={0.55} metalness={0.2} />
        </mesh>
        <group position={[0, 0.53, 0.33]}>
          <Box args={[0.1, 0.08, 0.02]}>
            <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={0.9} />
          </Box>
          <Box args={[0.06, 0.04, 0.025]}>
            <meshStandardMaterial color="#FF8C00" roughness={0.2} metalness={0.7} />
          </Box>
        </group>

        {/* Collar / neck guard */}
        <Cylinder args={[0.18, 0.26, 0.1, 10]} position={[0, 1.28, 0]}>
          <meshStandardMaterial color={shirtDark} roughness={0.8} />
        </Cylinder>

        {/* === SHOULDER PADS (LatheGeometry) === */}
        <mesh geometry={shoulderGeoL} position={[-0.46, 1.22, 0]} rotation={[0, 0, 0.3]} scale={[1.2, 1, 1.2]}>
          <meshStandardMaterial color="#6A5A4A" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh geometry={shoulderGeoR} position={[0.46, 1.22, 0]} rotation={[0, 0, -0.3]} scale={[1.2, 1, 1.2]}>
          <meshStandardMaterial color="#6A5A4A" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Shoulder pad rivets */}
        {[-1, 1].map(side => (
          <group key={`rivets-${side}`}>
            {[0, 1, 2].map(i => {
              const angle = (i / 3) * Math.PI * 0.6 - 0.3;
              return (
                <Sphere key={`rivet-${side}-${i}`} args={[0.015, 4, 4]}
                  position={[side * (0.46 + Math.cos(angle) * 0.15), 1.22 + Math.sin(angle) * 0.08, Math.sin(angle) * 0.1]}>
                  <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.9} />
                </Sphere>
              );
            })}
          </group>
        ))}

        {/* === CAPE (improved) === */}
        <group position={[0, 1.1, -0.24]}>
          {/* Cape clasp */}
          <Sphere args={[0.03, 6, 6]} position={[-0.2, 0.08, 0]}>
            <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
          </Sphere>
          <Sphere args={[0.03, 6, 6]} position={[0.2, 0.08, 0]}>
            <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
          </Sphere>
          {/* Cape main fabric */}
          <mesh ref={capeRef} position={[0, -0.05, 0]} rotation={[0.15, 0, 0]}>
            <planeGeometry args={[0.65, 1.0, 4, 6]} />
            <meshStandardMaterial color={capeColor} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Cape border */}
          <mesh position={[0, -0.55, -0.01]} rotation={[0.15, 0, 0]}>
            <planeGeometry args={[0.67, 0.06]} />
            <meshStandardMaterial color={capeBorder} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* === HEAD === */}
        <group ref={headRef} position={[0, 1.65, 0]}>
          {/* Neck */}
          <Cylinder args={[0.1, 0.12, 0.12, 8]} position={[0, -0.35, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Cylinder>

          {/* Head shape */}
          <Sphere args={[0.32, 16, 16]}>
            <meshStandardMaterial color={skinColor} roughness={0.82} />
          </Sphere>
          {/* Slight jaw definition */}
          <Sphere args={[0.22, 12, 10]} position={[0, -0.12, 0.05]} scale={[1.1, 0.5, 0.9]}>
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </Sphere>

          {/* Hair - volumetric */}
          <Sphere args={[0.33, 16, 16]} position={[0, 0.05, -0.03]} scale={[1.03, 0.97, 1.04]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Sphere>
          {/* Hair top volume */}
          <Sphere args={[0.2, 10, 10]} position={[0, 0.2, -0.05]} scale={[1.5, 0.5, 1.2]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Sphere>
          {/* Bangs */}
          <Box args={[0.52, 0.08, 0.15]} position={[0, 0.2, 0.15]} rotation={[0.2, 0, 0]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>
          {/* Side hair strands */}
          {[-1, 1].map(s => (
            <group key={`hair-${s}`}>
              <Box args={[0.07, 0.22, 0.12]} position={[s * 0.3, 0, 0.1]}>
                <meshStandardMaterial color={hairColor} roughness={1} />
              </Box>
              <Box args={[0.05, 0.12, 0.08]} position={[s * 0.28, -0.12, 0.14]}>
                <meshStandardMaterial color={hairColor} roughness={1} />
              </Box>
            </group>
          ))}
          {/* Back hair */}
          <Box args={[0.4, 0.15, 0.06]} position={[0, -0.08, -0.3]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>

          {/* Eyes */}
          {[-1, 1].map(s => (
            <group key={`eye-${s}`}>
              <Sphere args={[0.06, 8, 8]} position={[s * 0.11, 0.02, 0.26]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Sphere args={[0.04, 8, 8]} position={[s * 0.11, 0.02, 0.305]}>
                <meshStandardMaterial color="#3A7BD5" />
              </Sphere>
              <Sphere args={[0.02, 6, 6]} position={[s * 0.11, 0.02, 0.33]}>
                <meshStandardMaterial color="#111111" />
              </Sphere>
              <Sphere args={[0.012, 4, 4]} position={[s * 0.11 + s * 0.015, 0.04, 0.335]}>
                <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
              </Sphere>
              {/* Eyebrow */}
              <Box args={[0.1, 0.025, 0.03]} position={[s * 0.11, 0.1, 0.26]} rotation={[0, 0, s * 0.1]}>
                <meshStandardMaterial color={hairColor} />
              </Box>
            </group>
          ))}

          {/* Nose */}
          <Sphere args={[0.03, 6, 6]} position={[0, -0.04, 0.3]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
          <Sphere args={[0.015, 4, 4]} position={[0, -0.06, 0.31]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>

          {/* Mouth */}
          <Box args={[0.08, 0.015, 0.01]} position={[0, -0.12, 0.28]}>
            <meshStandardMaterial color="#B5665A" />
          </Box>

          {/* Ears */}
          {[-1, 1].map(s => (
            <Sphere key={`ear-${s}`} args={[0.06, 6, 6]} position={[s * 0.3, -0.02, 0]} scale={[0.4, 0.8, 0.6]}>
              <meshStandardMaterial color={skinColor} roughness={0.9} />
            </Sphere>
          ))}
        </group>

        {/* === ARMS === */}
        <Arm side="left" armRef={leftArmRef} shirtColor={shirtColor} skinColor={skinColor} />
        <Arm side="right" armRef={swordArmRef} shirtColor={shirtColor} skinColor={skinColor} hasSword />
      </group>

      {/* === LEGS === */}
      <Leg side="left" legRef={leftLegRef} pantsColor={pantsColor} bootColor={bootColor} bootTrim={bootTrim} />
      <Leg side="right" legRef={rightLegRef} pantsColor={pantsColor} bootColor={bootColor} bootTrim={bootTrim} />

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

export default memo(PlayerCharacter, (prev, next) => {
  if (prev.isCurrentPlayer) {
    return prev.targetPosition?.x === next.targetPosition?.x &&
      prev.targetPosition?.z === next.targetPosition?.z;
  }
  return prev.player.x === next.player.x &&
    prev.player.z === next.player.z &&
    prev.player.hp === next.player.hp &&
    prev.player.level === next.player.level &&
    prev.player.nickname === next.player.nickname;
});
