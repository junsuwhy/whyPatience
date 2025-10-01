/**
 * Unit tests for T022 GameState model
 * Tests the GameState class implementation with comprehensive validation scenarios.
 * This test file follows TDD principles - should fail until GameState is implemented.
 */

import { GameState } from '../../src/models/game-state';
import { Card } from '../../src/models/card';
import { TableauColumn } from '../../src/models/tableau-column';
import { FoundationPile } from '../../src/models/foundation-pile';
import { StockPile } from '../../src/models/stock-pile';
import { 
  Suit, 
  Rank
} from '../../src/types/card';
import { 
  GamePhase, 
  GameArea, 
  DrawMode, 
  MoveType,
  Position 
} from '../../src/types/game-state';

describe('T022 GameState Model', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = GameState.newGame();
  });

  describe('Constructor and Basic Properties', () => {
    test('should create GameState with correct initial properties', () => {
      expect(gameState.id).toBeDefined();
      expect(gameState.phase).toBe(GamePhase.NEW_GAME);
      expect(gameState.tableau).toHaveLength(7);
      expect(gameState.foundation).toHaveLength(4);
      expect(gameState.stock).toBeDefined();
      expect(gameState.history).toEqual([]);
      expect(gameState.historyIndex).toBe(-1);
      expect(gameState.statistics).toBeDefined();
      expect(gameState.settings).toBeDefined();
      expect(gameState.startTime).toBeDefined();
      expect(gameState.lastModified).toBeDefined();
    });

    test('should initialize with empty tableau columns', () => {
      gameState.tableau.forEach((column, index) => {
        expect(column.id).toBe(index);
        expect(column.cards).toEqual([]);
        expect(column.faceDownCount).toBe(0);
      });
    });

    test('should initialize with empty foundation piles', () => {
      gameState.foundation.forEach((pile, index) => {
        expect(pile.id).toBe(index);
        expect(pile.suit).toBeNull();
        expect(pile.cards).toEqual([]);
        expect(pile.topRank).toBeNull();
      });
    });

    test('should initialize with empty stock pile', () => {
      expect(gameState.stock.cards).toEqual([]);
      expect(gameState.stock.wasteCards).toEqual([]);
      expect(gameState.stock.cycleCount).toBe(0);
      expect(gameState.stock.drawMode).toBeDefined();
    });

    test('should initialize with default statistics', () => {
      expect(gameState.statistics.moveCount).toBe(0);
      expect(gameState.statistics.undoCount).toBe(0);
      expect(gameState.statistics.score).toBe(0);
      expect(gameState.statistics.elapsedTime).toBe(0);
      expect(gameState.statistics.cardsInFoundation).toBe(0);
    });
  });

  describe('Game State Validation', () => {
    test('should validate correct initial state', () => {
      expect(gameState.validate()).toBe(true);
    });

    test('should detect invalid tableau structure', () => {
      // Corrupt tableau by removing a column
      gameState.tableau.pop();
      expect(() => gameState.validate()).toThrow();
    });

    test('should detect invalid foundation structure', () => {
      // Corrupt foundation by removing a pile
      gameState.foundation.pop();
      expect(() => gameState.validate()).toThrow();
    });

    test('should detect invalid stock state', () => {
      // Corrupt stock by setting invalid draw mode
      (gameState.stock.drawMode as any) = 'invalid';
      expect(() => gameState.validate()).toThrow();
    });

    test('should detect invalid history index', () => {
      gameState.historyIndex = 10; // No history entries but index > -1
      expect(() => gameState.validate()).toThrow();
    });

    test('should detect negative statistics', () => {
      gameState.statistics.moveCount = -1;
      expect(() => gameState.validate()).toThrow();
    });
  });

  describe('Game Victory Detection', () => {
    test('should detect game not won in initial state', () => {
      expect(gameState.isGameWon()).toBe(false);
    });

    test('should detect game won when all foundations complete', () => {
      // Set up completed foundations
      gameState.foundation.forEach((pile, index) => {
        const suit = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES][index];
        pile.suit = suit;
        pile.topRank = Rank.KING;
        pile.cards = Array.from({ length: 13 }, (_, i) => 
          new Card(suit, (i + 1) as Rank, true)
        );
      });
      
      gameState.statistics.cardsInFoundation = 52;
      expect(gameState.isGameWon()).toBe(true);
    });

    test('should detect game not won with partial foundations', () => {
      // Set up partially completed foundations
      gameState.foundation[0].suit = Suit.HEARTS;
      gameState.foundation[0].topRank = Rank.TEN;
      gameState.foundation[0].cards = Array.from({ length: 10 }, (_, i) => 
        new Card(Suit.HEARTS, (i + 1) as Rank, true)
      );
      
      gameState.statistics.cardsInFoundation = 10;
      expect(gameState.isGameWon()).toBe(false);
    });
  });

  describe('Move Validation', () => {
    const fromPosition: Position = { area: GameArea.TABLEAU, index: 0 };
    const toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

    test('should validate legal moves', () => {
      // Set up a scenario with legal move
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      
      expect(gameState.canMove(fromPosition, toPosition)).toBe(true);
    });

    test('should reject illegal moves from empty position', () => {
      // Try to move from empty tableau column
      expect(gameState.canMove(fromPosition, toPosition)).toBe(false);
    });

    test('should reject moves to invalid positions', () => {
      const invalidPosition: Position = { area: GameArea.TABLEAU, index: 99 };
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      
      expect(gameState.canMove(fromPosition, invalidPosition)).toBe(false);
    });

    test('should validate foundation move rules', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoSpades = new Card(Suit.SPADES, Rank.TWO, true);
      
      gameState.tableau[0].cards = [aceHearts];
      gameState.tableau[1].cards = [twoSpades];
      
      // Ace to foundation should be valid
      expect(gameState.canMove(fromPosition, toPosition)).toBe(true);
      
      // Two to foundation should be invalid (needs Ace first)
      const fromPosition2: Position = { area: GameArea.TABLEAU, index: 1 };
      expect(gameState.canMove(fromPosition2, toPosition)).toBe(false);
    });
  });

  describe('Move Execution', () => {
    test('should execute valid move and update state', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      
      const move = {
        id: 'test-move-1',
        type: MoveType.TABLEAU_TO_FOUNDATION,
        cards: [aceHearts],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        timestamp: Date.now()
      };
      
      const result = gameState.makeMove(move);
      
      expect(result.success).toBe(true);
      expect(gameState.tableau[0].cards).toHaveLength(0);
      expect(gameState.foundation[0].cards).toHaveLength(1);
      expect(gameState.foundation[0].cards[0]).toEqual(aceHearts);
      expect(gameState.statistics.moveCount).toBe(1);
      expect(gameState.history).toHaveLength(1);
      expect(gameState.historyIndex).toBe(0);
    });

    test('should reject invalid move and not update state', () => {
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      gameState.tableau[0].cards = [twoHearts];
      
      const move = {
        id: 'test-move-2',
        type: MoveType.TABLEAU_TO_FOUNDATION,
        cards: [twoHearts],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        timestamp: Date.now()
      };
      
      const result = gameState.makeMove(move);
      
      expect(result.success).toBe(false);
      expect(gameState.tableau[0].cards).toHaveLength(1);
      expect(gameState.foundation[0].cards).toHaveLength(0);
      expect(gameState.statistics.moveCount).toBe(0);
      expect(gameState.history).toHaveLength(0);
    });

    test('should reveal hidden cards after move', () => {
      const hiddenCard = new Card(Suit.HEARTS, Rank.KING, false);
      const visibleCard = new Card(Suit.CLUBS, Rank.QUEEN, true);
      
      gameState.tableau[0].cards = [hiddenCard, visibleCard];
      gameState.tableau[0].faceDownCount = 1;
      
      const move = {
        id: 'test-move-3',
        type: MoveType.TABLEAU_TO_TABLEAU,
        cards: [visibleCard],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.TABLEAU, index: 1 },
        timestamp: Date.now()
      };
      
      gameState.makeMove(move);
      
      expect(gameState.tableau[0].cards[0].faceUp).toBe(true);
      expect(gameState.tableau[0].faceDownCount).toBe(0);
    });
  });

  describe('Undo Functionality', () => {
    test('should undo last move successfully', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      
      const move = {
        id: 'test-move-4',
        type: MoveType.TABLEAU_TO_FOUNDATION,
        cards: [aceHearts],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        timestamp: Date.now()
      };
      
      gameState.makeMove(move);
      expect(gameState.foundation[0].cards).toHaveLength(1);
      
      const undoResult = gameState.undoLastMove();
      
      expect(undoResult.success).toBe(true);
      expect(gameState.tableau[0].cards).toHaveLength(1);
      expect(gameState.foundation[0].cards).toHaveLength(0);
      expect(gameState.statistics.undoCount).toBe(1);
      expect(gameState.historyIndex).toBe(-1);
    });

    test('should fail to undo when no moves available', () => {
      const undoResult = gameState.undoLastMove();
      
      expect(undoResult.success).toBe(false);
      expect(gameState.statistics.undoCount).toBe(0);
    });

    test('should not undo beyond first move', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      
      const move = {
        id: 'test-move-5',
        type: MoveType.TABLEAU_TO_FOUNDATION,
        cards: [aceHearts],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        timestamp: Date.now()
      };
      
      gameState.makeMove(move);
      gameState.undoLastMove();
      
      const secondUndo = gameState.undoLastMove();
      expect(secondUndo.success).toBe(false);
    });
  });

  describe('Valid Moves Detection', () => {
    test('should find valid moves for cards', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoClubs = new Card(Suit.CLUBS, Rank.TWO, true);
      
      gameState.tableau[0].cards = [aceHearts];
      gameState.tableau[1].cards = [twoClubs];
      
      const validMoves = gameState.getValidMoves();
      
      expect(validMoves.length).toBeGreaterThan(0);
      expect(validMoves.some(move => 
        move.from.area === GameArea.TABLEAU && 
        move.to.area === GameArea.FOUNDATION
      )).toBe(true);
    });

    test('should return empty array when no valid moves', () => {
      // Set up state with no valid moves
      const validMoves = gameState.getValidMoves();
      expect(validMoves).toEqual([]);
    });

    test('should detect tableau-to-tableau moves', () => {
      const redKing = new Card(Suit.HEARTS, Rank.KING, true);
      const blackQueen = new Card(Suit.SPADES, Rank.QUEEN, true);
      
      gameState.tableau[0].cards = [redKing];
      gameState.tableau[1].cards = [blackQueen];
      
      const validMoves = gameState.getValidMoves();
      
      expect(validMoves.some(move => 
        move.cards[0].rank === Rank.QUEEN &&
        move.to.area === GameArea.TABLEAU
      )).toBe(true);
    });
  });

  describe('Static Factory Methods', () => {
    test('should create new game with default settings', () => {
      const newGame = GameState.newGame();
      
      expect(newGame.phase).toBe(GamePhase.NEW_GAME);
      expect(newGame.settings.drawMode).toBe(DrawMode.THREE_CARD);
      expect(newGame.statistics.moveCount).toBe(0);
    });

    test('should create new game with custom settings', () => {
      const customSettings = {
        drawMode: DrawMode.ONE_CARD,
        animationSpeed: 150,
        soundEnabled: false
      };
      
      const newGame = GameState.newGame(customSettings);
      
      expect(newGame.settings.drawMode).toBe(DrawMode.ONE_CARD);
      expect(newGame.settings.animationSpeed).toBe(150);
      expect(newGame.settings.soundEnabled).toBe(false);
    });
  });

  describe('Cloning and Serialization', () => {
    test('should create exact clone', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      gameState.statistics.moveCount = 5;
      
      const cloned = gameState.clone();
      
      expect(cloned.id).toBe(gameState.id);
      expect(cloned.phase).toBe(gameState.phase);
      expect(cloned.statistics.moveCount).toBe(gameState.statistics.moveCount);
      expect(cloned.tableau[0].cards).toHaveLength(1);
      
      // Should be independent copies
      expect(cloned).not.toBe(gameState);
      expect(cloned.tableau).not.toBe(gameState.tableau);
    });

    test('should serialize and deserialize correctly', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      gameState.statistics.moveCount = 3;
      
      const json = gameState.toJSON();
      const restored = GameState.fromJSON(json);
      
      expect(restored.id).toBe(gameState.id);
      expect(restored.phase).toBe(gameState.phase);
      expect(restored.statistics.moveCount).toBe(gameState.statistics.moveCount);
      expect(restored.tableau[0].cards).toHaveLength(1);
    });

    test('should handle empty game serialization', () => {
      const json = gameState.toJSON();
      const restored = GameState.fromJSON(json);
      
      expect(restored.tableau.every(col => col.cards.length === 0)).toBe(true);
      expect(restored.foundation.every(pile => pile.cards.length === 0)).toBe(true);
    });

    test('should throw error for invalid JSON deserialization', () => {
      expect(() => GameState.fromJSON(null)).toThrow();
      expect(() => GameState.fromJSON({})).toThrow();
      expect(() => GameState.fromJSON({ id: 'invalid' })).toThrow();
    });
  });

  describe('Game Phase Management', () => {
    test('should transition to playing phase after first move', () => {
      expect(gameState.phase).toBe(GamePhase.NEW_GAME);
      
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      
      const move = {
        id: 'test-move-6',
        type: MoveType.TABLEAU_TO_FOUNDATION,
        cards: [aceHearts],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        timestamp: Date.now()
      };
      
      gameState.makeMove(move);
      expect(gameState.phase).toBe(GamePhase.PLAYING);
    });

    test('should transition to won phase when game completed', () => {
      // Set up completed game
      gameState.foundation.forEach((pile, index) => {
        const suit = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES][index];
        pile.suit = suit;
        pile.topRank = Rank.KING;
        pile.cards = Array.from({ length: 13 }, (_, i) => 
          new Card(suit, (i + 1) as Rank, true)
        );
      });
      
      gameState.statistics.cardsInFoundation = 52;
      gameState.phase = GamePhase.WON;
      gameState.endTime = Date.now();
      
      expect(gameState.isGameWon()).toBe(true);
      expect(gameState.phase).toBe(GamePhase.WON);
      expect(gameState.endTime).toBeDefined();
    });
  });

  describe('Statistics Management', () => {
    test('should update statistics after moves', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      gameState.tableau[0].cards = [aceHearts];
      
      const move = {
        id: 'test-move-7',
        type: MoveType.TABLEAU_TO_FOUNDATION,
        cards: [aceHearts],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        timestamp: Date.now()
      };
      
      gameState.makeMove(move);
      
      expect(gameState.statistics.moveCount).toBe(1);
      expect(gameState.statistics.cardsInFoundation).toBe(1);
      expect(gameState.statistics.score).toBeGreaterThan(0);
    });

    test('should update elapsed time correctly', () => {
      const initialTime = gameState.statistics.elapsedTime;
      
      // Simulate time passage
      gameState.statistics.elapsedTime = 5000; // 5 seconds
      
      expect(gameState.statistics.elapsedTime).toBeGreaterThan(initialTime);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty move history', () => {
      expect(gameState.history).toHaveLength(0);
      expect(gameState.historyIndex).toBe(-1);
      expect(gameState.undoLastMove().success).toBe(false);
    });

    test('should handle invalid card references', () => {
      const invalidCard = null as any;
      
      const move = {
        id: 'invalid-move',
        type: MoveType.TABLEAU_TO_FOUNDATION,
        cards: [invalidCard],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        timestamp: Date.now()
      };
      
      expect(() => gameState.makeMove(move)).toThrow();
    });

    test('should maintain consistent timestamps', () => {
      const beforeTime = Date.now();
      const newGame = GameState.newGame();
      const afterTime = Date.now();
      
      expect(newGame.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(newGame.startTime).toBeLessThanOrEqual(afterTime);
      expect(newGame.lastModified).toBeGreaterThanOrEqual(beforeTime);
      expect(newGame.lastModified).toBeLessThanOrEqual(afterTime);
    });
  });
});