const initialPlayers = [
    { name: "Player 1", cardHeld: null, score: 0 },
    { name: "Player 2", cardHeld: null, score: 0 },
    { name: "Player 3", cardHeld: null, score: 0 },
    { name: "Player 4", cardHeld: null, score: 0 },
];
const DECK_SIZE = 40;
const MAX_CARD_VALUE = 12;
const POINTS_PER_SCORE = 1;
const NUM_PLAYERS = initialPlayers.length;
const TOTAL_ROUNDS = Math.floor(DECK_SIZE / NUM_PLAYERS);

const createGameLogic = (savedState = null) => {
    
    let players;
    let currentRound;
    // History array to store game states before each round for undo functionality
    let stateHistory = [];
    
    if (savedState && savedState.players && typeof savedState.currentRound === 'number') {
        // Load state from provided object
        players = JSON.parse(JSON.stringify(savedState.players));
        currentRound = savedState.currentRound;
        // NOTE: History is NOT loaded here; it starts fresh from the loaded state.
    } else {
        // Initialize new game state
        players = JSON.parse(JSON.stringify(initialPlayers));
        currentRound = 0;
    }

    const modifyPlayerName = (playerIndex, newName) => {
        if (players[playerIndex] && newName !== "") {
            players[playerIndex].name = newName;
        }
    };

    const drawCards = () => {
        for (const player of players) {
            player.cardHeld = Math.floor(Math.random() * MAX_CARD_VALUE) + 1;
        }
    };

    const resolveRound = () => {
        let biggestCardOfRound = 0;
        for (const player of players) {
            if (player.cardHeld > biggestCardOfRound) {
                biggestCardOfRound = player.cardHeld;
            }
        }
        for (const player of players) {
            if (player.cardHeld === biggestCardOfRound) {
                player.score += POINTS_PER_SCORE;
            }
        }
        currentRound++;
    };

    const runRound = () => {
        if (currentRound < TOTAL_ROUNDS) {
            // Save current state (pre-round) to history before modifying it
            stateHistory.push(getGameState());

            drawCards();
            resolveRound();
            return true;
        }
        return false;
    };

    const undoLastRound = () => {
        if (stateHistory.length > 0) {
            const previousState = stateHistory.pop();
            setGameState(previousState);
            return true;
        }
        return false;
    };

    const runGameLoop = () => {
        while (currentRound < TOTAL_ROUNDS) {
            runRound();
        }
        return players;
    };
    
    const getGameState = () => {
        return {
            players: JSON.parse(JSON.stringify(players)),
            currentRound: currentRound,
            totalRounds: TOTAL_ROUNDS
        };
    };

    const setGameState = (state) => {
        if (state && state.players && typeof state.currentRound === 'number') {
            players = JSON.parse(JSON.stringify(state.players));
            currentRound = state.currentRound;
            return true;
        }
        return false;
    };
    
    const resetGame = () => {
        players = JSON.parse(JSON.stringify(initialPlayers));
        currentRound = 0;
        stateHistory = []; // Clear history on reset
    };

    return {
        modifyPlayerName,
        runGameLoop,
        runRound,
        undoLastRound,
        getPlayers: () => players,
        getGameState,
        setGameState,
        resetGame,
        getTotalRounds: () => TOTAL_ROUNDS,
        getCurrentRound: () => currentRound
    };
};

export default createGameLogic;
