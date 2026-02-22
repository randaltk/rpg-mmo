'use client';

import { useState } from 'react';
import NicknameScreen from '@/components/ui/NicknameScreen';
import GameScreen from '@/components/ui/GameScreen';
import { useSocket, SocketProvider } from '@/hooks/useSocket';
import { CharacterClass } from '@/types/game';

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
