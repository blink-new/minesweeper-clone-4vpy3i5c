import { GameState } from '../types/game';
import { MinesweeperCell } from './MinesweeperCell';

interface GameBoardProps {
  gameState: GameState;
  onRevealCell: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
}

export function GameBoard({ gameState, onRevealCell, onToggleFlag }: GameBoardProps) {
  const { board, gameStatus, difficulty } = gameState;

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${difficulty.cols}, 1fr)`,
    gap: '1px',
    padding: '8px',
    backgroundColor: '#9ca3af',
    border: '2px solid #6b7280',
    borderRadius: '4px',
    maxWidth: 'fit-content',
    margin: '0 auto'
  };

  return (
    <div 
      style={gridStyles}
      className="shadow-lg"
    >
      {board.flat().map((cell) => (
        <MinesweeperCell
          key={cell.id}
          cell={cell}
          onReveal={onRevealCell}
          onFlag={onToggleFlag}
          gameStatus={gameStatus}
        />
      ))}
    </div>
  );
}