import type { MapObject, BiomeType, PortalTier } from '@/types/game';
import type { HeightSampler } from './terrain';
import type { BiomeSampler } from './biomes';
import { hashCoord, createSeededRNG } from './seed';

const PORTAL_SEED_OFFSET = 5555;
const SAFE_RADIUS = 60;

const BIOME_PORTAL_CHANCE: Record<BiomeType, number> = {
  plains: 0.04,
  forest: 0.06,
  swamp: 0.06,
  rocky: 0.10,
  ruins: 0.12,
};

const TIER_LABELS: Record<PortalTier, string> = {
  easy: 'Caverna Fácil',
  medium: 'Caverna Média',
  hard: 'Caverna Difícil',
  boss: 'Caverna do Boss',
};

function getTierByDistance(dist: number): PortalTier {
  if (dist < 150) return 'easy';
  if (dist < 250) return 'medium';
  if (dist < 400) return 'hard';
  return 'boss';
}

export function generateChunkPortal(
  chunkX: number,
  chunkZ: number,
  chunkSize: number,
  seed: number,
  biomeSampler: BiomeSampler,
  heightSampler: HeightSampler,
): MapObject | null {
  const portalHash = hashCoord(chunkX, chunkZ, seed + PORTAL_SEED_OFFSET);
  const rng = createSeededRNG(portalHash);

  const centerX = chunkX * chunkSize + chunkSize / 2;
  const centerZ = chunkZ * chunkSize + chunkSize / 2;
  const distFromOrigin = Math.sqrt(centerX * centerX + centerZ * centerZ);

  if (distFromOrigin < SAFE_RADIUS) return null;

  const biome = biomeSampler(centerX, centerZ);
  const chance = BIOME_PORTAL_CHANCE[biome] ?? 0.003;

  if (rng() > chance) return null;

  const x = chunkX * chunkSize + rng() * chunkSize;
  const z = chunkZ * chunkSize + rng() * chunkSize;
  const y = heightSampler(x, z);

  if (y > 8) return null;

  const tier = getTierByDistance(distFromOrigin);
  const caveSeed = hashCoord(chunkX, chunkZ, seed + PORTAL_SEED_OFFSET + 1000);

  return {
    id: `portal_dg_${chunkX}_${chunkZ}`,
    type: 'portal',
    x, y, z,
    width: 2,
    height: 3,
    depth: 1,
    solid: false,
    portalTo: `dungeon_${caveSeed}`,
    portalTier: tier,
    portalSpawn: { x: 0, y: 0, z: 0 },
  };
}
