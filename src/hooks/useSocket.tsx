import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, ChatMessage, MovementData, InteractionData, Monster, CombatEvent, PortalTier } from '@/types/game';
import type { WorldSeed } from '@/lib/worldgen/seed';
import { useGameStore } from '@/stores/gameStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  players: Record<string, Player>;
  currentPlayer: Player | null;
  chatMessages: ChatMessage[];
  monsters: Monster[];
  targetMonsterId: string | null;
  joinGame: (nickname: string, characterClass?: string) => void;
  movePlayer: (position: MovementData) => void;
  emitMove: (position: MovementData) => void;
  emitChangeMap: (mapId: string) => void;
  emitEnterDungeon: (data: { caveSeed: number; tier: PortalTier; portalX: number; portalZ: number }) => void;
  sendChatMessage: (message: string) => void;
  interact: (interactionData: InteractionData) => void;
  equipItem: (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
  attackMonster: (monsterId: string) => void;
  setTargetMonsterId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  
  const [targetMonsterId, setTargetMonsterId] = useState<string | null>(null);
  const attackCooldownRef = useRef(false);
  const pendingJoinRef = useRef<{ nickname: string; characterClass: string } | null>(null);

  useEffect(() => {
    const newSocket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });
    setSocket(newSocket);

    const handleConnect = () => {
      setIsConnected(true);
      if (pendingJoinRef.current) {
        newSocket.emit('join', pendingJoinRef.current);
        pendingJoinRef.current = null;
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleReconnect = () => {
      setIsConnected(true);
      if (pendingJoinRef.current) {
        newSocket.emit('join', pendingJoinRef.current);
        pendingJoinRef.current = null;
      }
    };

    const handleCurrentPlayers = (playersData: Record<string, Player>) => {
      setPlayers(playersData);
      const socketId = newSocket.id;
      if (socketId && playersData[socketId]) {
        setCurrentPlayer(playersData[socketId]);
      } else {
        setTimeout(() => {
          if (socketId && playersData[socketId]) {
            setCurrentPlayer(playersData[socketId]);
          }
        }, 100);
      }
    };

    const handleNewPlayer = (player: Player) => {
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    };

    const handlePlayerMoved = (player: Player) => {
      if (player.id === newSocket.id) return;
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    };

    const handleRemovePlayer = (playerId: string) => {
      setPlayers(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[playerId];
        return newPlayers;
      });
    };

    const handleChat = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, { ...message, timestamp: Date.now() }]);
    };

    const handleMonstersUpdate = (monsterList: Monster[]) => {
      useGameStore.getState().setMonstersData(monsterList);

      setMonsters(prev => {
        if (prev.length !== monsterList.length) return monsterList;
        for (let i = 0; i < prev.length; i++) {
          const p = prev[i], n = monsterList[i];
          if (p.id !== n.id || p.hp !== n.hp || p.state !== n.state ||
              p.level !== n.level || p.targetPlayerId !== n.targetPlayerId) {
            return monsterList;
          }
        }
        return prev;
      });
    };

    const handleCombatEvent = (event: CombatEvent) => {
      const store = useGameStore.getState();
      store.pushCombatEvent({ ...event, _spawnTime: performance.now() });

      if (event.type === 'playerAttack') {
        store.addAttackingPlayer(event.attackerId);
        setTimeout(() => useGameStore.getState().removeAttackingPlayer(event.attackerId), 400);
      }

      if (event.type === 'playerDeath' && event.targetId === newSocket.id) {
        setTargetMonsterId(null);
        useGameStore.getState().setCombatTarget(null);
        useGameStore.getState().setTeleportTo({ x: 0, y: 0, z: 0 });
      }
    };

    const handlePlayerUpdated = (player: Player) => {
      const socketId = newSocket.id;
      if (socketId && player.id === socketId) {
        setCurrentPlayer(player);
        setPlayers(prev => ({ ...prev, [player.id]: player }));
      }
    };

    const handleWorldSeed = (seed: WorldSeed) => {
      console.log('[WorldGen] Received seed from server:', seed);
      useGameStore.getState().setWorldSeed(seed);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('reconnect', handleReconnect);
    newSocket.on('currentPlayers', handleCurrentPlayers);
    newSocket.on('newPlayer', handleNewPlayer);
    newSocket.on('playerMoved', handlePlayerMoved);
    newSocket.on('removePlayer', handleRemovePlayer);
    newSocket.on('chat', handleChat);
    newSocket.on('monstersUpdate', handleMonstersUpdate);
    newSocket.on('combatEvent', handleCombatEvent);
    newSocket.on('playerUpdated', handlePlayerUpdated);
    newSocket.on('worldSeed', handleWorldSeed);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('reconnect', handleReconnect);
      newSocket.off('currentPlayers', handleCurrentPlayers);
      newSocket.off('newPlayer', handleNewPlayer);
      newSocket.off('playerMoved', handlePlayerMoved);
      newSocket.off('removePlayer', handleRemovePlayer);
      newSocket.off('chat', handleChat);
      newSocket.off('monstersUpdate', handleMonstersUpdate);
      newSocket.off('combatEvent', handleCombatEvent);
      newSocket.off('playerUpdated', handlePlayerUpdated);
      newSocket.off('worldSeed', handleWorldSeed);
      newSocket.disconnect();
    };
  }, []);

  const joinGame = useCallback((nickname: string, characterClass: string = 'knight') => {
    const joinData = { nickname, characterClass };
    if (socket && isConnected) {
      socket.emit('join', joinData);
    } else {
      pendingJoinRef.current = joinData;
    }
  }, [socket, isConnected]);

  const socketRef = useRef(socket);
  socketRef.current = socket;

  const emitMove = useCallback((position: MovementData) => {
    socketRef.current?.emit('move', position);
  }, []);

  const emitChangeMap = useCallback((mapId: string) => {
    socketRef.current?.emit('changeMap', { mapId });
  }, []);

  const emitEnterDungeon = useCallback((data: { caveSeed: number; tier: PortalTier; portalX: number; portalZ: number }) => {
    socketRef.current?.emit('enterDungeon', data);
  }, []);

  const movePlayer = useCallback((position: MovementData) => {
    if (socketRef.current && currentPlayer) {
      const updatedPlayer = { ...currentPlayer, ...position };
      setCurrentPlayer(updatedPlayer);
      setPlayers(prev => ({ ...prev, [currentPlayer.id]: updatedPlayer }));
      socketRef.current.emit('move', position);
    }
  }, [currentPlayer]);

  const sendChatMessage = (message: string) => {
    if (socket) socket.emit('chat', message);
  };

  const interact = (interactionData: InteractionData) => {
    if (socket) socket.emit('interact', interactionData);
  };

  const equipItem = (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => {
    if (socket && currentPlayer) socket.emit('equipItem', { itemId, slot });
  };

  const attackMonster = useCallback((monsterId: string) => {
    if (socket && currentPlayer && !attackCooldownRef.current) {
      attackCooldownRef.current = true;
      socket.emit('attackMonster', { monsterId });
      setTimeout(() => { attackCooldownRef.current = false; }, 600);
    }
  }, [socket, currentPlayer]);

  const value = {
    socket, isConnected, players, currentPlayer, chatMessages,
    monsters, targetMonsterId,
    joinGame, movePlayer, emitMove, emitChangeMap, emitEnterDungeon, sendChatMessage, interact, equipItem, attackMonster, setTargetMonsterId,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
