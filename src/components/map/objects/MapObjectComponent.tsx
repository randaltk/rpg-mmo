'use client';

import { Box } from '@react-three/drei';
import { MapObject } from '@/types/game';
import { TreeObject } from './TreeObject';
import { RockObject } from './RockObject';
import { WallObject } from './WallObject';
import { ChestObject } from './ChestObject';
import { ItemObject } from './ItemObject';
import { PortalObject } from './PortalObject';

export function MapObjectComponent({ obj }: { obj: MapObject }) {
  switch (obj.type) {
    case 'tree': return <TreeObject obj={obj} />;
    case 'rock': return <RockObject obj={obj} />;
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
}
