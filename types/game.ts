/**
 * Tipos e interfaces para o jogo Ultimate Tic-Tac-Toe
 */

// Tipo para representar o valor de uma célula (vazio, X ou O)
export type CellValue = 'X' | 'O' | null;

// Tipo para representar um jogador
export type Player = 'X' | 'O';

// Tipo para um mini tabuleiro 3x3
export type MiniBoard = [
  [CellValue, CellValue, CellValue],
  [CellValue, CellValue, CellValue],
  [CellValue, CellValue, CellValue]
];

// Tipo para o tabuleiro principal (3x3 de mini tabuleiros)
export type MainBoard = [
  [MiniBoard, MiniBoard, MiniBoard],
  [MiniBoard, MiniBoard, MiniBoard],
  [MiniBoard, MiniBoard, MiniBoard]
];

// Tipo para rastrear quais mini tabuleiros foram vencidos
// null = não vencido, 'X' ou 'O' = vencido por aquele jogador
export type MiniBoardWinners = [
  [Player | null, Player | null, Player | null],
  [Player | null, Player | null, Player | null],
  [Player | null, Player | null, Player | null]
];

// Interface para a posição de uma jogada
export interface Position {
  boardRow: number;    // Linha do tabuleiro principal (0-2)
  boardCol: number;    // Coluna do tabuleiro principal (0-2)
  cellRow: number;     // Linha dentro do mini tabuleiro (0-2)
  cellCol: number;     // Coluna dentro do mini tabuleiro (0-2)
}

// Interface para o estado completo do jogo
export interface GameState {
  mainBoard: MainBoard;                  // Estado de todos os mini tabuleiros
  miniBoardWinners: MiniBoardWinners;    // Rastreamento de mini tabuleiros vencidos
  currentPlayer: Player;                 // Jogador da vez
  nextBoardPosition: [number, number] | null; // Próximo mini tabuleiro obrigatório [row, col]
  gameWinner: Player | 'draw' | null;    // Vencedor do jogo (ou empate, ou ainda em andamento)
  isGameOver: boolean;                   // Se o jogo terminou
}
