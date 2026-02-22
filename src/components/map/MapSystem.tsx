'use client';

import { useEffect } from 'react';
import { GameMap } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { MapObjectComponent } from './objects/MapObjectComponent';
import { NPCComponent } from './npc/NPCComponent';
import { Ground } from './Ground';

interface MapSystemProps {
  currentMap: GameMap;
}

export default function MapSystem({ currentMap }: MapSystemProps) {
  const checkCollision = (x: number, y: number, z: number) => {
    for (const obj of currentMap.objects) {
      if (!obj.solid) continue;
      const playerSize = 0.5;
      if (
        x + playerSize > obj.x - obj.width / 2 &&
        x - playerSize < obj.x + obj.width / 2 &&
        y + playerSize > obj.y - obj.height / 2 &&
        y - playerSize < obj.y + obj.height / 2 &&
        z + playerSize > obj.z - obj.depth / 2 &&
        z - playerSize < obj.z + obj.depth / 2
      ) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    useGameStore.getState().setCheckCollision(checkCollision);
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
