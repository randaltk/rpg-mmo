"use client";

import React from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";

interface CharacterHeadProps {
  skinColor: string;
  hairColor: string;
}

export default function CharacterHead({ skinColor, hairColor }: CharacterHeadProps) {
  return (
    <>
      {/* Neck */}
      <Cylinder args={[0.1, 0.12, 0.12, 8]} position={[0, -0.35, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Cylinder>

      {/* Head shape */}
      <Sphere args={[0.32, 16, 16]}>
        <meshStandardMaterial color={skinColor} roughness={0.82} />
      </Sphere>
      <Sphere args={[0.22, 12, 10]} position={[0, -0.12, 0.05]} scale={[1.1, 0.5, 0.9]}>
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Sphere>

      {/* Hair */}
      <Sphere args={[0.33, 16, 16]} position={[0, 0.05, -0.03]} scale={[1.03, 0.97, 1.04]}>
        <meshStandardMaterial color={hairColor} roughness={1} />
      </Sphere>
      <Sphere args={[0.2, 10, 10]} position={[0, 0.2, -0.05]} scale={[1.5, 0.5, 1.2]}>
        <meshStandardMaterial color={hairColor} roughness={1} />
      </Sphere>
      <Box args={[0.52, 0.08, 0.15]} position={[0, 0.2, 0.15]} rotation={[0.2, 0, 0]}>
        <meshStandardMaterial color={hairColor} roughness={1} />
      </Box>
      {[-1, 1].map(s => (
        <group key={`hair-${s}`}>
          <Box args={[0.07, 0.22, 0.12]} position={[s * 0.3, 0, 0.1]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>
          <Box args={[0.05, 0.12, 0.08]} position={[s * 0.28, -0.12, 0.14]}>
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Box>
        </group>
      ))}
      <Box args={[0.4, 0.15, 0.06]} position={[0, -0.08, -0.3]}>
        <meshStandardMaterial color={hairColor} roughness={1} />
      </Box>

      {/* Eyes */}
      {[-1, 1].map(s => (
        <group key={`eye-${s}`}>
          <Sphere args={[0.06, 8, 8]} position={[s * 0.11, 0.02, 0.26]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Sphere>
          <Sphere args={[0.04, 8, 8]} position={[s * 0.11, 0.02, 0.305]}>
            <meshStandardMaterial color="#3A7BD5" />
          </Sphere>
          <Sphere args={[0.02, 6, 6]} position={[s * 0.11, 0.02, 0.33]}>
            <meshStandardMaterial color="#111111" />
          </Sphere>
          <Sphere args={[0.012, 4, 4]} position={[s * 0.11 + s * 0.015, 0.04, 0.335]}>
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </Sphere>
          <Box args={[0.1, 0.025, 0.03]} position={[s * 0.11, 0.1, 0.26]} rotation={[0, 0, s * 0.1]}>
            <meshStandardMaterial color={hairColor} />
          </Box>
        </group>
      ))}

      {/* Nose */}
      <Sphere args={[0.03, 6, 6]} position={[0, -0.04, 0.3]}>
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </Sphere>
      <Sphere args={[0.015, 4, 4]} position={[0, -0.06, 0.31]}>
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </Sphere>

      {/* Mouth */}
      <Box args={[0.08, 0.015, 0.01]} position={[0, -0.12, 0.28]}>
        <meshStandardMaterial color="#B5665A" />
      </Box>

      {/* Ears */}
      {[-1, 1].map(s => (
        <Sphere key={`ear-${s}`} args={[0.06, 6, 6]} position={[s * 0.3, -0.02, 0]} scale={[0.4, 0.8, 0.6]}>
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </Sphere>
      ))}
    </>
  );
}
