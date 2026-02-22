'use client';

import { memo, useMemo, useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Sparkles } from '@react-three/drei';
import { seededRandom } from '@/utils/seededRandom';
import { Mountains } from './environment/Mountains';
import { CastleFloor } from './environment/CastleFloor';
import { BIOME_CONFIGS } from '@/lib/worldgen/biome-configs';
import type { BiomeType, GameMap } from '@/types/game';
import { createTerrainSampler, type HeightSampler } from '@/lib/worldgen/terrain';
import { createBiomeSampler, type BiomeSampler } from '@/lib/worldgen/biomes';
import { hashCoord } from '@/lib/worldgen/seed';
import { TOWN_SEED } from '@/data/maps/town';
import { useGameStore } from '@/stores/gameStore';
import * as THREE from 'three';

const _tempColor = new THREE.Color();
const _tempColor2 = new THREE.Color();

function getTerrainColor(h: number, biome?: BiomeType): THREE.Color {
  const colors = biome ? BIOME_CONFIGS[biome].groundColors : ['#3A6A2A', '#5A8A3A', '#7A9A4A', '#8A7A5A', '#6A6A6A'];
  const t = Math.max(0, Math.min(1, (h + 1.5) / 13.5));
  const idx = t * (colors.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, colors.length - 1);
  const frac = idx - lo;
  _tempColor.set(colors[lo]);
  _tempColor2.set(colors[hi]);
  _tempColor.lerp(_tempColor2, frac);
  return _tempColor;
}

const PATCH_SIZE = 300;
const PATCH_RES = 128;
const REBUILD_THRESHOLD = 30;
const VEG_CHUNK = 30;
const VEG_VIEW_DIST = 60;
const VEG_VIEW_DIST_SQ = VEG_VIEW_DIST * VEG_VIEW_DIST;

interface InfiniteTerrainProps {
  heightSampler: HeightSampler;
  biomeSampler: BiomeSampler;
}

function buildPatchGeometry(
  centerX: number,
  centerZ: number,
  heightSampler: HeightSampler,
  biomeSampler: BiomeSampler,
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(PATCH_SIZE, PATCH_SIZE, PATCH_RES, PATCH_RES);
  geo.rotateX(-Math.PI / 2);

  const positions = geo.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const res = PATCH_RES + 1;

  for (let i = 0; i < positions.count; i++) {
    const lx = positions.getX(i);
    const lz = positions.getZ(i);
    const worldX = lx + centerX;
    const worldZ = lz + centerZ;

    const h = heightSampler(worldX, worldZ);
    positions.setY(i, h);

    const biome = biomeSampler(worldX, worldZ);
    const color = getTerrainColor(h, biome);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

interface VegItem {
  x: number;
  z: number;
  scale: number;
  type: 'flower' | 'grass';
  color: string;
  flowerColor: string;
}

interface PebItem {
  x: number;
  z: number;
  s: number;
}

function generateChunkVegetation(cx: number, cz: number, biomeSampler: BiomeSampler): VegItem[] {
  const items: VegItem[] = [];
  const seed = hashCoord(cx, cz, 7777);
  const baseX = cx * VEG_CHUNK;
  const baseZ = cz * VEG_CHUNK;
  const biome = biomeSampler(baseX + VEG_CHUNK / 2, baseZ + VEG_CHUNK / 2);
  const bc = BIOME_CONFIGS[biome];
  const count = Math.floor(8 * bc.vegetationDensity);

  for (let i = 0; i < count; i++) {
    const h = hashCoord(i, seed, 111);
    const r1 = (h & 0xffff) / 0xffff;
    const r2 = ((h >> 8) & 0xffff) / 0xffff;
    const r3 = ((h >> 4) & 0xff) / 0xff;
    const r4 = ((h >> 12) & 0xff) / 0xff;
    const r5 = ((h >> 16) & 0xff) / 0xff;

    items.push({
      x: baseX + r1 * VEG_CHUNK,
      z: baseZ + r2 * VEG_CHUNK,
      scale: 0.15 + r3 * 0.25,
      type: r4 > 0.6 ? 'flower' : 'grass',
      color: bc.vegetationColors[Math.floor(r5 * bc.vegetationColors.length)] ?? bc.vegetationColors[0],
      flowerColor: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8DC7'][Math.floor(r3 * 5)],
    });
  }
  return items;
}

function generateChunkPebbles(cx: number, cz: number): PebItem[] {
  const items: PebItem[] = [];
  const seed = hashCoord(cx, cz, 8888);
  const baseX = cx * VEG_CHUNK;
  const baseZ = cz * VEG_CHUNK;

  for (let i = 0; i < 3; i++) {
    const h = hashCoord(i, seed, 222);
    const r1 = (h & 0xffff) / 0xffff;
    const r2 = ((h >> 8) & 0xffff) / 0xffff;
    const r3 = ((h >> 4) & 0xff) / 0xff;
    items.push({
      x: baseX + r1 * VEG_CHUNK,
      z: baseZ + r2 * VEG_CHUNK,
      s: 0.04 + r3 * 0.08,
    });
  }
  return items;
}

const InfiniteTerrainMesh = memo(function InfiniteTerrainMesh({ heightSampler, biomeSampler }: InfiniteTerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const patchCenter = useRef({ x: 0, z: 0 });
  const geoRef = useRef<THREE.BufferGeometry | null>(null);
  const initializedRef = useRef(false);

  if (!geoRef.current) {
    geoRef.current = buildPatchGeometry(0, 0, heightSampler, biomeSampler);
  }

  useFrame(() => {
    const pos = useGameStore.getState().localPlayerPos;
    if (!pos || !meshRef.current) return;

    const dx = pos.x - patchCenter.current.x;
    const dz = pos.z - patchCenter.current.z;
    const distSq = dx * dx + dz * dz;

    const needsRebuild = !initializedRef.current || distSq > REBUILD_THRESHOLD * REBUILD_THRESHOLD;
    if (!needsRebuild) return;

    initializedRef.current = true;
    const newCX = Math.round(pos.x / 10) * 10;
    const newCZ = Math.round(pos.z / 10) * 10;
    patchCenter.current = { x: newCX, z: newCZ };

    const oldGeo = geoRef.current;
    geoRef.current = buildPatchGeometry(newCX, newCZ, heightSampler, biomeSampler);
    meshRef.current.geometry = geoRef.current;
    meshRef.current.position.set(newCX, 0, newCZ);
    oldGeo?.dispose();
  });

  return (
    <mesh ref={meshRef} geometry={geoRef.current!} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
    </mesh>
  );
});

interface FiniteTerrainProps {
  width: number;
  height: number;
  heightmap: Float32Array;
  resolution: number;
  biomeMap?: BiomeType[];
}

const FiniteTerrainGround = memo(function FiniteTerrainGround({ width, height, heightmap, resolution, biomeMap }: FiniteTerrainProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, resolution, resolution);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const res = resolution + 1;

    for (let i = 0; i < positions.count; i++) {
      const ix = i % res;
      const iz = Math.floor(i / res);
      const h = heightmap[iz * res + ix];
      positions.setY(i, h);

      const biome = biomeMap ? biomeMap[iz * res + ix] : undefined;
      const color = getTerrainColor(h, biome);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [width, height, heightmap, resolution, biomeMap]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
    </mesh>
  );
});

export const Ground = memo(function Ground({ currentMap }: { currentMap: GameMap }) {
  const { id: mapId, width, height, heightmap, heightmapResolution: resolution, biomeMap } = currentMap;

  const isCave = mapId === 'cave' || mapId.startsWith('dungeon_');
  const isCastle = mapId === 'castle';
  const isTown = mapId === 'town';

  const fallbackSamplers = useMemo(() => {
    if (currentMap.terrainSampler && currentMap.biomeSampler) return null;
    if (!isTown) return null;
    return {
      terrain: createTerrainSampler(TOWN_SEED),
      biome: createBiomeSampler(TOWN_SEED),
    };
  }, [currentMap.terrainSampler, currentMap.biomeSampler, isTown]);

  const terrainSampler = currentMap.terrainSampler ?? fallbackSamplers?.terrain;
  const biomeSampler = currentMap.biomeSampler ?? fallbackSamplers?.biome;
  const infinite = currentMap.infinite ?? isTown;

  const isInfinite = !!infinite && !!terrainSampler && !!biomeSampler;
  const hasFiniteHeightmap = !isInfinite && heightmap && resolution;

  const [vegetation, setVegetation] = useState<VegItem[]>([]);
  const [pebbles, setPebbles] = useState<PebItem[]>([]);
  const vegTimerRef = useRef(0);
  const lastVegChunkRef = useRef('');
  const vegCacheRef = useRef<Map<string, VegItem[]>>(new Map());
  const pebCacheRef = useRef<Map<string, PebItem[]>>(new Map());

  useFrame((_, delta) => {
    if (isCastle || isCave) return;
    vegTimerRef.current += delta;
    if (vegTimerRef.current < 0.5) return;
    vegTimerRef.current = 0;

    const pos = useGameStore.getState().localPlayerPos;
    if (!pos) return;
    const px = pos.x;
    const pz = pos.z;
    const chunkKey = `${Math.floor(px / VEG_CHUNK)},${Math.floor(pz / VEG_CHUNK)}`;
    if (chunkKey === lastVegChunkRef.current) return;
    lastVegChunkRef.current = chunkKey;

    if (isInfinite) {
      const pcx = Math.floor(px / VEG_CHUNK);
      const pcz = Math.floor(pz / VEG_CHUNK);
      const radius = 2;
      const allVeg: VegItem[] = [];
      const allPeb: PebItem[] = [];

      for (let dz = -radius; dz <= radius; dz++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const cx = pcx + dx;
          const cz = pcz + dz;
          const key = `${cx},${cz}`;

          if (!vegCacheRef.current.has(key)) {
            vegCacheRef.current.set(key, generateChunkVegetation(cx, cz, biomeSampler!));
            pebCacheRef.current.set(key, generateChunkPebbles(cx, cz));
          }

          const chunkVeg = vegCacheRef.current.get(key)!;
          const chunkPeb = pebCacheRef.current.get(key)!;

          for (const v of chunkVeg) {
            const ddx = v.x - px;
            const ddz = v.z - pz;
            if (ddx * ddx + ddz * ddz < VEG_VIEW_DIST_SQ) allVeg.push(v);
          }
          for (const p of chunkPeb) {
            const ddx = p.x - px;
            const ddz = p.z - pz;
            if (ddx * ddx + ddz * ddz < VEG_VIEW_DIST_SQ) allPeb.push(p);
          }
        }
      }

      // Prune distant chunks from cache
      Array.from(vegCacheRef.current.keys()).forEach(key => {
        const [kcx, kcz] = key.split(',').map(Number);
        if (Math.abs(kcx - pcx) > 5 || Math.abs(kcz - pcz) > 5) {
          vegCacheRef.current.delete(key);
          pebCacheRef.current.delete(key);
        }
      });

      setVegetation(allVeg);
      setPebbles(allPeb);
    }
  });

  const getVegY = useCallback((x: number, z: number): number => {
    if (isInfinite) return terrainSampler!(x, z);
    if (!hasFiniteHeightmap) return 0;
    const halfW = width / 2;
    const halfH = height / 2;
    const nx = (x + halfW) / width;
    const nz = (z + halfH) / height;
    const ix = Math.round(nx * resolution!);
    const iz = Math.round(nz * resolution!);
    const res = resolution! + 1;
    const ci = Math.max(0, Math.min(resolution!, iz)) * res + Math.max(0, Math.min(resolution!, ix));
    return heightmap![ci] ?? 0;
  }, [isInfinite, terrainSampler, hasFiniteHeightmap, width, height, resolution, heightmap]);

  if (isCastle) {
    return <CastleFloor width={width} height={height} />;
  }

  return (
    <>
      {isInfinite ? (
        <InfiniteTerrainMesh heightSampler={terrainSampler!} biomeSampler={biomeSampler!} />
      ) : hasFiniteHeightmap ? (
        <FiniteTerrainGround width={width} height={height} heightmap={heightmap!} resolution={resolution!} biomeMap={biomeMap} />
      ) : (
        <Box position={[0, -0.5, 0]} args={[width, 1, height]} receiveShadow>
          <meshStandardMaterial color={isCave ? '#2A2A2A' : '#5A8A3A'} roughness={0.95} metalness={0.02} />
        </Box>
      )}

      {mapId === 'cave' && (
        <group position={[-5, 0.01, -5]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[6, 24]} />
            <meshPhysicalMaterial
              color="#0A2A3A"
              roughness={0.05}
              metalness={0.2}
              transparent
              opacity={0.6}
              transmission={0.2}
              thickness={0.5}
            />
          </mesh>
          <Sparkles count={6} scale={[12, 0.3, 12]} size={1} speed={0.15} color="#00CED1" opacity={0.3} />
        </group>
      )}

      {isTown && (
        <>
          <Mountains currentMap={currentMap} />
          <group position={[15, getVegY(15, -12) + 0.02, -12]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[5, 24]} />
              <meshPhysicalMaterial
                color="#2A6A8A"
                roughness={0.05}
                metalness={0.1}
                transparent
                opacity={0.7}
                transmission={0.3}
                thickness={1}
              />
            </mesh>
            <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[5.5, 24]} />
              <meshStandardMaterial color="#3A4A2A" roughness={0.95} />
            </mesh>
            <Sparkles count={8} scale={[10, 0.5, 10]} size={1.5} speed={0.2} color="#8AC8E8" opacity={0.3} />
          </group>
        </>
      )}

      {vegetation.map((v, i) => {
        const vy = getVegY(v.x, v.z);
        return (
          <group key={`veg-${i}`} position={[v.x, vy, v.z]}>
            <Cylinder args={[0.005, 0.015, v.scale, 3]} position={[0, v.scale / 2, 0]} rotation={[0.1, 0, 0.05]}>
              <meshStandardMaterial color={v.color} roughness={0.9} />
            </Cylinder>
            <Cylinder args={[0.005, 0.015, v.scale * 0.8, 3]} position={[0.03, v.scale * 0.4, 0.02]} rotation={[-0.1, 0.3, 0.1]}>
              <meshStandardMaterial color={v.color} roughness={0.9} />
            </Cylinder>
            <Cylinder args={[0.005, 0.015, v.scale * 0.7, 3]} position={[-0.02, v.scale * 0.35, -0.01]} rotation={[0.05, -0.2, -0.1]}>
              <meshStandardMaterial color={v.color} roughness={0.9} />
            </Cylinder>
            {v.type === 'flower' && !isCave && (
              <Sphere args={[0.03, 5, 5]} position={[0, v.scale + 0.02, 0]}>
                <meshStandardMaterial color={v.flowerColor} emissive={v.flowerColor} emissiveIntensity={0.15} />
              </Sphere>
            )}
          </group>
        );
      })}

      {pebbles.map((p, i) => {
        const py = getVegY(p.x, p.z);
        return (
          <Sphere key={`peb-${i}`} args={[p.s, 5, 4]} position={[p.x, py + p.s * 0.3, p.z]} scale={[1, 0.5, 1]}>
            <meshStandardMaterial color={isCave ? '#444' : '#8B8878'} roughness={0.95} />
          </Sphere>
        );
      })}
    </>
  );
});
