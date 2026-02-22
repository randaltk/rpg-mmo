'use client';

import { useSocket } from '@/hooks/useSocket';

export default function PlayersList() {
  const { players, currentPlayer } = useSocket();

  return (
    <div className="fixed top-16 left-4 z-40 bg-[#0A0E27]/85 backdrop-blur-sm border-2 border-[#D4AF37]/30 rounded-lg p-3 min-w-[170px]">
      <h3 className="font-cinzel font-bold text-[#D4AF37] text-xs uppercase tracking-wider mb-2">
        Jogadores ({Object.keys(players).length})
      </h3>
      <div className="space-y-1.5">
        {Object.values(players).map((player) => (
          <div key={player.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-[#D4AF37]/30 flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />
            <span className={`text-sm ${player.id === currentPlayer?.id ? 'font-bold text-[#D4AF37]' : 'text-white/70'}`}>
              {player.nickname}
              {player.id === currentPlayer?.id && <span className="text-[#D4AF37]/50 text-xs ml-1">(Você)</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
