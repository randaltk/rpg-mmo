"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingParticlesProps {
  isCave?: boolean;
}

export default function FloatingParticles({ isCave = false }: FloatingParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const fireflyRef = useRef<THREE.Points>(null);

  const dustPositions = useMemo(() => {
    const count = 150;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.sin(i * 7.31) * 0.5 + 0.5 - 0.5) * 50;
      arr[i * 3 + 1] = Math.sin(i * 3.17) * 0.5 * 15 + 10;
      arr[i * 3 + 2] = (Math.sin(i * 11.13) * 0.5 + 0.5 - 0.5) * 50;
    }
    return arr;
  }, []);

  const fireflyPositions = useMemo(() => {
    const count = 40;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.sin(i * 5.77) * 0.5 + 0.5 - 0.5) * 35;
      arr[i * 3 + 1] = 0.5 + Math.sin(i * 2.31) * 0.5 * 3;
      arr[i * 3 + 2] = (Math.sin(i * 9.43) * 0.5 + 0.5 - 0.5) * 35;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.015;
    }
    if (fireflyRef.current) {
      const positions = fireflyRef.current.geometry.attributes.position;
      if (positions) {
        const arr = positions.array as Float32Array;
        for (let i = 0; i < arr.length / 3; i++) {
          arr[i * 3 + 1] = fireflyPositions[i * 3 + 1] + Math.sin(t * 0.8 + i * 2.1) * 0.4;
        }
        positions.needsUpdate = true;
      }
    }
  });

  return (
    <>
      {/* Ambient dust/pollen */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={dustPositions.length / 3} array={dustPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={isCave ? 0.06 : 0.08} color={isCave ? "#6A5ACD" : "#FFFDE7"} transparent opacity={isCave ? 0.4 : 0.5} sizeAttenuation />
      </points>

      {/* Fireflies / cave sparkles */}
      <points ref={fireflyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={fireflyPositions.length / 3} array={fireflyPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isCave ? 0.15 : 0.12}
          color={isCave ? "#00E5FF" : "#FFEB3B"}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </>
  );
}
