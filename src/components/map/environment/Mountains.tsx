'use client';

import { memo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cone, Sphere } from '@react-three/drei';
import { hashCoord, createSeededRNG } from '@/lib/worldgen/seed';
import { createTerrainSampler } from '@/lib/worldgen/terrain';
import { TOWN_SEED } from '@/data/maps/town';
import type { GameMap } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';

interface MountainData {
  x: number;
  z: number;
  baseY: number;
  h: number;
  r: number;
  snow: boolean;
  color: string;
  hasTree: boolean;
}

const REGION_SIZE = 80;
const MOUNTAIN_MAX_DIST = 300;
const MOUNTAIN_MAX_DIST_SQ = MOUNTAIN_MAX_DIST * MOUNTAIN_MAX_DIST;
const COLORS = ['#4A5A4A', '#5A6A5A', '#3A4A3A', '#6A7A6A'];

function generateRegionMountains(
  regionX: number,
  regionZ: number,
  seed: number,
  heightSampler?: (x: number, z: number) => number,
): MountainData[] {
  const regionSeed = hashCoord(regionX, regionZ, seed + 9999);
  const rng = createSeededRNG(regionSeed);
  const mountains: MountainData[] = [];

  const baseX = regionX * REGION_SIZE;
  const baseZ = regionZ * REGION_SIZE;

  const centerDist = Math.sqrt(
    (baseX + REGION_SIZE / 2) ** 2 + (baseZ + REGION_SIZE / 2) ** 2,
  );
  if (centerDist < 60) return mountains;

  const count = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < count; i++) {
    const x = baseX + rng() * REGION_SIZE;
    const z = baseZ + rng() * REGION_SIZE;
    const h = 20 + rng() * 35;
    const r = 14 + rng() * 18;
    const colorIdx = Math.floor(rng() * COLORS.length);
    const baseY = heightSampler ? heightSampler(x, z) : 0;

    mountains.push({
      x, z, baseY,
      h, r,
      snow: h > 30,
      color: COLORS[colorIdx],
      hasTree: h < 30 && rng() > 0.5,
    });
  }

  return mountains;
}

interface MountainsProps {
  currentMap: GameMap;
}

export const Mountains = memo(function Mountains({ currentMap }: MountainsProps) {
  const isTown = currentMap.id === 'town';
  const isInfinite = !!(currentMap.infinite ?? isTown);
  const heightSampler = currentMap.terrainSampler ?? (isTown ? createTerrainSampler(TOWN_SEED) : undefined);

  const [mountains, setMountains] = useState<MountainData[]>([]);
  const lastRegionRef = useRef('');
  const regionCacheRef = useRef<Map<string, MountainData[]>>(new Map());
  const timerRef = useRef(0);

  useFrame((_, delta) => {
    if (!isInfinite) return;
    timerRef.current += delta;
    if (timerRef.current < 0.5) return;
    timerRef.current = 0;

    const pos = useGameStore.getState().localPlayerPos;
    if (!pos) return;

    const prx = Math.floor(pos.x / REGION_SIZE);
    const prz = Math.floor(pos.z / REGION_SIZE);
    const regionKey = `${prx},${prz}`;
    if (regionKey === lastRegionRef.current) return;
    lastRegionRef.current = regionKey;

    const visible: MountainData[] = [];
    const scanRadius = 3;
    const seed = TOWN_SEED;

    for (let dz = -scanRadius; dz <= scanRadius; dz++) {
      for (let dx = -scanRadius; dx <= scanRadius; dx++) {
        const rx = prx + dx;
        const rz = prz + dz;
        const key = `${rx},${rz}`;

        if (!regionCacheRef.current.has(key)) {
          regionCacheRef.current.set(key, generateRegionMountains(rx, rz, seed, heightSampler));
        }

        const regionMts = regionCacheRef.current.get(key)!;
        for (const mt of regionMts) {
          const ddx = mt.x - pos.x;
          const ddz = mt.z - pos.z;
          const distSq = ddx * ddx + ddz * ddz;
          if (distSq <= MOUNTAIN_MAX_DIST_SQ) {
            visible.push(mt);
          }
        }
      }
    }

    // Prune far regions
    Array.from(regionCacheRef.current.keys()).forEach(key => {
      const [rx, rz] = key.split(',').map(Number);
      if (Math.abs(rx - prx) > 5 || Math.abs(rz - prz) > 5) {
        regionCacheRef.current.delete(key);
      }
    });

    setMountains(visible);
  });

  // Initial load for infinite
  useFrame(() => {
    if (!isInfinite || mountains.length > 0 || lastRegionRef.current !== '') return;

    const pos = useGameStore.getState().localPlayerPos;
    if (!pos) return;

    const prx = Math.floor(pos.x / REGION_SIZE);
    const prz = Math.floor(pos.z / REGION_SIZE);
    lastRegionRef.current = `${prx},${prz}`;

    const visible: MountainData[] = [];
    const seed = TOWN_SEED;
    for (let dz = -3; dz <= 3; dz++) {
      for (let dx = -3; dx <= 3; dx++) {
        const rx = prx + dx;
        const rz = prz + dz;
        const key = `${rx},${rz}`;
        const regionMts = generateRegionMountains(rx, rz, seed, heightSampler);
        regionCacheRef.current.set(key, regionMts);

        for (const mt of regionMts) {
          const ddx = mt.x - pos.x;
          const ddz = mt.z - pos.z;
          const distSq = ddx * ddx + ddz * ddz;
          if (distSq <= MOUNTAIN_MAX_DIST_SQ) {
            visible.push(mt);
          }
        }
      }
    }
    setMountains(visible);
  });

  return (
    <group>
      {mountains.map((m, i) => (
        <group key={`mt-${i}`} position={[m.x, m.baseY, m.z]}>
          <Cone args={[m.r, m.h, 8]} position={[0, m.h / 2, 0]}>
            <meshStandardMaterial color={m.color} roughness={0.95} />
          </Cone>
          {m.snow && (
            <Cone args={[m.r * 0.35, m.h * 0.18, 8]} position={[0, m.h * 0.88, 0]}>
              <meshStandardMaterial color="#E8E8F0" roughness={0.6} metalness={0.05} />
            </Cone>
          )}
          <Cone args={[m.r * 0.6, m.h * 0.4, 6]} position={[m.r * 0.5, m.h * 0.2, m.r * 0.3]}>
            <meshStandardMaterial color={m.color} roughness={0.95} />
          </Cone>
          {m.hasTree && (
            <group position={[m.r * 0.3, m.h * 0.35, m.r * -0.2]}>
              <Cone args={[1.5, 4, 6]} position={[0, 2, 0]}>
                <meshStandardMaterial color="#2D5A2D" roughness={0.9} />
              </Cone>
              <Cone args={[1.2, 3, 6]} position={[0, 3.5, 0]}>
                <meshStandardMaterial color="#3A6A3A" roughness={0.9} />
              </Cone>
            </group>
          )}
          {m.snow && (
            <Sphere args={[m.r * 0.15, 6, 6]} position={[m.r * -0.3, m.h * 0.6, m.r * 0.2]}>
              <meshStandardMaterial color="#D8D8E8" roughness={0.7} />
            </Sphere>
          )}
        </group>
      ))}
    </group>
  );
});
