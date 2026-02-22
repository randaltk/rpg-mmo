"use client";

import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import GameScene from "./GameScene";

interface Game3DProps {
  inventoryOpen: boolean;
  onInventoryToggle: () => void;
  interactionMessage: string | null;
  onInteractionMessage: (message: string | null) => void;
}

export default function Game3D({
  inventoryOpen,
  onInventoryToggle,
  interactionMessage,
  onInteractionMessage,
}: Game3DProps) {
  return (
    <div className="game-container">
      <Canvas
        camera={{ position: [0, 6, 8], fov: 60, near: 0.5, far: 1200 }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: SRGBColorSpace,
        }}
      >
        <GameScene
          inventoryOpen={inventoryOpen}
          onInventoryToggle={onInventoryToggle}
          interactionMessage={interactionMessage}
          onInteractionMessage={onInteractionMessage}
        />
      </Canvas>
    </div>
  );
}
