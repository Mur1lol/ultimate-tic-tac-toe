import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';
import type { Server as SocketIOServer } from 'socket.io';

/**
 * Tipos estendidos para Socket.io no Next.js
 */

export interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: SocketServer;
  };
}

export interface Position {
  boardRow: number;
  boardCol: number;
  cellRow: number;
  cellCol: number;
}

export interface RoomInfo {
  roomId: string;
  playerNumber: 1 | 2;
}

export interface GameStartInfo {
  player1: string;
  player2: string;
}

export interface MoveData {
  roomId: string;
  move: Position;
  gameState: any;
}
