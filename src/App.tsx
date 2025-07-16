import { useMinesweeper } from './hooks/useMinesweeper';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';

function App() {
  const { gameState, revealCell, toggleFlag, resetGame, changeDifficulty } = useMinesweeper();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Minesweeper</h1>
          <p className="text-gray-600">Classic mine detection game</p>
        </div>

        {/* Game Header */}
        <div className="mb-6">
          <GameHeader
            gameState={gameState}
            onReset={resetGame}
            onChangeDifficulty={changeDifficulty}
          />
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          <GameBoard
            gameState={gameState}
            onRevealCell={revealCell}
            onToggleFlag={toggleFlag}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
          <p><strong>Left click</strong> to reveal a cell</p>
          <p><strong>Right click</strong> to flag/unflag a mine</p>
          <p>Numbers show how many mines are adjacent to that cell</p>
        </div>
      </div>
    </div>
  );
}

export default App;