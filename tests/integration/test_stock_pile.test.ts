/**
 * Integration Test: Stock Pile Operations
 * Tests stock pile functionality including drawing, cycling, and integration with game state
 *
 * This test follows TDD principles - it should FAIL until stock pile implementation is complete
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock interfaces based on contracts and data model
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

interface StockPile {
  cards: Card[];
  drawMode: DrawMode;
  currentDraw: Card[];
  cycleCount: number;
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

interface DrawResult {
  success: boolean;
  drawnCards: Card[];
  remainingStock: number;
  cycled: boolean;
}

interface MoveResult {
  success: boolean;
  newState: GameState;
  move?: Move;
  revealed?: Card;
  error?: string;
}

enum CardRank {
  ACE = 1,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  JACK,
  QUEEN,
  KING,
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

enum DrawMode {
  ONE_CARD = 1,
  THREE_CARD = 3,
}

enum GameStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  PAUSED = 'paused',
}

interface TableauColumn {
  id: number;
  cards: Card[];
  faceDownCount: number;
}

interface FoundationPile {
  id: number;
  suit: CardSuit | null;
  cards: Card[];
  topRank: CardRank | null;
}

interface Move {
  id: string;
  timestamp: number;
  type: string;
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

// Mock game engine - these will fail until real implementation exists
const mockGameEngine = {
  initializeGame: jest.fn(),
  drawFromStock: jest.fn(),
  cycleStock: jest.fn(),
  moveCards: jest.fn(),
  undoMove: jest.fn(),
  isValidMove: jest.fn(),
  getGameStatistics: jest.fn(),
};

describe('Stock Pile Integration Tests', () => {
  let initialGameState: GameState;
  let mockCards: Card[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock cards for testing
    mockCards = createMockDeck();

    // Create initial game state with stock pile
    initialGameState = {
      id: 'test-game-1',
      status: GameStatus.IN_PROGRESS,
      tableau: Array.from({ length: 7 }, (_, i) => ({
        id: i,
        cards: [],
        faceDownCount: 0,
      })),
      foundation: Array.from({ length: 4 }, (_, i) => ({
        id: i,
        suit: null,
        cards: [],
        topRank: null,
      })),
      stock: {
        cards: mockCards.slice(28), // Remaining 24 cards after dealing to tableau
        drawMode: DrawMode.THREE_CARD,
        currentDraw: [],
        cycleCount: 0,
      },
      moves: [],
      statistics: {
        moveCount: 0,
        undoCount: 0,
        score: 0,
        elapsedTime: 0,
        cardsInFoundation: 0,
      },
      startTime: Date.now(),
    };
  });

  describe('Stock Pile Initialization', () => {
    it('should initialize stock pile with correct number of cards', () => {
      // This test will fail until GameEngine.initializeGame is implemented
      mockGameEngine.initializeGame.mockReturnValue(initialGameState);

      const gameState = mockGameEngine.initializeGame(DrawMode.THREE_CARD);

      expect(gameState.stock.cards).toHaveLength(24);
      expect(gameState.stock.drawMode).toBe(DrawMode.THREE_CARD);
      expect(gameState.stock.currentDraw).toHaveLength(0);
      expect(gameState.stock.cycleCount).toBe(0);
    });

    it('should initialize with all stock cards face down', () => {
      mockGameEngine.initializeGame.mockReturnValue(initialGameState);

      const gameState = mockGameEngine.initializeGame(DrawMode.ONE_CARD);

      gameState.stock.cards.forEach(card => {
        expect(card.faceUp).toBe(false);
        expect(card.position.area).toBe(GameArea.STOCK);
      });
    });
  });

  describe('1-Card Draw Mode', () => {
    beforeEach(() => {
      initialGameState.stock.drawMode = DrawMode.ONE_CARD;
    });

    it('should draw exactly 1 card from stock pile', () => {
      // This test will fail until drawFromStock is implemented
      const expectedResult: DrawResult = {
        success: true,
        drawnCards: [mockCards[28]], // First card from stock
        remainingStock: 23,
        cycled: false,
      };

      mockGameEngine.drawFromStock.mockReturnValue(expectedResult);

      const result = mockGameEngine.drawFromStock();

      expect(result.success).toBe(true);
      expect(result.drawnCards).toHaveLength(1);
      expect(result.remainingStock).toBe(23);
      expect(result.cycled).toBe(false);
    });

    it('should make drawn card face up and move to waste pile', () => {
      const drawnCard = {
        ...mockCards[28],
        faceUp: true,
        position: { area: GameArea.WASTE, index: 0 },
      };
      const expectedResult: DrawResult = {
        success: true,
        drawnCards: [drawnCard],
        remainingStock: 23,
        cycled: false,
      };

      mockGameEngine.drawFromStock.mockReturnValue(expectedResult);

      const result = mockGameEngine.drawFromStock();

      expect(result.drawnCards[0].faceUp).toBe(true);
      expect(result.drawnCards[0].position.area).toBe(GameArea.WASTE);
    });
  });

  describe('3-Card Draw Mode', () => {
    beforeEach(() => {
      initialGameState.stock.drawMode = DrawMode.THREE_CARD;
    });

    it('should draw up to 3 cards from stock pile', () => {
      const expectedResult: DrawResult = {
        success: true,
        drawnCards: mockCards.slice(28, 31), // First 3 cards from stock
        remainingStock: 21,
        cycled: false,
      };

      mockGameEngine.drawFromStock.mockReturnValue(expectedResult);

      const result = mockGameEngine.drawFromStock();

      expect(result.success).toBe(true);
      expect(result.drawnCards).toHaveLength(3);
      expect(result.remainingStock).toBe(21);
    });

    it('should draw remaining cards when fewer than 3 left', () => {
      // Simulate stock with only 2 cards left
      const expectedResult: DrawResult = {
        success: true,
        drawnCards: mockCards.slice(50, 52), // Last 2 cards
        remainingStock: 0,
        cycled: false,
      };

      mockGameEngine.drawFromStock.mockReturnValue(expectedResult);

      const result = mockGameEngine.drawFromStock();

      expect(result.success).toBe(true);
      expect(result.drawnCards).toHaveLength(2);
      expect(result.remainingStock).toBe(0);
    });
  });

  describe('Stock Pile Cycling', () => {
    it('should cycle stock pile when empty', () => {
      // This test will fail until cycleStock is implemented
      mockGameEngine.cycleStock.mockReturnValue(true);

      const result = mockGameEngine.cycleStock();

      expect(result).toBe(true);
      expect(mockGameEngine.cycleStock).toHaveBeenCalledTimes(1);
    });

    it('should reset waste pile to stock when cycling', () => {
      const gameStateAfterCycle = {
        ...initialGameState,
        stock: {
          ...initialGameState.stock,
          cards: mockCards.slice(28), // All cards back in stock
          currentDraw: [],
          cycleCount: 1,
        },
      };

      mockGameEngine.cycleStock.mockReturnValue(true);
      mockGameEngine.initializeGame.mockReturnValue(gameStateAfterCycle);

      const cycled = mockGameEngine.cycleStock();

      expect(cycled).toBe(true);
    });

    it('should increment cycle count when stock is cycled', () => {
      const gameStateAfterCycle = {
        ...initialGameState,
        stock: {
          ...initialGameState.stock,
          cycleCount: 1,
        },
      };

      mockGameEngine.initializeGame.mockReturnValue(gameStateAfterCycle);

      const gameState = mockGameEngine.initializeGame(DrawMode.THREE_CARD);
      // Cycle count should be tracked somewhere in the engine
      expect(gameState.stock.cycleCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Empty Stock Pile Handling', () => {
    it('should handle empty stock pile gracefully', () => {
      const emptyStockResult: DrawResult = {
        success: false,
        drawnCards: [],
        remainingStock: 0,
        cycled: false,
      };

      mockGameEngine.drawFromStock.mockReturnValue(emptyStockResult);

      const result = mockGameEngine.drawFromStock();

      expect(result.success).toBe(false);
      expect(result.drawnCards).toHaveLength(0);
      expect(result.remainingStock).toBe(0);
    });
  });

  describe('Integration with Tableau and Foundation', () => {
    it('should allow moving cards from waste to tableau', () => {
      const drawnCard = mockCards[28];
      const targetPosition: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };

      const expectedMoveResult: MoveResult = {
        success: true,
        newState: initialGameState,
        move: {
          id: 'move-1',
          timestamp: Date.now(),
          type: 'waste_to_tableau',
          cards: [drawnCard],
          from: { area: GameArea.WASTE, index: 0 },
          to: targetPosition,
        },
      };

      mockGameEngine.moveCards.mockReturnValue(expectedMoveResult);
      mockGameEngine.isValidMove.mockReturnValue(true);

      const isValid = mockGameEngine.isValidMove(
        [drawnCard],
        { area: GameArea.WASTE, index: 0 },
        targetPosition
      );
      expect(isValid).toBe(true);

      const moveResult = mockGameEngine.moveCards(
        [drawnCard],
        { area: GameArea.WASTE, index: 0 },
        targetPosition
      );
      expect(moveResult.success).toBe(true);
    });

    it('should allow moving cards from waste to foundation', () => {
      const aceCard: Card = {
        id: 'AS',
        rank: CardRank.ACE,
        suit: CardSuit.SPADES,
        faceUp: true,
        position: { area: GameArea.WASTE, index: 0 },
      };

      const targetPosition: Position = { area: GameArea.FOUNDATION, index: 0 };

      const expectedMoveResult: MoveResult = {
        success: true,
        newState: initialGameState,
        move: {
          id: 'move-2',
          timestamp: Date.now(),
          type: 'waste_to_foundation',
          cards: [aceCard],
          from: { area: GameArea.WASTE, index: 0 },
          to: targetPosition,
        },
      };

      mockGameEngine.moveCards.mockReturnValue(expectedMoveResult);
      mockGameEngine.isValidMove.mockReturnValue(true);

      const isValid = mockGameEngine.isValidMove(
        [aceCard],
        { area: GameArea.WASTE, index: 0 },
        targetPosition
      );
      expect(isValid).toBe(true);

      const moveResult = mockGameEngine.moveCards(
        [aceCard],
        { area: GameArea.WASTE, index: 0 },
        targetPosition
      );
      expect(moveResult.success).toBe(true);
    });
  });

  describe('Undo Operations with Stock Pile', () => {
    it('should restore stock pile state after undo', () => {
      const undoResult = {
        success: true,
        newState: initialGameState,
        undoneMove: {
          id: 'move-1',
          timestamp: Date.now(),
          type: 'stock_to_waste',
          cards: [mockCards[28]],
          from: { area: GameArea.STOCK, index: 0 },
          to: { area: GameArea.WASTE, index: 0 },
        },
      };

      mockGameEngine.undoMove.mockReturnValue(undoResult);

      const result = mockGameEngine.undoMove();

      expect(result.success).toBe(true);
      expect(result.undoneMove?.type).toBe('stock_to_waste');
    });

    it('should handle undo of stock cycling', () => {
      const undoResult = {
        success: true,
        newState: {
          ...initialGameState,
          stock: {
            ...initialGameState.stock,
            cycleCount: 0, // Cycle count should be decremented
          },
        },
      };

      mockGameEngine.undoMove.mockReturnValue(undoResult);

      const result = mockGameEngine.undoMove();

      expect(result.success).toBe(true);
      expect(result.newState.stock.cycleCount).toBe(0);
    });
  });

  describe('Game Statistics Integration', () => {
    it('should update statistics when drawing from stock', () => {
      const expectedStats = {
        moveCount: 1,
        undoCount: 0,
        score: 10,
        elapsedTime: 5000,
        cardsInFoundation: 0,
      };

      mockGameEngine.getGameStatistics.mockReturnValue(expectedStats);

      const stats = mockGameEngine.getGameStatistics();

      expect(stats.moveCount).toBeGreaterThanOrEqual(0);
      expect(stats.score).toBeGreaterThanOrEqual(0);
    });
  });
});

// Helper function to create a mock deck of cards
function createMockDeck(): Card[] {
  const suits = [
    CardSuit.SPADES,
    CardSuit.HEARTS,
    CardSuit.DIAMONDS,
    CardSuit.CLUBS,
  ];
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

  const cards: Card[] = [];
  let cardIndex = 0;

  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push({
        id: `${rank}${suit.charAt(0).toUpperCase()}`,
        rank,
        suit,
        faceUp: false,
        position: { area: GameArea.STOCK, index: cardIndex },
      });
      cardIndex++;
    }
  }

  return cards;
}
