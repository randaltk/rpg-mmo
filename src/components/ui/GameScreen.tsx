'use client';

import { useState } from 'react';
import Game3D from '@/components/game/Game3D';
import Chat from '@/components/ui/Chat';
import PlayersList from '@/components/ui/PlayersList';
import Inventory from '@/components/ui/Inventory';
import TargetInfo from '@/components/ui/TargetInfo';
import PlayerHUD from '@/components/ui/PlayerHUD';
import { useSocket } from '@/hooks/useSocket';

export default function GameScreen() {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [interactionMessage, setInteractionMessage] = useState<string | null>(null);
  const { currentPlayer } = useSocket();

  const handleEquipItem = (item: any, slot: 'weapon' | 'armor' | 'accessory') => {
    console.log('Equipando item:', item.name, 'no slot:', slot);
  };

  const handleUseItem = (item: any) => {
    console.log('Usando item:', item.name);
  };

  return (
    <div className="game-container">
      <Game3D
        inventoryOpen={inventoryOpen}
        onInventoryToggle={() => setInventoryOpen(!inventoryOpen)}
        interactionMessage={interactionMessage}
        onInteractionMessage={setInteractionMessage}
      />

      <div className="game-ui">
        <PlayersList />
        <Chat />
      </div>

      <TargetInfo />
      <PlayerHUD />

      {interactionMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#0A0E27]/90 backdrop-blur-sm text-[#D4AF37] px-6 py-3 rounded-lg z-50 border-2 border-[#D4AF37]/50 text-sm font-cinzel font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          {interactionMessage}
        </div>
      )}

      {currentPlayer && (
        <Inventory
          player={currentPlayer}
          onEquipItem={handleEquipItem}
          onUseItem={handleUseItem}
          isOpen={inventoryOpen}
          onClose={() => setInventoryOpen(false)}
        />
      )}
    </div>
  );
}
