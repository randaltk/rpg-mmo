'use client';

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Sphere, Cylinder, Cone } from '@react-three/drei';
import { NPC } from '@/types/game';
import * as THREE from 'three';

export const NPCComponent = memo(function NPCComponent({ npc }: { npc: NPC }) {
  const groupRef = useRef<THREE.Group>(null);
  const indicatorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (indicatorRef.current) {
      indicatorRef.current.position.y = 2.55 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
    }
  });

  const skin = '#EDCBA0';

  const palette: Record<string, { outfit: string; outfitDark: string; accent: string; hair: string; cape: string }> = {
    merchant: { outfit: '#B8860B', outfitDark: '#8B6508', accent: '#FFD700', hair: '#5C3A1E', cape: '#7A5A0A' },
    guard:    { outfit: '#3A4F8F', outfitDark: '#2A3A6A', accent: '#C0C0C0', hair: '#1A1A1A', cape: '#2A3A5A' },
    quest:    { outfit: '#2E7D32', outfitDark: '#1B5E20', accent: '#76FF03', hair: '#4A3728', cape: '#1B5E20' },
    wanderer: { outfit: '#6A4C93', outfitDark: '#4A2C73', accent: '#CE93D8', hair: '#3B2F2F', cape: '#4A2C63' },
  };
  const p = palette[npc.type] || palette.wanderer;

  return (
    <group ref={groupRef} position={[npc.x, npc.y, npc.z]}>

      {/* === TORSO === */}
      <Box args={[0.65, 0.7, 0.42]} position={[0, 0.85, 0]}>
        <meshStandardMaterial color={p.outfit} roughness={0.75} />
      </Box>
      <Box args={[0.12, 0.5, 0.02]} position={[0, 0.85, 0.22]}>
        <meshStandardMaterial color={p.outfitDark} roughness={0.8} />
      </Box>
      <Box args={[0.67, 0.18, 0.44]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color={p.outfit} roughness={0.8} />
      </Box>
      <Box args={[0.68, 0.09, 0.45]} position={[0, 0.52, 0]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.5} metalness={0.2} />
      </Box>
      <Box args={[0.1, 0.08, 0.03]} position={[0, 0.52, 0.24]}>
        <meshStandardMaterial color={p.accent} roughness={0.2} metalness={0.8} />
      </Box>
      <Box args={[0.5, 0.07, 0.32]} position={[0, 1.22, 0]}>
        <meshStandardMaterial color={p.outfitDark} roughness={0.8} />
      </Box>

      {/* === SHOULDER PADS === */}
      <Sphere args={[0.16, 8, 8]} position={[-0.42, 1.15, 0]} scale={[1, 0.7, 0.9]}>
        <meshStandardMaterial color={npc.type === 'guard' ? '#778899' : '#6A5A4A'} roughness={0.4} metalness={npc.type === 'guard' ? 0.7 : 0.3} />
      </Sphere>
      <Sphere args={[0.16, 8, 8]} position={[0.42, 1.15, 0]} scale={[1, 0.7, 0.9]}>
        <meshStandardMaterial color={npc.type === 'guard' ? '#778899' : '#6A5A4A'} roughness={0.4} metalness={npc.type === 'guard' ? 0.7 : 0.3} />
      </Sphere>

      {/* === CAPE === */}
      <mesh position={[0, 1.0, -0.23]} rotation={[0.12, 0, 0]}>
        <planeGeometry args={[0.55, 0.85]} />
        <meshStandardMaterial color={p.cape} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* === HEAD (chibi) === */}
      <group position={[0, 1.58, 0]}>
        <Sphere args={[0.3, 14, 14]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
        <Sphere args={[0.31, 14, 14]} position={[0, 0.04, -0.03]} scale={[1.02, 0.95, 1.02]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Sphere>
        <Box args={[0.5, 0.07, 0.14]} position={[0, 0.18, 0.14]} rotation={[0.2, 0, 0]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Box>
        <Box args={[0.07, 0.18, 0.1]} position={[-0.28, 0, 0.08]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Box>
        <Box args={[0.07, 0.18, 0.1]} position={[0.28, 0, 0.08]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Box>

        {/* === TYPE-SPECIFIC HEADGEAR === */}
        {npc.type === 'merchant' && (
          <>
            <Cylinder args={[0.4, 0.4, 0.04, 12]} position={[0, 0.25, 0]}>
              <meshStandardMaterial color="#6B4423" roughness={0.8} />
            </Cylinder>
            <Cylinder args={[0.08, 0.2, 0.2, 8]} position={[0, 0.38, 0]}>
              <meshStandardMaterial color="#6B4423" roughness={0.8} />
            </Cylinder>
            <Box args={[0.06, 0.06, 0.02]} position={[0, 0.32, 0.21]}>
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </Box>
          </>
        )}
        {npc.type === 'guard' && (
          <>
            <Sphere args={[0.32, 10, 10]} position={[0, 0.05, 0]} scale={[1, 0.85, 1]}>
              <meshStandardMaterial color="#6A7A8A" metalness={0.8} roughness={0.25} />
            </Sphere>
            <Box args={[0.28, 0.06, 0.05]} position={[0, 0.0, 0.3]}>
              <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
            </Box>
            <Box args={[0.04, 0.15, 0.3]} position={[0, 0.22, -0.02]}>
              <meshStandardMaterial color="#8B2020" roughness={0.7} />
            </Box>
          </>
        )}
        {npc.type === 'quest' && (
          <>
            <Cone args={[0.25, 0.5, 6]} position={[0, 0.4, 0]}>
              <meshStandardMaterial color="#1B5E20" roughness={0.8} />
            </Cone>
            <Cylinder args={[0.32, 0.32, 0.04, 10]} position={[0, 0.18, 0]}>
              <meshStandardMaterial color="#1B5E20" roughness={0.8} />
            </Cylinder>
            <Sphere args={[0.04, 6, 6]} position={[0.1, 0.5, 0.15]}>
              <meshStandardMaterial color="#76FF03" emissive="#76FF03" emissiveIntensity={1.5} />
            </Sphere>
          </>
        )}
        {npc.type === 'wanderer' && (
          <>
            <Sphere args={[0.33, 10, 10]} position={[0, 0.03, -0.03]} scale={[1, 1, 1.1]}>
              <meshStandardMaterial color="#4A2C63" roughness={0.9} />
            </Sphere>
          </>
        )}

        {/* Eyes */}
        <Sphere args={[0.05, 8, 8]} position={[-0.1, 0.0, 0.24]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere args={[0.05, 8, 8]} position={[0.1, 0.0, 0.24]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere args={[0.035, 8, 8]} position={[-0.1, 0.0, 0.28]}>
          <meshStandardMaterial color="#2C1810" />
        </Sphere>
        <Sphere args={[0.035, 8, 8]} position={[0.1, 0.0, 0.28]}>
          <meshStandardMaterial color="#2C1810" />
        </Sphere>
        <Sphere args={[0.015, 4, 4]} position={[-0.1, 0.0, 0.3]}>
          <meshStandardMaterial color="#111" />
        </Sphere>
        <Sphere args={[0.015, 4, 4]} position={[0.1, 0.0, 0.3]}>
          <meshStandardMaterial color="#111" />
        </Sphere>
        <Sphere args={[0.01, 4, 4]} position={[-0.088, 0.015, 0.305]}>
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
        </Sphere>
        <Sphere args={[0.01, 4, 4]} position={[0.112, 0.015, 0.305]}>
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
        </Sphere>
        {/* Nose */}
        <Sphere args={[0.025, 6, 6]} position={[0, -0.05, 0.28]}>
          <meshStandardMaterial color={skin} roughness={0.9} />
        </Sphere>
        {/* Mouth */}
        <Box args={[0.07, 0.012, 0.01]} position={[0, -0.12, 0.26]}>
          <meshStandardMaterial color="#B5665A" />
        </Box>
        {/* Ears */}
        <Sphere args={[0.05, 6, 6]} position={[-0.28, -0.02, 0]} scale={[0.4, 0.8, 0.6]}>
          <meshStandardMaterial color={skin} roughness={0.9} />
        </Sphere>
        <Sphere args={[0.05, 6, 6]} position={[0.28, -0.02, 0]} scale={[0.4, 0.8, 0.6]}>
          <meshStandardMaterial color={skin} roughness={0.9} />
        </Sphere>
      </group>

      {/* === ARMS === */}
      <group position={[-0.45, 1.05, 0]}>
        <Cylinder args={[0.09, 0.11, 0.38, 6]} position={[0, -0.19, 0]}>
          <meshStandardMaterial color={p.outfit} roughness={0.8} />
        </Cylinder>
        <Cylinder args={[0.07, 0.09, 0.28, 6]} position={[0, -0.48, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Sphere args={[0.07, 6, 6]} position={[0, -0.65, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
      </group>
      <group position={[0.45, 1.05, 0]}>
        <Cylinder args={[0.09, 0.11, 0.38, 6]} position={[0, -0.19, 0]}>
          <meshStandardMaterial color={p.outfit} roughness={0.8} />
        </Cylinder>
        <Cylinder args={[0.07, 0.09, 0.28, 6]} position={[0, -0.48, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Cylinder>
        <Sphere args={[0.07, 6, 6]} position={[0, -0.65, 0]}>
          <meshStandardMaterial color={skin} roughness={0.85} />
        </Sphere>
      </group>

      {/* === GUARD WEAPON === */}
      {npc.type === 'guard' && (
        <>
          <Cylinder args={[0.025, 0.025, 1.8, 4]} position={[0.6, 0.9, 0]}>
            <meshStandardMaterial color="#6B4423" roughness={0.7} />
          </Cylinder>
          <Cone args={[0.05, 0.2, 4]} position={[0.6, 1.85, 0]}>
            <meshStandardMaterial color="#AAA" metalness={0.9} roughness={0.2} />
          </Cone>
          <mesh position={[-0.15, 0.8, -0.3]} rotation={[0, 0, 0]}>
            <circleGeometry args={[0.22, 8]} />
            <meshStandardMaterial color="#3A4F8F" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.15, 0.8, -0.31]}>
            <circleGeometry args={[0.08, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* === MERCHANT POUCH === */}
      {npc.type === 'merchant' && (
        <Box args={[0.15, 0.12, 0.1]} position={[0.35, 0.45, 0.15]}>
          <meshStandardMaterial color="#8B6914" roughness={0.7} />
        </Box>
      )}

      {/* === LEGS === */}
      <group position={[-0.16, 0.32, 0]}>
        <Cylinder args={[0.12, 0.11, 0.3, 6]} position={[0, -0.12, 0]}>
          <meshStandardMaterial color="#3B2F2F" roughness={0.85} />
        </Cylinder>
        <Box args={[0.16, 0.16, 0.24]} position={[0, -0.35, 0.02]}>
          <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
        </Box>
        <Box args={[0.17, 0.04, 0.2]} position={[0, -0.27, 0.01]}>
          <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.3} />
        </Box>
        <Box args={[0.18, 0.03, 0.26]} position={[0, -0.44, 0.02]}>
          <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
        </Box>
      </group>
      <group position={[0.16, 0.32, 0]}>
        <Cylinder args={[0.12, 0.11, 0.3, 6]} position={[0, -0.12, 0]}>
          <meshStandardMaterial color="#3B2F2F" roughness={0.85} />
        </Cylinder>
        <Box args={[0.16, 0.16, 0.24]} position={[0, -0.35, 0.02]}>
          <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
        </Box>
        <Box args={[0.17, 0.04, 0.2]} position={[0, -0.27, 0.01]}>
          <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.3} />
        </Box>
        <Box args={[0.18, 0.03, 0.26]} position={[0, -0.44, 0.02]}>
          <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
        </Box>
      </group>

      {/* === UI === */}
      <Text position={[0, 2.35, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {npc.name}
      </Text>
      {npc.type === 'quest' && (
        <group ref={indicatorRef} position={[0, 2.55, 0]}>
          <Text fontSize={0.3} color="#FFD700" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
            !
          </Text>
        </group>
      )}
      {npc.type === 'merchant' && (
        <group ref={indicatorRef} position={[0, 2.55, 0]}>
          <mesh>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
          </mesh>
        </group>
      )}

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.55, 24]} />
        <meshStandardMaterial color={p.accent} emissive={p.accent} emissiveIntensity={0.4} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
});
