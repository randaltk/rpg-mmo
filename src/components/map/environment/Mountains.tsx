'use client';

import { memo, useMemo } from 'react';
import { Cone, Sphere } from '@react-three/drei';
import { seededRandom } from '@/utils/seededRandom';

export const Mountains = memo(function Mountains() {
  const mountains = useMemo(() => {
    const data = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + seededRandom(i * 13 + 500) * 0.3;
      const dist = 65 + seededRandom(i * 17 + 600) * 30;
      const h = 12 + seededRandom(i * 11 + 700) * 25;
      const r = 8 + seededRandom(i * 19 + 800) * 14;
      const colorIdx = Math.floor(seededRandom(i * 23 + 900) * 4);
      const colors = ['#4A5A4A', '#5A6A5A', '#3A4A3A', '#6A7A6A'];
      data.push({
        angle, dist, h, r,
        snow: h > 20,
        color: colors[colorIdx],
        hasTree: h < 20 && seededRandom(i * 29 + 950) > 0.5,
      });
    }
    return data;
  }, []);

  return (
    <group>
      {mountains.map((m, i) => {
        const x = Math.cos(m.angle) * m.dist;
        const z = Math.sin(m.angle) * m.dist;
        return (
          <group key={`mt-${i}`} position={[x, 0, z]}>
            <Cone args={[m.r, m.h, 8]} position={[0, m.h / 2, 0]}>
              <meshStandardMaterial color={m.color} roughness={0.95} />
            </Cone>
            {m.snow && (
              <Cone args={[m.r * 0.35, m.h * 0.18, 8]} position={[0, m.h * 0.88, 0]}>
                <meshStandardMaterial color="#E8E8F0" roughness={0.6} metalness={0.05} />
              </Cone>
            )}
            <Cone args={[m.r * 0.6, m.h * 0.4, 6]} position={[m.r * 0.5, m.h * 0.2, m.r * 0.3]}>
              <meshStandardMaterial color={m.color} roughness={0.95} />
            </Cone>
            {m.hasTree && (
              <group position={[m.r * 0.3, m.h * 0.35, m.r * -0.2]}>
                <Cone args={[1.5, 4, 6]} position={[0, 2, 0]}>
                  <meshStandardMaterial color="#2D5A2D" roughness={0.9} />
                </Cone>
                <Cone args={[1.2, 3, 6]} position={[0, 3.5, 0]}>
                  <meshStandardMaterial color="#3A6A3A" roughness={0.9} />
                </Cone>
              </group>
            )}
            {m.snow && (
              <Sphere args={[m.r * 0.15, 6, 6]} position={[m.r * -0.3, m.h * 0.6, m.r * 0.2]}>
                <meshStandardMaterial color="#D8D8E8" roughness={0.7} />
              </Sphere>
            )}
          </group>
        );
      })}
    </group>
  );
});
