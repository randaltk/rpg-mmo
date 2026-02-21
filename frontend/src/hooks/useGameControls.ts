"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Map } from "@/types/game";
import { allMaps } from "@/data/maps";

interface UseGameControlsProps {
  currentPlayer: { x: number; y: number; z: number } | null;
  movePlayer: (pos: { x: number; y: number; z: number }) => void;
  onInventoryToggle: () => void;
  onInteractionMessage: (msg: string | null) => void;
}

export function useGameControls({
  currentPlayer,
  movePlayer,
  onInventoryToggle,
  onInteractionMessage,
}: UseGameControlsProps) {
  const [currentMap, setCurrentMap] = useState<Map>(allMaps.town);
  const currentMapRef = useRef(currentMap);
  currentMapRef.current = currentMap;

  const checkCollision = useCallback(
    (x: number, y: number, z: number) => {
      if ((window as any).checkCollision) {
        return (window as any).checkCollision(x, y, z);
      }
      return true;
    },
    []
  );

  const checkAutoPortal = useCallback(
    (px: number, pz: number) => {
      const portalRange = 2;
      const map = currentMapRef.current;

      for (const obj of map.objects) {
        if (obj.type === "portal" && obj.portalTo) {
          const dist = Math.sqrt(
            Math.pow(px - obj.x, 2) + Math.pow(pz - obj.z, 2)
          );

          if (dist <= portalRange) {
            const targetMap = allMaps[obj.portalTo];
            if (targetMap && obj.portalSpawn) {
              setCurrentMap(targetMap);
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
    },
    [movePlayer, onInteractionMessage]
  );

  const checkNearbyInteractions = useCallback(() => {
    if (!currentPlayer) return;
    const interactionRange = 2;
    const map = currentMapRef.current;

    for (const npc of map.npcs) {
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

    for (const obj of map.objects) {
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
      }
    }
  }, [currentPlayer, onInteractionMessage]);

  useEffect(() => {
    const getCameraYaw = (): number => {
      const ref = (window as any).__cameraYaw;
      return ref?.current ?? 0;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentPlayer) return;

      const moveSpeed = 0.5;
      const yaw = getCameraYaw();
      const sinYaw = Math.sin(yaw);
      const cosYaw = Math.cos(yaw);

      let dx = 0;
      let dz = 0;

      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          dx = -sinYaw;
          dz = -cosYaw;
          break;
        case "s":
        case "arrowdown":
          dx = sinYaw;
          dz = cosYaw;
          break;
        case "a":
        case "arrowleft":
          dx = -cosYaw;
          dz = sinYaw;
          break;
        case "d":
        case "arrowright":
          dx = cosYaw;
          dz = -sinYaw;
          break;
        case "i":
          event.preventDefault();
          onInventoryToggle();
          return;
        case "e":
          event.preventDefault();
          checkNearbyInteractions();
          return;
        default:
          return;
      }

      const newX = currentPlayer.x + dx * moveSpeed;
      const newY = currentPlayer.y;
      const newZ = currentPlayer.z + dz * moveSpeed;

      if (checkCollision(newX, newY, newZ)) {
        movePlayer({ x: newX, y: newY, z: newZ });
        checkAutoPortal(newX, newZ);
      } else {
        onInteractionMessage("Você não pode passar por aqui!");
        setTimeout(() => onInteractionMessage(null), 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPlayer, movePlayer, onInventoryToggle, checkCollision, checkAutoPortal, checkNearbyInteractions]);

  return { currentMap };
}
