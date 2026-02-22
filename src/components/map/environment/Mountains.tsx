'use client';

import { useMemo } from 'react';
import { Cone } from '@react-three/drei';
import { seededRandom } from '@/utils/seededRandom';

export function Mountains() {
  const mountains = useMemo(() => {
    const data = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + seededRandom(i * 13 + 500) * 0.3;
      const dist = 70 + seededRandom(i * 17 + 600) * 25;
      const h = 12 + seededRandom(i * 11 + 700) * 22;
      const r = 8 + seededRandom(i * 19 + 800) * 12;
      data.push({ angle, dist, h, r, snow: h > 22 });
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
              <meshStandardMaterial color="#5A6A5A" roughness={0.95} />
            </Cone>
            {m.snow && (
              <Cone args={[m.r * 0.35, m.h * 0.18, 8]} position={[0, m.h * 0.88, 0]}>
                <meshStandardMaterial color="#E8E8F0" roughness={0.7} />
              </Cone>
            )}
            <Cone args={[m.r * 0.6, m.h * 0.4, 6]} position={[m.r * 0.5, m.h * 0.2, m.r * 0.3]}>
              <meshStandardMaterial color="#4A5A4A" roughness={0.95} />
            </Cone>
          </group>
        );
      })}
    </group>
  );
}
