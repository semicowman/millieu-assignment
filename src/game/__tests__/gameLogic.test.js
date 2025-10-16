import { describe, test, expect, beforeEach } from 'vitest';
import createGameLogic from '../gameLogic';

/**
 * Test suite for the High Card Game Logic
 * Tests cover:
 * - Game initialization and state management
 * - Player interactions (name changes)
 * - Round mechanics (card drawing, scoring)
 * - Game progression
 * - State persistence and restoration
 * - Edge cases and error conditions
 */
describe('Game Logic', () => {
    let game;

    beforeEach(() => {
        game = createGameLogic();
    });

    /**
     * Test initial game state properties
     * Verifies:
     * - Correct number of players (4)
     * - Initial round count (0)
     * - Total rounds calculation (40 cards / 4 players = 10 rounds)
     * - Player object structure and initial values
     */
    test('initial game state', () => {
        const players = game.getPlayers();
        expect(players).toHaveLength(4);
        expect(game.getCurrentRound()).toBe(0);
        expect(game.getTotalRounds()).toBe(10); // 40 cards / 4 players = 10 rounds

        players.forEach(player => {
            expect(player).toHaveProperty('name');
            expect(player).toHaveProperty('cardHeld', null);
            expect(player).toHaveProperty('score', 0);
        });
    });

    /**
     * Test player name modification
     * Verifies:
     * - Successful name update for valid index
     * - Empty name handling
     * - Invalid index handling
     */
    describe('modifyPlayerName', () => {
        test('updates player name correctly with valid input', () => {
            const newName = 'Test Player';
            game.modifyPlayerName(0, newName);
            const players = game.getPlayers();
            expect(players[0].name).toBe(newName);
        });

        test('handles empty name gracefully', () => {
            const newName = ''
            game.modifyPlayerName(0, newName);
            const players = game.getPlayers();
            expect(players[0].name).not.toBe('');
        });

        test('ignores invalid player index', () => {
            const originalPlayers = JSON.stringify(game.getPlayers());
            game.modifyPlayerName(999, 'Invalid Player');
            expect(JSON.stringify(game.getPlayers())).toBe(originalPlayers);
        });
    });

    /**
     * Test round execution mechanics
     * Verifies:
     * - Round counter advancement
     * - Card distribution
     * - Score updates
     * - Game completion handling
     */
    describe('runRound', () => {
        test('advances game state correctly', () => {
            const initialRound = game.getCurrentRound();
            const result = game.runRound();
            
            const players = game.getPlayers();
            const currentRound = game.getCurrentRound();

            expect(result).toBe(true);
            expect(currentRound).toBe(initialRound + 1);
            expect(players.some(player => player.cardHeld !== null)).toBe(true);
            expect(players.some(player => player.score > 0)).toBe(true);
        });

        test('returns false when game is complete', () => {
            // Run all rounds
            for (let i = 0; i < game.getTotalRounds(); i++) {
                game.runRound();
            }
            
            // Try to run one more round
            const result = game.runRound();
            expect(result).toBe(false);
            expect(game.getCurrentRound()).toBe(game.getTotalRounds());
        });
    });

    /**
     * Test undo functionality
     * Verifies:
     * - State restoration after undo
     * - Multiple undo operations
     * - Undo on initial state
     */
    describe('undoLastRound', () => {
        test('reverts to previous state correctly', () => {
            // Run a round and capture the state
            game.runRound();
            const stateAfterRound = game.getGameState();
            
            // Run another round
            game.runRound();
            
            // Undo the last round
            const undoResult = game.undoLastRound();
            const currentState = game.getGameState();
            
            expect(undoResult).toBe(true);
            expect(currentState).toEqual(stateAfterRound);
        });

        test('returns false when no history exists', () => {
            // Try to undo without any rounds played
            const undoResult = game.undoLastRound();
            expect(undoResult).toBe(false);
            expect(game.getCurrentRound()).toBe(0);
        });

        test('handles multiple undo operations correctly', () => {
            // Run multiple rounds
            game.runRound();
            game.runRound();
            game.runRound();
            
            // Undo all rounds
            let undoCount = 0;
            while (game.undoLastRound()) {
                undoCount++;
            }
            
            expect(undoCount).toBe(3);
            expect(game.getCurrentRound()).toBe(0);
        });
    });

    test('runGameLoop completes all rounds', () => {
        game.runGameLoop();
        const finalState = game.getGameState();
        
        expect(finalState.currentRound).toBe(game.getTotalRounds());
        expect(game.getPlayers().some(player => player.score > 0)).toBe(true);
    });

    test('resetGame returns to initial state', () => {
        // Play some rounds
        game.runGameLoop();
        
        // Reset the game
        game.resetGame();
        
        const players = game.getPlayers();
        expect(game.getCurrentRound()).toBe(0);
        players.forEach(player => {
            expect(player.cardHeld).toBe(null);
            expect(player.score).toBe(0);
        });
    });

    /**
     * Test state management functionality
     * Verifies:
     * - Valid state loading
     * - Invalid state handling
     * - State structure validation
     */
    describe('setGameState', () => {
        test('loads valid state correctly', () => {
            const testState = {
                players: [
                    { name: "Test 1", cardHeld: 5, score: 2 },
                    { name: "Test 2", cardHeld: 3, score: 1 },
                    { name: "Test 3", cardHeld: 4, score: 0 },
                    { name: "Test 4", cardHeld: 2, score: 1 }
                ],
                currentRound: 3,
                totalRounds: 10
            };

            const success = game.setGameState(testState);
            expect(success).toBe(true);

            const currentState = game.getGameState();
            expect(currentState.currentRound).toBe(testState.currentRound);
            expect(currentState.players).toEqual(testState.players);
        });

        test('rejects invalid state structure', () => {
            const invalidStates = [
                null,
                undefined,
                {},
                { players: [] },
                { currentRound: 0 },
                { players: [], currentRound: 'invalid' }
            ];

            invalidStates.forEach(invalidState => {
                const success = game.setGameState(invalidState);
                expect(success).toBe(false);
            });
        });

        test('maintains current state when loading fails', () => {
            // Set up initial state
            game.runRound();
            const originalState = game.getGameState();

            // Try to load invalid state
            game.setGameState(null);

            // Verify state hasn't changed
            const currentState = game.getGameState();
            expect(currentState).toEqual(originalState);
        });
    });

    /**
     * Test game rules and mechanics
     * Verifies:
     * - Card value ranges
     * - Scoring system
     * - Tie handling
     */
    describe('Game Rules', () => {
        test('card values are within valid range', () => {
            game.runRound();
            const players = game.getPlayers();
            
            players.forEach(player => {
                expect(player.cardHeld).toBeGreaterThan(0);
                expect(player.cardHeld).toBeLessThanOrEqual(12); // MAX_CARD_VALUE
            });
        });

        test('highest card(s) in round receive points', () => {
            game.runRound();
            const players = game.getPlayers();
            
            const maxCard = Math.max(...players.map(p => p.cardHeld));
            const winnersCount = players.filter(p => p.cardHeld === maxCard).length;
            const totalPointsAwarded = players.reduce((sum, p) => sum + p.score, 0);
            
            expect(totalPointsAwarded).toBe(winnersCount); // POINTS_PER_SCORE is 1
        });

        test('handles ties correctly', () => {
            // Run multiple rounds to increase chance of ties
            for (let i = 0; i < 5; i++) {
                game.runRound();
                const players = game.getPlayers();
                const maxCard = Math.max(...players.map(p => p.cardHeld));
                const winners = players.filter(p => p.cardHeld === maxCard);
                
                if (winners.length > 1) {
                    // If we found a tie, verify all tied players got points
                    winners.forEach(winner => {
                        expect(winner.score).toBeGreaterThan(0);
                    });
                    return; // Test succeeded in finding and verifying a tie
                }
            }
        });

        test('lower cards receive no points', () => {
            game.runRound();
            const players = game.getPlayers();
            
            const maxCard = Math.max(...players.map(p => p.cardHeld));
            const losers = players.filter(p => p.cardHeld < maxCard);
            
            losers.forEach(loser => {
                expect(loser.score).toBe(0);
            });
        });
    });
});