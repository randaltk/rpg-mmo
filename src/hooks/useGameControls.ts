"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Map } from "@/types/game";
import { allMaps } from "@/data/maps";

interface UseGameControlsProps {
  currentPlayer: { x: number; y: number; z: number } | null;
  movePlayer: (pos: { x: number; y: number; z: number }) => void;
  emitMove: (pos: { x: number; y: number; z: number }) => void;
  onInventoryToggle: () => void;
  onInteractionMessage: (msg: string | null) => void;
}

export function useGameControls({
  currentPlayer,
  movePlayer,
  emitMove,
  onInventoryToggle,
  onInteractionMessage,
}: UseGameControlsProps) {
  const [currentMap, setCurrentMap] = useState<Map>(allMaps.castle);
  const currentMapRef = useRef(currentMap);
  currentMapRef.current = currentMap;

  const keysPressed = useRef(new Set<string>());
  const currentPlayerRef = useRef(currentPlayer);
  currentPlayerRef.current = currentPlayer;

  const movePlayerRef = useRef(movePlayer);
  movePlayerRef.current = movePlayer;
  const emitMoveRef = useRef(emitMove);
  emitMoveRef.current = emitMove;

  const checkCollision = useCallback(
    (x: number, y: number, z: number) => {
      if ((window as any).checkCollision) {
        return (window as any).checkCollision(x, y, z);
      }
      return true;
    },
    []
  );

  const portalCooldownRef = useRef(0);

  const checkAutoPortal = useCallback(
    (px: number, pz: number) => {
      if (Date.now() < portalCooldownRef.current) return;

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
              portalCooldownRef.current = Date.now() + 2000;
              setCurrentMap(targetMap);
              const spawnPos = { x: obj.portalSpawn.x, y: obj.portalSpawn.y, z: obj.portalSpawn.z };
              (window as any).__teleportTo = spawnPos;
              movePlayerRef.current(spawnPos);
              onInteractionMessage(`Teleportado para ${targetMap.name}!`);
              setTimeout(() => onInteractionMessage(null), 3000);
            }
            return;
          }
        }
      }
    },
    [onInteractionMessage]
  );

  const checkNearbyInteractions = useCallback(() => {
    const player = currentPlayerRef.current;
    if (!player) return;
    const interactionRange = 2;
    const map = currentMapRef.current;

    for (const npc of map.npcs) {
      const distance = Math.sqrt(
        Math.pow(player.x - npc.x, 2) +
          Math.pow(player.z - npc.z, 2)
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
          Math.pow(player.x - obj.x, 2) +
            Math.pow(player.z - obj.z, 2)
        );
        if (distance <= interactionRange) {
          onInteractionMessage(`Pressione E para coletar ${obj.item?.name}`);
          setTimeout(() => onInteractionMessage(null), 2000);
          return;
        }
      }
    }
  }, [onInteractionMessage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "i") {
        event.preventDefault();
        onInventoryToggle();
        return;
      }
      if (key === "e") {
        event.preventDefault();
        checkNearbyInteractions();
        return;
      }
      if (key === "escape") {
        event.preventDefault();
        if ((window as any).__clearTarget) {
          (window as any).__clearTarget();
        }
        return;
      }

      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };

    const handleBlur = () => {
      keysPressed.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [onInventoryToggle, checkNearbyInteractions]);

  useEffect(() => {
    const localPos = { x: 0, y: 0, z: 0 };
    let initialized = false;
    let lastEmitTime = 0;
    let lastTime = performance.now();
    let wasMoving = false;
    let animFrame: number;
    let loopCount = 0;
    let loopLogTime = performance.now();
    let maxLoopMs = 0;

    const MOVE_SPEED = 7.0;
    const EMIT_INTERVAL = 100;

    const gameLoop = () => {
      const loopStart = performance.now();
      const now = loopStart;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const player = currentPlayerRef.current;
      const keys = keysPressed.current;

      if (player) {
        if (!initialized) {
          localPos.x = player.x;
          localPos.y = player.y;
          localPos.z = player.z;
          initialized = true;
        }

        const teleport = (window as any).__teleportTo as { x: number; y: number; z: number } | null;
        if (teleport) {
          localPos.x = teleport.x;
          localPos.y = teleport.y;
          localPos.z = teleport.z;
          (window as any).__teleportTo = null;
        }

        let dx = 0;
        let dz = 0;

        if (keys.size > 0) {
          const yaw = (window as any).__cameraYaw?.current ?? 0;
          const sinYaw = Math.sin(yaw);
          const cosYaw = Math.cos(yaw);

          if (keys.has("w") || keys.has("arrowup")) { dx -= sinYaw; dz -= cosYaw; }
          if (keys.has("s") || keys.has("arrowdown")) { dx += sinYaw; dz += cosYaw; }
          if (keys.has("a") || keys.has("arrowleft")) { dx -= cosYaw; dz += sinYaw; }
          if (keys.has("d") || keys.has("arrowright")) { dx += cosYaw; dz -= sinYaw; }
        }

        let keyMoving = dx !== 0 || dz !== 0;

        if (!keyMoving) {
          const combatTarget = (window as any).__combatTarget as { id: string } | null;
          if (combatTarget) {
            const monsters = (window as any).__monstersData as Array<{ id: string; x: number; z: number; state: string }> | null;
            const target = monsters?.find(m => m.id === combatTarget.id);
            if (target && target.state !== "dead") {
              const tdx = target.x - localPos.x;
              const tdz = target.z - localPos.z;
              const dist = Math.sqrt(tdx * tdx + tdz * tdz);
              if (dist > 2.0) {
                dx = tdx / dist;
                dz = tdz / dist;
              }
            }
          }
        }

        const isMoving = dx !== 0 || dz !== 0;

        if (isMoving) {
          const len = Math.sqrt(dx * dx + dz * dz);
          dx /= len;
          dz /= len;

          (window as any).__moveDirection = { x: dx, z: dz };

          const newX = localPos.x + dx * MOVE_SPEED * dt;
          const newZ = localPos.z + dz * MOVE_SPEED * dt;

          if (checkCollision(newX, localPos.y, newZ)) {
            localPos.x = newX;
            localPos.z = newZ;
          }

          if (now - lastEmitTime > EMIT_INTERVAL) {
            lastEmitTime = now;
            emitMoveRef.current({ x: localPos.x, y: localPos.y, z: localPos.z });
            checkAutoPortal(localPos.x, localPos.z);
          }
        } else {
          (window as any).__moveDirection = null;

          if (wasMoving) {
            movePlayerRef.current({ x: localPos.x, y: localPos.y, z: localPos.z });
          }
        }

        wasMoving = isMoving;
        (window as any).__localPlayerPos = localPos;
      }

      const loopEnd = performance.now();
      const loopMs = loopEnd - loopStart;
      if (loopMs > maxLoopMs) maxLoopMs = loopMs;
      loopCount++;
      if (now - loopLogTime > 3000) {
        console.log(`[PERF gameLoop] ticks/3s: ${loopCount} | maxTick: ${maxLoopMs.toFixed(2)}ms | emitInterval: ${EMIT_INTERVAL}ms`);
        loopCount = 0;
        loopLogTime = now;
        maxLoopMs = 0;
      }

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animFrame);
      (window as any).__moveDirection = null;
      (window as any).__localPlayerPos = null;
    };
  }, [checkCollision, checkAutoPortal]);

  return { currentMap };
}
