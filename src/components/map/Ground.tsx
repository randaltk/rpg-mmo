'use client';

import { useMemo } from 'react';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import { seededRandom } from '@/utils/seededRandom';
import { Mountains } from './environment/Mountains';
import { CastleFloor } from './environment/CastleFloor';

export function Ground({ mapId, width, height }: { mapId: string; width: number; height: number }) {
  const isCave = mapId === 'cave';
  const isCastle = mapId === 'castle';
  const isTown = mapId === 'town';

  const vegetation = useMemo(() => {
    if (isCastle) return [];
    const items = [];
    const count = isCave ? 25 : 180;
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

  const pebbles = useMemo(() => {
    if (isCastle) return [];
    return Array.from({ length: isTown ? 60 : 30 }, (_, i) => ({
      x: (seededRandom(i * 11 + 200) - 0.5) * width * 0.8,
      z: (seededRandom(i * 11 + 201) - 0.5) * height * 0.8,
      s: 0.04 + seededRandom(i * 11 + 202) * 0.08,
    }));
  }, [mapId, width, height, isCastle, isTown]);

  if (isCastle) {
    return <CastleFloor width={width} height={height} />;
  }

  return (
    <>
      <Box position={[0, -0.5, 0]} args={[width, 1, height]}>
        <meshStandardMaterial color={isCave ? '#2A2A2A' : '#5A8A3A'} roughness={0.95} metalness={0.02} />
      </Box>
      {isTown && (
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
        <mesh position={[-5, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[6, 16]} />
          <meshStandardMaterial color="#222" roughness={1} transparent opacity={0.3} />
        </mesh>
      )}

      {isTown && <Mountains />}

      {vegetation.map((v, i) => (
        <group key={`veg-${i}`} position={[v.x, 0, v.z]}>
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
      ))}

      {pebbles.map((p, i) => (
        <Sphere key={`peb-${i}`} args={[p.s, 5, 4]} position={[p.x, p.s * 0.3, p.z]} scale={[1, 0.5, 1]}>
          <meshStandardMaterial color={isCave ? '#444' : '#8B8878'} roughness={0.95} />
        </Sphere>
      ))}
    </>
  );
}
