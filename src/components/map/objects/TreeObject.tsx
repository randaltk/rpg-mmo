'use client';

import { Sphere, Cylinder } from '@react-three/drei';
import { MapObject } from '@/types/game';

export function TreeObject({ obj }: { obj: MapObject }) {
  const h = obj.height;
  return (
    <group position={[obj.x, obj.y, obj.z]}>
      {/* Roots */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + 0.3;
        return (
          <Cylinder key={`root-${i}`} args={[0.08, 0.15, 0.6, 4]} position={[Math.cos(angle) * 0.35, 0.15, Math.sin(angle) * 0.35]} rotation={[Math.sin(angle) * 0.4, 0, Math.cos(angle) * 0.4]}>
            <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
          </Cylinder>
        );
      })}
      {/* Trunk */}
      <Cylinder args={[0.2, 0.35, h, 8]} position={[0, h / 2, 0]}>
        <meshStandardMaterial color="#6B3A20" roughness={0.95} />
      </Cylinder>
      <Cylinder args={[0.18, 0.22, h * 0.3, 6]} position={[0.15, h * 0.7, 0.1]} rotation={[0.2, 0, 0.3]}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
      </Cylinder>
      {/* Foliage layers */}
      <Sphere args={[h * 0.55, 10, 8]} position={[0, h + 0.3, 0]}>
        <meshStandardMaterial color="#2D8B2D" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.42, 8, 6]} position={[0.4, h + 0.1, 0.3]}>
        <meshStandardMaterial color="#3AA63A" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.38, 8, 6]} position={[-0.3, h + 0.5, -0.2]}>
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </Sphere>
      <Sphere args={[h * 0.3, 8, 6]} position={[0.2, h + 0.8, -0.3]}>
        <meshStandardMaterial color="#36A336" roughness={0.9} />
      </Sphere>
    </group>
  );
}
