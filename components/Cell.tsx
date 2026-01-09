/**
 * Componente Cell - Representa uma célula individual dentro de um mini tabuleiro
 */

import type { CellValue } from '@/types/game';

interface CellProps {
  value: CellValue;
  onClick: () => void;
  disabled: boolean;
  isWinningCell?: boolean;
}

export default function Cell({ value, onClick, disabled, isWinningCell = false }: CellProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square w-full
        flex items-center justify-center
        text-2xl sm:text-3xl font-bold
        border-2 border-gray-300
        transition-all duration-200
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
        ${value === 'X' ? 'text-blue-600' : value === 'O' ? 'text-red-600' : ''}
        ${isWinningCell ? 'bg-yellow-100' : 'bg-white'}
        ${!disabled && !value ? 'hover:bg-blue-50 active:bg-blue-100' : ''}
      `}
      aria-label={value ? `Cell with ${value}` : 'Empty cell'}
    >
      {value}
    </button>
  );
}
