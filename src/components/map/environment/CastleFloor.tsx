'use client';

import { memo, useMemo } from 'react';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export const CastleFloor = memo(function CastleFloor({ width, height }: { width: number; height: number }) {
  const torches = useMemo(() => {
    const list = [];
    for (let z = -12; z <= 12; z += 6) {
      list.push({ x: -9.5, z }, { x: 9.5, z });
    }
    return list;
  }, []);

  return (
    <>
      {/* Stone floor */}
      <Box position={[0, -0.5, 0]} args={[width, 1, height]}>
        <meshStandardMaterial color="#4A4A4A" roughness={0.95} />
      </Box>
      {/* Floor tile pattern */}
      {Array.from({ length: 8 }, (_, ix) =>
        Array.from({ length: 10 }, (_, iz) => {
          const x = (ix - 3.5) * 2.8;
          const z = (iz - 4.5) * 3;
          const dark = (ix + iz) % 2 === 0;
          return (
            <Box key={`tile-${ix}-${iz}`} position={[x, 0.005, z]} args={[2.7, 0.01, 2.9]}>
              <meshStandardMaterial color={dark ? '#3A3A3A' : '#505050'} roughness={0.9} />
            </Box>
          );
        })
      )}
      {/* Red carpet */}
      <Box position={[0, 0.015, 0]} args={[3, 0.03, height * 0.85]}>
        <meshStandardMaterial color="#8B1A1A" roughness={0.8} />
      </Box>
      <Box position={[0, 0.025, 0]} args={[2.6, 0.02, height * 0.85]}>
        <meshStandardMaterial color="#A02020" roughness={0.75} />
      </Box>
      {/* Carpet gold trim */}
      <Box position={[-1.35, 0.03, 0]} args={[0.08, 0.02, height * 0.85]}>
        <meshStandardMaterial color="#C5A030" roughness={0.4} metalness={0.5} />
      </Box>
      <Box position={[1.35, 0.03, 0]} args={[0.08, 0.02, height * 0.85]}>
        <meshStandardMaterial color="#C5A030" roughness={0.4} metalness={0.5} />
      </Box>
      {/* Ceiling */}
      <Box position={[0, 6.5, 0]} args={[width, 0.5, height]}>
        <meshStandardMaterial color="#3A3530" roughness={0.95} />
      </Box>
      {/* Torches */}
      {torches.map((t, i) => (
        <group key={`torch-${i}`} position={[t.x, 2.5, t.z]}>
          <Cylinder args={[0.04, 0.06, 0.5, 5]}>
            <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
          </Cylinder>
          <Sphere args={[0.08, 6, 6]} position={[0, 0.3, 0]}>
            <meshStandardMaterial color="#FF8C00" emissive="#FF6600" emissiveIntensity={2} />
          </Sphere>
          <pointLight position={[0, 0.4, 0]} color="#FF8C00" intensity={0.8} distance={8} decay={2} />
        </group>
      ))}
      {/* Banners */}
      {[-7, 0, 7].map((z, i) => (
        <group key={`banner-${i}`}>
          <mesh position={[-10.4, 3.5, z]}>
            <planeGeometry args={[1.2, 2]} />
            <meshStandardMaterial color="#8B1A1A" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-10.4, 3.5, z]}>
            <planeGeometry args={[0.6, 1.5]} />
            <meshStandardMaterial color="#C5A030" roughness={0.5} metalness={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[10.4, 3.5, z]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.2, 2]} />
            <meshStandardMaterial color="#8B1A1A" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[10.4, 3.5, z]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.6, 1.5]} />
            <meshStandardMaterial color="#C5A030" roughness={0.5} metalness={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* Throne platform */}
      <Box position={[0, 0.15, -12]} args={[6, 0.3, 4]}>
        <meshStandardMaterial color="#3A3535" roughness={0.85} />
      </Box>
      <Box position={[0, 0.35, -12.5]} args={[4, 0.4, 2.5]}>
        <meshStandardMaterial color="#4A4040" roughness={0.85} />
      </Box>
      {/* Throne chair */}
      <Box position={[0, 1, -13]} args={[1.2, 1.2, 0.8]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
      </Box>
      <Box position={[0, 2, -13.2]} args={[1.4, 1.8, 0.15]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
      </Box>
      <Box position={[0, 2.9, -13.2]} args={[0.6, 0.3, 0.2]}>
        <meshStandardMaterial color="#C5A030" roughness={0.3} metalness={0.7} />
      </Box>
      {/* Armrests */}
      <Box position={[-0.65, 1.2, -12.8]} args={[0.15, 0.15, 0.6]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
      </Box>
      <Box position={[0.65, 1.2, -12.8]} args={[0.15, 0.15, 0.6]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
      </Box>
      {/* Throne cushion */}
      <Box position={[0, 0.7, -12.9]} args={[1, 0.15, 0.6]}>
        <meshStandardMaterial color="#8B1A1A" roughness={0.8} />
      </Box>
    </>
  );
});
