"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSocket } from "@/hooks/useSocket";
import { CharacterClass } from "@/types/game";

const CLASS_ORDER: CharacterClass[] = [
  "knight",
  "paladin",
  "rogue",
  "assassin",
  "ranger",
  "wizard",
  "sorcerer",
  "priest",
  "monk",
];

const CLASS_INFO: Record<
  CharacterClass,
  { label: string; weapon: string; desc: string; img: string }
> = {
  knight: {
    label: "Knight",
    weapon: "Espada + Escudo",
    desc: "Armadura pesada prateada, visual imponente de cavaleiro medieval",
    img: "/rpg-assets/knight_aldoria.png",
  },
  paladin: {
    label: "Paladin",
    weapon: "Espada + Escudo",
    desc: "Armadura branca com detalhes dourados, aparência sagrada",
    img: "/rpg-assets/paladin_aldoria.png",
  },
  rogue: {
    label: "Rogue",
    weapon: "Adaga",
    desc: "Roupa de couro escura, estilo furtivo e ágil",
    img: "/rpg-assets/rogue_aldoria.png",
  },
  assassin: {
    label: "Assassin",
    weapon: "Katar",
    desc: "Visual sombrio com máscara, ágil e letal",
    img: "/rpg-assets/assassin_aldoria.png",
  },
  ranger: {
    label: "Ranger",
    weapon: "Arco",
    desc: "Caçador da floresta com couro leve e verde",
    img: "/rpg-assets/ranger_aldoria.png",
  },
  wizard: {
    label: "Wizard",
    weapon: "Cajado",
    desc: "Túnica azul com chapéu pontudo clássico de mago",
    img: "/rpg-assets/wizard_aldoria.png",
  },
  sorcerer: {
    label: "Sorcerer",
    weapon: "Cajado + Livro",
    desc: "Roupa elegante e mística, tons roxos e dourados",
    img: "/rpg-assets/sorcerer_aldoria.png",
  },
  priest: {
    label: "Priest",
    weapon: "Cajado",
    desc: "Túnica branca clerical com detalhes dourados",
    img: "/rpg-assets/priest_aldoria.png",
  },
  monk: {
    label: "Monk",
    weapon: "Soqueiras",
    desc: "Artista marcial disciplinado, roupa leve",
    img: "/rpg-assets/monk_aldoria.png",
  },
};

interface NicknameScreenProps {
  onStart: (nickname: string, characterClass: CharacterClass) => void;
}

export default function NicknameScreen({ onStart }: NicknameScreenProps) {
  const [nickname, setNickname] = useState("");
  const [selectedClass, setSelectedClass] = useState<CharacterClass>("knight");
  const { isConnected } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onStart(nickname.trim(), selectedClass);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/rpg-assets/landing_bg.png"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27]/70 via-[#0A0E27]/80 to-[#0A0E27]" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${3 + (i % 3) * 1.5}px`,
              height: `${3 + (i % 3) * 1.5}px`,
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              backgroundColor: ["#D4AF37", "#7B3FF2", "#FFD700"][i % 3],
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + (i % 4) * 2}s`,
              opacity: 0.15,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 py-8 flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left: selected class preview */}
        <div className="hidden lg:flex flex-col items-center justify-center w-64 flex-shrink-0">
          <div className="w-52 h-52 rounded-xl border-2 border-[#D4AF37]/50 bg-[#1A3A52]/50 overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-4">
            <Image
              src={CLASS_INFO[selectedClass].img}
              alt={CLASS_INFO[selectedClass].label}
              width={220}
              height={220}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="font-cinzel font-bold text-[#D4AF37] text-xl">
              {CLASS_INFO[selectedClass].label}
            </div>
            <div className="text-white/50 text-sm mt-1">
              {CLASS_INFO[selectedClass].weapon}
            </div>
            <p className="text-white/40 text-xs mt-2 italic max-w-[200px]">
              {CLASS_INFO[selectedClass].desc}
            </p>
          </div>
        </div>

        {/* Center: main form */}
        <div className="flex-1 max-w-lg mx-auto lg:mx-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors mb-4 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-cinzel text-sm">Voltar</span>
          </Link>

          <div className="bg-[#1A3A52]/70 border-2 border-[#D4AF37]/50 rounded-xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.2)]">
            <div className="flex justify-center mb-4">
              <Image
                src="/rpg-assets/logo_aldoria.png"
                alt="Legends of Aldoria"
                width={260}
                height={100}
                className="h-16 w-auto"
              />
            </div>
            <p className="text-white/50 text-center text-sm mb-1">
              Escolha seu nome e classe
            </p>
            <div className="flex items-center justify-center gap-3 my-2">
              <div className="h-px flex-1 max-w-[50px] bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]/60" />
              <div className="h-px flex-1 max-w-[50px] bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
            </div>

            <div className="flex items-center justify-center gap-2 my-4">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
              />
              <span
                className={`text-xs font-medium ${isConnected ? "text-green-400" : "text-red-400"}`}
              >
                {isConnected
                  ? "Servidor conectado"
                  : "Conectando ao servidor..."}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="nickname"
                  className="block text-sm font-cinzel font-bold text-[#D4AF37] mb-2"
                >
                  Nickname
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: DragonSlayer"
                  className="w-full px-4 py-3 bg-[#0A0E27]/60 border-2 border-[#D4AF37]/30 rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
                  maxLength={20}
                  autoFocus
                  required
                />
                <p className="text-xs text-white/25 mt-1.5">
                  {nickname.length}/20 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-cinzel font-bold text-[#D4AF37] mb-3">
                  Classe
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CLASS_ORDER.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`p-2 rounded-lg border-2 text-center transition-all cursor-pointer group relative overflow-hidden ${
                        selectedClass === cls
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-[1.03]"
                          : "border-[#D4AF37]/15 bg-[#0A0E27]/40 hover:border-[#D4AF37]/40 hover:bg-[#1A3A52]/50"
                      }`}
                    >
                      {selectedClass === cls && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />
                      )}
                      <div className="relative">
                        <div className="w-10 h-10 mx-auto mb-1 rounded overflow-hidden border border-[#D4AF37]/20">
                          <Image
                            src={CLASS_INFO[cls].img}
                            alt={CLASS_INFO[cls].label}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div
                          className={`text-[11px] font-cinzel font-bold ${selectedClass === cls ? "text-[#D4AF37]" : "text-white/70"}`}
                        >
                          {CLASS_INFO[cls].label}
                        </div>
                        <div className="text-[9px] text-white/35 leading-tight">
                          {CLASS_INFO[cls].weapon}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Mobile class preview */}
                <div className="lg:hidden flex items-center gap-3 mt-3 p-3 rounded-lg bg-[#0A0E27]/40 border border-[#D4AF37]/20">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#D4AF37]/30 flex-shrink-0">
                    <Image
                      src={CLASS_INFO[selectedClass].img}
                      alt={CLASS_INFO[selectedClass].label}
                      width={60}
                      height={60}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-cinzel font-bold text-[#D4AF37] text-sm">
                      {CLASS_INFO[selectedClass].label}
                    </div>
                    <p className="text-[11px] text-white/40 italic">
                      {CLASS_INFO[selectedClass].desc}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!nickname.trim() || !isConnected}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] border-2 border-[#FFD700] rounded-lg font-cinzel font-black text-[#0A0E27] tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed uppercase animate-border-glow text-lg"
              >
                {isConnected ? "Iniciar Aventura" : "Aguardando servidor..."}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t-2 border-[#D4AF37]/15">
              <p className="text-xs text-[#D4AF37]/50 font-cinzel font-bold mb-3 uppercase tracking-widest">
                Controles
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
                {[
                  { key: "WASD", action: "Mover" },
                  { key: "Mouse", action: "Girar câmera" },
                  { key: "E", action: "Interagir" },
                  { key: "Scroll", action: "Zoom" },
                  { key: "I", action: "Inventário" },
                  { key: "2x Click", action: "Reset câmera" },
                ].map((ctrl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded text-[10px] font-mono text-[#D4AF37]/70">
                      {ctrl.key}
                    </kbd>
                    <span>{ctrl.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
