'use client';

import { useSocket } from '@/hooks/useSocket';

export default function PlayerHUD() {
  const { currentPlayer } = useSocket();
  if (!currentPlayer) return null;

  const hpPercent = (currentPlayer.hp / currentPlayer.maxHp) * 100;
  const expPercent = (currentPlayer.experience / (currentPlayer.level * 100)) * 100;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#0A0E27]/85 backdrop-blur-sm border-2 border-[#D4AF37]/40 rounded-lg p-3 min-w-[320px] shadow-[0_0_20px_rgba(212,175,55,0.15)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-white font-cinzel font-bold text-sm">{currentPlayer.nickname}</div>
        <div className="text-[#D4AF37] text-xs font-bold">Lv.{currentPlayer.level}</div>
        <div className="text-[#C0C0C0] text-xs ml-auto font-medium">ATK:{currentPlayer.attack} DEF:{currentPlayer.defense}</div>
      </div>
      {/* HP */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[#C41E3A] text-xs font-cinzel font-bold w-7">HP</span>
        <div className="flex-1 bg-[#0A0E27] rounded-full h-3 border border-[#D4AF37]/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${hpPercent}%`,
              background: hpPercent > 50
                ? 'linear-gradient(90deg, #2D5016, #4CAF50)'
                : hpPercent > 25
                  ? 'linear-gradient(90deg, #B8860B, #D4AF37)'
                  : 'linear-gradient(90deg, #8B0000, #C41E3A)',
            }}
          />
        </div>
        <span className="text-xs text-white/40 w-16 text-right font-mono">{currentPlayer.hp}/{currentPlayer.maxHp}</span>
      </div>
      {/* EXP */}
      <div className="flex items-center gap-2">
        <span className="text-[#4A8FD8] text-xs font-cinzel font-bold w-7">EXP</span>
        <div className="flex-1 bg-[#0A0E27] rounded-full h-2.5 border border-[#D4AF37]/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${expPercent}%`,
              background: 'linear-gradient(90deg, #2E5C8A, #4A8FD8)',
            }}
          />
        </div>
        <span className="text-xs text-white/40 w-16 text-right font-mono">{currentPlayer.experience}/{currentPlayer.level * 100}</span>
      </div>
    </div>
  );
}
