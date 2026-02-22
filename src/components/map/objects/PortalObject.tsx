'use client';

import { memo, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Torus, Cylinder, Sparkles } from '@react-three/drei';
import type { MapObject, PortalTier } from '@/types/game';
import * as THREE from 'three';

const staticLabels: Record<string, string> = {
  cave: 'Caverna',
  town: 'Planícies',
  castle: 'Castelo',
};

const tierLabels: Record<PortalTier, string> = {
  easy: 'Caverna Fácil',
  medium: 'Caverna Média',
  hard: 'Caverna Difícil',
  boss: 'Caverna do Boss',
};

interface TierStyle {
  archColor: string;
  ringColor: string;
  innerColor: string;
  fillColor: string;
  sparkleColor: string;
  lightColor: string;
  textColor: string;
  ringIntensity: number;
  scale: number;
}

const TIER_STYLES: Record<PortalTier, TierStyle> = {
  easy: {
    archColor: '#556677',
    ringColor: '#4488FF',
    innerColor: '#66BBFF',
    fillColor: '#224488',
    sparkleColor: '#4488FF',
    lightColor: '#4488FF',
    textColor: '#88CCFF',
    ringIntensity: 1.5,
    scale: 1.0,
  },
  medium: {
    archColor: '#555555',
    ringColor: '#9B30FF',
    innerColor: '#CC66FF',
    fillColor: '#4A0080',
    sparkleColor: '#9B30FF',
    lightColor: '#9B30FF',
    textColor: '#CC99FF',
    ringIntensity: 2.0,
    scale: 1.05,
  },
  hard: {
    archColor: '#443333',
    ringColor: '#FF3333',
    innerColor: '#FF6655',
    fillColor: '#660000',
    sparkleColor: '#FF3333',
    lightColor: '#FF3333',
    textColor: '#FF8888',
    ringIntensity: 2.5,
    scale: 1.1,
  },
  boss: {
    archColor: '#554422',
    ringColor: '#FFD700',
    innerColor: '#FFEE88',
    fillColor: '#886600',
    sparkleColor: '#FFD700',
    lightColor: '#FFD700',
    textColor: '#FFE888',
    ringIntensity: 3.0,
    scale: 1.25,
  },
};

const DEFAULT_STYLE: TierStyle = {
  archColor: '#555',
  ringColor: '#9B30FF',
  innerColor: '#00E5FF',
  fillColor: '#6A0DAD',
  sparkleColor: '#9B30FF',
  lightColor: '#9B30FF',
  textColor: '#E0B0FF',
  ringIntensity: 2,
  scale: 1.0,
};

export const PortalObject = memo(function PortalObject({ obj }: { obj: MapObject }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.8;
    if (innerRef.current) innerRef.current.rotation.z = -t * 1.2;
  });

  const tier = obj.portalTier;
  const style = tier ? TIER_STYLES[tier] : DEFAULT_STYLE;

  const label = useMemo(() => {
    if (tier) return tierLabels[tier];
    if (obj.portalTo) return staticLabels[obj.portalTo] || obj.portalTo;
    return 'Portal';
  }, [tier, obj.portalTo]);

  const s = style.scale;

  return (
    <group position={[obj.x, obj.y + obj.height / 2, obj.z]} scale={[s, s, s]}>
      {/* Stone arch */}
      <Torus args={[1.3, 0.2, 8, 24, Math.PI]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color={style.archColor} roughness={0.9} />
      </Torus>
      <Cylinder args={[0.2, 0.25, obj.height, 6]} position={[-1.3, -0.3, 0]}>
        <meshStandardMaterial color={style.archColor} roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.2, 0.25, obj.height, 6]} position={[1.3, -0.3, 0]}>
        <meshStandardMaterial color={style.archColor} roughness={0.9} />
      </Cylinder>

      {/* Decorations for hard/boss tiers */}
      {tier === 'hard' && (
        <>
          <mesh position={[0, 1.55, 0.15]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#CC3333" emissive="#FF0000" emissiveIntensity={1} />
          </mesh>
          <mesh position={[-0.5, 1.4, 0.15]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial color="#CC3333" emissive="#FF0000" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.5, 1.4, 0.15]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial color="#CC3333" emissive="#FF0000" emissiveIntensity={0.6} />
          </mesh>
        </>
      )}
      {tier === 'boss' && (
        <>
          <mesh position={[0, 1.7, 0.15]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFAA00" emissiveIntensity={2} />
          </mesh>
          <Torus args={[0.35, 0.04, 6, 16]} position={[0, 1.7, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#FFD700" emissive="#FFAA00" emissiveIntensity={1.5} />
          </Torus>
        </>
      )}
      {tier === 'medium' && (
        <>
          {[-0.8, 0, 0.8].map((xp, i) => (
            <mesh key={i} position={[xp, 1.35 + Math.abs(xp) * 0.15, 0.18]}>
              <boxGeometry args={[0.08, 0.12, 0.02]} />
              <meshStandardMaterial color="#9B30FF" emissive="#9B30FF" emissiveIntensity={1.5} />
            </mesh>
          ))}
        </>
      )}

      {/* Animated rings */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.0, 0.03, 8, 48]} />
        <meshStandardMaterial color={style.ringColor} emissive={style.ringColor} emissiveIntensity={style.ringIntensity} transparent opacity={0.8} />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[0.7, 0.02, 8, 48]} />
        <meshStandardMaterial color={style.innerColor} emissive={style.innerColor} emissiveIntensity={style.ringIntensity} transparent opacity={0.7} />
      </mesh>

      {/* Portal fill */}
      <mesh>
        <circleGeometry args={[0.9, 32]} />
        <meshStandardMaterial color={style.fillColor} emissive={style.fillColor} emissiveIntensity={0.5} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Lights */}
      <pointLight color={style.lightColor} intensity={1} distance={8} />
      <pointLight color={style.innerColor} intensity={0.5} distance={5} />

      {/* Sparkles */}
      <Sparkles count={tier === 'boss' ? 40 : 20} scale={2.5} size={tier === 'boss' ? 5 : 3} speed={0.6} color={style.sparkleColor} opacity={0.7} />

      {/* Label */}
      <Text position={[0, 1.8, 0]} fontSize={0.25} color={style.textColor} anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {label}
      </Text>
    </group>
  );
});
