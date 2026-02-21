'use client';

import { useState } from 'react';
import Link from 'next/link';
import Game3D from '@/components/game/Game3D';
import Chat from '@/components/ui/Chat';
import PlayersList from '@/components/ui/PlayersList';
import Inventory from '@/components/ui/Inventory';
import { useSocket, SocketProvider } from '@/hooks/useSocket';

function NicknameScreen({ onStart }: { onStart: (nickname: string) => void }) {
  const [nickname, setNickname] = useState('');
  const { isConnected } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onStart(nickname.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-15 animate-float"
            style={{
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              backgroundColor: ['#9B30FF', '#00E5FF', '#FFD700'][i % 3],
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + (i % 4) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-xl">
              R
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">RPG MMO 3D</h1>
          <p className="text-gray-400 text-center text-sm mb-8">Escolha seu nome de aventureiro</p>

          {/* Connection status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Servidor conectado' : 'Conectando ao servidor...'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: DragonSlayer"
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                maxLength={20}
                autoFocus
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">{nickname.length}/20 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={!nickname.trim() || !isConnected}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isConnected ? 'Iniciar Aventura' : 'Aguardando servidor...'}
            </button>
          </form>

          {/* Controls hint */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Controles</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">WASD</kbd>
                <span>Mover</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">Mouse</kbd>
                <span>Girar câmera</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">E</kbd>
                <span>Interagir</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">Scroll</kbd>
                <span>Zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">I</kbd>
                <span>Inventário</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">2x Click</kbd>
                <span>Reset câmera</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameScreen() {
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

      {interactionMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl z-50 border border-white/10 text-sm font-medium">
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

function PlayContent() {
  const [started, setStarted] = useState(false);
  const { joinGame } = useSocket();

  const handleStart = (nickname: string) => {
    joinGame(nickname);
    setStarted(true);
  };

  if (!started) {
    return <NicknameScreen onStart={handleStart} />;
  }

  return <GameScreen />;
}

export default function PlayPage() {
  return (
    <SocketProvider>
      <PlayContent />
    </SocketProvider>
  );
}
