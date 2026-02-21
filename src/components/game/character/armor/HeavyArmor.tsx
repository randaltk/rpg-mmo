"use client";

import React, { useMemo } from "react";
import { Box, Sphere } from "@react-three/drei";
import { CharacterColors } from "../colors";
import { createChestplateGeometry, createShoulderPadGeometry } from "../geometries";

interface HeavyArmorProps {
  colors: CharacterColors;
}

export default function HeavyArmor({ colors }: HeavyArmorProps) {
  const chestplateGeo = useMemo(() => createChestplateGeometry(), []);
  const shoulderGeoL = useMemo(() => createShoulderPadGeometry(), []);
  const shoulderGeoR = useMemo(() => createShoulderPadGeometry(), []);

  return (
    <>
      {/* Chestplate */}
      <mesh geometry={chestplateGeo} position={[0, 0.87, 0.18]}>
        <meshStandardMaterial color={colors.secondary} roughness={colors.armorRoughness} metalness={colors.armorMetalness} />
      </mesh>
      <Box args={[0.04, 0.5, 0.02]} position={[0, 0.88, 0.26]}>
        <meshStandardMaterial color={colors.accent} roughness={0.3} metalness={0.6} />
      </Box>
      <Box args={[0.25, 0.03, 0.02]} position={[0, 0.95, 0.26]}>
        <meshStandardMaterial color={colors.accent} roughness={0.3} metalness={0.6} />
      </Box>

      {/* Shoulder pads */}
      <mesh geometry={shoulderGeoL} position={[-0.46, 1.22, 0]} rotation={[0, 0, 0.3]} scale={[1.2, 1, 1.2]}>
        <meshStandardMaterial color={colors.secondary} roughness={colors.armorRoughness} metalness={colors.armorMetalness} />
      </mesh>
      <mesh geometry={shoulderGeoR} position={[0.46, 1.22, 0]} rotation={[0, 0, -0.3]} scale={[1.2, 1, 1.2]}>
        <meshStandardMaterial color={colors.secondary} roughness={colors.armorRoughness} metalness={colors.armorMetalness} />
      </mesh>

      {/* Rivets */}
      {[-1, 1].map(side => (
        <group key={`rivets-${side}`}>
          {[0, 1, 2].map(i => {
            const angle = (i / 3) * Math.PI * 0.6 - 0.3;
            return (
              <Sphere
                key={`rivet-${side}-${i}`}
                args={[0.015, 4, 4]}
                position={[
                  side * (0.46 + Math.cos(angle) * 0.15),
                  1.22 + Math.sin(angle) * 0.08,
                  Math.sin(angle) * 0.1,
                ]}
              >
                <meshStandardMaterial color={colors.accent} roughness={0.2} metalness={0.9} />
              </Sphere>
            );
          })}
        </group>
      ))}
    </>
  );
}
