/**
 * Lógica do jogo Ultimate Tic-Tac-Toe
 * Contém funções para verificação de vitória e gerenciamento de estado
 */

import type { CellValue, MiniBoard, MiniBoardWinners, Player, MainBoard, GameState } from '@/types/game';

/**
 * Verifica se há um vencedor em um mini tabuleiro ou no tabuleiro principal
 * Checa linhas, colunas e diagonais
 */
export function checkWinner(board: CellValue[][]): CellValue {
  // Verifica linhas
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      return board[i][0];
    }
  }

  // Verifica colunas
  for (let i = 0; i < 3; i++) {
    if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
      return board[0][i];
    }
  }

  // Verifica diagonal principal (top-left para bottom-right)
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0];
  }

  // Verifica diagonal secundária (top-right para bottom-left)
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2];
  }

  return null;
}

/**
 * Verifica se um mini tabuleiro está completamente preenchido (empate ou vencido)
 */
export function isBoardFull(board: MiniBoard): boolean {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Verifica se um mini tabuleiro está disponível para jogadas
 * Um tabuleiro está indisponível se já foi vencido ou está completamente cheio
 */
export function isBoardAvailable(
  boardRow: number,
  boardCol: number,
  miniBoardWinners: MiniBoardWinners,
  mainBoard: MainBoard
): boolean {
  // Se já foi vencido, não está disponível
  if (miniBoardWinners[boardRow][boardCol] !== null) {
    return false;
  }
  
  // Se está completamente cheio, não está disponível
  return !isBoardFull(mainBoard[boardRow][boardCol]);
}

/**
 * Cria um mini tabuleiro vazio
 */
export function createEmptyMiniBoard(): MiniBoard {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];
}

/**
 * Cria o tabuleiro principal inicial (9 mini tabuleiros vazios)
 */
export function createEmptyMainBoard(): MainBoard {
  return [
    [createEmptyMiniBoard(), createEmptyMiniBoard(), createEmptyMiniBoard()],
    [createEmptyMiniBoard(), createEmptyMiniBoard(), createEmptyMiniBoard()],
    [createEmptyMiniBoard(), createEmptyMiniBoard(), createEmptyMiniBoard()]
  ];
}

/**
 * Cria a matriz de vencedores de mini tabuleiros inicial
 */
export function createEmptyWinners(): MiniBoardWinners {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];
}

/**
 * Verifica se há algum mini tabuleiro disponível para jogar
 */
export function hasAvailableBoards(
  miniBoardWinners: MiniBoardWinners,
  mainBoard: MainBoard
): boolean {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (isBoardAvailable(row, col, miniBoardWinners, mainBoard)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Cria o estado inicial do jogo
 */
export function createInitialGameState(): GameState {
  return {
    mainBoard: createEmptyMainBoard(),
    miniBoardWinners: createEmptyWinners(),
    currentPlayer: 'X',
    nextBoardPosition: null, // Jogador inicial pode escolher qualquer tabuleiro
    gameWinner: null,
    isGameOver: false
  };
}
