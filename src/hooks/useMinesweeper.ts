import { useState, useCallback, useEffect } from 'react';
import { Cell, GameState, Difficulty, DIFFICULTIES } from '../types/game';

export const useMinesweeper = (initialDifficulty: string = 'easy') => {
  const [gameState, setGameState] = useState<GameState>(() => 
    initializeGame(DIFFICULTIES[initialDifficulty])
  );
  const [isFirstClick, setIsFirstClick] = useState(true);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeElapsed: prev.timeElapsed + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameStatus]);

  const createEmptyBoard = useCallback((difficulty: Difficulty): Cell[][] => {
    const board: Cell[][] = [];
    for (let row = 0; row < difficulty.rows; row++) {
      board[row] = [];
      for (let col = 0; col < difficulty.cols; col++) {
        board[row][col] = {
          id: `${row}-${col}`,
          row,
          col,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }
    return board;
  }, []);

  const placeMines = useCallback((board: Cell[][], difficulty: Difficulty, firstClickRow: number, firstClickCol: number) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < difficulty.mines) {
      const row = Math.floor(Math.random() * difficulty.rows);
      const col = Math.floor(Math.random() * difficulty.cols);

      // Don't place mine on first click or if already has mine
      if (newBoard[row][col].isMine || 
          (Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1)) {
        continue;
      }

      newBoard[row][col].isMine = true;
      minesPlaced++;
    }

    // Calculate neighbor mine counts
    for (let row = 0; row < difficulty.rows; row++) {
      for (let col = 0; col < difficulty.cols; col++) {
        if (!newBoard[row][col].isMine) {
          newBoard[row][col].neighborMines = countNeighborMines(newBoard, row, col, difficulty);
        }
      }
    }

    return newBoard;
  }, [countNeighborMines]);

  const countNeighborMines = useCallback((board: Cell[][], row: number, col: number, difficulty: Difficulty): number => {
    let count = 0;
    for (let r = Math.max(0, row - 1); r <= Math.min(difficulty.rows - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(difficulty.cols - 1, col + 1); c++) {
        if (r !== row || c !== col) {
          if (board[r][c].isMine) count++;
        }
      }
    }
    return count;
  }, []);

  const revealCell = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing') return prev;

      let newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      
      // Handle first click - place mines after first click
      if (isFirstClick) {
        newBoard = placeMines(newBoard, prev.difficulty, row, col);
        setIsFirstClick(false);
      }

      const cell = newBoard[row][col];
      if (cell.isRevealed || cell.isFlagged) return prev;

      // Reveal the cell
      newBoard[row][col].isRevealed = true;

      // If it's a mine, game over
      if (cell.isMine) {
        // Reveal all mines
        newBoard.forEach(row => {
          row.forEach(cell => {
            if (cell.isMine) cell.isRevealed = true;
          });
        });
        return { ...prev, board: newBoard, gameStatus: 'lost' };
      }

      // If it's empty (no neighbor mines), reveal adjacent cells
      if (cell.neighborMines === 0) {
        const toReveal: [number, number][] = [[row, col]];
        const visited = new Set<string>();

        while (toReveal.length > 0) {
          const [r, c] = toReveal.pop()!;
          const key = `${r}-${c}`;
          
          if (visited.has(key)) continue;
          visited.add(key);

          for (let nr = Math.max(0, r - 1); nr <= Math.min(prev.difficulty.rows - 1, r + 1); nr++) {
            for (let nc = Math.max(0, c - 1); nc <= Math.min(prev.difficulty.cols - 1, c + 1); nc++) {
              const neighborCell = newBoard[nr][nc];
              if (!neighborCell.isRevealed && !neighborCell.isFlagged && !neighborCell.isMine) {
                neighborCell.isRevealed = true;
                if (neighborCell.neighborMines === 0) {
                  toReveal.push([nr, nc]);
                }
              }
            }
          }
        }
      }

      // Check for win condition
      const revealedCount = newBoard.flat().filter(cell => cell.isRevealed).length;
      const totalCells = prev.difficulty.rows * prev.difficulty.cols;
      const isWon = revealedCount === totalCells - prev.difficulty.mines;

      return {
        ...prev,
        board: newBoard,
        gameStatus: isWon ? 'won' : 'playing'
      };
    });
  }, [isFirstClick, placeMines]);

  const toggleFlag = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing') return prev;

      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (cell.isRevealed) return prev;

      cell.isFlagged = !cell.isFlagged;
      const flagCount = newBoard.flat().filter(cell => cell.isFlagged).length;

      return {
        ...prev,
        board: newBoard,
        flagCount
      };
    });
  }, []);

  const resetGame = useCallback((difficulty?: Difficulty) => {
    const newDifficulty = difficulty || gameState.difficulty;
    setGameState(initializeGame(newDifficulty));
    setIsFirstClick(true);
  }, [gameState.difficulty]);

  const changeDifficulty = useCallback((difficultyKey: string) => {
    const difficulty = DIFFICULTIES[difficultyKey];
    resetGame(difficulty);
  }, [resetGame]);

  return {
    gameState,
    revealCell,
    toggleFlag,
    resetGame,
    changeDifficulty
  };
};

function initializeGame(difficulty: Difficulty): GameState {
  const board: Cell[][] = [];
  for (let row = 0; row < difficulty.rows; row++) {
    board[row] = [];
    for (let col = 0; col < difficulty.cols; col++) {
      board[row][col] = {
        id: `${row}-${col}`,
        row,
        col,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      };
    }
  }

  return {
    board,
    gameStatus: 'playing',
    mineCount: difficulty.mines,
    flagCount: 0,
    timeElapsed: 0,
    difficulty
  };
}