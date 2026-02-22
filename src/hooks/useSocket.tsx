import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, ChatMessage, MovementData, InteractionData, Monster, CombatEvent } from '@/types/game';
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
  sendChatMessage: (message: string) => void;
  interact: (interactionData: InteractionData) => void;
  equipItem: (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
  attackMonster: (monsterId: string) => void;
  setTargetMonsterId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

let socketInstance: Socket | null = null;
let socketInitialized = false;
let pendingJoin: { nickname: string; characterClass: string } | null = null;

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  
  const [targetMonsterId, setTargetMonsterId] = useState<string | null>(null);
  const attackCooldownRef = useRef(false);

  useEffect(() => {
    if (socketInstance && socketInitialized && socketInstance.connected) {
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
      return;
    }

    if (socketInstance && !socketInstance.connected) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    socketInitialized = true;

    const newSocket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });
    socketInstance = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (pendingJoin) {
        newSocket.emit('join', pendingJoin);
        pendingJoin = null;
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
      if (pendingJoin) {
        newSocket.emit('join', pendingJoin);
        pendingJoin = null;
      }
    });

    newSocket.on('currentPlayers', (playersData: Record<string, Player>) => {
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
    });

    newSocket.on('newPlayer', (player: Player) => {
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    });

    newSocket.on('playerMoved', (player: Player) => {
      if (player.id === newSocket.id) return;
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    });

    newSocket.on('removePlayer', (playerId: string) => {
      setPlayers(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[playerId];
        return newPlayers;
      });
    });

    newSocket.on('chat', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, { ...message, timestamp: Date.now() }]);
    });

    newSocket.on('monstersUpdate', (monsterList: Monster[]) => {
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
    });

    newSocket.on('combatEvent', (event: CombatEvent) => {
      const store = useGameStore.getState();
      store.pushCombatEvent({ ...event, _spawnTime: performance.now() });

      if (event.type === 'playerAttack') {
        store.addAttackingPlayer(event.attackerId);
        setTimeout(() => useGameStore.getState().removeAttackingPlayer(event.attackerId), 400);
      }
    });

    newSocket.on('playerUpdated', (player: Player) => {
      const socketId = newSocket.id;
      if (socketId && player.id === socketId) {
        setCurrentPlayer(player);
        setPlayers(prev => ({ ...prev, [player.id]: player }));
      }
    });

    return () => {};
  }, []);

  const joinGame = (nickname: string, characterClass: string = 'knight') => {
    const joinData = { nickname, characterClass };
    const tryJoin = () => {
      if (socket && isConnected) {
        socket.emit('join', joinData);
        return true;
      }
      return false;
    };

    if (!tryJoin()) {
      pendingJoin = joinData;
      const retryInterval = setInterval(() => {
        if (tryJoin()) {
          clearInterval(retryInterval);
          pendingJoin = null;
        }
      }, 500);
      setTimeout(() => {
        clearInterval(retryInterval);
        if (pendingJoin?.nickname === nickname) pendingJoin = null;
      }, 15000);
    }
  };

  const socketRef = useRef(socket);
  socketRef.current = socket;

  const emitMove = useCallback((position: MovementData) => {
    socketRef.current?.emit('move', position);
  }, []);

  const emitChangeMap = useCallback((mapId: string) => {
    socketRef.current?.emit('changeMap', { mapId });
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
    joinGame, movePlayer, emitMove, emitChangeMap, sendChatMessage, interact, equipItem, attackMonster, setTargetMonsterId,
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
