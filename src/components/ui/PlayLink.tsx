'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

function LoadingOverlay() {
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
      className="bg-[#0A0E27] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_60%)]" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${(i * 8) % 100}%`,
              top: `${(i * 11) % 100}%`,
              backgroundColor: ['#D4AF37', '#7B3FF2', '#FFD700'][i % 3],
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 3) * 2}s`,
              opacity: 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="w-20 h-20 rounded-full bg-[#1A3A52]/70 border-2 border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <span className="text-3xl">⚔️</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-cinzel font-bold text-[#D4AF37] text-xl tracking-wider mb-2">
            Preparando o Mundo
          </h1>
          <p className="text-white/40 text-sm">Carregando recursos do jogo...</p>
        </div>

        <div className="w-56 h-1.5 bg-[#0A0E27] rounded-full border border-[#D4AF37]/20 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] animate-[loading-bar_2s_ease-in-out_infinite]" />
        </div>

        <p className="text-white/20 text-xs font-cinzel italic tracking-wide">Legends of Aldoria</p>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default function PlayLink({ className, children }: { className?: string; children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push('/play');
  }, [router]);

  return (
    <>
      <a href="/play" onClick={handleClick} className={className}>
        {children}
      </a>
      {loading && <LoadingOverlay />}
    </>
  );
}
