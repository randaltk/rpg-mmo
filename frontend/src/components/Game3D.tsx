"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Box,
  Sphere,
  Cylinder,
  Cone,
  Stars,
} from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Player, Map, MapObject, NPC } from "@/types/game";
import * as THREE from "three";
import MapSystem from "./MapSystem";
import Inventory from "./Inventory";

interface PlayerCubeProps {
  player: Player;
  isCurrentPlayer?: boolean;
}

function PlayerCharacter({ player, isCurrentPlayer = false }: PlayerCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [lastPosition, setLastPosition] = useState({
    x: player.x,
    y: player.y,
    z: player.z,
  });

  // Animação de movimento
  useFrame((state) => {
    if (groupRef.current) {
      // Animação de flutuação sutil
      groupRef.current.position.y =
        player.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;

      // Animação de rotação quando se move
      if (isMoving) {
        groupRef.current.rotation.y += 0.02;
      }
    }
  });

  // Detectar movimento
  useEffect(() => {
    const moved =
      Math.abs(player.x - lastPosition.x) > 0.01 ||
      Math.abs(player.z - lastPosition.z) > 0.01;
    setIsMoving(moved);
    setLastPosition({ x: player.x, y: player.y, z: player.z });
  }, [player.x, player.y, player.z, lastPosition]);

  return (
    <group ref={groupRef} position={[player.x, player.y, player.z]}>
      {/* Corpo principal */}
      <Cylinder args={[0.3, 0.4, 1.2, 8]} position={[0, 0.6, 0]}>
        <meshStandardMaterial
          color={player.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Cylinder>

      {/* Cabeça */}
      <Sphere args={[0.25, 16, 16]} position={[0, 1.4, 0]}>
        <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
      </Sphere>

      {/* Olhos */}
      <Sphere args={[0.05, 8, 8]} position={[-0.08, 1.45, 0.2]}>
        <meshStandardMaterial color="#000" />
      </Sphere>
      <Sphere args={[0.05, 8, 8]} position={[0.08, 1.45, 0.2]}>
        <meshStandardMaterial color="#000" />
      </Sphere>

      {/* Braços */}
      <Cylinder
        args={[0.08, 0.1, 0.8, 6]}
        position={[-0.5, 0.8, 0]}
        rotation={[0, 0, Math.PI / 4]}
      >
        <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
      </Cylinder>
      <Cylinder
        args={[0.08, 0.1, 0.8, 6]}
        position={[0.5, 0.8, 0]}
        rotation={[0, 0, -Math.PI / 4]}
      >
        <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
      </Cylinder>

      {/* Pernas */}
      <Cylinder args={[0.1, 0.12, 0.8, 6]} position={[-0.2, -0.4, 0]}>
        <meshStandardMaterial color="#4169E1" roughness={0.7} />
      </Cylinder>
      <Cylinder args={[0.1, 0.12, 0.8, 6]} position={[0.2, -0.4, 0]}>
        <meshStandardMaterial color="#4169E1" roughness={0.7} />
      </Cylinder>

      {/* Nome do jogador */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        {player.nickname}
      </Text>

      {/* Barra de HP melhorada */}
      <Box position={[0, 2.5, 0]} args={[1.2, 0.15, 0.1]}>
        <meshStandardMaterial color="#333" />
      </Box>
      <Box
        position={[0, 2.5, 0.01]}
        args={[(player.hp / player.maxHp) * 1.2, 0.13, 0.08]}
      >
        <meshStandardMaterial
          color={
            player.hp / player.maxHp > 0.5
              ? "#00ff00"
              : player.hp / player.maxHp > 0.25
              ? "#ffff00"
              : "#ff0000"
          }
        />
      </Box>

      {/* Efeito de brilho para o jogador atual */}
      {isCurrentPlayer && (
        <Sphere args={[0.8, 16, 16]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#00ffff" transparent opacity={0.1} />
        </Sphere>
      )}
    </group>
  );
}

// Componente de partículas flutuantes
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.05;
    }
  });

  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 20 + 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#FFFFFF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface GameSceneProps {
  inventoryOpen: boolean;
  onInventoryToggle: () => void;
  interactionMessage: string | null;
  onInteractionMessage: (message: string | null) => void;
}

function GameScene({
  inventoryOpen,
  onInventoryToggle,
  interactionMessage,
  onInteractionMessage,
}: GameSceneProps) {
  const { players, currentPlayer, movePlayer } = useSocket();
  const controlsRef = useRef<any>(null);

  // Sistema de mapas expandido
  const [allMaps] = useState<Record<string, Map>>({
    town: {
      id: "town",
      name: "Vila Inicial",
      width: 40,
      height: 40,
      objects: [
        // Paredes externas
        {
          id: "wall1",
          type: "wall",
          x: -18,
          y: 0,
          z: 0,
          width: 1,
          height: 4,
          depth: 40,
          solid: true,
        },
        {
          id: "wall2",
          type: "wall",
          x: 18,
          y: 0,
          z: 0,
          width: 1,
          height: 4,
          depth: 40,
          solid: true,
        },
        {
          id: "wall3",
          type: "wall",
          x: 0,
          y: 0,
          z: -18,
          width: 40,
          height: 4,
          depth: 1,
          solid: true,
        },
        {
          id: "wall4",
          type: "wall",
          x: 0,
          y: 0,
          z: 18,
          width: 40,
          height: 4,
          depth: 1,
          solid: true,
        },

        // Árvores espalhadas
        {
          id: "tree1",
          type: "tree",
          x: -15,
          y: 0,
          z: -15,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree2",
          type: "tree",
          x: 15,
          y: 0,
          z: -15,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree3",
          type: "tree",
          x: -15,
          y: 0,
          z: 15,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree4",
          type: "tree",
          x: 15,
          y: 0,
          z: 15,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree5",
          type: "tree",
          x: -10,
          y: 0,
          z: -10,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree6",
          type: "tree",
          x: 10,
          y: 0,
          z: -10,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree7",
          type: "tree",
          x: -10,
          y: 0,
          z: 10,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree8",
          type: "tree",
          x: 10,
          y: 0,
          z: 10,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree9",
          type: "tree",
          x: 0,
          y: 0,
          z: -12,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },
        {
          id: "tree10",
          type: "tree",
          x: 0,
          y: 0,
          z: 12,
          width: 1,
          height: 4,
          depth: 1,
          solid: false,
        },

        // Rochas decorativas
        {
          id: "rock1",
          type: "rock",
          x: -12,
          y: 0,
          z: -12,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
        },
        {
          id: "rock2",
          type: "rock",
          x: 12,
          y: 0,
          z: -12,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
        },
        {
          id: "rock3",
          type: "rock",
          x: -12,
          y: 0,
          z: 12,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
        },
        {
          id: "rock4",
          type: "rock",
          x: 12,
          y: 0,
          z: 12,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
        },

        // Caixas de itens
        {
          id: "chest1",
          type: "chest",
          x: -15,
          y: 0,
          z: 0,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
          item: {
            id: "gold_coin",
            name: "Moeda de Ouro",
            type: "consumable",
            rarity: "common",
            stats: { hp: 10 },
            description: "Uma moeda de ouro valiosa.",
            icon: "💰",
          },
        },
        {
          id: "chest2",
          type: "chest",
          x: 15,
          y: 0,
          z: 0,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
          item: {
            id: "health_potion",
            name: "Poção de Vida",
            type: "consumable",
            rarity: "uncommon",
            stats: { hp: 50 },
            description: "Restaura 50 de HP.",
            icon: "💊",
          },
        },
        {
          id: "chest3",
          type: "chest",
          x: 0,
          y: 0,
          z: 15,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
          item: {
            id: "sword",
            name: "Espada de Madeira",
            type: "weapon",
            rarity: "common",
            stats: { attack: 5 },
            description: "Uma espada simples para iniciantes.",
            icon: "⚔️",
          },
        },
        {
          id: "chest4",
          type: "chest",
          x: 0,
          y: 0,
          z: -15,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
          item: {
            id: "shield",
            name: "Escudo de Madeira",
            type: "armor",
            rarity: "common",
            stats: { defense: 3 },
            description: "Um escudo leve para defender.",
            icon: "🛡️",
          },
        },

        // Portal para a caverna
        {
          id: "portal1",
          type: "portal",
          x: 0,
          y: 0,
          z: -16,
          width: 2,
          height: 3,
          depth: 1,
          solid: false,
          portalTo: "cave",
          portalSpawn: { x: 0, y: 0, z: 0 },
        },
      ],
      npcs: [
        {
          id: "merchant1",
          name: "Mercador",
          x: -8,
          y: 0,
          z: 8,
          type: "merchant",
          dialogue: ["Olá! Como posso ajudar?", "Vem comprar algo!"],
          isMoving: false,
          movementPattern: "static",
        },
        {
          id: "guard1",
          name: "Guarda",
          x: 8,
          y: 0,
          z: -8,
          type: "guard",
          dialogue: ["Quem é você?", "Não se aproxime!"],
          isMoving: false,
          movementPattern: "static",
        },
        {
          id: "quest1",
          name: "Guia de Missão",
          x: 0,
          y: 0,
          z: 0,
          type: "quest",
          dialogue: ["Preciso de ajuda para derrotar o dragão!"],
          isMoving: false,
          movementPattern: "static",
        },
        {
          id: "wanderer1",
          name: "Vagabundo",
          x: -12,
          y: 0,
          z: 0,
          type: "wanderer",
          dialogue: ["Onde está a cidade?", "Preciso de um guia."],
          isMoving: false,
          movementPattern: "static",
        },
      ],
      spawnPoints: [{ x: 0, y: 0, z: 0 }],
    },
    cave: {
      id: "cave",
      name: "Caverna Sombria",
      width: 30,
      height: 30,
      objects: [
        // Paredes da caverna
        {
          id: "cave_wall1",
          type: "wall",
          x: -14,
          y: 0,
          z: 0,
          width: 1,
          height: 5,
          depth: 30,
          solid: true,
        },
        {
          id: "cave_wall2",
          type: "wall",
          x: 14,
          y: 0,
          z: 0,
          width: 1,
          height: 5,
          depth: 30,
          solid: true,
        },
        {
          id: "cave_wall3",
          type: "wall",
          x: 0,
          y: 0,
          z: -14,
          width: 30,
          height: 5,
          depth: 1,
          solid: true,
        },
        {
          id: "cave_wall4",
          type: "wall",
          x: 0,
          y: 0,
          z: 14,
          width: 30,
          height: 5,
          depth: 1,
          solid: true,
        },

        // Estalactites (no teto)
        {
          id: "stalactite1",
          type: "rock",
          x: -10,
          y: 2,
          z: -10,
          width: 0.5,
          height: 2,
          depth: 0.5,
          solid: false,
        },
        {
          id: "stalactite2",
          type: "rock",
          x: 10,
          y: 2,
          z: -10,
          width: 0.5,
          height: 2,
          depth: 0.5,
          solid: false,
        },
        {
          id: "stalactite3",
          type: "rock",
          x: -10,
          y: 2,
          z: 10,
          width: 0.5,
          height: 2,
          depth: 0.5,
          solid: false,
        },
        {
          id: "stalactite4",
          type: "rock",
          x: 10,
          y: 2,
          z: 10,
          width: 0.5,
          height: 2,
          depth: 0.5,
          solid: false,
        },
        {
          id: "stalactite5",
          type: "rock",
          x: 0,
          y: 2,
          z: 0,
          width: 0.5,
          height: 2,
          depth: 0.5,
          solid: false,
        },

        // Estalagmites (no chão)
        {
          id: "stalagmite1",
          type: "rock",
          x: -8,
          y: 0,
          z: -8,
          width: 1,
          height: 2,
          depth: 1,
          solid: false,
        },
        {
          id: "stalagmite2",
          type: "rock",
          x: 8,
          y: 0,
          z: -8,
          width: 1,
          height: 2,
          depth: 1,
          solid: false,
        },
        {
          id: "stalagmite3",
          type: "rock",
          x: -8,
          y: 0,
          z: 8,
          width: 1,
          height: 2,
          depth: 1,
          solid: false,
        },
        {
          id: "stalagmite4",
          type: "rock",
          x: 8,
          y: 0,
          z: 8,
          width: 1,
          height: 2,
          depth: 1,
          solid: false,
        },

        // Cristais mágicos
        {
          id: "crystal1",
          type: "item",
          x: -5,
          y: 0,
          z: -5,
          width: 0.5,
          height: 1,
          depth: 0.5,
          solid: false,
          item: {
            id: "magic_crystal",
            name: "Cristal Mágico",
            type: "consumable",
            rarity: "rare",
            stats: { hp: 100 },
            description: "Um cristal brilhante com poder mágico.",
            icon: "💎",
          },
        },
        {
          id: "crystal2",
          type: "item",
          x: 5,
          y: 0,
          z: -5,
          width: 0.5,
          height: 1,
          depth: 0.5,
          solid: false,
          item: {
            id: "magic_crystal2",
            name: "Cristal Mágico",
            type: "consumable",
            rarity: "rare",
            stats: { hp: 100 },
            description: "Um cristal brilhante com poder mágico.",
            icon: "💎",
          },
        },

        // Baú da caverna
        {
          id: "cave_chest",
          type: "chest",
          x: 0,
          y: 0,
          z: 10,
          width: 1,
          height: 1,
          depth: 1,
          solid: false,
          item: {
            id: "cave_treasure",
            name: "Tesouro da Caverna",
            type: "consumable",
            rarity: "epic",
            stats: { hp: 200 },
            description: "Um tesouro antigo encontrado na caverna.",
            icon: "🏺",
          },
        },

        // Portal de volta para a vila
        {
          id: "portal2",
          type: "portal",
          x: 0,
          y: 0,
          z: 16,
          width: 2,
          height: 3,
          depth: 1,
          solid: false,
          portalTo: "town",
          portalSpawn: { x: 0, y: 0, z: -16 },
        },
      ],
      npcs: [
        {
          id: "cave_guardian",
          name: "Guardião da Caverna",
          x: 0,
          y: 0,
          z: 0,
          type: "guard",
          dialogue: ["Esta caverna é perigosa!", "Cuidado com os cristais!"],
          isMoving: false,
          movementPattern: "static",
        },
        {
          id: "cave_merchant",
          name: "Mercador da Caverna",
          x: -8,
          y: 0,
          z: 0,
          type: "merchant",
          dialogue: ["Bem-vindo à caverna!", "Tenho itens especiais aqui!"],
          isMoving: false,
          movementPattern: "static",
        },
      ],
      spawnPoints: [{ x: 0, y: 0, z: 0 }],
    },
  });

  const [currentMap, setCurrentMap] = useState<Map>(allMaps.town);

  // Debug logs (apenas quando necessário)
  console.log("GameScene - players count:", Object.keys(players).length);
  console.log("GameScene - currentPlayer:", currentPlayer?.nickname);

  const handlePlayerMove = (x: number, y: number, z: number) => {
    // Verificar colisões
    if ((window as any).checkCollision) {
      const canMove = (window as any).checkCollision(x, y, z);
      if (!canMove) {
        onInteractionMessage("Você não pode passar por aqui!");
        setTimeout(() => onInteractionMessage(null), 2000);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentPlayer) {
        console.log("currentPlayer é null, ignorando tecla");
        return;
      }

      const moveSpeed = 0.5;
      let newX = currentPlayer.x;
      let newY = currentPlayer.y;
      let newZ = currentPlayer.z;

      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          newZ -= moveSpeed;
          break;
        case "s":
        case "arrowdown":
          newZ += moveSpeed;
          break;
        case "a":
        case "arrowleft":
          newX -= moveSpeed;
          break;
        case "d":
        case "arrowright":
          newX += moveSpeed;
          break;
        case " ":
          event.preventDefault();
          newY += moveSpeed;
          break;
        case "shift":
          newY -= moveSpeed;
          break;
        case "i":
          event.preventDefault();
          onInventoryToggle();
          return;
        case "e":
          event.preventDefault();
          // Interagir com objetos próximos
          checkNearbyInteractions();
          // Verificar se está próximo a um portal
          checkPortalInteraction();
          return;
        default:
          return;
      }

      // Verificar se pode mover
      if (handlePlayerMove(newX, newY, newZ)) {
        console.log("Movendo para:", { x: newX, y: newY, z: newZ });
        movePlayer({ x: newX, y: newY, z: newZ });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPlayer, movePlayer, inventoryOpen]);

  const checkNearbyInteractions = () => {
    if (!currentPlayer) return;

    const interactionRange = 2;

    // Verificar NPCs próximos
    for (const npc of currentMap.npcs) {
      const distance = Math.sqrt(
        Math.pow(currentPlayer.x - npc.x, 2) +
          Math.pow(currentPlayer.z - npc.z, 2)
      );

      if (distance <= interactionRange) {
        onInteractionMessage(`${npc.name}: ${npc.dialogue[0]}`);
        setTimeout(() => onInteractionMessage(null), 3000);
        return;
      }
    }

    // Verificar objetos próximos
    for (const obj of currentMap.objects) {
      if (obj.type === "item") {
        const distance = Math.sqrt(
          Math.pow(currentPlayer.x - obj.x, 2) +
            Math.pow(currentPlayer.z - obj.z, 2)
        );

        if (distance <= interactionRange) {
          onInteractionMessage(`Pressione E para coletar ${obj.item?.name}`);
          setTimeout(() => onInteractionMessage(null), 2000);
          return;
        }
      } else if (obj.type === "portal") {
        const distance = Math.sqrt(
          Math.pow(currentPlayer.x - obj.x, 2) +
            Math.pow(currentPlayer.z - obj.z, 2)
        );

        if (distance <= interactionRange) {
          onInteractionMessage(`Pressione E para entrar no portal`);
          setTimeout(() => onInteractionMessage(null), 2000);
          return;
        }
      }
    }
  };

  const checkPortalInteraction = () => {
    if (!currentPlayer) return;

    const interactionRange = 2;

    // Verificar portais próximos
    for (const obj of currentMap.objects) {
      if (obj.type === "portal" && obj.portalTo) {
        const distance = Math.sqrt(
          Math.pow(currentPlayer.x - obj.x, 2) +
            Math.pow(currentPlayer.z - obj.z, 2)
        );

        if (distance <= interactionRange) {
          // Teleportar para o mapa de destino
          const targetMap = allMaps[obj.portalTo];
          if (targetMap && obj.portalSpawn) {
            console.log(`Teleportando para ${targetMap.name}`);
            setCurrentMap(targetMap);

            // Mover o jogador para a posição de spawn
            movePlayer({
              x: obj.portalSpawn.x,
              y: obj.portalSpawn.y,
              z: obj.portalSpawn.z,
            });

            onInteractionMessage(`Teleportado para ${targetMap.name}!`);
            setTimeout(() => onInteractionMessage(null), 3000);
          }
          return;
        }
      }
    }
  };

  return (
    <>
      {/* Céu estrelado */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Iluminação ambiente suave */}
      <ambientLight
        intensity={currentMap.id === "cave" ? 0.2 : 0.4}
        color={currentMap.id === "cave" ? "#1a1a2e" : "#87CEEB"}
      />

      {/* Luz direcional principal (sol) */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={currentMap.id === "cave" ? 0.3 : 1.2}
        color={currentMap.id === "cave" ? "#4a4a6e" : "#FFF8DC"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Luz de preenchimento */}
      <directionalLight
        position={[-5, 10, -5]}
        intensity={currentMap.id === "cave" ? 0.1 : 0.3}
        color={currentMap.id === "cave" ? "#2d2d4a" : "#E6E6FA"}
      />

      {/* Luz pontual para efeito de fogo/lanterna */}
      <pointLight
        position={[0, 3, 0]}
        intensity={currentMap.id === "cave" ? 0.8 : 0.5}
        color={currentMap.id === "cave" ? "#4169E1" : "#FFA500"}
        distance={currentMap.id === "cave" ? 15 : 10}
      />

      {/* Luzes especiais para caverna */}
      {currentMap.id === "cave" && (
        <>
          <pointLight
            position={[-8, 2, -8]}
            intensity={0.3}
            color="#00FFFF"
            distance={8}
          />
          <pointLight
            position={[8, 2, 8]}
            intensity={0.3}
            color="#00FFFF"
            distance={8}
          />
        </>
      )}

      {/* Névoa atmosférica */}
      <fog
        attach="fog"
        args={[currentMap.id === "cave" ? "#1a1a2e" : "#87CEEB", 10, 50]}
      />

      {/* Partículas flutuantes */}
      <FloatingParticles />

      {/* Sistema de mapa */}
      <MapSystem
        currentMap={currentMap}
        onPlayerMove={(x: number, y: number, z: number) => {
          const canMove = (window as any).checkCollision(x, y, z);
          if (canMove) {
            movePlayer({ x, y, z });
            return true;
          }
          return false;
        }}
      />

      {/* Debug info */}
      <Text position={[0, 3, 0]} fontSize={0.5} color="white">
        Players: {Object.keys(players).length} | Current:{" "}
        {currentPlayer?.nickname || "None"}
      </Text>

      {/* Mapa atual */}
      <Text position={[0, 2.4, 0]} fontSize={0.3} color="white">
        Mapa: {currentMap.name}
      </Text>

      {/* Status de conexão */}
      <Text
        position={[0, 2.7, 0]}
        fontSize={0.3}
        color={currentPlayer ? "#00ff00" : "#ff0000"}
      >
        {currentPlayer ? "✅ Conectado" : "⏳ Conectando..."}
      </Text>

      {/* Controles */}
      <Text position={[0, 2.5, 0]} fontSize={0.3} color="white">
        WASD: Mover | E: Interagir | I: Inventário
      </Text>

      {/* Render all players */}
      {Object.values(players).map((player) => (
        <PlayerCharacter
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === currentPlayer?.id}
        />
      ))}

      {/* Fallback: Mostrar personagem de teste se não há jogadores ou currentPlayer */}
      {(!currentPlayer || Object.keys(players).length === 0) && (
        <PlayerCharacter
          key="test-player"
          player={{
            id: "test",
            nickname: currentPlayer?.nickname || "Conectando...",
            x: 0,
            y: 0,
            z: 0,
            color: "#FF6B6B",
            level: 1,
            hp: 100,
            maxHp: 100,
            attack: 10,
            defense: 5,
            experience: 0,
            inventory: [],
            equipped: {
              weapon: undefined,
              armor: undefined,
              accessory: undefined,
            },
          }}
          isCurrentPlayer={true}
        />
      )}
    </>
  );
}

interface Game3DProps {
  inventoryOpen: boolean;
  onInventoryToggle: () => void;
  interactionMessage: string | null;
  onInteractionMessage: (message: string | null) => void;
}

export default function Game3D({
  inventoryOpen,
  onInventoryToggle,
  interactionMessage,
  onInteractionMessage,
}: Game3DProps) {
  return (
    <div className="game-container">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <GameScene
          inventoryOpen={inventoryOpen}
          onInventoryToggle={onInventoryToggle}
          interactionMessage={interactionMessage}
          onInteractionMessage={onInteractionMessage}
        />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
