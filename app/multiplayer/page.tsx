'use client';

/**
 * Página de Multiplayer Online
 * Permite criar ou entrar em salas para jogar 1v1
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import type { RoomInfo } from '@/types/socket';

export default function MultiplayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, isConnected } = useSocket();
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const playerNameRef = useRef(playerName);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [error, setError] = useState('');
  
  // Manter ref atualizada
  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  // Verificar se há código de sala na URL
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setRoomId(joinCode.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    if (!socket) return;

    console.log('[Lobby] Socket disponível. Connected:', isConnected, 'Socket ID:', socket.id);

    // Sala criada com sucesso
    socket.on('room-created', ({ roomId, playerNumber }: RoomInfo) => {
      const currentName = playerNameRef.current;
      console.log('[Cliente] Sala criada com sucesso:', roomId, 'playerNumber:', playerNumber);
      console.log('[Cliente] Nome do jogador:', currentName);
      setIsCreatingRoom(false);
      // Salvar nome no localStorage e redirecionar com nome na URL
      localStorage.setItem('playerName', currentName);
      const encodedName = encodeURIComponent(currentName);
      const url = `/multiplayer/game?room=${roomId}&player=${playerNumber}&name=${encodedName}`;
      console.log('[Cliente] Redirecionando para:', url);
      router.push(url);
    });

    // Entrou na sala com sucesso
    socket.on('room-joined', ({ roomId, playerNumber }: RoomInfo) => {
      const currentName = playerNameRef.current;
      console.log('[Cliente] Entrou na sala com sucesso:', roomId, 'playerNumber:', playerNumber);
      console.log('[Cliente] Nome do jogador:', currentName);
      setIsJoiningRoom(false);
      // Salvar nome no localStorage e redirecionar com nome na URL
      localStorage.setItem('playerName', currentName);
      const encodedName = encodeURIComponent(currentName);
      router.push(`/multiplayer/game?room=${roomId}&player=${playerNumber}&name=${encodedName}`);
    });

    // Erro ao criar/entrar na sala
    socket.on('error', ({ message }: { message: string }) => {
      console.log('[Cliente] Erro recebido:', message);
      setError(message);
      setIsCreatingRoom(false);
      setIsJoiningRoom(false);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('error');
    };
  }, [socket, router]);

  const handleCreateRoom = () => {
    if (!socket || !isConnected) {
      setError('Conectando ao servidor...');
      return;
    }

    if (!playerName.trim()) {
      setError('Digite seu nome antes de criar a sala');
      return;
    }

    setError('');
    setIsCreatingRoom(true);
    console.log('[Cliente] Criando sala com nome:', playerName.trim());
    socket.emit('create-room', { playerName: playerName.trim() });
  };

  const handleJoinRoom = () => {
    if (!socket || !isConnected) {
      setError('Conectando ao servidor...');
      return;
    }

    if (!playerName.trim()) {
      setError('Digite seu nome antes de entrar na sala');
      return;
    }

    if (!roomId.trim()) {
      setError('Digite um código de sala válido');
      return;
    }

    setError('');
    setIsJoiningRoom(true);
    console.log('[Cliente] Tentando entrar na sala:', roomId.toUpperCase(), 'com nome:', playerName.trim());
    socket.emit('join-room', { roomId: roomId.toUpperCase(), playerName: playerName.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            Multiplayer Online
          </h1>
          <p className="text-gray-600">
            Jogue Ultimate Tic-Tac-Toe com um amigo online!
          </p>
          
          {/* Status de conexão */}
          <div className="mt-4">
            {isConnected ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Conectado
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                Conectando...
              </span>
            )}
          </div>
        </div>

        {/* Cards de ação */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Campo de Nome (Compartilhado) */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <label className="block text-center mb-2 text-gray-700 font-semibold">
                Seu Nome
              </label>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 text-center text-lg text-black border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Criar Sala */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Criar Sala
              </h2>
              <p className="text-gray-600 text-sm">
                Crie uma nova sala e compartilhe o código com seu amigo
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!isConnected || isCreatingRoom || !playerName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {isCreatingRoom ? 'Criando...' : 'Criar Nova Sala'}
            </button>
          </div>

          {/* Entrar em Sala */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Entrar em Sala
              </h2>
              <p className="text-gray-600 text-sm">
                Digite o código da sala para entrar
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Código da sala (ex: ABC123)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-lg text-black font-mono uppercase border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              
              <button
                onClick={handleJoinRoom}
                disabled={!isConnected || isJoiningRoom || !roomId.trim() || !playerName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isJoiningRoom ? 'Entrando...' : 'Entrar na Sala'}
              </button>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Botão voltar */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Voltar para o menu
          </button>
        </div>

        {/* Instruções */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Como Jogar Online
          </h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">1.</span>
              <span>Um jogador cria uma sala e recebe um código</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">2.</span>
              <span>Compartilhe o código com seu amigo</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">3.</span>
              <span>Seu amigo entra usando o código</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">4.</span>
              <span>O jogo começa automaticamente! Jogador 1 é X, Jogador 2 é O</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
