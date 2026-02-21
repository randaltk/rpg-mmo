'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Sphere, Cylinder, Cone, Torus } from '@react-three/drei';
import { Map, MapObject, NPC } from '@/types/game';
import * as THREE from 'three';

interface MapSystemProps {
  currentMap: Map;
  onPlayerMove: (x: number, y: number, z: number) => boolean;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// --- Map Objects ---

function TreeObject({ obj }: { obj: MapObject }) {
  const h = obj.height;
  return (
    <group position={[obj.x, obj.y, obj.z]}>
      {/* Roots */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + 0.3;
        return (
          <Cylinder key={`root-${i}`} args={[0.08, 0.15, 0.6, 4]} position={[Math.cos(angle) * 0.35, 0.15, Math.sin(angle) * 0.35]} rotation={[Math.sin(angle) * 0.4, 0, Math.cos(angle) * 0.4]}>
            <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
          </Cylinder>
        );
      })}
      {/* Trunk */}
      <Cylinder args={[0.2, 0.35, h, 8]} position={[0, h / 2, 0]}>
        <meshStandardMaterial color="#6B3A20" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.18, 0.22, h * 0.3, 6]} position={[0.15, h * 0.7, 0.1]} rotation={[0.2, 0, 0.3]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
      </Cylinder>
      {/* Foliage layers */}
      <Sphere args={[h * 0.55, 10, 8]} position={[0, h + 0.3, 0]}>
        <meshStandardMaterial color="#2D8B2D" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.42, 8, 6]} position={[0.4, h + 0.1, 0.3]}>
        <meshStandardMaterial color="#3AA63A" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.38, 8, 6]} position={[-0.3, h + 0.5, -0.2]}>
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.3, 8, 6]} position={[0.2, h + 0.8, -0.3]}>
        <meshStandardMaterial color="#36A336" roughness={0.9} />
      </Sphere>
    </group>
  );
}

function RockObject({ obj }: { obj: MapObject }) {
  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <Sphere args={[obj.width * 0.55, 7, 5]} position={[0, obj.height * 0.35, 0]} scale={[1, 0.7, 0.9]}>
        <meshStandardMaterial color="#7A7A7A" roughness={0.95} metalness={0.05} />
      </Sphere>
      <Sphere args={[obj.width * 0.35, 6, 4]} position={[obj.width * 0.25, obj.height * 0.2, obj.width * 0.15]} scale={[1, 0.6, 0.8]}>
        <meshStandardMaterial color="#666666" roughness={0.9} metalness={0.08} />
      </Sphere>
      <Sphere args={[obj.width * 0.2, 5, 4]} position={[-obj.width * 0.2, obj.height * 0.15, -obj.width * 0.1]}>
        <meshStandardMaterial color="#888888" roughness={0.85} />
      </Sphere>
    </group>
  );
}

function WallObject({ obj }: { obj: MapObject }) {
  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <Box args={[obj.width, obj.height, obj.depth]} position={[0, obj.height / 2, 0]}>
        <meshStandardMaterial color="#8B7355" roughness={0.9} metalness={0.05} />
      </Box>
      {/* Top trim */}
      <Box args={[obj.width + 0.2, 0.15, obj.depth + 0.2]} position={[0, obj.height, 0]}>
        <meshStandardMaterial color="#6B5335" roughness={0.85} />
      </Box>
    </group>
  );
}

function ChestObject({ obj }: { obj: MapObject }) {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.position.y = obj.height + 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <Box args={[0.8, 0.5, 0.6]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.3} />
      </Box>
      {/* Lid */}
      <Box args={[0.85, 0.15, 0.65]} position={[0, 0.55, 0]}>
        <meshStandardMaterial color="#A67C28" roughness={0.4} metalness={0.35} />
      </Box>
      {/* Metal bands */}
      <Box args={[0.82, 0.04, 0.62]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#8B7355" roughness={0.4} metalness={0.6} />
      </Box>
      {/* Lock */}
      <Torus args={[0.06, 0.02, 6, 8]} position={[0, 0.35, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.15} />
      </Torus>
      {/* Floating glow */}
      <mesh ref={glowRef} position={[0, obj.height + 0.5, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 0.6, 0]} color="#FFD700" intensity={0.4} distance={3} />
    </group>
  );
}

function ItemObject({ obj }: { obj: MapObject }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = obj.height / 2 + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      groupRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <group position={[obj.x, obj.y, obj.z]}>
      <group ref={groupRef}>
        <mesh>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} transparent opacity={0.85} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      <pointLight position={[0, 0.5, 0]} color="#00E5FF" intensity={0.5} distance={4} />
      <Text position={[0, obj.height + 0.8, 0]} fontSize={0.22} color="#00E5FF" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {obj.item?.name || 'Item'}
      </Text>
    </group>
  );
}

const portalLabels: Record<string, string> = {
  cave: 'Caverna',
  town: 'Planícies',
  castle: 'Castelo',
};

function PortalObject({ obj }: { obj: MapObject }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.8;
    if (innerRef.current) innerRef.current.rotation.z = -t * 1.2;
  });

  const label = obj.portalTo ? portalLabels[obj.portalTo] || obj.portalTo : 'Portal';

  return (
    <group position={[obj.x, obj.y + obj.height / 2, obj.z]}>
      {/* Stone arch */}
      <Torus args={[1.3, 0.2, 8, 24, Math.PI]} position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#555" roughness={0.9} />
      </Torus>
      <Cylinder args={[0.2, 0.25, obj.height, 6]} position={[-1.3, -0.3, 0]}>
        <meshStandardMaterial color="#555" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.2, 0.25, obj.height, 6]} position={[1.3, -0.3, 0]}>
        <meshStandardMaterial color="#555" roughness={0.9} />
      </Cylinder>
      {/* Spinning rings */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.0, 0.03, 8, 48]} />
        <meshStandardMaterial color="#9B30FF" emissive="#9B30FF" emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[0.7, 0.02, 8, 48]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      {/* Portal surface */}
      <mesh>
        <circleGeometry args={[0.9, 32]} />
        <meshStandardMaterial color="#6A0DAD" emissive="#6A0DAD" emissiveIntensity={0.5} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#9B30FF" intensity={1} distance={8} />
      <pointLight color="#00E5FF" intensity={0.5} distance={5} />
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#E0B0FF" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {label}
      </Text>
    </group>
  );
}

function MapObjectComponent({ obj }: { obj: MapObject }) {
  switch (obj.type) {
    case 'tree': return <TreeObject obj={obj} />;
    case 'rock': return <RockObject obj={obj} />;
    case 'wall': return <WallObject obj={obj} />;
    case 'chest': return <ChestObject obj={obj} />;
    case 'item': return <ItemObject obj={obj} />;
    case 'portal': return <PortalObject obj={obj} />;
    default:
      return (
        <Box args={[obj.width, obj.height, obj.depth]} position={[obj.x, obj.y + obj.height / 2, obj.z]}>
          <meshStandardMaterial color="#808080" roughness={0.7} />
        </Box>
      );
  }
}

// --- NPCs ---

function NPCComponent({ npc }: { npc: NPC }) {
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
      {/* Front detail */}
      <Box args={[0.12, 0.5, 0.02]} position={[0, 0.85, 0.22]}>
        <meshStandardMaterial color={p.outfitDark} roughness={0.8} />
      </Box>
      {/* Lower tunic */}
      <Box args={[0.67, 0.18, 0.44]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color={p.outfit} roughness={0.8} />
      </Box>
      {/* Belt */}
      <Box args={[0.68, 0.09, 0.45]} position={[0, 0.52, 0]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.5} metalness={0.2} />
      </Box>
      {/* Belt buckle */}
      <Box args={[0.1, 0.08, 0.03]} position={[0, 0.52, 0.24]}>
        <meshStandardMaterial color={p.accent} roughness={0.2} metalness={0.8} />
      </Box>
      {/* Collar */}
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
        {/* Hair */}
        <Sphere args={[0.31, 14, 14]} position={[0, 0.04, -0.03]} scale={[1.02, 0.95, 1.02]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Sphere>
        {/* Bangs */}
        <Box args={[0.5, 0.07, 0.14]} position={[0, 0.18, 0.14]} rotation={[0.2, 0, 0]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Box>
        {/* Side hair */}
        <Box args={[0.07, 0.18, 0.1]} position={[-0.28, 0, 0.08]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Box>
        <Box args={[0.07, 0.18, 0.1]} position={[0.28, 0, 0.08]}>
          <meshStandardMaterial color={p.hair} roughness={1} />
        </Box>

        {/* === TYPE-SPECIFIC HEADGEAR === */}
        {npc.type === 'merchant' && (
          <>
            {/* Wide-brimmed hat */}
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
            {/* Full helmet */}
            <Sphere args={[0.32, 10, 10]} position={[0, 0.05, 0]} scale={[1, 0.85, 1]}>
              <meshStandardMaterial color="#6A7A8A" metalness={0.8} roughness={0.25} />
            </Sphere>
            {/* Visor */}
            <Box args={[0.28, 0.06, 0.05]} position={[0, 0.0, 0.3]}>
              <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
            </Box>
            {/* Crest */}
            <Box args={[0.04, 0.15, 0.3]} position={[0, 0.22, -0.02]}>
              <meshStandardMaterial color="#8B2020" roughness={0.7} />
            </Box>
          </>
        )}
        {npc.type === 'quest' && (
          <>
            {/* Wizard/sage pointed hat */}
            <Cone args={[0.25, 0.5, 6]} position={[0, 0.4, 0]}>
              <meshStandardMaterial color="#1B5E20" roughness={0.8} />
            </Cone>
            {/* Hat brim */}
            <Cylinder args={[0.32, 0.32, 0.04, 10]} position={[0, 0.18, 0]}>
              <meshStandardMaterial color="#1B5E20" roughness={0.8} />
            </Cylinder>
            {/* Star on hat */}
            <Sphere args={[0.04, 6, 6]} position={[0.1, 0.5, 0.15]}>
              <meshStandardMaterial color="#76FF03" emissive="#76FF03" emissiveIntensity={1.5} />
            </Sphere>
          </>
        )}
        {npc.type === 'wanderer' && (
          <>
            {/* Hood */}
            <Sphere args={[0.33, 10, 10]} position={[0, 0.03, -0.03]} scale={[1, 1, 1.1]}>
              <meshStandardMaterial color="#4A2C63" roughness={0.9} />
            </Sphere>
          </>
        )}

        {/* Eyes - big chibi style */}
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
        {/* Shine */}
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
      {/* Left */}
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
      {/* Right */}
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

      {/* === GUARD WEAPON (spear + shield) === */}
      {npc.type === 'guard' && (
        <>
          {/* Spear */}
          <Cylinder args={[0.025, 0.025, 1.8, 4]} position={[0.6, 0.9, 0]}>
            <meshStandardMaterial color="#6B4423" roughness={0.7} />
          </Cylinder>
          <Cone args={[0.05, 0.2, 4]} position={[0.6, 1.85, 0]}>
            <meshStandardMaterial color="#AAA" metalness={0.9} roughness={0.2} />
          </Cone>
          {/* Shield on back */}
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
      {/* Left */}
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
      {/* Right */}
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

      {/* Glow ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.55, 24]} />
        <meshStandardMaterial color={p.accent} emissive={p.accent} emissiveIntensity={0.4} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// --- Mountains (Town) ---

function Mountains() {
  const mountains = useMemo(() => {
    const data = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + seededRandom(i * 13 + 500) * 0.3;
      const dist = 70 + seededRandom(i * 17 + 600) * 25;
      const h = 12 + seededRandom(i * 11 + 700) * 22;
      const r = 8 + seededRandom(i * 19 + 800) * 12;
      data.push({ angle, dist, h, r, snow: h > 22 });
    }
    return data;
  }, []);

  return (
    <group>
      {mountains.map((m, i) => {
        const x = Math.cos(m.angle) * m.dist;
        const z = Math.sin(m.angle) * m.dist;
        return (
          <group key={`mt-${i}`} position={[x, 0, z]}>
            <Cone args={[m.r, m.h, 8]} position={[0, m.h / 2, 0]}>
              <meshStandardMaterial color="#5A6A5A" roughness={0.95} />
            </Cone>
            {m.snow && (
              <Cone args={[m.r * 0.35, m.h * 0.18, 8]} position={[0, m.h * 0.88, 0]}>
                <meshStandardMaterial color="#E8E8F0" roughness={0.7} />
              </Cone>
            )}
            <Cone args={[m.r * 0.6, m.h * 0.4, 6]} position={[m.r * 0.5, m.h * 0.2, m.r * 0.3]}>
              <meshStandardMaterial color="#4A5A4A" roughness={0.95} />
            </Cone>
          </group>
        );
      })}
    </group>
  );
}

// --- Castle Floor Decorations ---

function CastleFloor({ width, height }: { width: number; height: number }) {
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
      {/* Red carpet down the center */}
      <Box position={[0, 0.015, 0]} args={[3, 0.03, height * 0.85]}>
        <meshStandardMaterial color="#8B1A1A" roughness={0.8} />
      </Box>
      <Box position={[0, 0.025, 0]} args={[2.6, 0.02, height * 0.85]}>
        <meshStandardMaterial color="#A02020" roughness={0.75} />
      </Box>
      {/* Carpet gold trim lines */}
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
      {/* Torches along walls */}
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
      {/* Banners on walls */}
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
      {/* Throne platform at the north end */}
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
}

// --- Ground ---

function Ground({ mapId, width, height }: { mapId: string; width: number; height: number }) {
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
      {/* Main ground */}
      <Box position={[0, -0.5, 0]} args={[width, 1, height]}>
        <meshStandardMaterial color={isCave ? '#2A2A2A' : '#5A8A3A'} roughness={0.95} metalness={0.02} />
      </Box>
      {/* Ground color variation patches */}
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
          {/* Dirt paths */}
          <Box position={[0, 0.015, 0]} args={[2.5, 0.02, 60]}>
            <meshStandardMaterial color="#8B7355" roughness={1} />
          </Box>
          <Box position={[0, 0.015, 0]} args={[60, 0.02, 2.5]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#8B7355" roughness={1} />
          </Box>
        </>
      )}
      {isCave && (
        <>
          <mesh position={[-5, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[6, 16]} />
            <meshStandardMaterial color="#222" roughness={1} transparent opacity={0.3} />
          </mesh>
        </>
      )}

      {/* Town mountains */}
      {isTown && <Mountains />}

      {/* Vegetation */}
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

      {/* Pebbles */}
      {pebbles.map((p, i) => (
        <Sphere key={`peb-${i}`} args={[p.s, 5, 4]} position={[p.x, p.s * 0.3, p.z]} scale={[1, 0.5, 1]}>
          <meshStandardMaterial color={isCave ? '#444' : '#8B8878'} roughness={0.95} />
        </Sphere>
      ))}
    </>
  );
}

// --- Main ---

export default function MapSystem({ currentMap, onPlayerMove }: MapSystemProps) {
  const [interactionTarget, setInteractionTarget] = useState<MapObject | NPC | null>(null);

  const handleObjectInteract = (obj: MapObject) => {
    if (obj.type === 'item' && obj.item) {
      console.log('Coletando item:', obj.item.name);
    }
    setInteractionTarget(obj);
  };

  const handleNPCInteract = (npc: NPC) => {
    console.log('Interagindo com NPC:', npc.name);
    setInteractionTarget(npc);
  };

  const checkCollision = (x: number, y: number, z: number) => {
    for (const obj of currentMap.objects) {
      if (!obj.solid) continue;
      const playerSize = 0.5;
      if (
        x + playerSize > obj.x - obj.width/2 &&
        x - playerSize < obj.x + obj.width/2 &&
        y + playerSize > obj.y - obj.height/2 &&
        y - playerSize < obj.y + obj.height/2 &&
        z + playerSize > obj.z - obj.depth/2 &&
        z - playerSize < obj.z + obj.depth/2
      ) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    (window as any).checkCollision = checkCollision;
  }, [currentMap]);

  return (
    <>
      {currentMap.objects.map((obj) => (
        <MapObjectComponent key={obj.id} obj={obj} />
      ))}

      {currentMap.npcs.map((npc) => (
        <NPCComponent key={npc.id} npc={npc} />
      ))}

      <Ground mapId={currentMap.id} width={currentMap.width} height={currentMap.height} />
    </>
  );
}
