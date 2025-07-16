import { Cell } from '../types/game';
import { cn } from '../lib/utils';

interface MinesweeperCellProps {
  cell: Cell;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  gameStatus: 'playing' | 'won' | 'lost';
}

const numberColors = {
  1: 'text-blue-600',
  2: 'text-green-600', 
  3: 'text-red-600',
  4: 'text-purple-600',
  5: 'text-yellow-600',
  6: 'text-pink-600',
  7: 'text-black',
  8: 'text-gray-600'
};

export function MinesweeperCell({ cell, onReveal, onFlag, gameStatus }: MinesweeperCellProps) {
  const handleClick = () => {
    if (gameStatus !== 'playing') return;
    onReveal(cell.row, cell.col);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;
    onFlag(cell.row, cell.col);
  };

  const getCellContent = () => {
    if (cell.isFlagged) {
      return <span className="text-red-500 font-bold">🚩</span>;
    }
    
    if (!cell.isRevealed) {
      return null;
    }

    if (cell.isMine) {
      return <span className="text-red-600 font-bold">💣</span>;
    }

    if (cell.neighborMines > 0) {
      return (
        <span className={cn('font-bold text-sm', numberColors[cell.neighborMines as keyof typeof numberColors])}>
          {cell.neighborMines}
        </span>
      );
    }

    return null;
  };

  const getCellStyles = () => {
    const baseStyles = 'w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-medium cursor-pointer select-none transition-all duration-150';
    
    if (!cell.isRevealed) {
      return cn(
        baseStyles,
        'bg-gray-300 hover:bg-gray-200 active:bg-gray-400',
        'shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]',
        cell.isFlagged && 'bg-yellow-200 hover:bg-yellow-100'
      );
    }

    if (cell.isMine && gameStatus === 'lost') {
      return cn(baseStyles, 'bg-red-500 text-white');
    }

    return cn(
      baseStyles,
      'bg-gray-100 border-gray-300',
      'shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]'
    );
  };

  return (
    <button
      className={getCellStyles()}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      disabled={gameStatus !== 'playing'}
    >
      {getCellContent()}
    </button>
  );
}