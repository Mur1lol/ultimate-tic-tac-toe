'use client';

/**
 * Página do jogo multiplayer online
 * Sincroniza o estado do jogo entre dois jogadores via HTTP polling
 */

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainBoard from '@/components/MainBoard';
import { useGameRoom } from '@/hooks/useGameRoom';
import type { GameState, Player } from '@/types/game';
import {
  createInitialGameState,
  checkWinner,
  isBoardAvailable,
  hasAvailableBoards
} from '@/utils/gameLogic';

function MultiplayerGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getRoom, makeMove, restartGame } = useGameRoom();
  
  const roomId = searchParams.get('room');
  const playerNumber = parseInt(searchParams.get('player') || '0') as 1 | 2;
  const urlName = searchParams.get('name');
  
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [mySymbol, setMySymbol] = useState<Player>('X');
  const [myName, setMyName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // Configurar nome e símbolo
  useEffect(() => {
    const decodedName = urlName ? decodeURIComponent(urlName) : null;
    const savedName = decodedName || localStorage.getItem('playerName') || 'Jogador';
    setMyName(savedName);

    if (playerNumber === 1) {
      setMySymbol('X');
    } else if (playerNumber === 2) {
      setMySymbol('O');
    }
  }, [playerNumber, urlName]);

  // Polling: buscar estado da sala periodicamente
  const pollRoomState = useCallback(async () => {
    if (!roomId) return;
    
    const room = await getRoom(roomId);
    if (!room) {
      console.error('Sala não encontrada');
      return;
    }

    // Atualizar estado dos jogadores
    if (room.players && room.players.length === 2) {
      setGameStarted(true);
      setOpponentConnected(true);
      
      const opponent = room.players.find((_: any, idx: number) => idx + 1 !== playerNumber);
      if (opponent) {
        setOpponentName(opponent.name);
      }
    }

    // Atualizar estado do jogo
    if (room.gameState) {
      setGameState(room.gameState);
      
      // Determinar se é minha vez
      // Jogador 1 = X, Jogador 2 = O
      // Se currentPlayer é X, é turno do jogador 1
      // Se currentPlayer é O, é turno do jogador 2
      const currentPlayerSymbol = room.gameState.currentPlayer;
      const isMyTurnNow = (currentPlayerSymbol === 'X' && playerNumber === 1) || 
                          (currentPlayerSymbol === 'O' && playerNumber === 2);
      console.log('[Polling] currentPlayer:', currentPlayerSymbol, 'myPlayer:', playerNumber, 'isMyTurn:', isMyTurnNow);
      setIsMyTurn(isMyTurnNow);
    } else {
      // Jogo ainda não iniciou, jogador 1 (X) sempre começa
      if (room.players && room.players.length === 2) {
        console.log('[Polling] Jogo iniciando, definindo turno. PlayerNumber:', playerNumber);
        setIsMyTurn(playerNumber === 1);
      }
    }
    }
  }, [roomId, playerNumber, getRoom]);

  // Iniciar polling quando a página carregar
  useEffect(() => {
    if (!roomId) return;

    // Poll imediatamente
    pollRoomState();

    // Poll a cada 1.5 segundos
    const intervalId = setInterval(pollRoomState, 1500);

    return () => clearInterval(intervalId);
  }, [roomId, pollRoomState]);

  const handleCellClick = async (
    boardRow: number,
    boardCol: number,
    cellRow: number,
    cellCol: number
  ) => {
    // Validações
    if (!gameStarted || !isMyTurn) return;
    if (gameState.isGameOver) return;
    if (!isBoardAvailable(boardRow, boardCol, gameState.miniBoardWinners, gameState.mainBoard)) return;
    if (
      gameState.nextBoardPosition !== null &&
      (gameState.nextBoardPosition[0] !== boardRow || gameState.nextBoardPosition[1] !== boardCol)
    ) return;
    if (gameState.mainBoard[boardRow][boardCol][cellRow][cellCol] !== null) return;

    // Criar novo estado
    const newMainBoard = gameState.mainBoard.map(row =>
      row.map(miniBoard =>
        miniBoard.map(miniBoardRow => [...miniBoardRow])
      )
    ) as typeof gameState.mainBoard;

    const newMiniBoardWinners = gameState.miniBoardWinners.map(row => [...row]) as typeof gameState.miniBoardWinners;

    newMainBoard[boardRow][boardCol][cellRow][cellCol] = mySymbol;

    const miniBoardWinner = checkWinner(newMainBoard[boardRow][boardCol]);
    if (miniBoardWinner) {
      newMiniBoardWinners[boardRow][boardCol] = miniBoardWinner as Player;
    }

    const mainWinner = checkWinner(newMiniBoardWinners);
    
    let nextBoard: [number, number] | null = [cellRow, cellCol];
    if (!isBoardAvailable(cellRow, cellCol, newMiniBoardWinners, newMainBoard)) {
      nextBoard = null;
    }

    let isDraw = false;
    if (!mainWinner && !hasAvailableBoards(newMiniBoardWinners, newMainBoard)) {
      isDraw = true;
    }

    const newGameState: GameState = {
      mainBoard: newMainBoard,
      miniBoardWinners: newMiniBoardWinners,
      currentPlayer: mySymbol === 'X' ? 'O' : 'X',
      nextBoardPosition: nextBoard,
      gameWinner: mainWinner ? (mainWinner as Player) : (isDraw ? 'draw' : null),
      isGameOver: mainWinner !== null || isDraw
    };

    setGameState(newGameState);
    setIsMyTurn(false);

    // Enviar jogada via HTTP
    if (roomId) {
      await makeMove(roomId, playerNumber, newGameState);
      // Poll imediatamente para sincronizar
      pollRoomState();
    }
  };

  const handleRestart = async () => {
    if (roomId) {
      const result = await restartGame(roomId);
      if (result) {
        const initialState = createInitialGameState();
        setGameState(initialState);
        setIsMyTurn(result.startingPlayer === playerNumber);
      }
    }
  };

  const handleLeaveRoom = () => {
    router.push('/multiplayer');
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/multiplayer?join=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    });
  };

  if (!roomId || !playerNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">Parâmetros inválidos</p>
          <button
            onClick={() => router.push('/multiplayer')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Voltar ao Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <header className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Multiplayer Online
          </h1>
          
          {/* Código da sala e botão de compartilhar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
            <div className="inline-flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
              <span className="text-sm text-gray-600 mr-2">Sala:</span>
              <span className="text-lg font-mono font-bold text-blue-600">{roomId}</span>
            </div>
            
            <button
              onClick={copyRoomLink}
              className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {showCopiedMessage ? 'Copiado!' : 'Compartilhar'}
            </button>
          </div>

          {/* Status da conexão */}
          <div className="text-sm">
            {!opponentConnected && (
              <span className="text-yellow-600">⏳ Aguardando oponente...</span>
            )}
            {opponentConnected && gameStarted && (
              <span className="text-green-600">✓ Conectado com oponente</span>
            )}
          </div>
        </header>

        {/* Informações do jogo */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* Seu jogador */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Você</p>
              <p className="text-xs font-semibold text-gray-700 mb-1">{myName}</p>
              <span className={`text-2xl font-bold ${mySymbol === 'X' ? 'text-blue-600' : 'text-red-600'}`}>
                {mySymbol}
              </span>
            </div>

            {/* Status do turno */}
            <div className="text-center flex-1">
              {!gameState.isGameOver ? (
                <>
                  <p className="text-sm text-gray-600 mb-1">
                    {isMyTurn ? 'Sua vez!' : 'Vez do oponente'}
                  </p>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    isMyTurn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isMyTurn ? '🎮' : '⏳'}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  {gameState.gameWinner === 'draw' ? (
                    <p className="text-xl font-bold text-gray-700">Empate! 🤝</p>
                  ) : gameState.gameWinner === mySymbol ? (
                    <p className="text-xl font-bold text-green-600">Você venceu! 🎉</p>
                  ) : (
                    <p className="text-xl font-bold text-red-600">Você perdeu 😢</p>
                  )}
                </div>
              )}
            </div>

            {/* Oponente */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Oponente</p>
              <p className="text-xs font-semibold text-gray-700 mb-1">
                {opponentName || 'Aguardando...'}
              </p>
              <span className={`text-2xl font-bold ${mySymbol === 'X' ? 'text-red-600' : 'text-blue-600'}`}>
                {mySymbol === 'X' ? 'O' : 'X'}
              </span>
            </div>
          </div>

          {/* Indicação do tabuleiro obrigatório */}
          {!gameState.isGameOver && gameState.nextBoardPosition !== null && isMyTurn && (
            <p className="text-sm text-center text-gray-600">
              Jogue no mini tabuleiro destacado
            </p>
          )}
          {!gameState.isGameOver && gameState.nextBoardPosition === null && isMyTurn && (
            <p className="text-sm text-center text-gray-600">
              Escolha qualquer mini tabuleiro disponível
            </p>
          )}
        </div>

        {/* Tabuleiro */}
        {gameStarted ? (
          <MainBoard
            mainBoard={gameState.mainBoard}
            miniBoardWinners={gameState.miniBoardWinners}
            nextBoardPosition={gameState.nextBoardPosition}
            onCellClick={handleCellClick}
            gameWinner={gameState.gameWinner}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4"></div>
              <p className="text-xl font-semibold text-gray-700">
                Aguardando oponente...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Compartilhe o código da sala: <span className="font-mono font-bold">{roomId}</span>
              </p>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-4 justify-center mt-6">
          {gameState.isGameOver && (
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 shadow-lg"
            >
              Jogar Novamente
            </button>
          )}
          
          <button
            onClick={handleLeaveRoom}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
          >
            Sair da Sala
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MultiplayerGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    }>
      <MultiplayerGameContent />
    </Suspense>
  );
}
