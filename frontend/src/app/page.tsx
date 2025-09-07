'use client';

import { useState } from 'react';
import Game3D from '@/components/Game3D';
import LoginModal from '@/components/LoginModal';
import Chat from '@/components/Chat';
import PlayersList from '@/components/PlayersList';
import Inventory from '@/components/Inventory';
import { useSocket, SocketProvider } from '@/hooks/useSocket';

function HomeContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [interactionMessage, setInteractionMessage] = useState<string | null>(null);
  const { joinGame, currentPlayer } = useSocket();

  const handleLogin = (nickname: string) => {
    joinGame(nickname);
    setIsLoggedIn(true);
  };

  const handleEquipItem = (item: any, slot: 'weapon' | 'armor' | 'accessory') => {
    console.log('Equipando item:', item.name, 'no slot:', slot);
    // Aqui você implementaria a lógica de equipamento
  };

  const handleUseItem = (item: any) => {
    console.log('Usando item:', item.name);
    // Aqui você implementaria a lógica de uso de item
  };

  if (!isLoggedIn) {
    return <LoginModal onLogin={handleLogin} />;
  }

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

      {/* Mensagem de interação */}
      {interactionMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded z-50">
          {interactionMessage}
        </div>
      )}

      {/* Inventário */}
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

export default function Home() {
  return (
    <SocketProvider>
      <HomeContent />
    </SocketProvider>
  );
}

