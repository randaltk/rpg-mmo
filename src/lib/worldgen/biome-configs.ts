import type { BiomeType, TreeVariant, RockVariant, StructureVariant, Monster, MonsterVariant } from '@/types/game';

export interface BiomeConfig {
  groundColors: string[];
  treeDensity: number;
  treeVariants: TreeVariant[];
  treeVariantWeights: number[];
  rockDensity: number;
  rockVariants: RockVariant[];
  rockVariantWeights: number[];
  structureDensity: number;
  structureVariants: StructureVariant[];
  structureVariantWeights: number[];
  terrainAmplitudeMultiplier: number;
  monsterTable: { type: Monster['type']; variant?: MonsterVariant; weight: number; levelRange: [number, number] }[];
  fogColor: string;
  fogNear: number;
  fogFar: number;
  ambientColor: string;
  ambientIntensity: number;
  vegetationDensity: number;
  vegetationColors: string[];
}

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  plains: {
    groundColors: ['#3A6A2A', '#5A8A3A', '#7A9A4A', '#8A7A5A', '#6A6A6A'],
    treeDensity: 0.7,
    treeVariants: ['oak', 'cherry'],
    treeVariantWeights: [70, 30],
    rockDensity: 0.3,
    rockVariants: ['boulder', 'mossy'],
    rockVariantWeights: [60, 40],
    structureDensity: 0.1,
    structureVariants: ['camp'],
    structureVariantWeights: [100],
    terrainAmplitudeMultiplier: 1.0,
    monsterTable: [
      { type: 'slime', weight: 60, levelRange: [1, 3] },
      { type: 'slime', variant: 'golden', weight: 5, levelRange: [2, 4] },
      { type: 'goblin', weight: 25, levelRange: [2, 4] },
      { type: 'wolf', weight: 10, levelRange: [2, 3] },
    ],
    fogColor: '#c8ddf0',
    fogNear: 80,
    fogFar: 350,
    ambientColor: '#FFF8F0',
    ambientIntensity: 0.25,
    vegetationDensity: 0.8,
    vegetationColors: ['#4CAF50', '#66BB6A', '#43A047', '#388E3C'],
  },

  forest: {
    groundColors: ['#2A4A1A', '#3A5A2A', '#4A6A3A', '#5A5A3A', '#4A4A3A'],
    treeDensity: 1.0,
    treeVariants: ['oak', 'pine', 'willow'],
    treeVariantWeights: [35, 40, 25],
    rockDensity: 0.4,
    rockVariants: ['mossy', 'stacked'],
    rockVariantWeights: [65, 35],
    structureDensity: 0.15,
    structureVariants: ['totem'],
    structureVariantWeights: [100],
    terrainAmplitudeMultiplier: 0.8,
    monsterTable: [
      { type: 'goblin', weight: 30, levelRange: [2, 5] },
      { type: 'goblin', variant: 'archer', weight: 15, levelRange: [3, 5] },
      { type: 'wolf', weight: 35, levelRange: [3, 5] },
      { type: 'wolf', variant: 'poison', weight: 10, levelRange: [4, 6] },
      { type: 'slime', variant: 'poison', weight: 10, levelRange: [3, 5] },
    ],
    fogColor: '#8aaa8a',
    fogNear: 50,
    fogFar: 250,
    ambientColor: '#C8E6C8',
    ambientIntensity: 0.18,
    vegetationDensity: 1.0,
    vegetationColors: ['#2E7D32', '#388E3C', '#1B5E20', '#4CAF50'],
  },

  swamp: {
    groundColors: ['#2A3A2A', '#3A4A30', '#4A4A38', '#3A3A2A', '#2A2A20'],
    treeDensity: 0.5,
    treeVariants: ['dead', 'mushroom'],
    treeVariantWeights: [55, 45],
    rockDensity: 0.4,
    rockVariants: ['flat', 'mossy'],
    rockVariantWeights: [50, 50],
    structureDensity: 0.1,
    structureVariants: ['altar'],
    structureVariantWeights: [100],
    terrainAmplitudeMultiplier: 0.5,
    monsterTable: [
      { type: 'slime', variant: 'poison', weight: 35, levelRange: [3, 6] },
      { type: 'skeleton', weight: 30, levelRange: [4, 7] },
      { type: 'skeleton', variant: 'shaman', weight: 10, levelRange: [5, 8] },
      { type: 'goblin', variant: 'shaman', weight: 15, levelRange: [4, 7] },
      { type: 'slime', variant: 'ice', weight: 10, levelRange: [4, 6] },
    ],
    fogColor: '#5a6a5a',
    fogNear: 40,
    fogFar: 180,
    ambientColor: '#A8B8A0',
    ambientIntensity: 0.15,
    vegetationDensity: 0.6,
    vegetationColors: ['#556B2F', '#6B8E23', '#808000', '#8B8000'],
  },

  rocky: {
    groundColors: ['#5A5A5A', '#6A6A6A', '#7A7A6A', '#8A7A5A', '#8A8A8A'],
    treeDensity: 0.2,
    treeVariants: ['pine', 'dead'],
    treeVariantWeights: [60, 40],
    rockDensity: 1.0,
    rockVariants: ['boulder', 'crystal', 'stacked'],
    rockVariantWeights: [40, 25, 35],
    structureDensity: 0.3,
    structureVariants: ['ruins_pillar', 'ruins_wall'],
    structureVariantWeights: [55, 45],
    terrainAmplitudeMultiplier: 2.0,
    monsterTable: [
      { type: 'skeleton', weight: 30, levelRange: [5, 8] },
      { type: 'skeleton', variant: 'warrior', weight: 15, levelRange: [6, 9] },
      { type: 'goblin', variant: 'warrior', weight: 20, levelRange: [5, 8] },
      { type: 'wolf', variant: 'ice', weight: 15, levelRange: [5, 8] },
      { type: 'goblin', variant: 'chief', weight: 5, levelRange: [7, 10] },
      { type: 'slime', variant: 'fire', weight: 15, levelRange: [5, 7] },
    ],
    fogColor: '#9a9a9a',
    fogNear: 60,
    fogFar: 280,
    ambientColor: '#D8D8D8',
    ambientIntensity: 0.22,
    vegetationDensity: 0.2,
    vegetationColors: ['#8B8B83', '#9E9E93', '#A0A090'],
  },

  ruins: {
    groundColors: ['#4A4A4A', '#5A5A52', '#6A6A5A', '#5A5050', '#484848'],
    treeDensity: 0.15,
    treeVariants: ['dead'],
    treeVariantWeights: [100],
    rockDensity: 0.6,
    rockVariants: ['stacked'],
    rockVariantWeights: [100],
    structureDensity: 0.8,
    structureVariants: ['ruins_pillar', 'ruins_wall', 'altar'],
    structureVariantWeights: [35, 35, 30],
    terrainAmplitudeMultiplier: 1.5,
    monsterTable: [
      { type: 'skeleton', weight: 25, levelRange: [6, 10] },
      { type: 'skeleton', variant: 'warrior', weight: 20, levelRange: [7, 10] },
      { type: 'skeleton', variant: 'shaman', weight: 15, levelRange: [8, 12] },
      { type: 'goblin', variant: 'chief', weight: 10, levelRange: [8, 12] },
      { type: 'wolf', variant: 'fire', weight: 15, levelRange: [7, 10] },
      { type: 'slime', variant: 'golden', weight: 5, levelRange: [6, 10] },
      { type: 'skeleton', variant: 'chief', weight: 10, levelRange: [10, 15] },
    ],
    fogColor: '#6a5a6a',
    fogNear: 45,
    fogFar: 200,
    ambientColor: '#C8B8D8',
    ambientIntensity: 0.18,
    vegetationDensity: 0.15,
    vegetationColors: ['#6B6B63', '#7A7A70', '#585850'],
  },
};
