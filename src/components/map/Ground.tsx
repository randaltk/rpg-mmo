'use client';

import { memo, useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Sparkles } from '@react-three/drei';
import { seededRandom } from '@/utils/seededRandom';
import { Mountains } from './environment/Mountains';
import { CastleFloor } from './environment/CastleFloor';
import { BIOME_CONFIGS } from '@/lib/worldgen/biome-configs';
import type { BiomeType } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import * as THREE from 'three';

interface TerrainGroundProps {
  width: number;
  height: number;
  heightmap: Float32Array;
  resolution: number;
  biomeMap?: BiomeType[];
}

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

const TerrainGround = memo(function TerrainGround({ width, height, heightmap, resolution, biomeMap }: TerrainGroundProps) {
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

export const Ground = memo(function Ground({ mapId, width, height, heightmap, resolution, biomeMap }: {
  mapId: string;
  width: number;
  height: number;
  heightmap?: Float32Array;
  resolution?: number;
  biomeMap?: BiomeType[];
}) {
  const isCave = mapId === 'cave';
  const isCastle = mapId === 'castle';
  const isTown = mapId === 'town';
  const hasHeightmap = heightmap && resolution;

  const allVegetation = useMemo(() => {
    if (isCastle) return [];
    const items = [];
    const count = isCave ? 25 : 200;
    for (let i = 0; i < count; i++) {
      items.push({
        x: (seededRandom(i * 7 + 1) - 0.5) * width * 0.85,
        z: (seededRandom(i * 7 + 2) - 0.5) * height * 0.85,
        scale: 0.15 + seededRandom(i * 7 + 3) * 0.25,
        type: seededRandom(i * 7 + 4) > 0.6 ? 'flower' : 'grass',
        color: isCave
          ? ['#2D4A3A', '#1E3A2A', '#3A5A4A'][Math.floor(seededRandom(i * 7 + 5) * 3)]
          : ['#4CAF50', '#66BB6A', '#43A047', '#388E3C'][Math.floor(seededRandom(i * 7 + 5) * 4)],
        flowerColor: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8DC7'][Math.floor(seededRandom(i * 7 + 6) * 5)],
      });
    }
    return items;
  }, [mapId, width, height, isCave, isCastle]);

  const allPebbles = useMemo(() => {
    if (isCastle) return [];
    return Array.from({ length: isTown ? 100 : 30 }, (_, i) => ({
      x: (seededRandom(i * 11 + 200) - 0.5) * width * 0.8,
      z: (seededRandom(i * 11 + 201) - 0.5) * height * 0.8,
      s: 0.04 + seededRandom(i * 11 + 202) * 0.08,
    }));
  }, [mapId, width, height, isCastle, isTown]);

  const VEG_VIEW_DIST_SQ = 60 * 60;
  const [vegetation, setVegetation] = useState(allVegetation.slice(0, 40));
  const [pebbles, setPebbles] = useState(allPebbles.slice(0, 20));
  const vegTimerRef = useRef(0);
  const lastVegChunkRef = useRef('');

  useFrame((_, delta) => {
    if (isCastle || isCave) return;
    vegTimerRef.current += delta;
    if (vegTimerRef.current < 0.5) return;
    vegTimerRef.current = 0;

    const pos = useGameStore.getState().localPlayerPos;
    if (!pos) return;
    const px = pos.x;
    const pz = pos.z;
    const chunkKey = `${Math.floor(px / 30)},${Math.floor(pz / 30)}`;
    if (chunkKey === lastVegChunkRef.current) return;
    lastVegChunkRef.current = chunkKey;

    setVegetation(allVegetation.filter(v => {
      const dx = v.x - px;
      const dz = v.z - pz;
      return dx * dx + dz * dz < VEG_VIEW_DIST_SQ;
    }));
    setPebbles(allPebbles.filter(p => {
      const dx = p.x - px;
      const dz = p.z - pz;
      return dx * dx + dz * dz < VEG_VIEW_DIST_SQ;
    }));
  });

  if (isCastle) {
    return <CastleFloor width={width} height={height} />;
  }

  // Vegetation Y offset helper — sample heightmap if available
  const getVegY = (x: number, z: number): number => {
    if (!hasHeightmap) return 0;
    const halfW = width / 2;
    const halfH = height / 2;
    const nx = (x + halfW) / width;
    const nz = (z + halfH) / height;
    const ix = Math.round(nx * resolution!);
    const iz = Math.round(nz * resolution!);
    const res = resolution! + 1;
    const ci = Math.max(0, Math.min(resolution!, iz)) * res + Math.max(0, Math.min(resolution!, ix));
    return heightmap![ci] ?? 0;
  };

  return (
    <>
      {hasHeightmap ? (
        <TerrainGround width={width} height={height} heightmap={heightmap!} resolution={resolution!} biomeMap={biomeMap} />
      ) : (
        <Box position={[0, -0.5, 0]} args={[width, 1, height]} receiveShadow>
          <meshStandardMaterial color={isCave ? '#2A2A2A' : '#5A8A3A'} roughness={0.95} metalness={0.02} />
        </Box>
      )}

      {isTown && !hasHeightmap && (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            const cx = (seededRandom(i * 23 + 300) - 0.5) * width * 0.7;
            const cz = (seededRandom(i * 23 + 301) - 0.5) * height * 0.7;
            const r = 4 + seededRandom(i * 23 + 302) * 8;
            const colors = ['#4E7A2E', '#6B9A4A', '#4A7028', '#5A8A3A', '#3D6B22'];
            return (
              <mesh key={`patch-${i}`} position={[cx, 0.01, cz]} rotation={[-Math.PI / 2, 0, seededRandom(i * 23 + 303) * Math.PI]}>
                <circleGeometry args={[r, 16]} />
                <meshStandardMaterial color={colors[i % colors.length]} roughness={1} transparent opacity={0.4} />
              </mesh>
            );
          })}
          <Box position={[0, 0.015, 0]} args={[2.5, 0.02, 60]}>
            <meshStandardMaterial color="#8B7355" roughness={1} />
          </Box>
          <Box position={[0, 0.015, 0]} args={[60, 0.02, 2.5]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#8B7355" roughness={1} />
          </Box>
        </>
      )}

      {isCave && (
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
          <Mountains
            heightmap={heightmap}
            mapWidth={width}
            mapHeight={height}
            resolution={resolution}
          />
          {/* Pond */}
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
