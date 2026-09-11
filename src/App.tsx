import { useMemo } from 'react';
import { useSnakeGame, Direction, Difficulty } from './hooks/useSnakeGame';
import { useTouchControls } from './hooks/useTouchControls';

function App() {
  const {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize,
    lastAte,
    startGame,
    togglePause,
    restart,
    changeDirection,
    changeDifficulty,
  } = useSnakeGame();

  const touchRef = useTouchControls({
    onDirectionChange: changeDirection,
    onTap: () => {
      if (gameState === 'idle' || gameState === 'gameover') {
        startGame();
      } else {
        togglePause();
      }
    },
    enabled: gameState === 'playing' || gameState === 'paused',
  });

  // Build grid cells
  const gridCells = useMemo(() => {
    const cells: { key: string; type: 'empty' | 'snake-head' | 'snake-body' | 'food'; dir?: Direction }[] = [];
    const snakeSet = new Map<string, number>();
    snake.forEach((s, i) => {
      snakeSet.set(`${s.x},${s.y}`, i);
    });

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = `${x},${y}`;
        if (x === food.x && y === food.y) {
          cells.push({ key, type: 'food' });
        } else if (snakeSet.has(key)) {
          const idx = snakeSet.get(key)!;
          if (idx === 0) {
            cells.push({ key, type: 'snake-head', dir: direction });
          } else {
            cells.push({ key, type: 'snake-body' });
          }
        } else {
          cells.push({ key, type: 'empty' });
        }
      }
    }
    return cells;
  }, [snake, food, direction, gridSize]);

  const getHeadRotation = (dir: Direction) => {
    switch (dir) {
      case 'UP': return 'rotate(-90deg)';
      case 'DOWN': return 'rotate(90deg)';
      case 'LEFT': return 'rotate(180deg)';
      case 'RIGHT': return 'rotate(0deg)';
    }
  };

  const difficulties: { value: Difficulty; label: string; color: string }[] = [
    { value: 'easy', label: 'Easy', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'hard', label: 'Hard', color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 select-none">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-4">
          🐍 Snake Game
        </h1>

        {/* Score Board */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm font-medium">Score</span>
            <span className={`text-2xl font-bold text-white transition-transform duration-200 ${lastAte ? 'scale-125 text-green-400' : ''}`}>
              {score}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm font-medium">Best</span>
            <span className="text-2xl font-bold text-amber-400">
              {highScore}
            </span>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => changeDifficulty(d.value)}
              disabled={gameState === 'playing'}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                difficulty === d.value
                  ? `${d.color} text-white shadow-lg scale-105`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${gameState === 'playing' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div
        ref={touchRef}
        className="relative w-full max-w-lg aspect-square bg-gray-800/50 rounded-xl border-2 border-gray-700 shadow-2xl overflow-hidden backdrop-blur-sm"
      >
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
          {gridCells.map(cell => {
            if (cell.type === 'snake-head') {
              return (
                <div
                  key={cell.key}
                  className="relative flex items-center justify-center"
                >
                  <div
                    className="w-[90%] h-[90%] rounded-md bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 transition-transform duration-100"
                    style={{ transform: getHeadRotation(cell.dir!) }}
                  >
                    <div className="absolute top-[15%] right-[15%] w-[25%] h-[25%] rounded-full bg-white">
                      <div className="absolute top-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-gray-900"></div>
                    </div>
                    <div className="absolute bottom-[15%] right-[15%] w-[25%] h-[25%] rounded-full bg-white">
                      <div className="absolute top-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-gray-900"></div>
                    </div>
                  </div>
                </div>
              );
            }
            if (cell.type === 'snake-body') {
              return (
                <div key={cell.key} className="flex items-center justify-center">
                  <div className="w-[80%] h-[80%] rounded-md bg-gradient-to-br from-green-500 to-emerald-600 opacity-90"></div>
                </div>
              );
            }
            if (cell.type === 'food') {
              return (
                <div key={cell.key} className="flex items-center justify-center">
                  <div className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-red-400 to-rose-600 animate-pulse shadow-lg shadow-red-500/40 flex items-center justify-center">
                    <div className="w-[30%] h-[30%] rounded-full bg-white/30 -translate-x-1/4 -translate-y-1/4"></div>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={cell.key}
                className="border border-gray-800/30"
              ></div>
            );
          })}
        </div>

        {/* Overlays */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <div className="text-6xl mb-4 animate-bounce">🐍</div>
            <p className="text-white text-xl font-bold mb-2">Ready to Play?</p>
            <p className="text-gray-300 text-sm mb-4">Use arrow keys, WASD, or swipe to move</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-white text-2xl font-bold mb-4">Paused</p>
            <button
              onClick={togglePause}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Resume
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10">
            <div className="text-5xl mb-3">💀</div>
            <p className="text-white text-2xl font-bold mb-1">Game Over!</p>
            <p className="text-gray-300 text-lg mb-1">Score: <span className="text-green-400 font-bold">{score}</span></p>
            {score >= highScore && score > 0 && (
              <p className="text-amber-400 text-sm font-semibold mb-3 animate-pulse">🏆 New High Score!</p>
            )}
            <button
              onClick={restart}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-200 cursor-pointer mt-2"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg mt-4">
        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-4">
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
            >
              ⏸ Pause
            </button>
          )}
          {gameState === 'paused' && (
            <button
              onClick={togglePause}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
            >
              ▶ Resume
            </button>
          )}
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={restart}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
            >
              🔄 Restart
            </button>
          )}
        </div>

        {/* Mobile D-Pad */}
        <div className="md:hidden flex flex-col items-center gap-1 mt-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('UP'); }}
            className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl transition-colors duration-100 cursor-pointer touch-manipulation"
          >
            ↑
          </button>
          <div className="flex gap-1">
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
              className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl transition-colors duration-100 cursor-pointer touch-manipulation"
            >
              ←
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
              className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl transition-colors duration-100 cursor-pointer touch-manipulation"
            >
              ↓
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
              className="w-14 h-14 bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl transition-colors duration-100 cursor-pointer touch-manipulation"
            >
              →
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="hidden md:block text-center mt-3">
          <p className="text-gray-500 text-xs">
            Arrow keys / WASD to move • Space to pause • Enter to start
          </p>
        </div>
        <div className="md:hidden text-center mt-3">
          <p className="text-gray-500 text-xs">
            Swipe on board or use buttons • Tap board to pause
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
