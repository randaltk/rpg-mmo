"use client";

import { Canvas } from "@react-three/fiber";
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
        camera={{ position: [0, 6, 8], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
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
