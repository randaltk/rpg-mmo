"use client";

import React from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { CharacterColors } from "./colors";
import { ClassConfig } from "./classes/types";
import ArmorOverlay from "./armor/ArmorOverlay";

interface CharacterTorsoProps {
  capeRef: React.RefObject<THREE.Mesh>;
  colors: CharacterColors;
  classConfig: ClassConfig;
}

export default function CharacterTorso({ capeRef, colors, classConfig }: CharacterTorsoProps) {
  const capeWidth =
    classConfig.capeStyle === "light" ? 0.5 : 0.65;
  const capeHeight =
    classConfig.capeStyle === "long" ? 1.3 : classConfig.capeStyle === "light" ? 0.7 : 1.0;
  const capeBorderY =
    classConfig.capeStyle === "long" ? -0.7 : -0.55;

  return (
    <>
      {/* === BASE TORSO === */}
      <Cylinder args={[0.3, 0.34, 0.72, 10]} position={[0, 0.88, 0]} castShadow>
        <meshStandardMaterial color={colors.primary} roughness={0.8} />
      </Cylinder>
      <Sphere args={[0.3, 10, 8]} position={[0, 0.9, 0.08]} scale={[1.1, 0.95, 0.7]}>
        <meshStandardMaterial color={colors.primary} roughness={0.8} />
      </Sphere>
      <Sphere args={[0.25, 8, 8]} position={[0, 0.9, -0.08]} scale={[1.05, 0.9, 0.6]}>
        <meshStandardMaterial color={colors.primary} roughness={0.82} />
      </Sphere>

      {/* === ARMOR OVERLAY (varies by class) === */}
      <ArmorOverlay weight={classConfig.armorWeight} colors={colors} />

      {/* Lower tunic */}
      <Cylinder args={[0.33, 0.3, 0.22, 10]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color={colors.primary} roughness={0.8} />
      </Cylinder>
      <mesh position={[0, 0.38, 0.28]} rotation={[0.1, 0, 0]}>
        <planeGeometry args={[0.25, 0.18]} />
        <meshStandardMaterial color={colors.primaryDark} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, 0.53, 0]}>
        <torusGeometry args={[0.32, 0.04, 6, 16, Math.PI * 2]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.55} metalness={0.2} />
      </mesh>
      <group position={[0, 0.53, 0.33]}>
        <Box args={[0.1, 0.08, 0.02]}>
          <meshStandardMaterial color={colors.accent} roughness={0.15} metalness={0.9} />
        </Box>
        <Box args={[0.06, 0.04, 0.025]}>
          <meshStandardMaterial color={colors.accent} roughness={0.2} metalness={0.7} />
        </Box>
      </group>

      {/* Collar */}
      <Cylinder args={[0.18, 0.26, 0.1, 10]} position={[0, 1.28, 0]}>
        <meshStandardMaterial color={colors.primaryDark} roughness={0.8} />
      </Cylinder>

      {/* === CAPE (conditional, style varies) === */}
      {classConfig.capeStyle !== "none" && (
        <group position={[0, 1.1, -0.24]}>
          <Sphere args={[0.03, 6, 6]} position={[-0.2, 0.08, 0]}>
            <meshStandardMaterial color={colors.accent} roughness={0.2} metalness={0.8} />
          </Sphere>
          <Sphere args={[0.03, 6, 6]} position={[0.2, 0.08, 0]}>
            <meshStandardMaterial color={colors.accent} roughness={0.2} metalness={0.8} />
          </Sphere>
          <mesh ref={capeRef} position={[0, -0.05, 0]} rotation={[0.15, 0, 0]}>
            <planeGeometry args={[capeWidth, capeHeight, 4, 6]} />
            <meshStandardMaterial
              color={colors.capeColor}
              roughness={0.9}
              side={THREE.DoubleSide}
              transparent={classConfig.capeStyle === "light"}
              opacity={classConfig.capeStyle === "light" ? 0.85 : 1}
            />
          </mesh>
          <mesh position={[0, capeBorderY, -0.01]} rotation={[0.15, 0, 0]}>
            <planeGeometry args={[capeWidth + 0.02, 0.06]} />
            <meshStandardMaterial color={colors.capeBorder} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </>
  );
}
