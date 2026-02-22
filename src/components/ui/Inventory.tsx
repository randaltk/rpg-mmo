'use client';

import { useState } from 'react';
import { Player, Item } from '@/types/game';

interface InventoryProps {
  player: Player;
  onEquipItem: (item: Item, slot: 'weapon' | 'armor' | 'accessory') => void;
  onUseItem: (item: Item) => void;
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-[#C0C0C0]',
  uncommon: 'text-green-400',
  rare: 'text-[#4A8FD8]',
  epic: 'text-[#7B3FF2]',
  legendary: 'text-[#D4AF37]',
};

export default function Inventory({ player, onEquipItem, onUseItem, isOpen, onClose }: InventoryProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!isOpen) return null;

  const getRarityColor = (rarity: string) => RARITY_COLORS[rarity] || 'text-[#C0C0C0]';

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-[#D4AF37]/60';
      case 'epic': return 'border-[#7B3FF2]/60';
      case 'rare': return 'border-[#4A8FD8]/60';
      case 'uncommon': return 'border-green-500/40';
      default: return 'border-[#D4AF37]/15';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0E27]/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A3A52]/95 border-2 border-[#D4AF37]/60 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto mx-4 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-[#D4AF37]/20">
          <h2 className="font-cinzel text-xl font-bold text-[#D4AF37]">
            Inventário — {player.nickname}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-[#D4AF37]/30 text-[#D4AF37]/60 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center text-lg"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Attributes */}
          <div className="bg-[#0A0E27]/50 border border-[#D4AF37]/20 rounded-lg p-4">
            <h3 className="font-cinzel font-bold text-[#D4AF37] text-sm uppercase tracking-wider mb-3">Atributos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Nível:</span>
                <span className="text-[#D4AF37] font-bold">{player.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">HP:</span>
                <span className="text-[#C41E3A] font-bold">{player.hp}/{player.maxHp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Ataque:</span>
                <span className="text-orange-400 font-bold">{player.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Defesa:</span>
                <span className="text-[#4A8FD8] font-bold">{player.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Experiência:</span>
                <span className="text-green-400 font-bold">{player.experience}</span>
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-[#0A0E27]/50 border border-[#D4AF37]/20 rounded-lg p-4">
            <h3 className="font-cinzel font-bold text-[#D4AF37] text-sm uppercase tracking-wider mb-3">Equipamentos</h3>
            <div className="space-y-3">
              {[
                { label: 'Arma', item: player.equipped.weapon },
                { label: 'Armadura', item: player.equipped.armor },
                { label: 'Acessório', item: player.equipped.accessory },
              ].map((slot, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">{slot.label}:</span>
                  <span className={`text-sm font-medium ${slot.item ? 'text-[#D4AF37]' : 'text-white/25'}`}>
                    {slot.item?.name || 'Nenhum'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items grid */}
          <div className="bg-[#0A0E27]/50 border border-[#D4AF37]/20 rounded-lg p-4">
            <h3 className="font-cinzel font-bold text-[#D4AF37] text-sm uppercase tracking-wider mb-3">
              Itens ({player.inventory.length}/20)
            </h3>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
              {player.inventory.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      : `${getRarityBorder(item.rarity)} bg-[#1A3A52]/40 hover:bg-[#1A3A52]/70`
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="text-center">
                    <div className="text-lg">{item.icon}</div>
                    <div className={`text-[10px] font-bold leading-tight ${getRarityColor(item.rarity)}`}>{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected item detail */}
        {selectedItem && (
          <div className="mt-5 bg-[#0A0E27]/50 border border-[#D4AF37]/30 rounded-lg p-4">
            <h4 className="font-cinzel font-bold text-[#D4AF37] mb-2">{selectedItem.name}</h4>
            <p className="text-white/50 text-sm mb-3">{selectedItem.description}</p>
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="text-sm flex flex-wrap gap-2">
                <span className={`${getRarityColor(selectedItem.rarity)} capitalize font-bold`}>{selectedItem.rarity}</span>
                {selectedItem.stats.attack && <span className="text-orange-400">+{selectedItem.stats.attack} ATK</span>}
                {selectedItem.stats.defense && <span className="text-[#4A8FD8]">+{selectedItem.stats.defense} DEF</span>}
                {selectedItem.stats.hp && <span className="text-[#C41E3A]">+{selectedItem.stats.hp} HP</span>}
              </div>
              <div className="flex gap-2">
                {selectedItem.type === 'weapon' && (
                  <button onClick={() => onEquipItem(selectedItem, 'weapon')} className="px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0A0E27] rounded font-cinzel font-bold text-xs hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all uppercase">Equipar</button>
                )}
                {selectedItem.type === 'armor' && (
                  <button onClick={() => onEquipItem(selectedItem, 'armor')} className="px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0A0E27] rounded font-cinzel font-bold text-xs hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all uppercase">Equipar</button>
                )}
                {selectedItem.type === 'accessory' && (
                  <button onClick={() => onEquipItem(selectedItem, 'accessory')} className="px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0A0E27] rounded font-cinzel font-bold text-xs hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all uppercase">Equipar</button>
                )}
                {selectedItem.type === 'consumable' && (
                  <button onClick={() => onUseItem(selectedItem)} className="px-4 py-1.5 bg-gradient-to-r from-[#2D5016] to-[#4CAF50] text-white rounded font-cinzel font-bold text-xs hover:shadow-[0_0_15px_rgba(45,80,22,0.5)] transition-all uppercase">Usar</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
