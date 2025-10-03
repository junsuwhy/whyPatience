/**
 * Integration Tests for Foundation Building
 * Tests the complete flow of moving cards from tableau to foundation piles
 * following solitaire rules (Ace to King by suit)
 */

import {
  GameEngineContract,
  MoveResult,
} from '../../src/interfaces/game-engine-interface';

// Mock types based on data model - these will be replaced by real implementations
interface Card {
  id: string;
  rank: CardRank;
  suit: CardSuit;
  faceUp: boolean;
  position: Position;
}

interface Position {
  area: GameArea;
  index: number;
  stackIndex?: number;
}

interface FoundationPile {
  id: number;
  suit: CardSuit | null;
  cards: Card[];
  topRank: CardRank | null;
}

interface GameState {
  id: string;
  status: GameStatus;
  tableau: TableauColumn[];
  foundation: FoundationPile[];
  stock: StockPile;
  moves: Move[];
  statistics: GameStatistics;
  startTime: number;
  endTime?: number;
}

interface TableauColumn {
  id: number;
  cards: Card[];
  faceDownCount: number;
}

interface StockPile {
  cards: Card[];
  drawMode: DrawMode;
  currentDraw: Card[];
  cycleCount: number;
}

interface Move {
  id: string;
  timestamp: number;
  type: MoveType;
  cards: Card[];
  from: Position;
  to: Position;
  revealed?: Card;
}

interface GameStatistics {
  moveCount: number;
  undoCount: number;
  score: number;
  elapsedTime: number;
  cardsInFoundation: number;
}

enum CardRank {
  ACE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  JACK = 11,
  QUEEN = 12,
  KING = 13,
}

enum CardSuit {
  SPADES = 'spades',
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
}

enum GameArea {
  TABLEAU = 'tableau',
  FOUNDATION = 'foundation',
  STOCK = 'stock',
  WASTE = 'waste',
}

enum GameStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  PAUSED = 'paused',
}

enum DrawMode {
  ONE_CARD = 1,
  THREE_CARD = 3,
}

enum MoveType {
  TABLEAU_TO_TABLEAU = 'tableau_to_tableau',
  TABLEAU_TO_FOUNDATION = 'tableau_to_foundation',
  STOCK_TO_WASTE = 'stock_to_waste',
  WASTE_TO_TABLEAU = 'waste_to_tableau',
  WASTE_TO_FOUNDATION = 'waste_to_foundation',
  FOUNDATION_TO_TABLEAU = 'foundation_to_tableau',
}

// Mock GameEngine - will be replaced by real implementation
class MockGameEngine implements GameEngineContract {
  initializeGame(): GameState {
    throw new Error('Not implemented yet');
  }

  dealCards(): GameState {
    throw new Error('Not implemented yet');
  }

  resetGame(): GameState {
    throw new Error('Not implemented yet');
  }

  moveCards(): MoveResult {
    throw new Error('Not implemented yet');
  }

  undoMove() {
    throw new Error('Not implemented yet');
  }

  autoComplete(): boolean {
    throw new Error('Not implemented yet');
  }

  isValidMove(): boolean {
    throw new Error('Not implemented yet');
  }

  getValidMoves() {
    throw new Error('Not implemented yet');
  }

  isGameWon(): boolean {
    throw new Error('Not implemented yet');
  }

  canUndo(): boolean {
    throw new Error('Not implemented yet');
  }

  drawFromStock() {
    throw new Error('Not implemented yet');
  }

  cycleStock(): boolean {
    throw new Error('Not implemented yet');
  }

  getGameStatistics() {
    throw new Error('Not implemented yet');
  }

  updateStatistics() {
    throw new Error('Not implemented yet');
  }
}

describe('Foundation Building Integration Tests', () => {
  let gameEngine: GameEngineContract;
  let gameState: GameState;

  beforeEach(() => {
    gameEngine = new MockGameEngine();
    // This will fail until GameEngine is implemented
    gameState = gameEngine.initializeGame(DrawMode.ONE_CARD);
  });

  describe('Foundation Pile Initialization', () => {
    test('should initialize empty foundation piles', () => {
      expect(gameState.foundation).toHaveLength(4);
      gameState.foundation.forEach((pile, index) => {
        expect(pile.id).toBe(index);
        expect(pile.suit).toBeNull();
        expect(pile.cards).toHaveLength(0);
        expect(pile.topRank).toBeNull();
      });
    });
  });

  describe('Ace Placement on Empty Foundation', () => {
    test('should allow Ace to be placed on empty foundation pile', () => {
      const aceOfSpades: Card = {
        id: 'AS',
        rank: CardRank.ACE,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      const fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      const result = gameEngine.moveCards(
        [aceOfSpades],
        fromPosition,
        toPosition
      );

      expect(result.success).toBe(true);
      expect(result.newState.foundation[0].suit).toBe(CardSuit.SPADES);
      expect(result.newState.foundation[0].topRank).toBe(CardRank.ACE);
      expect(result.newState.foundation[0].cards).toHaveLength(1);
    });

    test('should reject non-Ace cards on empty foundation pile', () => {
      const twoOfSpades: Card = {
        id: '2S',
        rank: CardRank.TWO,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      const fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      const result = gameEngine.moveCards(
        [twoOfSpades],
        fromPosition,
        toPosition
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'only Ace can be placed on empty foundation'
      );
    });
  });

  describe('Sequential Card Placement', () => {
    test('should allow same suit cards in ascending order (A→2→3...→K)', () => {
      // First place Ace of Spades
      const aceOfSpades: Card = {
        id: 'AS',
        rank: CardRank.ACE,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      let fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      let toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      let result = gameEngine.moveCards(
        [aceOfSpades],
        fromPosition,
        toPosition
      );
      expect(result.success).toBe(true);

      // Then place Two of Spades
      const twoOfSpades: Card = {
        id: '2S',
        rank: CardRank.TWO,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 1, stackIndex: 0 },
      };

      fromPosition = { area: GameArea.TABLEAU, index: 1, stackIndex: 0 };
      toPosition = { area: GameArea.FOUNDATION, index: 0 };

      result = gameEngine.moveCards([twoOfSpades], fromPosition, toPosition);

      expect(result.success).toBe(true);
      expect(result.newState.foundation[0].topRank).toBe(CardRank.TWO);
      expect(result.newState.foundation[0].cards).toHaveLength(2);
    });

    test('should reject wrong suit cards', () => {
      // Place Ace of Spades first
      const aceOfSpades: Card = {
        id: 'AS',
        rank: CardRank.ACE,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      let fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      let toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      gameEngine.moveCards([aceOfSpades], fromPosition, toPosition);

      // Try to place Two of Hearts (wrong suit)
      const twoOfHearts: Card = {
        id: '2H',
        rank: CardRank.TWO,
        suit: CardSuit.HEARTS,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 1, stackIndex: 0 },
      };

      fromPosition = { area: GameArea.TABLEAU, index: 1, stackIndex: 0 };
      toPosition = { area: GameArea.FOUNDATION, index: 0 };

      const result = gameEngine.moveCards(
        [twoOfHearts],
        fromPosition,
        toPosition
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('card must be same suit');
    });

    test('should reject wrong sequence cards (e.g., placing 4 on 2)', () => {
      // Place Ace of Spades first
      const aceOfSpades: Card = {
        id: 'AS',
        rank: CardRank.ACE,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      let fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      let toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      gameEngine.moveCards([aceOfSpades], fromPosition, toPosition);

      // Try to place Four of Spades (skipping Two and Three)
      const fourOfSpades: Card = {
        id: '4S',
        rank: CardRank.FOUR,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 1, stackIndex: 0 },
      };

      fromPosition = { area: GameArea.TABLEAU, index: 1, stackIndex: 0 };
      toPosition = { area: GameArea.FOUNDATION, index: 0 };

      const result = gameEngine.moveCards(
        [fourOfSpades],
        fromPosition,
        toPosition
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('card must be next in sequence');
    });
  });

  describe('Complete Foundation Building Flow', () => {
    test('should handle complete tableau to foundation movement flow', () => {
      // This test verifies the complete flow from tableau to foundation
      // including card revelation when cards are moved from tableau

      const aceOfSpades: Card = {
        id: 'AS',
        rank: CardRank.ACE,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      const fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      const result = gameEngine.moveCards(
        [aceOfSpades],
        fromPosition,
        toPosition
      );

      expect(result.success).toBe(true);
      expect(result.move?.type).toBe(MoveType.TABLEAU_TO_FOUNDATION);
      expect(result.move?.from).toEqual(fromPosition);
      expect(result.move?.to).toEqual(toPosition);

      // Should potentially reveal card behind moved card
      if (result.revealed) {
        expect(result.revealed.faceUp).toBe(true);
      }

      // Move should be recorded in game history
      expect(result.newState.moves).toContain(result.move);
    });

    test('should handle foundation pile with 13 cards (full suit)', () => {
      // Build a complete foundation pile from Ace to King
      const suits = [CardSuit.SPADES];
      const ranks = [
        CardRank.ACE,
        CardRank.TWO,
        CardRank.THREE,
        CardRank.FOUR,
        CardRank.FIVE,
        CardRank.SIX,
        CardRank.SEVEN,
        CardRank.EIGHT,
        CardRank.NINE,
        CardRank.TEN,
        CardRank.JACK,
        CardRank.QUEEN,
        CardRank.KING,
      ];

      let currentState = gameState;

      ranks.forEach((rank, index) => {
        const card: Card = {
          id: `${rank}S`,
          rank: rank,
          suit: CardSuit.SPADES,
          faceUp: true,
          position: { area: GameArea.TABLEAU, index: index % 7, stackIndex: 0 },
        };

        const fromPosition: Position = {
          area: GameArea.TABLEAU,
          index: index % 7,
          stackIndex: 0,
        };
        const toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

        const result = gameEngine.moveCards([card], fromPosition, toPosition);
        expect(result.success).toBe(true);
        currentState = result.newState;
      });

      // Foundation pile should be complete
      expect(currentState.foundation[0].cards).toHaveLength(13);
      expect(currentState.foundation[0].topRank).toBe(CardRank.KING);

      // Should not accept any more cards
      const anotherKing: Card = {
        id: 'KH',
        rank: CardRank.KING,
        suit: CardSuit.HEARTS,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      const fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      const result = gameEngine.moveCards(
        [anotherKing],
        fromPosition,
        toPosition
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('foundation pile is complete');
    });
  });

  describe('Game Victory Condition', () => {
    test('should detect victory when all four foundation piles are complete', () => {
      // Mock a game state where all foundation piles have 13 cards
      const completeFoundationState: GameState = {
        ...gameState,
        foundation: [
          {
            id: 0,
            suit: CardSuit.SPADES,
            cards: new Array(13),
            topRank: CardRank.KING,
          },
          {
            id: 1,
            suit: CardSuit.HEARTS,
            cards: new Array(13),
            topRank: CardRank.KING,
          },
          {
            id: 2,
            suit: CardSuit.DIAMONDS,
            cards: new Array(13),
            topRank: CardRank.KING,
          },
          {
            id: 3,
            suit: CardSuit.CLUBS,
            cards: new Array(13),
            topRank: CardRank.KING,
          },
        ],
      };

      // Temporarily update game engine's internal state for this test
      const isWon = gameEngine.isGameWon();
      expect(isWon).toBe(true);
    });

    test('should not detect victory if any foundation pile is incomplete', () => {
      // Mock a game state where only 3 foundation piles are complete
      const incompleteFoundationState: GameState = {
        ...gameState,
        foundation: [
          {
            id: 0,
            suit: CardSuit.SPADES,
            cards: new Array(13),
            topRank: CardRank.KING,
          },
          {
            id: 1,
            suit: CardSuit.HEARTS,
            cards: new Array(13),
            topRank: CardRank.KING,
          },
          {
            id: 2,
            suit: CardSuit.DIAMONDS,
            cards: new Array(13),
            topRank: CardRank.KING,
          },
          {
            id: 3,
            suit: CardSuit.CLUBS,
            cards: new Array(12), // Missing one card
            topRank: CardRank.QUEEN,
          },
        ],
      };

      const isWon = gameEngine.isGameWon();
      expect(isWon).toBe(false);
    });
  });

  describe('Move Validation', () => {
    test('should validate moves before execution', () => {
      const aceOfSpades: Card = {
        id: 'AS',
        rank: CardRank.ACE,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      };

      const fromPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const toPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      // Should validate that Ace can be placed on empty foundation
      const isValid = gameEngine.isValidMove(
        [aceOfSpades],
        fromPosition,
        toPosition
      );
      expect(isValid).toBe(true);

      // Should suggest valid moves for the card
      const validMoves = gameEngine.getValidMoves(aceOfSpades);
      expect(validMoves).toContain(
        expect.objectContaining({
          area: GameArea.FOUNDATION,
          index: expect.any(Number),
        })
      );
    });
  });
});
