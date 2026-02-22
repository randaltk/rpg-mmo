'use client';

import { useSocket } from '@/hooks/useSocket';

export default function TargetInfo() {
  const { monsters, targetMonsterId, setTargetMonsterId, currentPlayer } = useSocket();
  const target = targetMonsterId ? monsters.find(m => m.id === targetMonsterId) : null;

  if (!target || target.state === 'dead') return null;

  const hpPercent = (target.hp / target.maxHp) * 100;
  const dist = currentPlayer
    ? Math.sqrt((currentPlayer.x - target.x) ** 2 + (currentPlayer.z - target.z) ** 2).toFixed(1)
    : '?';

  return (
    <div className="fixed top-4 right-4 z-50 bg-[#0A0E27]/90 backdrop-blur-sm border-2 border-[#C41E3A]/50 rounded-lg p-3 min-w-[200px] shadow-[0_0_15px_rgba(196,30,58,0.2)]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[#C41E3A] font-cinzel font-bold text-sm">{target.name}</span>
          <span className="text-[#D4AF37] text-xs ml-2 font-bold">Lv.{target.level}</span>
        </div>
        <button onClick={() => setTargetMonsterId(null)} className="text-white/30 hover:text-white text-xs px-1 transition-colors">✕</button>
      </div>
      <div className="w-full bg-[#0A0E27] rounded-full h-3 mb-1 border border-[#C41E3A]/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${hpPercent}%`,
            background: hpPercent > 50
              ? 'linear-gradient(90deg, #C41E3A, #E74C3C)'
              : hpPercent > 25
                ? 'linear-gradient(90deg, #B8860B, #D4AF37)'
                : 'linear-gradient(90deg, #8B0000, #C41E3A)',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40 font-mono">
        <span>{target.hp}/{target.maxHp} HP</span>
        <span>{dist}m</span>
      </div>
    </div>
  );
}
