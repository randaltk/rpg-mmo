"use client";

import React from "react";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import { HeadgearType } from "./classes/types";
import HeadgearMesh from "./equipment/HeadgearMesh";

interface CharacterHeadProps {
  skinColor: string;
  hairColor: string;
  headgear?: HeadgearType;
  headgearColor?: string;
  headgearAccent?: string;
}

export default function CharacterHead({
  skinColor,
  hairColor,
  headgear = "none",
  headgearColor,
  headgearAccent,
}: CharacterHeadProps) {
  const showHair =
    headgear === "none" || headgear === "mask" || headgear === "headband";
  const showFace = headgear !== "helmet";
  const showMouth = headgear !== "helmet" && headgear !== "mask";

  return (
    <>
      {/* Neck - Um pouco mais curto e grosso para um visual mais "fortinho" */}
      <Cylinder args={[0.15, 0.15, 0.1, 8]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Cylinder>

      {/* CABEÇA - AGORA A FORMA PRINCIPAL É UM POUCO DIFERENTE */}

      {/* Base da Cabeça: Um "esferoide" ligeiramente alongado para baixo, 
          dando um aspecto mais de "cabeça de personagem" do que uma esfera perfeita. */}
      <Sphere args={[0.35, 18, 18]} scale={[1.0, 1.15, 0.9]}>
        <meshStandardMaterial color={skinColor} roughness={0.82} />
      </Sphere>

      {/* Maxilar / Bochechas: Uma forma para dar volume às bochechas e definir o queixo.
          (Este mesh pode ser removido se ficar estranho, mas a ideia é adicionar volume) */}
      <Sphere
        args={[0.3, 12, 10]}
        position={[0, -0.15, 0.05]}
        scale={[1.2, 0.6, 0.85]}
      >
        <meshStandardMaterial color={skinColor} roughness={0.85} />
      </Sphere>

      {/* CABELO - Agora com mais volume e "estilo" */}
      {showHair && (
        <>
          {/* Volume principal do cabelo, mais encorpado e subindo mais */}
          <Sphere
            args={[0.4, 18, 18]}
            position={[0, 0.12, -0.03]}
            scale={[1.05, 0.9, 1.1]}
          >
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Sphere>
          {/* Topete/Franja - Uma forma que sobe mais, dando um estilo mais "animado" */}
          <Sphere
            args={[0.3, 12, 12]}
            position={[0, 0.3, -0.1]}
            scale={[1.2, 0.6, 1.3]}
          >
            <meshStandardMaterial color={hairColor} roughness={1} />
          </Sphere>
          {/* Laterais do cabelo (costeletas) - para dar mais volume e charme */}
          {[-1, 1].map((s) => (
            <Sphere
              key={`hair-side-${s}`}
              args={[0.18, 8, 8]}
              position={[s * 0.28, -0.05, 0.05]}
              scale={[0.5, 0.9, 0.7]}
            >
              <meshStandardMaterial color={hairColor} roughness={1} />
            </Sphere>
          ))}
        </>
      )}

      {/* OLHOS - A MAIOR MUDANÇA! Olhos maiores e mais expressivos */}
      {showFace && (
        <>
          {[-1, 1].map((s) => (
            <group key={`eye-${s}`}>
              {/* Branco do Olho - Maior e mais redondo */}
              <Sphere args={[0.1, 12, 12]} position={[s * 0.15, 0.04, 0.28]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Sphere args={[0.07, 10, 10]} position={[s * 0.15, 0.04, 0.33]}>
                <meshStandardMaterial
                  color="#3A7BD5"
                  emissive="#2A6BC5"
                  emissiveIntensity={0.6}
                />
              </Sphere>
              <Sphere args={[0.04, 8, 8]} position={[s * 0.15, 0.04, 0.355]}>
                <meshStandardMaterial color="#111111" />
              </Sphere>
              <Sphere
                args={[0.025, 6, 6]}
                position={[s * 0.15 + s * 0.025, 0.065, 0.365]}
              >
                <meshStandardMaterial
                  color="#FFFFFF"
                  emissive="#FFFFFF"
                  emissiveIntensity={1.8}
                />
              </Sphere>
              {/* Sobrancelha - Mais grossa e com um ângulo mais dramático */}
              <Box
                args={[0.15, 0.04, 0.03]}
                position={[s * 0.15, 0.16, 0.28]}
                rotation={[0, 0, s * 0.2]}
              >
                <meshStandardMaterial color={hairColor} />
              </Box>
            </group>
          ))}
        </>
      )}

      {/* NARIZ - Estilizado, pequeno e pontudo (muito comum em caricaturas) */}
      {showFace && (
        <group position={[0, -0.02, 0.34]}>
          <Sphere args={[0.045, 6, 6]} scale={[0.8, 0.6, 1.2]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
          <Sphere args={[0.025, 4, 4]} position={[0, -0.02, 0.03]}>
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
        </group>
      )}

      {/* BOCA - Mais definida e "desenhada" */}
      {showMouth && (
        <group position={[0, -0.15, 0.3]}>
          {/* Linha da boca principal */}
          <Box args={[0.18, 0.02, 0.02]} rotation={[0, 0, 0.02]}>
            <meshStandardMaterial color="#B5665A" />
          </Box>
          {/* Um pequeno "V" no centro do lábio superior para dar mais forma */}
          <Box
            args={[0.04, 0.02, 0.02]}
            position={[0, 0.02, 0.005]}
            rotation={[0, 0, 0]}
          >
            <meshStandardMaterial color="#B5665A" />
          </Box>
        </group>
      )}

      {/* ORELHAS - Um pouco maiores e mais proeminentes */}
      {showFace &&
        [-1, 1].map((s) => (
          <Sphere
            key={`ear-${s}`}
            args={[0.1, 8, 8]}
            position={[s * 0.35, -0.02, 0]}
            scale={[0.3, 0.9, 0.6]}
          >
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </Sphere>
        ))}

      {/* Headgear (sem alterações) */}
      <HeadgearMesh
        type={headgear}
        primaryColor={headgearColor}
        accentColor={headgearAccent}
      />
    </>
  );
}
