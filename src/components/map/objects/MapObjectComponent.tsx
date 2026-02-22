'use client';

import { memo } from 'react';
import { Box } from '@react-three/drei';
import { MapObject } from '@/types/game';

import { OakTree } from './trees/OakTree';
import { PineTree } from './trees/PineTree';
import { WillowTree } from './trees/WillowTree';
import { DeadTree } from './trees/DeadTree';
import { MushroomTree } from './trees/MushroomTree';
import { CherryTree } from './trees/CherryTree';
import { BaobabTree } from './trees/BaobabTree';

import { BoulderRock } from './rocks/BoulderRock';
import { CrystalRock } from './rocks/CrystalRock';
import { StackedRock } from './rocks/StackedRock';
import { MossyRock } from './rocks/MossyRock';
import { FlatRock } from './rocks/FlatRock';

import { RuinsPillar } from './structures/RuinsPillar';
import { RuinsWall } from './structures/RuinsWall';
import { Camp } from './structures/Camp';
import { Totem } from './structures/Totem';
import { Altar } from './structures/Altar';

import { WallObject } from './WallObject';
import { ChestObject } from './ChestObject';
import { ItemObject } from './ItemObject';
import { PortalObject } from './PortalObject';

function TreeByVariant({ obj }: { obj: MapObject }) {
  switch (obj.variant) {
    case 'pine': return <PineTree obj={obj} />;
    case 'willow': return <WillowTree obj={obj} />;
    case 'dead': return <DeadTree obj={obj} />;
    case 'mushroom': return <MushroomTree obj={obj} />;
    case 'cherry': return <CherryTree obj={obj} />;
    case 'baobab': return <BaobabTree obj={obj} />;
    default: return <OakTree obj={obj} />;
  }
}

function RockByVariant({ obj }: { obj: MapObject }) {
  switch (obj.variant) {
    case 'crystal': return <CrystalRock obj={obj} />;
    case 'stacked': return <StackedRock obj={obj} />;
    case 'mossy': return <MossyRock obj={obj} />;
    case 'flat': return <FlatRock obj={obj} />;
    default: return <BoulderRock obj={obj} />;
  }
}

function StructureByVariant({ obj }: { obj: MapObject }) {
  switch (obj.variant) {
    case 'ruins_wall': return <RuinsWall obj={obj} />;
    case 'camp': return <Camp obj={obj} />;
    case 'totem': return <Totem obj={obj} />;
    case 'altar': return <Altar obj={obj} />;
    default: return <RuinsPillar obj={obj} />;
  }
}

export const MapObjectComponent = memo(function MapObjectComponent({ obj }: { obj: MapObject }) {
  switch (obj.type) {
    case 'tree': return <TreeByVariant obj={obj} />;
    case 'rock': return <RockByVariant obj={obj} />;
    case 'structure': return <StructureByVariant obj={obj} />;
    case 'wall': return <WallObject obj={obj} />;
    case 'chest': return <ChestObject obj={obj} />;
    case 'item': return <ItemObject obj={obj} />;
    case 'portal': return <PortalObject obj={obj} />;
    default:
      return (
        <Box args={[obj.width, obj.height, obj.depth]} position={[obj.x, obj.y + obj.height / 2, obj.z]}>
          <meshStandardMaterial color="#808080" roughness={0.7} />
        </Box>
      );
  }
});
