import React, { useState, useEffect, useMemo } from "react";
import createGameLogic from "./game/gameLogic";

const Scoreboard = ({ players }) => {
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const indexify = ["st", "nd", "rd", "th"];

  return (
    <div className="mt-8 p-6 bg-white shadow-xl rounded-xl w-full max-w-sm mx-auto text-center">
      <h3 className="text-2xl font-extrabold text-blue-700 mb-4 flex items-center justify-center">
        Final Scoreboard <span className="ml-2 text-3xl">🏆</span>
      </h3>
      <ul className="space-y-3 list-none p-0 inline-block max-w-xs w-full text-left mx-auto">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const suffix = rank <= 3 ? indexify[index] : "th";
          const isWinner = index === 0;
          return (
            <li
              key={player.name}
              className={`flex justify-between items-center p-3 rounded-lg ${
                isWinner
                  ? "bg-yellow-100 font-bold border-2 border-yellow-400"
                  : "bg-gray-50"
              }`}
            >
              <span
                className={`text-lg font-mono ${
                  isWinner ? "text-yellow-600" : "text-gray-500"
                }`}
              >
                {`${rank}${suffix}`}
              </span>
              <strong className="text-gray-800">{player.name}</strong>
              <span
                className={`text-xl font-extrabold ${
                  isWinner ? "text-yellow-700" : "text-green-600"
                }`}
              >
                {player.score}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

function App() {
  const [game, setGame] = useState(() => createGameLogic());
  const [players, setPlayers] = useState(game.getPlayers());
  const [gameState, setGameState] = useState("ready");

  const totalRounds = game.getTotalRounds();
  const [currentRound, setCurrentRound] = useState(game.getCurrentRound());

  const handlePlayerNameBlur = (playerIndex, event) => {
    game.modifyPlayerName(playerIndex, event.target.value);
    setPlayers([...game.getPlayers()]);
  };

  const syncState = () => {
    const newRound = game.getCurrentRound();
    const newPlayers = game.getPlayers();

    setPlayers([...newPlayers]);
    setCurrentRound(newRound);

    if (newRound >= totalRounds && totalRounds > 0) {
      setGameState("finished");
    } else if (newRound > 0) {
      setGameState("playing");
    } else {
      setGameState("ready");
    }
  };

  const handleRunFullGame = () => {
    game.runGameLoop();
    syncState();
  };

  const handleRunRound = () => {
    if (game.runRound()) {
      syncState();
    }
  };

  const handleRevertRound = () => {
    const success = game.undoLastRound();
    if (success) {
      syncState(); // Synchronization handles all state updates (players, round count, game state)
    } else {
      // If undo fails (no history), ensure the state reflects the start
      syncState();
    }
  };

  const handleResetGame = () => {
    const newGame = createGameLogic();
    setGame(newGame);
    // Synchronize with the new game's initial state
    setPlayers(newGame.getPlayers());
    setCurrentRound(newGame.getCurrentRound());
    setGameState("ready");
  };

  // Use useEffect to update gameState if currentRound hits totalRounds via external actions
  useEffect(() => {
    if (currentRound === totalRounds && totalRounds > 0) {
      setGameState("finished");
    }
  }, [currentRound, totalRounds]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-black text-center text-blue-800 mb-6">
          High Card Game Simulator
        </h1>

        <div className="text-center mb-6">
          <p className="status-text text-xl font-semibold">
            Status:{" "}
            <strong
              className={`font-extrabold ${
                gameState === "finished" ? "text-red-600" : "text-green-600"
              }`}
            >
              {gameState.toUpperCase()}
            </strong>
          </p>
          <p className="text-sm text-gray-500">
            Round: {currentRound}/{totalRounds}
          </p>
        </div>

        <div className="controls flex flex-col md:flex-row justify-center gap-3 mb-8">
          <button
            onClick={handleRunFullGame}
            disabled={gameState === "finished"}
            className="flex-1 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run Full Game ({totalRounds} Rounds)
          </button>
          <button
            onClick={handleRunRound}
            disabled={gameState === "finished"}
            className="flex-1 w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run Next Round ({currentRound + 1}/{totalRounds})
          </button>
          <button
            onClick={handleRevertRound}
            disabled={currentRound === 0}
            className="flex-1 w-full md:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Revert Prev Round ({currentRound}/{totalRounds})
          </button>
          <button
            onClick={handleResetGame}
            className="flex-1 w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Game
          </button>
        </div>

        {gameState !== "finished" ? (
          <div className="playersList grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {players.map((player, playerIndex) => (
              <div
                key={player.name}
                className="playerCard w-full max-w-xs bg-gray-50 p-5 rounded-xl shadow-lg border border-gray-200 text-center transition duration-300 hover:shadow-xl"
              >
                <input
                  className="text-xl font-bold text-gray-700 mb-2 w-full text-center bg-transparent border-b-2 border-indigo-400 focus:outline-none focus:border-indigo-600 transition duration-150"
                  type="text"
                  defaultValue={player.name}
                  onBlur={(e) => handlePlayerNameBlur(playerIndex, e)}
                  maxLength={15}
                  placeholder="Enter Name"
                />
                <p className="text-sm text-gray-500 mb-3">
                  Score:{" "}
                  <span className="font-extrabold text-lg text-green-700">
                    {player.score}
                  </span>
                </p>
                {currentRound > 0 && player.cardHeld !== null && (
                  <div className="card inline-block text-3xl font-extrabold px-5 py-3 border-4 border-indigo-500 bg-white rounded-lg shadow-inner select-none">
                    {player.cardHeld}
                  </div>
                )}
                {currentRound === 0 && (
                  <div className="card inline-block text-lg font-semibold px-5 py-3 border-4 border-gray-300 bg-gray-200 text-gray-500 rounded-lg shadow-inner select-none">
                    Waiting
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Scoreboard players={players} />
        )}
      </div>
    </div>
  );
}

export default App;
