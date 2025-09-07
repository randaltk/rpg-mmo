'use client';

import { useSocket } from '@/hooks/useSocket';

export default function PlayersList() {
  const { players, currentPlayer } = useSocket();

  return (
    <div className="players-list">
      <h3 className="font-bold mb-2">Jogadores Online ({Object.keys(players).length})</h3>
      {Object.values(players).map((player) => (
        <div key={player.id} className="player-item">
          <div
            className="player-color"
            style={{ backgroundColor: player.color }}
          />
          <span className={player.id === currentPlayer?.id ? 'font-bold' : ''}>
            {player.nickname}
            {player.id === currentPlayer?.id && ' (Você)'}
          </span>
        </div>
      ))}
    </div>
  );
}

