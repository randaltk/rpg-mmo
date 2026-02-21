import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, ChatMessage, MovementData, InteractionData, Map } from '@/types/game';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  players: Record<string, Player>;
  currentPlayer: Player | null;
  chatMessages: ChatMessage[];
  currentMap: Map | null;
  joinGame: (nickname: string) => void;
  movePlayer: (position: MovementData) => void;
  sendChatMessage: (message: string) => void;
  interact: (interactionData: InteractionData) => void;
  equipItem: (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

let socketInstance: Socket | null = null;
let socketInitialized = false;
let pendingJoin: string | null = null;

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMap, setCurrentMap] = useState<Map | null>(null);

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
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });
    socketInstance = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (pendingJoin) {
        newSocket.emit('join', { nickname: pendingJoin });
        pendingJoin = null;
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
      if (pendingJoin) {
        newSocket.emit('join', { nickname: pendingJoin });
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

    newSocket.on('currentMap', (mapData: Map) => {
      setCurrentMap(mapData);
    });

    newSocket.on('newPlayer', (player: Player) => {
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    });

    newSocket.on('playerMoved', (player: Player) => {
      setPlayers(prev => ({ ...prev, [player.id]: player }));
      if (player.id !== newSocket.id) {
        setCurrentPlayer(prev => prev?.id === player.id ? player : prev);
      }
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

    return () => {};
  }, []);

  const joinGame = (nickname: string) => {
    const tryJoin = () => {
      if (socket && isConnected) {
        socket.emit('join', { nickname });
        return true;
      }
      return false;
    };

    if (!tryJoin()) {
      pendingJoin = nickname;
      const retryInterval = setInterval(() => {
        if (tryJoin()) {
          clearInterval(retryInterval);
          pendingJoin = null;
        }
      }, 500);
      setTimeout(() => {
        clearInterval(retryInterval);
        if (pendingJoin === nickname) pendingJoin = null;
      }, 15000);
    }
  };

  const movePlayer = (position: MovementData) => {
    if (socket && currentPlayer) {
      const updatedPlayer = { ...currentPlayer, ...position };
      setCurrentPlayer(updatedPlayer);
      setPlayers(prev => ({ ...prev, [currentPlayer.id]: updatedPlayer }));
      socket.emit('move', position);
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket) socket.emit('chat', message);
  };

  const interact = (interactionData: InteractionData) => {
    if (socket) socket.emit('interact', interactionData);
  };

  const equipItem = (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => {
    if (socket && currentPlayer) socket.emit('equipItem', { itemId, slot });
  };

  const value = {
    socket, isConnected, players, currentPlayer, chatMessages, currentMap,
    joinGame, movePlayer, sendChatMessage, interact, equipItem,
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
