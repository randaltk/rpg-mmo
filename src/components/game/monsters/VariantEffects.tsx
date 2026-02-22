'use client';

import { useMemo } from 'react';
import { Sphere, Cylinder, Cone } from '@react-three/drei';
import type { MonsterVariant } from '@/types/game';

interface VariantEffectsProps {
  variant?: MonsterVariant;
  monsterHeight: number;
}

function FireAura({ h }: { h: number }) {
  const positions = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => [
      Math.sin(i * 2.1) * 0.3,
      h * 0.2 + i * h * 0.2,
      Math.cos(i * 2.1) * 0.3,
    ] as [number, number, number]), [h]);

  return (
    <group>
      {positions.map((pos, i) => (
        <Sphere key={i} args={[0.06 - i * 0.01, 4, 3]} position={pos}>
          <meshStandardMaterial color="#FF6600" emissive="#FF4400" emissiveIntensity={3} transparent opacity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

function IceCrystals({ h }: { h: number }) {
  const positions = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => [
      Math.sin(i * 2.5) * 0.35,
      h * 0.15 + i * h * 0.25,
      Math.cos(i * 2.5) * 0.35,
    ] as [number, number, number]), [h]);

  return (
    <group>
      {positions.map((pos, i) => (
        <Cone key={i} args={[0.03, 0.1, 4]} position={pos} rotation={[i * 0.5, i * 1.2, i * 0.3]}>
          <meshStandardMaterial color="#88DDFF" emissive="#44AAFF" emissiveIntensity={1.5} transparent opacity={0.6} />
        </Cone>
      ))}
    </group>
  );
}

function PoisonDrops({ h }: { h: number }) {
  const positions = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => [
      Math.sin(i * 1.8) * 0.3,
      h * 0.1 + i * h * 0.15,
      Math.cos(i * 1.8) * 0.3,
    ] as [number, number, number]), [h]);

  return (
    <group>
      {positions.map((pos, i) => (
        <Sphere key={i} args={[0.04, 3, 3]} position={pos}>
          <meshStandardMaterial color="#88FF44" emissive="#66CC22" emissiveIntensity={2} transparent opacity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

function GoldenGlow({ h }: { h: number }) {
  return (
    <Sphere args={[0.15, 4, 4]} position={[0, h * 0.5, 0]}>
      <meshStandardMaterial color="#FFD700" emissive="#FFAA00" emissiveIntensity={3} transparent opacity={0.25} />
    </Sphere>
  );
}

function WarriorShield() {
  return (
    <group position={[-0.4, 0.65, 0.1]} rotation={[0, 0.3, 0.1]}>
      <Cylinder args={[0.18, 0.22, 0.03, 6]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#6A4A2A" roughness={0.7} metalness={0.3} />
      </Cylinder>
      <Sphere args={[0.06, 4, 4]} position={[0, 0, 0.02]}>
        <meshStandardMaterial color="#AAA" roughness={0.3} metalness={0.8} />
      </Sphere>
    </group>
  );
}

function ShamanStaff() {
  return (
    <group position={[-0.35, 0.3, 0.05]}>
      <Cylinder args={[0.02, 0.02, 1.1, 4]} position={[0, 0.55, 0]}>
        <meshStandardMaterial color="#4A3A1A" roughness={0.85} />
      </Cylinder>
      <Sphere args={[0.08, 4, 4]} position={[0, 1.15, 0]}>
        <meshStandardMaterial color="#AA44FF" emissive="#8822DD" emissiveIntensity={2.5} transparent opacity={0.8} />
      </Sphere>
    </group>
  );
}

export function VariantEffects({ variant, monsterHeight }: VariantEffectsProps) {
  if (!variant) return null;

  const h = monsterHeight;

  switch (variant) {
    case 'fire':
      return <FireAura h={h} />;
    case 'ice':
      return <IceCrystals h={h} />;
    case 'poison':
      return <PoisonDrops h={h} />;
    case 'golden':
      return <GoldenGlow h={h} />;
    case 'warrior':
      return <WarriorShield />;
    case 'shaman':
      return <ShamanStaff />;
    case 'archer':
    case 'chief':
    default:
      return null;
  }
}

export function getVariantColor(baseColor: string, variant?: MonsterVariant): string {
  if (!variant) return baseColor;
  switch (variant) {
    case 'fire': return '#DD4400';
    case 'ice': return '#4488CC';
    case 'poison': return '#558833';
    case 'golden': return '#DAA520';
    default: return baseColor;
  }
}

export function getVariantScale(variant?: MonsterVariant): number {
  if (variant === 'chief') return 1.6;
  return 1;
}
