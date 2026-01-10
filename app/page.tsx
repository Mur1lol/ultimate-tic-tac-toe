'use client';

/**
 * Página principal do Ultimate Tic-Tac-Toe
 * Menu para escolher modo de jogo
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainBoard from '@/components/MainBoard';
import type { GameState, Player } from '@/types/game';
import {
  createInitialGameState,
  checkWinner,
  isBoardAvailable,
  hasAvailableBoards
} from '@/utils/gameLogic';

export default function Home() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(true);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());

  /**
   * Função principal que processa uma jogada
   */
  const handleCellClick = (
    boardRow: number,
    boardCol: number,
    cellRow: number,
    cellCol: number
  ) => {
    // Se o jogo já terminou, não permite jogadas
    if (gameState.isGameOver) {
      return;
    }

    // Verifica se o mini tabuleiro está disponível
    if (!isBoardAvailable(boardRow, boardCol, gameState.miniBoardWinners, gameState.mainBoard)) {
      return;
    }

    // Se há uma posição obrigatória, verifica se a jogada está nela
    if (
      gameState.nextBoardPosition !== null &&
      (gameState.nextBoardPosition[0] !== boardRow || gameState.nextBoardPosition[1] !== boardCol)
    ) {
      return;
    }

    // Verifica se a célula já está ocupada
    if (gameState.mainBoard[boardRow][boardCol][cellRow][cellCol] !== null) {
      return;
    }

    // Cria uma cópia profunda do estado para imutabilidade
    const newMainBoard = gameState.mainBoard.map(row =>
      row.map(miniBoard =>
        miniBoard.map(miniBoardRow => [...miniBoardRow])
      )
    ) as typeof gameState.mainBoard;

    const newMiniBoardWinners = gameState.miniBoardWinners.map(row => [...row]) as typeof gameState.miniBoardWinners;

    // Realiza a jogada
    newMainBoard[boardRow][boardCol][cellRow][cellCol] = gameState.currentPlayer;

    // Verifica se o mini tabuleiro foi vencido
    const miniBoardWinner = checkWinner(newMainBoard[boardRow][boardCol]);
    if (miniBoardWinner) {
      newMiniBoardWinners[boardRow][boardCol] = miniBoardWinner as Player;
    }

    // Verifica se o jogo foi vencido (analisando os mini tabuleiros vencidos)
    const mainWinner = checkWinner(newMiniBoardWinners);
    
    // Determina o próximo mini tabuleiro obrigatório
    // A jogada em (cellRow, cellCol) define o próximo tabuleiro como (cellRow, cellCol) do tabuleiro principal
    let nextBoard: [number, number] | null = [cellRow, cellCol];
    
    // Se o tabuleiro direcionado não está disponível, jogador pode escolher livremente
    if (!isBoardAvailable(cellRow, cellCol, newMiniBoardWinners, newMainBoard)) {
      nextBoard = null;
    }

    // Verifica empate no jogo principal
    let isDraw = false;
    if (!mainWinner && !hasAvailableBoards(newMiniBoardWinners, newMainBoard)) {
      isDraw = true;
    }

    // Atualiza o estado do jogo
    setGameState({
      mainBoard: newMainBoard,
      miniBoardWinners: newMiniBoardWinners,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
      nextBoardPosition: nextBoard,
      gameWinner: mainWinner ? (mainWinner as Player) : (isDraw ? 'draw' : null),
      isGameOver: mainWinner !== null || isDraw
    });
  };

  /**
   * Reinicia o jogo
   */
  const handleRestart = () => {
    setGameState(createInitialGameState());
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
    setGameState(createInitialGameState());
  };

  // Menu de seleção de modo
  if (showMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Ultimate Tic-Tac-Toe
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Escolha o modo de jogo
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Modo Local */}
            <button
              onClick={() => setShowMenu(false)}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Jogar Local
              </h2>
              <p className="text-gray-600">
                Jogue no mesmo dispositivo com um amigo
              </p>
            </button>

            {/* Modo Online */}
            <button
              onClick={() => router.push('/multiplayer')}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Jogar Online
              </h2>
              <p className="text-gray-600">
                Jogue com um amigo pela internet
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Novo!
              </span>
            </button>
          </div>

          {/* Regras do jogo */}
          <details className="bg-white rounded-xl shadow-lg p-6 mt-8 max-w-3xl mx-auto">
            <summary className="text-xl font-bold text-gray-800 cursor-pointer">
              Como Jogar
            </summary>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• O jogo consiste em um tabuleiro 3x3 de mini tabuleiros 3x3</li>
              <li>• Sua jogada em uma célula determina onde o próximo jogador deve jogar</li>
              <li>• Vença um mini tabuleiro fazendo 3 em linha nele</li>
              <li>• Vença o jogo conquistando 3 mini tabuleiros em linha</li>
              <li>• Se o mini tabuleiro direcionado estiver cheio ou vencido, escolha livremente</li>
            </ul>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Ultimate Tic-Tac-Toe - Local
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Vença 3 mini tabuleiros em linha para ganhar!
          </p>
          <button
            onClick={handleBackToMenu}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Voltar ao menu
          </button>
        </header>

        {/* Informações do jogo */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Status do jogo */}
          {!gameState.isGameOver ? (
            <div className="text-center">
              <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                Vez do jogador:{' '}
                <span
                  className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                    gameState.currentPlayer === 'X' ? 'text-blue-600' : 'text-red-600'
                  }`}
                >
                  {gameState.currentPlayer}
                </span>
              </p>
              
              {/* Indicação do mini tabuleiro obrigatório */}
              {gameState.nextBoardPosition !== null ? (
                <p className="text-sm sm:text-base text-gray-600">
                  Jogue no mini tabuleiro destacado
                </p>
              ) : (
                <p className="text-sm sm:text-base text-gray-600">
                  Escolha qualquer mini tabuleiro disponível
                </p>
              )}
            </div>
          ) : (
            // Mensagem de fim de jogo
            <div className="text-center">
              {gameState.gameWinner === 'draw' ? (
                <p className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">
                  Empate! 🤝
                </p>
              ) : (
                <p className="text-2xl sm:text-3xl font-bold mb-4">
                  <span
                    className={
                      gameState.gameWinner === 'X' ? 'text-blue-600' : 'text-red-600'
                    }
                  >
                    Jogador {gameState.gameWinner}
                  </span>{' '}
                  venceu! 🎉
                </p>
              )}
              
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Jogar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Tabuleiro principal */}
        <MainBoard
          mainBoard={gameState.mainBoard}
          miniBoardWinners={gameState.miniBoardWinners}
          nextBoardPosition={gameState.nextBoardPosition}
          onCellClick={handleCellClick}
          gameWinner={gameState.gameWinner}
        />

        {/* Botão de reiniciar (sempre visível) */}
        {!gameState.isGameOver && (
          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={handleRestart}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 sm:py-2 sm:px-6 rounded-lg text-sm sm:text-base transition-all duration-200"
            >
              Reiniciar Jogo
            </button>
          </div>
        )}

        {/* Regras do jogo (colapsável em mobile) */}
        <details className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <summary className="text-lg sm:text-xl font-bold text-gray-800 cursor-pointer">
            Como Jogar
          </summary>
          <ul className="mt-4 space-y-2 text-sm sm:text-base text-gray-700">
            <li>• O jogo consiste em um tabuleiro 3x3 de mini tabuleiros 3x3</li>
            <li>• Sua jogada em uma célula determina onde o próximo jogador deve jogar</li>
            <li>• Vença um mini tabuleiro fazendo 3 em linha nele</li>
            <li>• Vença o jogo conquistando 3 mini tabuleiros em linha</li>
            <li>• Se o mini tabuleiro direcionado estiver cheio ou vencido, escolha livremente</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
