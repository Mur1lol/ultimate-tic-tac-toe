/**
 * Componente MiniBoard - Representa um mini tabuleiro 3x3
 * Pode estar ativo (jogável), inativo (não jogável) ou vencido
 */

import Cell from './Cell';
import type { MiniBoard as MiniBoardType, Player } from '@/types/game';

interface MiniBoardProps {
  board: MiniBoardType;
  boardRow: number;
  boardCol: number;
  onCellClick: (cellRow: number, cellCol: number) => void;
  isActive: boolean;      // Se este é o mini tabuleiro obrigatório para a próxima jogada
  isAvailable: boolean;   // Se o tabuleiro está disponível para jogadas (não vencido e não cheio)
  winner: Player | null;  // Se o mini tabuleiro foi vencido
}

export default function MiniBoard({
  board,
  boardRow,
  boardCol,
  onCellClick,
  isActive,
  isAvailable,
  winner
}: MiniBoardProps) {
  // Determina se uma célula específica pode ser clicada
  const isCellDisabled = (cellRow: number, cellCol: number): boolean => {
    // Célula já ocupada
    if (board[cellRow][cellCol] !== null) {
      return true;
    }
    // Mini tabuleiro não está disponível
    if (!isAvailable) {
      return true;
    }
    // Se existe um tabuleiro obrigatório e este não é ele
    if (!isActive) {
      return true;
    }
    return false;
  };

  return (
    <div
      className={`
        relative
        border-4 rounded-lg
        p-1 sm:p-2
        ${isActive ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-400 bg-white'}
        ${!isAvailable ? 'opacity-60' : ''}
        transition-all duration-300
      `}
    >
      {/* Indicador visual de vitória */}
      {winner && (
        <div className="absolute inset-0 bg-opacity-90 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm"
          style={{ backgroundColor: winner === 'X' ? 'rgba(37, 99, 235, 0.9)' : 'rgba(220, 38, 38, 0.9)' }}
        >
          <span className="text-6xl sm:text-8xl font-bold text-white drop-shadow-lg">
            {winner}
          </span>
        </div>
      )}

      {/* Grid 3x3 do mini tabuleiro */}
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${boardRow}-${boardCol}-${rowIndex}-${colIndex}`}
              value={cell}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={isCellDisabled(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
}
