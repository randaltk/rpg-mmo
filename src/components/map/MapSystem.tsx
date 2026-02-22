'use client';

import { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { GameMap, MapObject } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { getHeightAt, createTerrainSampler } from '@/lib/worldgen/terrain';
import { createBiomeSampler } from '@/lib/worldgen/biomes';
import { generateChunkObjects, OBJ_CHUNK_SIZE } from '@/lib/worldgen/objects';
import { TOWN_SEED } from '@/data/maps/town';
import { MapObjectComponent } from './objects/MapObjectComponent';
import { NPCComponent } from './npc/NPCComponent';
import { Ground } from './Ground';

const OBJECT_VIEW_DIST = 70;
const OBJECT_VIEW_DIST_SQ = OBJECT_VIEW_DIST * OBJECT_VIEW_DIST;
const CHUNK_SIZE = OBJ_CHUNK_SIZE;
const UPDATE_INTERVAL = 0.3;
const CHUNK_DISCARD_DIST = 5;

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
  const isTown = currentMap.id === 'town';
  const isInfinite = !!(currentMap.infinite ?? isTown);

  const resolvedSamplers = useMemo(() => {
    if (currentMap.terrainSampler && currentMap.biomeSampler) {
      return { terrain: currentMap.terrainSampler, biome: currentMap.biomeSampler };
    }
    if (!isTown) return null;
    return { terrain: createTerrainSampler(TOWN_SEED), biome: createBiomeSampler(TOWN_SEED) };
  }, [currentMap.terrainSampler, currentMap.biomeSampler, isTown]);

  const samplers = useRef(resolvedSamplers);
  samplers.current = resolvedSamplers;

  const chunkMapRef = useRef<ChunkMap>({});
  const infiniteChunkCacheRef = useRef<Map<string, MapObject[]>>(new Map());
  const [visibleObjects, setVisibleObjects] = useState<MapObject[]>([]);
  const timerRef = useRef(0);
  const lastChunkKeyRef = useRef('');

  useEffect(() => {
    if (!isInfinite) {
      chunkMapRef.current = buildChunkMap(currentMap.objects);
    }
    lastChunkKeyRef.current = '';
    infiniteChunkCacheRef.current.clear();
  }, [currentMap.objects, isInfinite]);

  const getOrGenerateChunk = useCallback((cx: number, cz: number): MapObject[] => {
    const key = `${cx},${cz}`;
    const cache = infiniteChunkCacheRef.current;
    if (cache.has(key)) return cache.get(key)!;

    const s = samplers.current;
    if (!s) return [];
    const objs = generateChunkObjects(cx, cz, TOWN_SEED, s.biome, s.terrain);
    cache.set(key, objs);
    return objs;
  }, []);

  const checkCollision = useCallback((x: number, _y: number, _z: number) => {
    if (!isInfinite) {
      const halfW = currentMap.width / 2;
      const halfH = currentMap.height / 2;
      if (x < -halfW + 1 || x > halfW - 1 || _z < -halfH + 1 || _z > halfH - 1) {
        return false;
      }
    }

    const s = samplers.current;
    if (s) {
      const terrainY = s.terrain(x, _z);
      const slopeDiff = Math.abs(terrainY - _y);
      if (slopeDiff > 3) return false;
    } else if (currentMap.heightmap && currentMap.heightmapResolution) {
      const terrainY = getHeightAt(x, _z, currentMap.heightmap, currentMap.width, currentMap.height, currentMap.heightmapResolution);
      if (terrainY > 10) return false;
    }

    for (const obj of currentMap.objects) {
      if (!obj.solid) continue;
      const playerSize = 0.5;
      if (
        x + playerSize > obj.x - obj.width / 2 &&
        x - playerSize < obj.x + obj.width / 2 &&
        _y + playerSize > obj.y - obj.height / 2 &&
        _y - playerSize < obj.y + obj.height / 2 &&
        _z + playerSize > obj.z - obj.depth / 2 &&
        _z - playerSize < obj.z + obj.depth / 2
      ) {
        return false;
      }
    }
    return true;
  }, [currentMap, isInfinite]);

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
    const visible: MapObject[] = [];

    if (isInfinite) {
      const pcx = Math.floor(px / CHUNK_SIZE);
      const pcz = Math.floor(pz / CHUNK_SIZE);

      for (const key of keys) {
        const [cx, cz] = key.split(',').map(Number);
        const objs = getOrGenerateChunk(cx, cz);
        for (const obj of objs) {
          const dx = obj.x - px;
          const dz = obj.z - pz;
          if (dx * dx + dz * dz < OBJECT_VIEW_DIST_SQ) {
            visible.push(obj);
          }
        }
      }

      // Prune distant chunks
      const cache = infiniteChunkCacheRef.current;
      Array.from(cache.keys()).forEach(cacheKey => {
        const [cx, cz] = cacheKey.split(',').map(Number);
        if (Math.abs(cx - pcx) > CHUNK_DISCARD_DIST || Math.abs(cz - pcz) > CHUNK_DISCARD_DIST) {
          cache.delete(cacheKey);
        }
      });
    } else {
      const chunks = chunkMapRef.current;
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
    }

    for (const obj of currentMap.objects) {
      if ((obj.type === 'portal' || obj.type === 'chest') && !visible.includes(obj)) {
        visible.push(obj);
      }
    }

    setVisibleObjects(visible);

    const portals = visible.filter(o => o.type === 'portal' && o.portalTo?.startsWith('dungeon_'));
    useGameStore.getState().setNearbyPortals(portals);
  });

  useEffect(() => {
    const pos = useGameStore.getState().localPlayerPos;
    const px = pos?.x ?? 0;
    const pz = pos?.z ?? 0;
    const keys = getVisibleChunkKeys(px, pz);
    const visible: MapObject[] = [];

    if (isInfinite) {
      for (const key of keys) {
        const [cx, cz] = key.split(',').map(Number);
        const objs = getOrGenerateChunk(cx, cz);
        for (const obj of objs) {
          const dx = obj.x - px;
          const dz = obj.z - pz;
          if (dx * dx + dz * dz < OBJECT_VIEW_DIST_SQ) {
            visible.push(obj);
          }
        }
      }
    } else {
      const chunks = chunkMapRef.current;
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
    }

    for (const obj of currentMap.objects) {
      if ((obj.type === 'portal' || obj.type === 'chest') && !visible.includes(obj)) {
        visible.push(obj);
      }
    }
    setVisibleObjects(visible);
  }, [currentMap, isInfinite, getOrGenerateChunk]);

  return (
    <>
      <VisibleObjects objects={visibleObjects} />

      {currentMap.npcs.map((npc) => (
        <NPCComponent key={npc.id} npc={npc} />
      ))}

      <Ground currentMap={currentMap} />
    </>
  );
}
