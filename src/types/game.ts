export interface Cell {
  id: string;
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  uses: number;
  maxUses: number;
  cooldown: number;
  lastUsed: number;
}

export interface GameState {
  board: Cell[][];
  gameStatus: 'playing' | 'won' | 'lost';
  mineCount: number;
  flagCount: number;
  timeElapsed: number;
  difficulty: Difficulty;
  powerUps: PowerUp[];
  xrayActive: boolean;
  xrayEndTime: number;
  timeFrozen: boolean;
  timeFreezeEndTime: number;
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