'use client';

import { useRef, useEffect, useState } from 'react';
import { Box, Text, Sphere, Cylinder, Cone, Torus } from '@react-three/drei';
import { Map, MapObject, NPC } from '@/types/game';
import * as THREE from 'three';

interface MapSystemProps {
  currentMap: Map;
  onPlayerMove: (x: number, y: number, z: number) => boolean;
}

interface MapObjectProps {
  obj: MapObject;
  onInteract: (obj: MapObject) => void;
}

function MapObjectComponent({ obj, onInteract }: MapObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const getObjectColor = (type: string) => {
    switch (type) {
      case 'wall': return '#8B4513';
      case 'tree': return '#228B22';
      case 'rock': return '#696969';
      case 'chest': return '#DAA520';
      case 'door': return '#8B4513';
      case 'item': return '#FFD700';
      default: return '#808080';
    }
  };

  const renderObject = () => {
    const position = [obj.x, obj.y, obj.z] as [number, number, number];
    
    switch (obj.type) {
      case 'tree':
        return (
          <group position={position}>
            {/* Tronco da árvore */}
            <Cylinder
              args={[0.3, 0.4, obj.height, 8]}
              position={[0, obj.height / 2, 0]}
            >
              <meshStandardMaterial 
                color="#8B4513" 
                roughness={0.8}
                metalness={0.1}
              />
            </Cylinder>
            {/* Folhas da árvore */}
            <Sphere
              args={[obj.height * 0.6, 12, 8]}
              position={[0, obj.height + 0.5, 0]}
            >
              <meshStandardMaterial 
                color="#32CD32" 
                roughness={0.9}
              />
            </Sphere>
            {/* Detalhes nas folhas */}
            <Sphere
              args={[obj.height * 0.4, 8, 6]}
              position={[0.3, obj.height + 0.3, 0.2]}
            >
              <meshStandardMaterial 
                color="#228B22" 
                roughness={0.9}
                transparent
                opacity={0.7}
              />
            </Sphere>
          </group>
        );
        
      case 'rock':
        return (
          <group position={position}>
            <Sphere
              args={[obj.width / 2, 8, 6]}
              position={[0, obj.height / 2, 0]}
            >
              <meshStandardMaterial 
                color="#696969" 
                roughness={0.9}
                metalness={0.2}
              />
            </Sphere>
            {/* Detalhes na rocha */}
            <Box
              args={[obj.width * 0.3, obj.height * 0.2, obj.depth * 0.3]}
              position={[0.1, obj.height * 0.3, 0.1]}
            >
              <meshStandardMaterial 
                color="#555555" 
                roughness={0.8}
              />
            </Box>
          </group>
        );
        
      case 'chest':
        return (
          <group position={position}>
            {/* Corpo do baú */}
            <Box args={[obj.width, obj.height, obj.depth]}>
              <meshStandardMaterial 
                color="#DAA520" 
                roughness={0.6}
                metalness={0.3}
              />
            </Box>
            {/* Tampo do baú */}
            <Box 
              args={[obj.width * 1.1, obj.height * 0.2, obj.depth * 1.1]}
              position={[0, obj.height * 0.6, 0]}
            >
              <meshStandardMaterial 
                color="#B8860B" 
                roughness={0.5}
                metalness={0.4}
              />
            </Box>
            {/* Fechadura */}
            <Torus
              args={[0.1, 0.05, 4, 8]}
              position={[0, obj.height * 0.3, obj.depth / 2 + 0.01]}
            >
              <meshStandardMaterial 
                color="#FFD700" 
                metalness={0.8}
                roughness={0.2}
              />
            </Torus>
          </group>
        );
        
      case 'wall':
        return (
          <Box
            args={[obj.width, obj.height, obj.depth]}
            position={position}
          >
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.8}
              metalness={0.1}
            />
          </Box>
        );
        
      case 'item':
        return (
          <group position={position}>
            <Sphere
              args={[obj.width / 2, 8, 6]}
              position={[0, obj.height / 2, 0]}
            >
              <meshStandardMaterial 
                color="#FFD700" 
                transparent
                opacity={0.8}
                metalness={0.8}
                roughness={0.2}
              />
            </Sphere>
            <Text
              position={[0, obj.height + 0.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000"
            >
              {obj.item?.name || 'Item'}
            </Text>
          </group>
        );
        
      case 'portal':
        return (
          <group position={position}>
            {/* Portal principal */}
            <Box args={[obj.width, obj.height, obj.depth]}>
              <meshStandardMaterial 
                color="#8A2BE2" 
                transparent
                opacity={0.7}
                metalness={0.8}
                roughness={0.1}
              />
            </Box>
            {/* Efeito de energia do portal */}
            <Box 
              args={[obj.width * 1.2, obj.height * 1.2, obj.depth * 0.1]}
              position={[0, obj.height / 2, 0]}
            >
              <meshStandardMaterial 
                color="#00FFFF" 
                transparent
                opacity={0.3}
                metalness={0.9}
                roughness={0.1}
              />
            </Box>
            {/* Partículas flutuantes do portal */}
            <Sphere
              args={[0.1, 8, 6]}
              position={[0, obj.height * 0.8, 0]}
            >
              <meshStandardMaterial 
                color="#FFFFFF" 
                transparent
                opacity={0.8}
                metalness={0.9}
              />
            </Sphere>
            <Text
              position={[0, obj.height + 0.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000"
            >
              Portal
            </Text>
          </group>
        );
        
      default:
        return (
          <Box
            args={[obj.width, obj.height, obj.depth]}
            position={position}
          >
            <meshStandardMaterial 
              color={getObjectColor(obj.type)} 
              roughness={0.7}
            />
          </Box>
        );
    }
  };

  return (
    <group onClick={() => onInteract(obj)}>
      {renderObject()}
    </group>
  );
}

interface NPCComponentProps {
  npc: NPC;
  onInteract: (npc: NPC) => void;
}

function NPCComponent({ npc, onInteract }: NPCComponentProps) {
  const groupRef = useRef<THREE.Group>(null);

  const getNPCColor = (type: string) => {
    switch (type) {
      case 'merchant': return '#FFD700';
      case 'guard': return '#4169E1';
      case 'quest': return '#32CD32';
      case 'wanderer': return '#9370DB';
      default: return '#808080';
    }
  };

  const getNPCAccessory = (type: string) => {
    switch (type) {
      case 'merchant':
        return (
          <Cylinder
            args={[0.15, 0.2, 0.3, 6]}
            position={[0, 1.8, 0]}
          >
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
        );
      case 'guard':
        return (
          <Box
            args={[0.1, 0.3, 0.05]}
            position={[0.3, 1.6, 0]}
          >
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
          </Box>
        );
      case 'quest':
        return (
          <Sphere
            args={[0.1, 8, 6]}
            position={[0, 1.8, 0]}
          >
            <meshStandardMaterial color="#FFD700" metalness={0.8} />
          </Sphere>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} position={[npc.x, npc.y, npc.z]} onClick={() => onInteract(npc)}>
      {/* Corpo do NPC */}
      <Cylinder
        args={[0.3, 0.35, 1.2, 8]}
        position={[0, 0.6, 0]}
      >
        <meshStandardMaterial 
          color={getNPCColor(npc.type)} 
          roughness={0.7}
          metalness={0.1}
        />
      </Cylinder>
      
      {/* Cabeça */}
      <Sphere
        args={[0.25, 16, 16]}
        position={[0, 1.4, 0]}
      >
        <meshStandardMaterial 
          color="#FDBCB4" 
          roughness={0.8}
        />
      </Sphere>
      
      {/* Olhos */}
      <Sphere
        args={[0.05, 8, 8]}
        position={[-0.08, 1.45, 0.2]}
      >
        <meshStandardMaterial color="#000" />
      </Sphere>
      <Sphere
        args={[0.05, 8, 8]}
        position={[0.08, 1.45, 0.2]}
      >
        <meshStandardMaterial color="#000" />
      </Sphere>
      
      {/* Acessório específico do tipo */}
      {getNPCAccessory(npc.type)}
      
      {/* Nome do NPC */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        {npc.name}
      </Text>
      
      {/* Efeito de brilho para NPCs importantes */}
      {(npc.type === 'merchant' || npc.type === 'quest') && (
        <Sphere
          args={[0.6, 16, 16]}
          position={[0, 0.6, 0]}
        >
          <meshStandardMaterial 
            color={npc.type === 'merchant' ? '#FFD700' : '#32CD32'} 
            transparent 
            opacity={0.1}
          />
        </Sphere>
      )}
    </group>
  );
}

export default function MapSystem({ currentMap, onPlayerMove }: MapSystemProps) {
  const [interactionTarget, setInteractionTarget] = useState<MapObject | NPC | null>(null);

  const handleObjectInteract = (obj: MapObject) => {
    if (obj.type === 'item' && obj.item) {
      // Coletar item
      console.log('Coletando item:', obj.item.name);
      // Aqui você implementaria a lógica de coleta
    } else if (obj.type === 'door') {
      // Entrar em casa/caverna
      console.log('Entrando em:', obj.id);
      // Aqui você implementaria a lógica de transição de mapa
    }
    setInteractionTarget(obj);
  };

  const handleNPCInteract = (npc: NPC) => {
    console.log('Interagindo com NPC:', npc.name);
    setInteractionTarget(npc);
  };

  // Sistema de colisão simples
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
        return false; // Colisão detectada
      }
    }
    return true; // Sem colisão
  };

  // Expor função de colisão para o componente pai
  useEffect(() => {
    (window as any).checkCollision = checkCollision;
  }, [currentMap]);

  return (
    <>
      {/* Renderizar objetos do mapa */}
      {currentMap.objects.map((obj) => (
        <MapObjectComponent
          key={obj.id}
          obj={obj}
          onInteract={handleObjectInteract}
        />
      ))}

      {/* Renderizar NPCs */}
      {currentMap.npcs.map((npc) => (
        <NPCComponent
          key={npc.id}
          npc={npc}
          onInteract={handleNPCInteract}
        />
      ))}

      {/* Ground do mapa melhorado */}
      <Box position={[0, -1, 0]} args={[currentMap.width, 0.2, currentMap.height]}>
        <meshStandardMaterial 
          color={currentMap.id === 'cave' ? "#2F4F4F" : "#8FBC8F"} 
          roughness={0.9}
          metalness={0.1}
        />
      </Box>
      
      {/* Detalhes no chão - pedras pequenas */}
      {Array.from({ length: 20 }, (_, i) => (
        <Sphere
          key={`ground-rock-${i}`}
          args={[0.1, 6, 4]}
          position={[
            (Math.random() - 0.5) * currentMap.width * 0.8,
            -0.9,
            (Math.random() - 0.5) * currentMap.height * 0.8
          ]}
        >
          <meshStandardMaterial 
            color="#696969" 
            roughness={0.9}
            metalness={0.2}
          />
        </Sphere>
      ))}
      
      {/* Grama decorativa */}
      {Array.from({ length: 30 }, (_, i) => (
        <Cylinder
          key={`grass-${i}`}
          args={[0.02, 0.02, 0.3, 4]}
          position={[
            (Math.random() - 0.5) * currentMap.width * 0.9,
            -0.85,
            (Math.random() - 0.5) * currentMap.height * 0.9
          ]}
        >
          <meshStandardMaterial 
            color="#32CD32" 
            roughness={0.9}
          />
        </Cylinder>
      ))}

      {/* Grid helper sutil */}
      <gridHelper 
        args={[currentMap.width, currentMap.height]} 
        position={[0, -0.9, 0]}
        material-opacity={0.3}
        material-transparent
      />
    </>
  );
}



