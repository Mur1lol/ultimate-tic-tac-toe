'use client';

/**
 * Hook customizado para gerenciar conexão Socket.io
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Inicializar conexão Socket.io
    const socketInitializer = async () => {
      try {
        // Conectar ao servidor Socket.io
        if (!socket) {
          console.log('[useSocket] Iniciando conexão...');
          
          socket = io({
            path: '/api/socket',
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
          });

          socket.on('connect', () => {
            console.log('[useSocket] Conectado ao servidor Socket.io. ID:', socket?.id);
            setIsConnected(true);
          });

          socket.on('disconnect', () => {
            console.log('[useSocket] Desconectado do servidor');
            setIsConnected(false);
          });

          socket.on('connect_error', (error) => {
            console.error('[useSocket] Erro de conexão Socket.io:', error);
          });
        }
      } catch (error) {
        console.error('[useSocket] Erro ao inicializar socket:', error);
      }
    };

    socketInitializer();

    return () => {
      if (socket) {
        console.log('Limpando conexão socket');
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return { socket, isConnected };
};

export const getSocket = () => socket;
