'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface LoginModalProps {
  onLogin: (nickname: string) => void;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [nickname, setNickname] = useState('');
  const { isConnected } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onLogin(nickname.trim());
    }
  };

  return (
    <div className="login-modal">
      <h2 className="text-2xl font-bold mb-4">RPG MMO 3D</h2>
      <p className="mb-4">Digite seu nickname para entrar no jogo</p>
      
      <div className="mb-4">
        <div className={`inline-block px-2 py-1 rounded text-sm ${
          isConnected ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Seu nickname"
          className="login-input"
          maxLength={20}
          required
        />
        <button type="submit" className="login-button">
          Entrar no Jogo
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-400">
        <p>Controles:</p>
        <p>WASD ou Setas - Mover</p>
        <p>Espaço - Subir</p>
        <p>Shift - Descer</p>
      </div>
    </div>
  );
}

