'use client';

/**
 * Hook para comunicação com o servidor via polling HTTP
 * Substitui Socket.io para funcionar 100% na Vercel
 */

import { useEffect, useState, useCallback } from 'react';

interface UseGameRoomReturn {
  isConnected: boolean;
  createRoom: (playerName: string) => Promise<{ roomId: string; playerNumber: number } | null>;
  joinRoom: (roomId: string, playerName: string) => Promise<{ roomId: string; playerNumber: number; players: any[] } | null>;
  getRoom: (roomId: string) => Promise<any>;
  makeMove: (roomId: string, playerNumber: number, gameState: any) => Promise<boolean>;
  restartGame: (roomId: string) => Promise<{ startingPlayer: number } | null>;
}

export const useGameRoom = (): UseGameRoomReturn => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simula conexão (sempre conectado em polling HTTP)
    setIsConnected(true);
  }, []);

  const createRoom = useCallback(async (playerName: string) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-room', playerName })
      });
      
      const data = await response.json();
      if (data.success) {
        return { roomId: data.roomId, playerNumber: data.playerNumber };
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      return null;
    }
  }, []);

  const joinRoom = useCallback(async (roomId: string, playerName: string) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join-room', roomId, playerName })
      });
      
      const data = await response.json();
      if (data.success) {
        return { 
          roomId: data.roomId, 
          playerNumber: data.playerNumber,
          players: data.players 
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      return null;
    }
  }, []);

  const getRoom = useCallback(async (roomId: string) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-room', roomId })
      });
      
      const data = await response.json();
      if (data.success) {
        return data.room;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar sala:', error);
      return null;
    }
  }, []);

  const makeMove = useCallback(async (roomId: string, playerNumber: number, gameState: any) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'make-move', roomId, playerNumber, gameState })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao fazer jogada:', error);
      return false;
    }
  }, []);

  const restartGame = useCallback(async (roomId: string) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart-game', roomId })
      });
      
      const data = await response.json();
      if (data.success) {
        return { startingPlayer: data.startingPlayer };
      }
      return null;
    } catch (error) {
      console.error('Erro ao reiniciar jogo:', error);
      return null;
    }
  }, []);

  return {
    isConnected,
    createRoom,
    joinRoom,
    getRoom,
    makeMove,
    restartGame
  };
};
