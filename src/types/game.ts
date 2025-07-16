export interface Cell {
  id: string;
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export interface GameState {
  board: Cell[][];
  gameStatus: 'playing' | 'won' | 'lost';
  mineCount: number;
  flagCount: number;
  timeElapsed: number;
  difficulty: Difficulty;
}

export interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTIES: Record<string, Difficulty> = {
  easy: { name: 'Easy', rows: 9, cols: 9, mines: 10 },
  medium: { name: 'Medium', rows: 16, cols: 16, mines: 40 },
  hard: { name: 'Hard', rows: 16, cols: 30, mines: 99 }
};