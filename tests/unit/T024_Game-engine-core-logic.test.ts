/**
 * T024 Unit Test: Game engine core logic in src/services/game-engine.ts
 * Tests the core game engine implementation following TDD principles
 * This test should FAIL until the GameEngine is implemented
 */

import { GameEngine } from '../../src/services/game-engine';
import {
  GameEngineContract,
  MoveResult,
  UndoResult,
  DrawResult,
} from '../../specs/001-game-rules-md/contracts/game-engine-interface';
import {
  Card,
  Position,
  GameState,
  GameStatistics,
  Move,
  DrawMode,
  Suit,
  Rank,
} from '../../src/types';

describe('T024: GameEngine Core Logic Unit Tests', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  describe('Game Engine Implementation', () => {
    it('should implement GameEngineContract interface', () => {
      expect(gameEngine).toBeDefined();
      expect(gameEngine).toBeInstanceOf(GameEngine);

      // Check that it implements the contract interface
      const contract: GameEngineContract = gameEngine;
      expect(contract).toBeDefined();
    });

    it('should have all required methods from GameEngineContract', () => {
      const requiredMethods = [
        'initializeGame',
        'dealCards',
        'resetGame',
        'moveCards',
        'undoMove',
        'autoComplete',
        'isValidMove',
        'getValidMoves',
        'isGameWon',
        'canUndo',
        'drawFromStock',
        'cycleStock',
        'getGameStatistics',
        'updateStatistics',
      ];

      requiredMethods.forEach(method => {
        expect(gameEngine).toHaveProperty(method);
        expect(typeof (gameEngine as any)[method]).toBe('function');
      });
    });
  });

  describe('initializeGame() method', () => {
    it('should initialize a new game with ONE card draw mode', () => {
      const gameState = gameEngine.initializeGame(DrawMode.ONE);

      expect(gameState).toBeDefined();
      expect(gameState.drawMode).toBe(DrawMode.ONE);
      expect(gameState.tableau).toHaveLength(7);
      expect(gameState.foundations).toHaveLength(4);
      expect(gameState.stock).toBeDefined();
      expect(gameState.waste).toBeDefined();
      expect(gameState.moves).toEqual([]);
      expect(gameState.score).toBe(0);
      expect(gameState.isWon).toBe(false);
      expect(gameState.startTime).toBeGreaterThan(0);
    });

    it('should initialize a new game with THREE card draw mode', () => {
      const gameState = gameEngine.initializeGame(DrawMode.THREE);

      expect(gameState).toBeDefined();
      expect(gameState.drawMode).toBe(DrawMode.THREE);
      expect(gameState.tableau).toHaveLength(7);
      expect(gameState.foundations).toHaveLength(4);
    });

    it('should properly distribute cards to tableau columns', () => {
      const gameState = gameEngine.initializeGame(DrawMode.ONE);

      // Verify tableau column card counts: 1,2,3,4,5,6,7
      for (let i = 0; i < 7; i++) {
        expect(gameState.tableau[i].cards).toHaveLength(i + 1);

        // Only the top card should be face up
        const topCard =
          gameState.tableau[i].cards[gameState.tableau[i].cards.length - 1];
        expect(topCard.faceUp).toBe(true);

        // All other cards should be face down
        for (let j = 0; j < gameState.tableau[i].cards.length - 1; j++) {
          expect(gameState.tableau[i].cards[j].faceUp).toBe(false);
        }
      }
    });

    it('should initialize empty foundations', () => {
      const gameState = gameEngine.initializeGame(DrawMode.ONE);

      gameState.foundations.forEach(foundation => {
        expect(foundation.cards).toEqual([]);
        expect(foundation.suit).toBeDefined();
      });
    });

    it('should place remaining cards in stock pile', () => {
      const gameState = gameEngine.initializeGame(DrawMode.ONE);

      // Total cards: 52
      // Tableau cards: 1+2+3+4+5+6+7 = 28
      // Stock cards: 52-28 = 24
      expect(gameState.stock.cards).toHaveLength(24);
      expect(gameState.waste.cards).toEqual([]);
    });
  });

  describe('validateMove() method', () => {
    let gameState: GameState;
    let mockCard: Card;

    beforeEach(() => {
      gameState = gameEngine.initializeGame(DrawMode.ONE);
      mockCard = {
        id: 'test-card',
        suit: Suit.HEARTS,
        rank: Rank.ACE,
        faceUp: true,
      };
    });

    it('should validate move from tableau to foundation', () => {
      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'foundation', index: 0 };

      const isValid = gameEngine.isValidMove([mockCard], from, to);
      expect(typeof isValid).toBe('boolean');
    });

    it('should validate move from tableau to tableau', () => {
      const redKing: Card = {
        id: 'red-king',
        suit: Suit.HEARTS,
        rank: Rank.KING,
        faceUp: true,
      };

      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'tableau', index: 1 };

      const isValid = gameEngine.isValidMove([redKing], from, to);
      expect(typeof isValid).toBe('boolean');
    });

    it('should invalidate moves to invalid positions', () => {
      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'tableau', index: 10 }; // Invalid index

      const isValid = gameEngine.isValidMove([mockCard], from, to);
      expect(isValid).toBe(false);
    });
  });

  describe('executeMove() method', () => {
    let gameState: GameState;
    let mockCard: Card;

    beforeEach(() => {
      gameState = gameEngine.initializeGame(DrawMode.ONE);
      mockCard =
        gameState.tableau[0].cards[gameState.tableau[0].cards.length - 1];
    });

    it('should execute a valid move and return MoveResult', () => {
      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'foundation', index: 0 };

      const result: MoveResult = gameEngine.moveCards([mockCard], from, to);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.newState).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should return failed MoveResult for invalid moves', () => {
      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'tableau', index: 10 }; // Invalid index

      const result: MoveResult = gameEngine.moveCards([mockCard], from, to);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('undoLastMove() method', () => {
    it('should return UndoResult structure', () => {
      const result: UndoResult = gameEngine.undoMove();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.newState).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should fail when no moves to undo', () => {
      const result: UndoResult = gameEngine.undoMove();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('stock pile operations', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = gameEngine.initializeGame(DrawMode.ONE);
    });

    it('should draw cards from stock pile', () => {
      const result: DrawResult = gameEngine.drawFromStock();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.drawnCards).toBeDefined();
      expect(result.remainingStock).toBeDefined();
      expect(result.cycled).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.drawnCards)).toBe(true);
      expect(typeof result.remainingStock).toBe('number');
      expect(typeof result.cycled).toBe('boolean');
    });

    it('should cycle stock when empty', () => {
      const cycled = gameEngine.cycleStock();
      expect(typeof cycled).toBe('boolean');
    });
  });

  describe('game state queries', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = gameEngine.initializeGame(DrawMode.ONE);
    });

    it('should check victory condition', () => {
      const isWon = gameEngine.isGameWon();
      expect(typeof isWon).toBe('boolean');
      expect(isWon).toBe(false); // New game should not be won
    });

    it('should check if undo is possible', () => {
      const canUndo = gameEngine.canUndo();
      expect(typeof canUndo).toBe('boolean');
      expect(canUndo).toBe(false); // New game has no moves to undo
    });

    it('should get valid moves for a card', () => {
      const topCard =
        gameState.tableau[0].cards[gameState.tableau[0].cards.length - 1];
      const validMoves = gameEngine.getValidMoves(topCard);

      expect(Array.isArray(validMoves)).toBe(true);
      validMoves.forEach(position => {
        expect(position.type).toBeDefined();
        expect(position.index).toBeDefined();
      });
    });

    it('should perform auto-complete operation', () => {
      const completed = gameEngine.autoComplete();
      expect(typeof completed).toBe('boolean');
    });
  });

  describe('game statistics', () => {
    it('should get game statistics', () => {
      const stats: GameStatistics = gameEngine.getGameStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.gamesPlayed).toBe('number');
      expect(typeof stats.gamesWon).toBe('number');
      expect(typeof stats.winPercentage).toBe('number');
      expect(typeof stats.bestTime).toBe('number');
      expect(typeof stats.totalTime).toBe('number');
      expect(typeof stats.averageTime).toBe('number');
      expect(typeof stats.currentStreak).toBe('number');
      expect(typeof stats.bestStreak).toBe('number');
    });

    it('should update statistics after a move', () => {
      const mockMove: Move = {
        id: 'test-move',
        cards: [],
        from: { type: 'tableau', index: 0 },
        to: { type: 'foundation', index: 0 },
        timestamp: Date.now(),
      };

      expect(() => gameEngine.updateStatistics(mockMove)).not.toThrow();
    });
  });

  describe('performance requirements', () => {
    it('should initialize game within performance bounds', () => {
      const startTime = performance.now();
      gameEngine.initializeGame(DrawMode.ONE);
      const endTime = performance.now();

      // Should initialize quickly (< 16ms for 60fps requirement)
      expect(endTime - startTime).toBeLessThan(16);
    });

    it('should validate moves quickly', () => {
      const gameState = gameEngine.initializeGame(DrawMode.ONE);
      const card = gameState.tableau[0].cards[0];
      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'foundation', index: 0 };

      const startTime = performance.now();
      gameEngine.isValidMove([card], from, to);
      const endTime = performance.now();

      // Should validate quickly (< 1ms)
      expect(endTime - startTime).toBeLessThan(1);
    });
  });

  describe('error handling', () => {
    it('should handle invalid card parameters gracefully', () => {
      const invalidCard = null as any;
      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'foundation', index: 0 };

      expect(() =>
        gameEngine.isValidMove([invalidCard], from, to)
      ).not.toThrow();
      expect(() => gameEngine.moveCards([invalidCard], from, to)).not.toThrow();
    });

    it('should handle invalid position parameters gracefully', () => {
      const card: Card = {
        id: 'test',
        suit: Suit.HEARTS,
        rank: Rank.ACE,
        faceUp: true,
      };
      const invalidPosition = null as any;

      expect(() =>
        gameEngine.isValidMove([card], invalidPosition, invalidPosition)
      ).not.toThrow();
      expect(() =>
        gameEngine.moveCards([card], invalidPosition, invalidPosition)
      ).not.toThrow();
    });

    it('should handle empty card arrays gracefully', () => {
      const from: Position = { type: 'tableau', index: 0 };
      const to: Position = { type: 'foundation', index: 0 };

      expect(() => gameEngine.isValidMove([], from, to)).not.toThrow();
      expect(() => gameEngine.moveCards([], from, to)).not.toThrow();
    });
  });
});
