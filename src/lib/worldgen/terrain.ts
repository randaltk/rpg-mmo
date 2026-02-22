import { createNoise2D } from 'simplex-noise';
import { createSeededRNG } from './seed';

export interface TerrainConfig {
  width: number;
  height: number;
  resolution: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  amplitude: number;
  scale: number;
  safeRadius: number;
  minHeight: number;
  maxHeight: number;
}

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  width: 400,
  height: 400,
  resolution: 128,
  octaves: 5,
  persistence: 0.48,
  lacunarity: 2.0,
  amplitude: 7.0,
  scale: 0.012,
  safeRadius: 35,
  minHeight: -1.5,
  maxHeight: 12.0,
};

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Generates a heightmap using multi-octave simplex noise.
 * Returns a Float32Array of size (resolution+1)^2 representing heights.
 * Layout: row-major, index = z * (resolution+1) + x
 */
export function generateHeightmap(seed: number, config: TerrainConfig = DEFAULT_TERRAIN_CONFIG): Float32Array {
  const rng = createSeededRNG(seed);
  const noise2D = createNoise2D(rng);

  const res = config.resolution + 1;
  const heightmap = new Float32Array(res * res);

  const halfW = config.width / 2;
  const halfH = config.height / 2;

  for (let iz = 0; iz < res; iz++) {
    for (let ix = 0; ix < res; ix++) {
      const worldX = (ix / config.resolution) * config.width - halfW;
      const worldZ = (iz / config.resolution) * config.height - halfH;

      let h = 0;
      let amp = config.amplitude;
      let freq = config.scale;

      for (let o = 0; o < config.octaves; o++) {
        h += noise2D(worldX * freq, worldZ * freq) * amp;
        amp *= config.persistence;
        freq *= config.lacunarity;
      }

      // Flatten center safe zone, then let terrain rise naturally
      const centerDist = Math.sqrt(worldX * worldX + worldZ * worldZ);
      const rampEnd = config.safeRadius * 1.5;

      if (centerDist < config.safeRadius) {
        h *= 0;
      } else if (centerDist < rampEnd) {
        h *= smoothstep(config.safeRadius, rampEnd, centerDist);
      }

      // Amplify edges for natural mountain walls (only very close to boundary)
      const edgeDist = Math.min(
        halfW - Math.abs(worldX),
        halfH - Math.abs(worldZ),
      );
      const edgeZone = 12;
      if (edgeDist < edgeZone) {
        const edgeFactor = 1 - smoothstep(0, edgeZone, edgeDist);
        h += edgeFactor * config.maxHeight * 0.8;
      }

      h = Math.max(config.minHeight, Math.min(config.maxHeight, h));
      heightmap[iz * res + ix] = h;
    }
  }

  return heightmap;
}

/**
 * Samples the heightmap at arbitrary world coordinates using bilinear interpolation.
 */
export function getHeightAt(
  worldX: number,
  worldZ: number,
  heightmap: Float32Array,
  mapWidth: number,
  mapHeight: number,
  resolution: number,
): number {
  const halfW = mapWidth / 2;
  const halfH = mapHeight / 2;

  const normX = (worldX + halfW) / mapWidth;
  const normZ = (worldZ + halfH) / mapHeight;

  const fx = normX * resolution;
  const fz = normZ * resolution;

  const ix = Math.floor(fx);
  const iz = Math.floor(fz);

  const fracX = fx - ix;
  const fracZ = fz - iz;

  const res = resolution + 1;

  const clampX = (v: number) => Math.max(0, Math.min(resolution, v));
  const clampZ = (v: number) => Math.max(0, Math.min(resolution, v));

  const x0 = clampX(ix);
  const x1 = clampX(ix + 1);
  const z0 = clampZ(iz);
  const z1 = clampZ(iz + 1);

  const h00 = heightmap[z0 * res + x0];
  const h10 = heightmap[z0 * res + x1];
  const h01 = heightmap[z1 * res + x0];
  const h11 = heightmap[z1 * res + x1];

  const h0 = h00 + (h10 - h00) * fracX;
  const h1 = h01 + (h11 - h01) * fracX;

  return h0 + (h1 - h0) * fracZ;
}
