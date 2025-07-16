import { useMinesweeper } from './hooks/useMinesweeper';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { PowerUps } from './components/PowerUps';

function App() {
  const { gameState, revealCell, toggleFlag, resetGame, changeDifficulty, usePowerUp } = useMinesweeper();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
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

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Power-ups */}
          <div className="lg:order-1">
            <PowerUps
              powerUps={gameState.powerUps}
              onUsePowerUp={usePowerUp}
              xrayActive={gameState.xrayActive}
              timeFrozen={gameState.timeFrozen}
            />
          </div>

          {/* Game Board */}
          <div className="lg:order-2 flex justify-center">
            <GameBoard
              gameState={gameState}
              onRevealCell={revealCell}
              onToggleFlag={toggleFlag}
            />
          </div>

          {/* Stats */}
          <div className="lg:order-3">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Game Stats</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="font-medium">{gameState.difficulty.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Grid Size:</span>
                  <span className="font-medium">{gameState.difficulty.rows}×{gameState.difficulty.cols}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Mines:</span>
                  <span className="font-medium">{gameState.difficulty.mines}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cells Revealed:</span>
                  <span className="font-medium">
                    {gameState.board.flat().filter(cell => cell.isRevealed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
          <p><strong>Left click</strong> to reveal a cell • <strong>Right click</strong> to flag/unflag a mine</p>
          <p>Use power-ups strategically to help you win! Numbers show adjacent mine count.</p>
        </div>
      </div>
    </div>
  );
}

export default App;