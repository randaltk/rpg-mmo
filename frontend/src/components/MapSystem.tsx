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

function PortalObject({ obj }: { obj: MapObject }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.8;
    if (innerRef.current) innerRef.current.rotation.z = -t * 1.2;
  });

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
        Portal
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
  const floatRef = useRef(0);

  useFrame((state) => {
    floatRef.current = state.clock.elapsedTime;
  });

  const getOutfitColor = (type: string) => {
    switch (type) {
      case 'merchant': return '#B8860B';
      case 'guard': return '#2F4F8F';
      case 'quest': return '#2E7D32';
      case 'wanderer': return '#6A4C93';
      default: return '#666';
    }
  };

  const getAccentColor = (type: string) => {
    switch (type) {
      case 'merchant': return '#FFD700';
      case 'guard': return '#C0C0C0';
      case 'quest': return '#76FF03';
      case 'wanderer': return '#CE93D8';
      default: return '#999';
    }
  };

  const skinColor = '#E8C4A0';
  const outfitColor = getOutfitColor(npc.type);
  const accentColor = getAccentColor(npc.type);

  return (
    <group ref={groupRef} position={[npc.x, npc.y, npc.z]}>
      {/* Body */}
      <Cylinder args={[0.25, 0.3, 1.0, 8]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={outfitColor} roughness={0.75} />
      </Cylinder>
      {/* Belt/sash */}
      <Cylinder args={[0.31, 0.31, 0.08, 8]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.3} />
      </Cylinder>
      {/* Head */}
      <Sphere args={[0.2, 12, 12]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Sphere>
      {/* Eyes */}
      <Sphere args={[0.035, 6, 6]} position={[-0.07, 1.24, 0.16]}>
        <meshStandardMaterial color="#2C2C2C" />
      </Sphere>
      <Sphere args={[0.035, 6, 6]} position={[0.07, 1.24, 0.16]}>
        <meshStandardMaterial color="#2C2C2C" />
      </Sphere>
      {/* Hat/helmet/hood */}
      {npc.type === 'merchant' && (
        <Cylinder args={[0.05, 0.25, 0.2, 8]} position={[0, 1.45, 0]}>
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </Cylinder>
      )}
      {npc.type === 'guard' && (
        <Sphere args={[0.22, 8, 8]} position={[0, 1.35, 0]} scale={[1, 0.7, 1]}>
          <meshStandardMaterial color="#778899" metalness={0.7} roughness={0.3} />
        </Sphere>
      )}
      {npc.type === 'quest' && (
        <>
          <Cone args={[0.18, 0.35, 6]} position={[0, 1.55, 0]}>
            <meshStandardMaterial color="#2E7D32" roughness={0.8} />
          </Cone>
          <Sphere args={[0.04, 6, 6]} position={[0, 1.75, 0]}>
            <meshStandardMaterial color="#76FF03" emissive="#76FF03" emissiveIntensity={1} />
          </Sphere>
        </>
      )}
      {/* Arms */}
      <Cylinder args={[0.06, 0.07, 0.5, 5]} position={[-0.35, 0.65, 0]} rotation={[0, 0, 0.2]}>
        <meshStandardMaterial color={outfitColor} roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.06, 0.07, 0.5, 5]} position={[0.35, 0.65, 0]} rotation={[0, 0, -0.2]}>
        <meshStandardMaterial color={outfitColor} roughness={0.8} />
      </Cylinder>
      {/* Guard weapon */}
      {npc.type === 'guard' && (
        <Cylinder args={[0.025, 0.025, 1.5, 4]} position={[0.5, 0.75, 0]}>
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
        </Cylinder>
      )}
      {/* Name + indicator */}
      <Text position={[0, 1.85, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
        {npc.name}
      </Text>
      {(npc.type === 'quest') && (
        <Text position={[0, 2.05, 0]} fontSize={0.25} color="#FFD700" anchorX="center" anchorY="middle">
          !
        </Text>
      )}
      {/* Subtle glow underfoot */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.3} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// --- Ground ---

function Ground({ mapId, width, height }: { mapId: string; width: number; height: number }) {
  const isCave = mapId === 'cave';

  const vegetation = useMemo(() => {
    const items = [];
    const count = isCave ? 25 : 80;
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
  }, [mapId, width, height, isCave]);

  const pebbles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      x: (seededRandom(i * 11 + 200) - 0.5) * width * 0.8,
      z: (seededRandom(i * 11 + 201) - 0.5) * height * 0.8,
      s: 0.04 + seededRandom(i * 11 + 202) * 0.08,
    }));
  }, [mapId, width, height]);

  return (
    <>
      {/* Main ground */}
      <Box position={[0, -0.5, 0]} args={[width, 1, height]}>
        <meshStandardMaterial color={isCave ? '#2A2A2A' : '#5A8A3A'} roughness={0.95} metalness={0.02} />
      </Box>
      {/* Ground color variation patches */}
      {!isCave && (
        <>
          <mesh position={[-5, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[6, 16]} />
            <meshStandardMaterial color="#4E7A2E" roughness={1} transparent opacity={0.5} />
          </mesh>
          <mesh position={[8, 0.01, 7]} rotation={[-Math.PI / 2, 0, 0.3]}>
            <circleGeometry args={[5, 16]} />
            <meshStandardMaterial color="#6B9A4A" roughness={1} transparent opacity={0.4} />
          </mesh>
          <mesh position={[-10, 0.01, 10]} rotation={[-Math.PI / 2, 0, 1]}>
            <circleGeometry args={[4, 16]} />
            <meshStandardMaterial color="#4A7028" roughness={1} transparent opacity={0.4} />
          </mesh>
        </>
      )}
      {/* Dirt path through center */}
      {!isCave && (
        <Box position={[0, 0.015, 0]} args={[2.5, 0.02, width * 0.7]}>
          <meshStandardMaterial color="#8B7355" roughness={1} />
        </Box>
      )}

      {/* Vegetation */}
      {vegetation.map((v, i) => (
        <group key={`veg-${i}`} position={[v.x, 0, v.z]}>
          {/* Grass blades */}
          <Cylinder args={[0.005, 0.015, v.scale, 3]} position={[0, v.scale / 2, 0]} rotation={[0.1, 0, 0.05]}>
            <meshStandardMaterial color={v.color} roughness={0.9} />
          </Cylinder>
          <Cylinder args={[0.005, 0.015, v.scale * 0.8, 3]} position={[0.03, v.scale * 0.4, 0.02]} rotation={[-0.1, 0.3, 0.1]}>
            <meshStandardMaterial color={v.color} roughness={0.9} />
          </Cylinder>
          <Cylinder args={[0.005, 0.015, v.scale * 0.7, 3]} position={[-0.02, v.scale * 0.35, -0.01]} rotation={[0.05, -0.2, -0.1]}>
            <meshStandardMaterial color={v.color} roughness={0.9} />
          </Cylinder>
          {/* Flower */}
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
