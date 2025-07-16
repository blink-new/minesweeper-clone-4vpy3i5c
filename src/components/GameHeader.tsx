import { GameState, DIFFICULTIES } from '../types/game';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RotateCcw, Timer, Flag } from 'lucide-react';

interface GameHeaderProps {
  gameState: GameState;
  onReset: () => void;
  onChangeDifficulty: (difficulty: string) => void;
}

export function GameHeader({ gameState, onReset, onChangeDifficulty }: GameHeaderProps) {
  const { timeElapsed, mineCount, flagCount, gameStatus, difficulty } = gameState;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusEmoji = () => {
    switch (gameStatus) {
      case 'won': return '😎';
      case 'lost': return '😵';
      default: return '🙂';
    }
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'won': return 'Congratulations! You won!';
      case 'lost': return 'Game Over! Try again.';
      default: return 'Click to reveal cells, right-click to flag mines';
    }
  };

  const remainingMines = mineCount - flagCount;

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <div className="text-center">
        <div className="text-4xl mb-2">{getStatusEmoji()}</div>
        <p className="text-sm text-gray-600">{getStatusMessage()}</p>
      </div>

      {/* Game Controls */}
      <div className="flex items-center justify-between gap-4 bg-gray-100 p-4 rounded-lg">
        {/* Timer */}
        <div className="flex items-center gap-2 bg-black text-green-400 px-3 py-2 rounded font-mono text-lg">
          <Timer className="w-4 h-4" />
          {formatTime(timeElapsed)}
        </div>

        {/* Reset Button */}
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </Button>

        {/* Mine Counter */}
        <div className="flex items-center gap-2 bg-black text-red-400 px-3 py-2 rounded font-mono text-lg">
          <Flag className="w-4 h-4" />
          {remainingMines.toString().padStart(3, '0')}
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-medium">Difficulty:</span>
        <Select value={Object.keys(DIFFICULTIES).find(key => DIFFICULTIES[key] === difficulty)} onValueChange={onChangeDifficulty}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DIFFICULTIES).map(([key, diff]) => (
              <SelectItem key={key} value={key}>
                {diff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}