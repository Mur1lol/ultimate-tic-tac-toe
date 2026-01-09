/**
 * Componente MainBoard - Tabuleiro principal contendo 9 mini tabuleiros
 */

import MiniBoard from './MiniBoard';
import type { MainBoard as MainBoardType, MiniBoardWinners, Player } from '@/types/game';
import { isBoardAvailable } from '@/utils/gameLogic';

interface MainBoardProps {
  mainBoard: MainBoardType;
  miniBoardWinners: MiniBoardWinners;
  nextBoardPosition: [number, number] | null;
  onCellClick: (boardRow: number, boardCol: number, cellRow: number, cellCol: number) => void;
  gameWinner: Player | 'draw' | null;
}

export default function MainBoard({
  mainBoard,
  miniBoardWinners,
  nextBoardPosition,
  onCellClick,
  gameWinner
}: MainBoardProps) {
  /**
   * Determina se um mini tabuleiro específico está ativo (deve ser jogado agora)
   */
  const isMiniBoardActive = (boardRow: number, boardCol: number): boolean => {
    // Se o jogo acabou, nenhum tabuleiro está ativo
    if (gameWinner) {
      return false;
    }
    
    // Se não há restrição de posição (início do jogo ou tabuleiro direcionado está indisponível)
    if (nextBoardPosition === null) {
      return isBoardAvailable(boardRow, boardCol, miniBoardWinners, mainBoard);
    }
    
    // Apenas o tabuleiro especificado está ativo
    return nextBoardPosition[0] === boardRow && nextBoardPosition[1] === boardCol;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
      {/* Grid 3x3 do tabuleiro principal */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-gray-800 p-2 sm:p-3 rounded-xl">
        {mainBoard.map((row, rowIndex) =>
          row.map((miniBoard, colIndex) => (
            <MiniBoard
              key={`${rowIndex}-${colIndex}`}
              board={miniBoard}
              boardRow={rowIndex}
              boardCol={colIndex}
              onCellClick={(cellRow, cellCol) => 
                onCellClick(rowIndex, colIndex, cellRow, cellCol)
              }
              isActive={isMiniBoardActive(rowIndex, colIndex)}
              isAvailable={isBoardAvailable(
                rowIndex,
                colIndex,
                miniBoardWinners,
                mainBoard
              )}
              winner={miniBoardWinners[rowIndex][colIndex]}
            />
          ))
        )}
      </div>
    </div>
  );
}
