import { useState, useCallback, useEffect } from 'react';
import { Cell, GameState, Difficulty, DIFFICULTIES, PowerUp } from '../types/game';

export const useMinesweeper = (initialDifficulty: string = 'easy') => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const difficulty = DIFFICULTIES[initialDifficulty] || DIFFICULTIES.easy;
    return initializeGame(difficulty);
  });
  const [isFirstClick, setIsFirstClick] = useState(true);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        
        // Check if time freeze is active
        if (prev.timeFrozen && now < prev.timeFreezeEndTime) {
          return prev; // Don't increment time
        }
        
        // Check if X-ray should be deactivated
        let newXrayActive = prev.xrayActive;
        if (prev.xrayActive && now >= prev.xrayEndTime) {
          newXrayActive = false;
        }
        
        // Check if time freeze should be deactivated
        let newTimeFrozen = prev.timeFrozen;
        if (prev.timeFrozen && now >= prev.timeFreezeEndTime) {
          newTimeFrozen = false;
        }

        return {
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
          xrayActive: newXrayActive,
          timeFrozen: newTimeFrozen
        };
      });
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

  const placeMines = useCallback((board: Cell[][], difficulty: Difficulty, firstClickRow: number, firstClickCol: number) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < difficulty.mines) {
      const randomRow = Math.floor(Math.random() * difficulty.rows);
      const randomCol = Math.floor(Math.random() * difficulty.cols);

      // Don't place mine on first click or if already has mine
      if (newBoard[randomRow][randomCol].isMine || 
          (Math.abs(randomRow - firstClickRow) <= 1 && Math.abs(randomCol - firstClickCol) <= 1)) {
        continue;
      }

      newBoard[randomRow][randomCol].isMine = true;
      minesPlaced++;
    }

    // Calculate neighbor mine counts
    for (let r = 0; r < difficulty.rows; r++) {
      for (let c = 0; c < difficulty.cols; c++) {
        if (!newBoard[r][c].isMine) {
          newBoard[r][c].neighborMines = countNeighborMines(newBoard, r, c, difficulty);
        }
      }
    }

    return newBoard;
  }, [countNeighborMines]);

  const revealCell = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing') return prev;

      let newBoard = prev.board.map(boardRow => boardRow.map(cell => ({ ...cell })));
      
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
        newBoard.forEach(boardRow => {
          boardRow.forEach(cell => {
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

      const newBoard = prev.board.map(boardRow => boardRow.map(cell => ({ ...cell })));
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
    const difficulty = DIFFICULTIES[difficultyKey] || DIFFICULTIES.easy;
    resetGame(difficulty);
  }, [resetGame]);

  // Power-up functions
  const usePowerUp = useCallback((powerUpId: string) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing') return prev;
      
      const now = Date.now();
      const powerUp = prev.powerUps.find(p => p.id === powerUpId);
      
      if (!powerUp || powerUp.uses <= 0 || (now - powerUp.lastUsed) < powerUp.cooldown * 1000) {
        return prev;
      }

      const newPowerUps = prev.powerUps.map(p => 
        p.id === powerUpId 
          ? { ...p, uses: p.uses - 1, lastUsed: now }
          : p
      );

      const newState = { ...prev, powerUps: newPowerUps };

      switch (powerUpId) {
        case 'xray': {
          newState.xrayActive = true;
          newState.xrayEndTime = now + 5000; // 5 seconds
          break;
        }
        case 'timefreeze': {
          newState.timeFrozen = true;
          newState.timeFreezeEndTime = now + 10000; // 10 seconds
          break;
        }
        case 'safeclicks': {
          // Safe click is handled in revealCell
          break;
        }
        case 'autoflag': {
          // Auto-flag obvious mines
          const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
          
          // Find cells that are obviously mines (all neighbors revealed and count matches)
          for (let r = 0; r < prev.difficulty.rows; r++) {
            for (let c = 0; c < prev.difficulty.cols; c++) {
              const cell = newBoard[r][c];
              if (cell.isRevealed && cell.neighborMines > 0) {
                const neighbors = getNeighbors(r, c, prev.difficulty);
                const unrevealedNeighbors = neighbors.filter(([nr, nc]) => 
                  !newBoard[nr][nc].isRevealed && !newBoard[nr][nc].isFlagged
                );
                const flaggedNeighbors = neighbors.filter(([nr, nc]) => 
                  newBoard[nr][nc].isFlagged
                );
                
                if (flaggedNeighbors.length + unrevealedNeighbors.length === cell.neighborMines) {
                  // Flag all unrevealed neighbors
                  unrevealedNeighbors.forEach(([nr, nc]) => {
                    newBoard[nr][nc].isFlagged = true;
                  });
                }
              }
            }
          }
          
          const flagCount = newBoard.flat().filter(cell => cell.isFlagged).length;
          newState.board = newBoard;
          newState.flagCount = flagCount;
          break;
        }
      }

      return newState;
    });
  }, []);

  const getNeighbors = (row: number, col: number, difficulty: Difficulty): [number, number][] => {
    const neighbors: [number, number][] = [];
    for (let r = Math.max(0, row - 1); r <= Math.min(difficulty.rows - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(difficulty.cols - 1, col + 1); c++) {
        if (r !== row || c !== col) {
          neighbors.push([r, c]);
        }
      }
    }
    return neighbors;
  };

  const processRevealCell = useCallback((state: GameState, row: number, col: number): GameState => {
    let newBoard = state.board.map(boardRow => boardRow.map(cell => ({ ...cell })));
    
    // Handle first click - place mines after first click
    if (isFirstClick) {
      newBoard = placeMines(newBoard, state.difficulty, row, col);
      setIsFirstClick(false);
    }

    const cell = newBoard[row][col];
    if (cell.isRevealed || cell.isFlagged) return state;

    // Reveal the cell
    newBoard[row][col].isRevealed = true;

    // If it's a mine, game over
    if (cell.isMine) {
      // Reveal all mines
      newBoard.forEach(boardRow => {
        boardRow.forEach(cell => {
          if (cell.isMine) cell.isRevealed = true;
        });
      });
      return { ...state, board: newBoard, gameStatus: 'lost' };
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

        for (let nr = Math.max(0, r - 1); nr <= Math.min(state.difficulty.rows - 1, r + 1); nr++) {
          for (let nc = Math.max(0, c - 1); nc <= Math.min(state.difficulty.cols - 1, c + 1); nc++) {
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
    const totalCells = state.difficulty.rows * state.difficulty.cols;
    const isWon = revealedCount === totalCells - state.difficulty.mines;

    return {
      ...state,
      board: newBoard,
      gameStatus: isWon ? 'won' : 'playing'
    };
  }, [isFirstClick, placeMines]);

  // Enhanced reveal cell with safe click support
  const enhancedRevealCell = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing') return prev;

      const safeClickPowerUp = prev.powerUps.find(p => p.id === 'safeclicks');
      const cell = prev.board[row][col];
      
      // If using safe click and cell is a mine, find a safe alternative
      if (safeClickPowerUp && safeClickPowerUp.uses > 0 && !isFirstClick) {
        const newBoard = prev.board.map(boardRow => boardRow.map(cell => ({ ...cell })));
        
        if (cell.isMine && !cell.isRevealed && !cell.isFlagged) {
          // Find a safe cell to reveal instead
          const safeCells = newBoard.flat().filter(c => 
            !c.isMine && !c.isRevealed && !c.isFlagged
          );
          
          if (safeCells.length > 0) {
            const randomSafeCell = safeCells[Math.floor(Math.random() * safeCells.length)];
            // Use the safe cell coordinates instead
            row = randomSafeCell.row;
            col = randomSafeCell.col;
            
            // Consume the safe click
            const newPowerUps = prev.powerUps.map(p => 
              p.id === 'safeclicks' 
                ? { ...p, uses: p.uses - 1, lastUsed: Date.now() }
                : p
            );
            
            // Continue with normal reveal logic but with updated state
            const updatedState = { ...prev, powerUps: newPowerUps };
            return processRevealCell(updatedState, row, col);
          }
        }
      }
      
      return processRevealCell(prev, row, col);
    });
  }, [isFirstClick, processRevealCell]);

  return {
    gameState,
    revealCell: enhancedRevealCell,
    toggleFlag,
    resetGame,
    changeDifficulty,
    usePowerUp
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

  // Initialize power-ups based on difficulty
  const powerUps: PowerUp[] = [
    {
      id: 'xray',
      name: 'X-Ray Vision',
      description: 'Reveal mine locations for 5 seconds',
      icon: '👁️',
      uses: difficulty.name === 'Easy' ? 2 : difficulty.name === 'Medium' ? 1 : 1,
      maxUses: difficulty.name === 'Easy' ? 2 : difficulty.name === 'Medium' ? 1 : 1,
      cooldown: 30,
      lastUsed: 0
    },
    {
      id: 'safeclicks',
      name: 'Safe Click',
      description: 'Guaranteed safe click - redirects mines',
      icon: '🛡️',
      uses: difficulty.name === 'Easy' ? 3 : difficulty.name === 'Medium' ? 2 : 1,
      maxUses: difficulty.name === 'Easy' ? 3 : difficulty.name === 'Medium' ? 2 : 1,
      cooldown: 0,
      lastUsed: 0
    },
    {
      id: 'autoflag',
      name: 'Auto Flag',
      description: 'Automatically flag obvious mines',
      icon: '🚩',
      uses: difficulty.name === 'Easy' ? 3 : difficulty.name === 'Medium' ? 2 : 2,
      maxUses: difficulty.name === 'Easy' ? 3 : difficulty.name === 'Medium' ? 2 : 2,
      cooldown: 15,
      lastUsed: 0
    },
    {
      id: 'timefreeze',
      name: 'Time Freeze',
      description: 'Pause timer for 10 seconds',
      icon: '⏸️',
      uses: difficulty.name === 'Easy' ? 2 : 1,
      maxUses: difficulty.name === 'Easy' ? 2 : 1,
      cooldown: 60,
      lastUsed: 0
    }
  ];

  return {
    board,
    gameStatus: 'playing',
    mineCount: difficulty.mines,
    flagCount: 0,
    timeElapsed: 0,
    difficulty,
    powerUps,
    xrayActive: false,
    xrayEndTime: 0,
    timeFrozen: false,
    timeFreezeEndTime: 0
  };
}