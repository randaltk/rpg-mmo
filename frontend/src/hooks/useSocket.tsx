import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
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

// Singleton socket instance
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
    // Use singleton pattern to avoid multiple connections
    if (socketInstance && socketInitialized && socketInstance.connected) {
      console.log('Reusing existing socket connection');
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
      return;
    }

    // Se o socket existe mas não está conectado, reconecta
    if (socketInstance && !socketInstance.connected) {
      console.log('Socket exists but disconnected, reconnecting...');
      socketInstance.disconnect();
      socketInstance = null;
    }

    console.log('=== Iniciando conexão socket ===');
    socketInitialized = true;
    
    const newSocket = io('http://localhost:3001', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });
    socketInstance = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Conectado ao servidor, Socket ID:', newSocket.id);
      setIsConnected(true);
      
      // Se há um join pendente, executa agora
      if (pendingJoin) {
        console.log('🔄 Executando join pendente:', pendingJoin);
        newSocket.emit('join', { nickname: pendingJoin });
        pendingJoin = null;
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado do servidor');
      setIsConnected(false);
    });

    newSocket.on('reconnect', () => {
      console.log('🔄 Reconectado ao servidor');
      setIsConnected(true);
      
      // Se há um join pendente, executa agora
      if (pendingJoin) {
        console.log('🔄 Executando join pendente após reconexão:', pendingJoin);
        newSocket.emit('join', { nickname: pendingJoin });
        pendingJoin = null;
      }
    });

    newSocket.on('currentPlayers', (playersData: Record<string, Player>) => {
      console.log('📥 Recebidos jogadores:', playersData);
      console.log(' Socket ID atual:', newSocket.id);
      setPlayers(playersData);
      
      // Define o currentPlayer como o jogador atual (socket.id)
      const socketId = newSocket.id;
      if (socketId && playersData[socketId]) {
        console.log('✅ Definindo currentPlayer:', playersData[socketId]);
        setCurrentPlayer(playersData[socketId]);
      } else {
        console.log('❌ Socket ID não encontrado nos jogadores:', socketId, 'Jogadores disponíveis:', Object.keys(playersData));
        // Se não encontrou o jogador, tenta novamente após um pequeno delay
        setTimeout(() => {
          if (socketId && playersData[socketId]) {
            console.log('🔄 Tentando definir currentPlayer novamente:', playersData[socketId]);
            setCurrentPlayer(playersData[socketId]);
          }
        }, 100);
      }
    });

    newSocket.on('currentMap', (mapData: Map) => {
      console.log('🗺️ Mapa recebido:', mapData);
      setCurrentMap(mapData);
    });

    newSocket.on('newPlayer', (player: Player) => {
      console.log('👤 Novo jogador:', player);
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    });

    newSocket.on('playerMoved', (player: Player) => {
      console.log('🏃 Jogador movido:', player);
      setPlayers(prev => ({ ...prev, [player.id]: player }));
      // Só atualiza currentPlayer se NÃO for o jogador atual (para evitar conflito com movimento local)
      if (player.id !== newSocket.id) {
        setCurrentPlayer(prev => prev?.id === player.id ? player : prev);
      }
    });

    newSocket.on('removePlayer', (playerId: string) => {
      console.log('👋 Jogador removido:', playerId);
      setPlayers(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[playerId];
        return newPlayers;
      });
    });

    newSocket.on('chat', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, { ...message, timestamp: Date.now() }]);
    });

    return () => {
      // Don't close the socket here as it's shared
      console.log('Socket provider unmounting, but keeping connection alive');
    };
  }, []);

  const joinGame = (nickname: string) => {
    console.log('🎮 Tentando fazer join com nickname:', nickname);
    console.log('Socket disponível:', !!socket);
    console.log('Conectado:', isConnected);
    
    const tryJoin = () => {
      if (socket && isConnected) {
        console.log('✅ Enviando join com nickname:', nickname, 'Socket ID:', socket.id);
        socket.emit('join', { nickname });
        return true;
      }
      return false;
    };

    if (!tryJoin()) {
      console.log('⏳ Socket não está conectado ainda, salvando join pendente...');
      // Salva o join para ser executado quando conectar
      pendingJoin = nickname;
      
      // Se não estiver conectado, aguarda um pouco e tenta novamente
      const retryInterval = setInterval(() => {
        if (tryJoin()) {
          clearInterval(retryInterval);
          pendingJoin = null;
        }
      }, 500);
      
      // Timeout após 15 segundos
      setTimeout(() => {
        clearInterval(retryInterval);
        if (pendingJoin === nickname) {
          console.log('❌ Timeout ao tentar conectar');
          pendingJoin = null;
        }
      }, 15000);
    }
  };

  const movePlayer = (position: MovementData) => {
    if (socket && currentPlayer) {
      console.log(' Enviando movimento:', position);
      
      // Atualiza o currentPlayer localmente imediatamente para feedback visual
      const updatedPlayer = { ...currentPlayer, ...position };
      setCurrentPlayer(updatedPlayer);
      setPlayers(prev => ({ ...prev, [currentPlayer.id]: updatedPlayer }));
      
      // Envia para o servidor
      socket.emit('move', position);
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket) {
      socket.emit('chat', message);
    }
  };

  const interact = (interactionData: InteractionData) => {
    if (socket) {
      socket.emit('interact', interactionData);
    }
  };

  const equipItem = (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => {
    if (socket && currentPlayer) {
      socket.emit('equipItem', { itemId, slot });
    }
  };

  const value = {
    socket,
    isConnected,
    players,
    currentPlayer,
    chatMessages,
    currentMap,
    joinGame,
    movePlayer,
    sendChatMessage,
    interact,
    equipItem,
  };

  return (
    <SocketContext.Provider value={value}
      >
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

