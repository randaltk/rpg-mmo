'use client';

import { useState } from 'react';
import Link from 'next/link';
import Game3D from '@/components/game/Game3D';
import Chat from '@/components/ui/Chat';
import PlayersList from '@/components/ui/PlayersList';
import Inventory from '@/components/ui/Inventory';
import { useSocket, SocketProvider } from '@/hooks/useSocket';
import { CharacterClass } from '@/types/game';

const CLASS_ORDER: CharacterClass[] = [
  'knight', 'paladin', 'rogue', 'assassin', 'ranger', 'wizard', 'sorcerer', 'priest', 'monk',
];

const CLASS_INFO: Record<CharacterClass, { emoji: string; label: string; weapon: string; desc: string }> = {
  knight:   { emoji: '⚔️',  label: 'Knight',   weapon: 'Espada + Escudo', desc: 'Armadura pesada prateada, visual imponente de cavaleiro medieval' },
  paladin:  { emoji: '🛡️', label: 'Paladin',  weapon: 'Espada + Escudo', desc: 'Armadura branca com detalhes dourados, aparência sagrada' },
  rogue:    { emoji: '🗡️', label: 'Rogue',    weapon: 'Adaga',           desc: 'Roupa de couro escura, estilo furtivo e ágil' },
  assassin: { emoji: '🥷',  label: 'Assassin', weapon: 'Katar',           desc: 'Visual sombrio com máscara, ágil e letal' },
  ranger:   { emoji: '🏹',  label: 'Ranger',   weapon: 'Arco',            desc: 'Caçador da floresta com couro leve e verde' },
  wizard:   { emoji: '🧙',  label: 'Wizard',   weapon: 'Cajado',          desc: 'Túnica azul com chapéu pontudo clássico de mago' },
  sorcerer: { emoji: '✨',  label: 'Sorcerer', weapon: 'Cajado + Livro',  desc: 'Roupa elegante e mística, tons roxos e dourados' },
  priest:   { emoji: '🙏',  label: 'Priest',   weapon: 'Cajado',          desc: 'Túnica branca clerical com detalhes dourados' },
  monk:     { emoji: '👊',  label: 'Monk',     weapon: 'Soqueiras',       desc: 'Artista marcial disciplinado, roupa leve' },
};

function NicknameScreen({ onStart }: { onStart: (nickname: string, characterClass: CharacterClass) => void }) {
  const [nickname, setNickname] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('knight');
  const { isConnected } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onStart(nickname.trim(), selectedClass);
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

        <div className="relative z-10 w-full max-w-lg px-6">
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
          <p className="text-gray-400 text-center text-sm mb-8">Escolha seu nome e classe</p>

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

            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Classe
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CLASS_ORDER.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedClass === cls
                        ? 'border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/40 scale-[1.03]'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{CLASS_INFO[cls].emoji}</div>
                    <div className="text-[11px] font-bold text-white">{CLASS_INFO[cls].label}</div>
                    <div className="text-[9px] text-gray-500 leading-tight">{CLASS_INFO[cls].weapon}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2.5 text-center italic min-h-[2.5em]">
                {CLASS_INFO[selectedClass].desc}
              </p>
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

function TargetInfo() {
  const { monsters, targetMonsterId, setTargetMonsterId, currentPlayer } = useSocket();
  const target = targetMonsterId ? monsters.find(m => m.id === targetMonsterId) : null;

  if (!target || target.state === 'dead') return null;

  const hpPercent = (target.hp / target.maxHp) * 100;
  const dist = currentPlayer
    ? Math.sqrt((currentPlayer.x - target.x) ** 2 + (currentPlayer.z - target.z) ** 2).toFixed(1)
    : '?';

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-red-400 font-bold text-sm">{target.name}</span>
          <span className="text-yellow-400 text-xs ml-2">Lv.{target.level}</span>
        </div>
        <button
          onClick={() => setTargetMonsterId(null)}
          className="text-gray-400 hover:text-white text-xs px-1"
        >
          ✕
        </button>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3 mb-1">
        <div
          className="h-3 rounded-full transition-all duration-300"
          style={{
            width: `${hpPercent}%`,
            backgroundColor: hpPercent > 50 ? '#E74C3C' : hpPercent > 25 ? '#F1C40F' : '#C0392B',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{target.hp}/{target.maxHp} HP</span>
        <span>{dist}m</span>
      </div>
    </div>
  );
}

function PlayerHUD() {
  const { currentPlayer } = useSocket();
  if (!currentPlayer) return null;

  const hpPercent = (currentPlayer.hp / currentPlayer.maxHp) * 100;
  const expPercent = (currentPlayer.experience / (currentPlayer.level * 100)) * 100;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl p-3 min-w-[300px]">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-white font-bold text-sm">{currentPlayer.nickname}</div>
        <div className="text-yellow-400 text-xs">Lv.{currentPlayer.level}</div>
        <div className="text-gray-400 text-xs ml-auto">ATK:{currentPlayer.attack} DEF:{currentPlayer.defense}</div>
      </div>
      {/* HP */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-400 text-xs font-bold w-6">HP</span>
        <div className="flex-1 bg-gray-800 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${hpPercent}%`,
              backgroundColor: hpPercent > 50 ? '#2ECC71' : hpPercent > 25 ? '#F1C40F' : '#E74C3C',
            }}
          />
        </div>
        <span className="text-xs text-gray-400 w-16 text-right">{currentPlayer.hp}/{currentPlayer.maxHp}</span>
      </div>
      {/* EXP */}
      <div className="flex items-center gap-2">
        <span className="text-blue-400 text-xs font-bold w-6">EXP</span>
        <div className="flex-1 bg-gray-800 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${expPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-16 text-right">{currentPlayer.experience}/{currentPlayer.level * 100}</span>
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

      <TargetInfo />
      <PlayerHUD />

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

  const handleStart = (nickname: string, characterClass: CharacterClass) => {
    joinGame(nickname, characterClass);
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
