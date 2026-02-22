'use client';

import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { GameMap, MapObject } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { getHeightAt } from '@/lib/worldgen/terrain';
import { MapObjectComponent } from './objects/MapObjectComponent';
import { NPCComponent } from './npc/NPCComponent';
import { Ground } from './Ground';

const OBJECT_VIEW_DIST = 70;
const OBJECT_VIEW_DIST_SQ = OBJECT_VIEW_DIST * OBJECT_VIEW_DIST;
const CHUNK_SIZE = 30;
const UPDATE_INTERVAL = 0.3;

interface ChunkMap {
  [key: string]: MapObject[];
}

function buildChunkMap(objects: MapObject[]): ChunkMap {
  const chunks: ChunkMap = {};
  for (const obj of objects) {
    const cx = Math.floor(obj.x / CHUNK_SIZE);
    const cz = Math.floor(obj.z / CHUNK_SIZE);
    const key = `${cx},${cz}`;
    if (!chunks[key]) chunks[key] = [];
    chunks[key].push(obj);
  }
  return chunks;
}

function getVisibleChunkKeys(px: number, pz: number): string[] {
  const radius = Math.ceil(OBJECT_VIEW_DIST / CHUNK_SIZE);
  const cx = Math.floor(px / CHUNK_SIZE);
  const cz = Math.floor(pz / CHUNK_SIZE);
  const keys: string[] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      keys.push(`${cx + dx},${cz + dz}`);
    }
  }
  return keys;
}

const VisibleObjects = memo(function VisibleObjects({
  objects,
}: {
  objects: MapObject[];
}) {
  return (
    <>
      {objects.map((obj) => (
        <MapObjectComponent key={obj.id} obj={obj} />
      ))}
    </>
  );
});

interface MapSystemProps {
  currentMap: GameMap;
}

export default function MapSystem({ currentMap }: MapSystemProps) {
  const chunkMapRef = useRef<ChunkMap>({});
  const [visibleObjects, setVisibleObjects] = useState<MapObject[]>([]);
  const timerRef = useRef(0);
  const lastChunkKeyRef = useRef('');

  useEffect(() => {
    chunkMapRef.current = buildChunkMap(currentMap.objects);
  }, [currentMap.objects]);

  const checkCollision = useCallback((x: number, y: number, z: number) => {
    const halfW = currentMap.width / 2;
    const halfH = currentMap.height / 2;
    if (x < -halfW + 1 || x > halfW - 1 || z < -halfH + 1 || z > halfH - 1) {
      return false;
    }

    if (currentMap.heightmap && currentMap.heightmapResolution) {
      const terrainY = getHeightAt(x, z, currentMap.heightmap, currentMap.width, currentMap.height, currentMap.heightmapResolution);
      const maxSlope = 10;
      if (terrainY > maxSlope) return false;
    }

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
  }, [currentMap]);

  useEffect(() => {
    useGameStore.getState().setCheckCollision(checkCollision);
  }, [checkCollision]);

  useFrame((_, delta) => {
    timerRef.current += delta;
    if (timerRef.current < UPDATE_INTERVAL) return;
    timerRef.current = 0;

    const pos = useGameStore.getState().localPlayerPos;
    if (!pos) return;

    const px = pos.x;
    const pz = pos.z;
    const chunkKey = `${Math.floor(px / CHUNK_SIZE)},${Math.floor(pz / CHUNK_SIZE)}`;
    if (chunkKey === lastChunkKeyRef.current) return;
    lastChunkKeyRef.current = chunkKey;

    const keys = getVisibleChunkKeys(px, pz);
    const chunks = chunkMapRef.current;
    const visible: MapObject[] = [];

    for (const key of keys) {
      const objs = chunks[key];
      if (!objs) continue;
      for (const obj of objs) {
        const dx = obj.x - px;
        const dz = obj.z - pz;
        if (dx * dx + dz * dz < OBJECT_VIEW_DIST_SQ) {
          visible.push(obj);
        }
      }
    }

    for (const obj of currentMap.objects) {
      if ((obj.type === 'portal' || obj.type === 'chest') && !visible.includes(obj)) {
        visible.push(obj);
      }
    }

    setVisibleObjects(visible);
  });

  useEffect(() => {
    const pos = useGameStore.getState().localPlayerPos;
    const px = pos?.x ?? 0;
    const pz = pos?.z ?? 0;
    const keys = getVisibleChunkKeys(px, pz);
    const chunks = chunkMapRef.current;
    const visible: MapObject[] = [];
    for (const key of keys) {
      const objs = chunks[key];
      if (!objs) continue;
      for (const obj of objs) {
        const dx = obj.x - px;
        const dz = obj.z - pz;
        if (dx * dx + dz * dz < OBJECT_VIEW_DIST_SQ) {
          visible.push(obj);
        }
      }
    }
    for (const obj of currentMap.objects) {
      if ((obj.type === 'portal' || obj.type === 'chest') && !visible.includes(obj)) {
        visible.push(obj);
      }
    }
    setVisibleObjects(visible);
  }, [currentMap]);

  return (
    <>
      <VisibleObjects objects={visibleObjects} />

      {currentMap.npcs.map((npc) => (
        <NPCComponent key={npc.id} npc={npc} />
      ))}

      <Ground
        mapId={currentMap.id}
        width={currentMap.width}
        height={currentMap.height}
        heightmap={currentMap.heightmap}
        resolution={currentMap.heightmapResolution}
        biomeMap={currentMap.biomeMap}
      />
    </>
  );
}
