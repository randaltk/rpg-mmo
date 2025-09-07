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

export default function Inventory({ player, onEquipItem, onUseItem, isOpen, onClose }: InventoryProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!isOpen) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Inventário - {player.nickname}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Atributos do jogador */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Atributos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Nível:</span>
                <span className="text-white">{player.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">HP:</span>
                <span className="text-red-400">{player.hp}/{player.maxHp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Ataque:</span>
                <span className="text-orange-400">{player.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Defesa:</span>
                <span className="text-blue-400">{player.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Experiência:</span>
                <span className="text-green-400">{player.experience}</span>
              </div>
            </div>
          </div>

          {/* Equipamentos */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Equipamentos</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Arma:</span>
                <span className="text-white">{player.equipped.weapon?.name || 'Nenhuma'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Armadura:</span>
                <span className="text-white">{player.equipped.armor?.name || 'Nenhuma'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Acessório:</span>
                <span className="text-white">{player.equipped.accessory?.name || 'Nenhum'}</span>
              </div>
            </div>
          </div>

          {/* Inventário */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Itens ({player.inventory.length}/20)</h3>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {player.inventory.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border cursor-pointer ${
                    selectedItem?.id === item.id ? 'border-yellow-400 bg-yellow-900' : 'border-gray-600'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="text-center">
                    <div className="text-lg">{item.icon}</div>
                    <div className={`text-xs ${getRarityColor(item.rarity)}`}>
                      {item.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detalhes do item selecionado */}
        {selectedItem && (
          <div className="mt-4 bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">{selectedItem.name}</h4>
            <p className="text-gray-300 text-sm mb-2">{selectedItem.description}</p>
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className={`${getRarityColor(selectedItem.rarity)} capitalize`}>
                  {selectedItem.rarity}
                </span>
                {selectedItem.stats.attack && (
                  <span className="text-orange-400 ml-2">+{selectedItem.stats.attack} ATK</span>
                )}
                {selectedItem.stats.defense && (
                  <span className="text-blue-400 ml-2">+{selectedItem.stats.defense} DEF</span>
                )}
                {selectedItem.stats.hp && (
                  <span className="text-red-400 ml-2">+{selectedItem.stats.hp} HP</span>
                )}
              </div>
              <div className="space-x-2">
                {selectedItem.type === 'weapon' && (
                  <button
                    onClick={() => onEquipItem(selectedItem, 'weapon')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Equipar
                  </button>
                )}
                {selectedItem.type === 'armor' && (
                  <button
                    onClick={() => onEquipItem(selectedItem, 'armor')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Equipar
                  </button>
                )}
                {selectedItem.type === 'accessory' && (
                  <button
                    onClick={() => onEquipItem(selectedItem, 'accessory')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Equipar
                  </button>
                )}
                {selectedItem.type === 'consumable' && (
                  <button
                    onClick={() => onUseItem(selectedItem)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Usar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
