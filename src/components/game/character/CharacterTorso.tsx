"use client";

import React, { useMemo } from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { CharacterColors } from "./colors";
import { createChestplateGeometry, createShoulderPadGeometry } from "./geometries";

interface CharacterTorsoProps {
  capeRef: React.RefObject<THREE.Mesh>;
  colors: CharacterColors;
}

export default function CharacterTorso({ capeRef, colors }: CharacterTorsoProps) {
  const chestplateGeo = useMemo(() => createChestplateGeometry(), []);
  const shoulderGeoL = useMemo(() => createShoulderPadGeometry(), []);
  const shoulderGeoR = useMemo(() => createShoulderPadGeometry(), []);

  const {
    shirtColor,
    shirtDark,
    armorColor,
    armorHighlight,
    skinColor,
    capeColor,
    capeBorder,
  } = colors;

  return (
    <>
      {/* === TORSO === */}
      <Cylinder args={[0.3, 0.34, 0.72, 10]} position={[0, 0.88, 0]}>
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </Cylinder>
      <Sphere args={[0.3, 10, 8]} position={[0, 0.9, 0.08]} scale={[1.1, 0.95, 0.7]}>
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </Sphere>
      <Sphere args={[0.25, 8, 8]} position={[0, 0.9, -0.08]} scale={[1.05, 0.9, 0.6]}>
        <meshStandardMaterial color={shirtColor} roughness={0.82} />
      </Sphere>

      {/* === CHEST ARMOR PLATE === */}
      <mesh geometry={chestplateGeo} position={[0, 0.87, 0.18]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color={armorColor} roughness={0.35} metalness={0.55} />
      </mesh>
      <Box args={[0.04, 0.5, 0.02]} position={[0, 0.88, 0.26]}>
        <meshStandardMaterial color={armorHighlight} roughness={0.3} metalness={0.6} />
      </Box>
      <Box args={[0.25, 0.03, 0.02]} position={[0, 0.95, 0.26]}>
        <meshStandardMaterial color={armorHighlight} roughness={0.3} metalness={0.6} />
      </Box>

      {/* Lower tunic */}
      <Cylinder args={[0.33, 0.3, 0.22, 10]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </Cylinder>
      <mesh position={[0, 0.38, 0.28]} rotation={[0.1, 0, 0]}>
        <planeGeometry args={[0.25, 0.18]} />
        <meshStandardMaterial color={shirtDark} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, 0.53, 0]}>
        <torusGeometry args={[0.32, 0.04, 6, 16, Math.PI * 2]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.55} metalness={0.2} />
      </mesh>
      <group position={[0, 0.53, 0.33]}>
        <Box args={[0.1, 0.08, 0.02]}>
          <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={0.9} />
        </Box>
        <Box args={[0.06, 0.04, 0.025]}>
          <meshStandardMaterial color="#FF8C00" roughness={0.2} metalness={0.7} />
        </Box>
      </group>

      {/* Collar */}
      <Cylinder args={[0.18, 0.26, 0.1, 10]} position={[0, 1.28, 0]}>
        <meshStandardMaterial color={shirtDark} roughness={0.8} />
      </Cylinder>

      {/* === SHOULDER PADS === */}
      <mesh geometry={shoulderGeoL} position={[-0.46, 1.22, 0]} rotation={[0, 0, 0.3]} scale={[1.2, 1, 1.2]}>
        <meshStandardMaterial color="#6A5A4A" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh geometry={shoulderGeoR} position={[0.46, 1.22, 0]} rotation={[0, 0, -0.3]} scale={[1.2, 1, 1.2]}>
        <meshStandardMaterial color="#6A5A4A" roughness={0.4} metalness={0.5} />
      </mesh>
      {[-1, 1].map(side => (
        <group key={`rivets-${side}`}>
          {[0, 1, 2].map(i => {
            const angle = (i / 3) * Math.PI * 0.6 - 0.3;
            return (
              <Sphere key={`rivet-${side}-${i}`} args={[0.015, 4, 4]}
                position={[side * (0.46 + Math.cos(angle) * 0.15), 1.22 + Math.sin(angle) * 0.08, Math.sin(angle) * 0.1]}>
                <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.9} />
              </Sphere>
            );
          })}
        </group>
      ))}

      {/* === CAPE === */}
      <group position={[0, 1.1, -0.24]}>
        <Sphere args={[0.03, 6, 6]} position={[-0.2, 0.08, 0]}>
          <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
        </Sphere>
        <Sphere args={[0.03, 6, 6]} position={[0.2, 0.08, 0]}>
          <meshStandardMaterial color="#C0A030" roughness={0.2} metalness={0.8} />
        </Sphere>
        <mesh ref={capeRef} position={[0, -0.05, 0]} rotation={[0.15, 0, 0]}>
          <planeGeometry args={[0.65, 1.0, 4, 6]} />
          <meshStandardMaterial color={capeColor} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.55, -0.01]} rotation={[0.15, 0, 0]}>
          <planeGeometry args={[0.67, 0.06]} />
          <meshStandardMaterial color={capeBorder} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}
