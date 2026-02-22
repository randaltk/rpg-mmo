'use client';

import { memo, useMemo } from 'react';
import { Cone, Sphere } from '@react-three/drei';
import { seededRandom } from '@/utils/seededRandom';
import { getHeightAt } from '@/lib/worldgen/terrain';

interface MountainsProps {
  heightmap?: Float32Array;
  mapWidth?: number;
  mapHeight?: number;
  resolution?: number;
}

export const Mountains = memo(function Mountains({
  heightmap,
  mapWidth = 150,
  mapHeight = 150,
  resolution,
}: MountainsProps) {
  const mountains = useMemo(() => {
    const data = [];
    const halfW = mapWidth / 2;
    const halfH = mapHeight / 2;
    const ringDist = Math.min(halfW, halfH) * 0.9;
    const count = 40;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + seededRandom(i * 13 + 500) * 0.2;
      const dist = ringDist + seededRandom(i * 17 + 600) * 20;
      const h = 20 + seededRandom(i * 11 + 700) * 35;
      const r = 14 + seededRandom(i * 19 + 800) * 18;
      const colorIdx = Math.floor(seededRandom(i * 23 + 900) * 4);
      const colors = ['#4A5A4A', '#5A6A5A', '#3A4A3A', '#6A7A6A'];

      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      let baseY = 0;
      if (heightmap && resolution) {
        baseY = getHeightAt(x, z, heightmap, mapWidth, mapHeight, resolution);
      }

      data.push({
        x, z, baseY,
        h, r,
        snow: h > 20,
        color: colors[colorIdx],
        hasTree: h < 20 && seededRandom(i * 29 + 950) > 0.5,
      });
    }
    return data;
  }, [heightmap, mapWidth, mapHeight, resolution]);

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
