import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Player } from "@/types/game";
import { useGameStore } from "@/stores/gameStore";
import { PerfMonitor } from "@/utils/perfMonitor";
import * as THREE from "three";

const charPerfLog = new PerfMonitor("PlayerChar useFrame");

interface UseCharacterAnimationConfig {
  player: Player;
  isCurrentPlayer: boolean;
  targetPosition: { x: number; z: number } | null;
}

export function useCharacterAnimation({
  player,
  isCurrentPlayer,
  targetPosition,
}: UseCharacterAnimationConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const weaponArmRef = useRef<THREE.Group>(null);
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


  useFrame((state, delta) => {
    const frameStart = performance.now();

    const atkSet = useGameStore.getState().attackingPlayers;
    if (atkSet.has(player.id) && !isAttackingRef.current) {
      isAttackingRef.current = true;
      attackAnim.current = 1.0;
    }

    const gs = useGameStore.getState();
    const moveDir = gs.moveDirection;
    const localPos = isCurrentPlayer ? gs.localPlayerPos : null;

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

      if (weaponArmRef.current) {
        weaponArmRef.current.rotation.x = -2.2 * swingCurve;
        weaponArmRef.current.rotation.z = -0.8 * swingCurve;
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
      if (weaponArmRef.current) {
        const targetArmX = speed > 0.1 ? armSwing : -0.1 + Math.sin(breathCycle.current * 0.7) * 0.03;
        weaponArmRef.current.rotation.x = THREE.MathUtils.lerp(weaponArmRef.current.rotation.x, targetArmX, delta * 6);
        weaponArmRef.current.rotation.z = THREE.MathUtils.lerp(weaponArmRef.current.rotation.z, 0, delta * 6);
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
      charPerfLog.tick(performance.now() - frameStart);
    }
  });

  return { groupRef, leftLegRef, rightLegRef, leftArmRef, weaponArmRef, bodyRef, capeRef, headRef };
}
