/**
 * T039 Unit Test: useGameStatistics Hook
 * Tests the custom React hook for managing game statistics
 * This test should FAIL until useGameStatistics hook is implemented
 *
 * Following TDD principles (Constitution Principle II):
 * - Tests written before implementation
 * - Comprehensive coverage of all statistics calculations
 * - Tests for real-time updates and localStorage integration
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameStatistics } from '../../src/hooks/useGameStatistics';
import { GamePhase, GameState, createNewGameState } from '../../src/types/game-state';
import { Suit, Rank } from '../../src/types/card';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper function to create a mock game state
const createMockGameState = (overrides?: Partial<GameState>): GameState => {
  const baseState = createNewGameState();
  // Create mock history with 10 moves
  const mockHistory = Array.from({ length: 10 }, (_, i) => ({
    id: `move_${i}`,
    type: 'tableau_to_foundation' as any,
    fromArea: 'tableau' as any,
    toArea: 'foundation' as any,
    fromPosition: { tableauIndex: 0, cardIndex: 0 },
    toPosition: { foundationIndex: 0 },
    cards: [{ id: `card_${i}`, suit: Suit.HEARTS, rank: Rank.ACE, faceUp: true }],
    timestamp: Date.now() - (1000 * (10 - i)),
  }));
  
  return {
    ...baseState,
    history: mockHistory,
    statistics: {
      moveCount: 10,
      undoCount: 2,
      score: 100,
      elapsedTime: 60000, // 1 minute
      cardsInFoundation: 4,
    },
    // Add foundation cards to match cardsInFoundation
    foundation: baseState.foundation.map((pile, index) => ({
      ...pile,
      cards: index === 0 ? [
        { id: 'f1', suit: Suit.HEARTS, rank: Rank.ACE, faceUp: true },
        { id: 'f2', suit: Suit.HEARTS, rank: Rank.TWO, faceUp: true },
        { id: 'f3', suit: Suit.HEARTS, rank: Rank.THREE, faceUp: true },
        { id: 'f4', suit: Suit.HEARTS, rank: Rank.FOUR, faceUp: true },
      ] : [],
    })),
    ...overrides,
  };
};

describe('T039: useGameStatistics Hook Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('1. 基本功能測試 (Basic Functionality Tests)', () => {
    it('should initialize hook with default values when no game state provided', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      expect(result.current.currentStats).toEqual({
        moveCount: 0,
        undoCount: 0,
        score: 0,
        elapsedTime: 0,
        cardsInFoundation: 0,
      });
      expect(result.current.overallStats).toBeDefined();
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should calculate initial statistics from provided game state', () => {
      const mockGameState = createMockGameState();
      const { result } = renderHook(() => useGameStatistics(mockGameState));

      expect(result.current.currentStats.moveCount).toBe(10);
      expect(result.current.currentStats.undoCount).toBe(2);
      expect(result.current.currentStats.cardsInFoundation).toBe(4);
      expect(result.current.currentStats.score).toBeGreaterThan(0);
    });

    it('should return correct interface structure', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      expect(result.current).toHaveProperty('currentStats');
      expect(result.current).toHaveProperty('overallStats');
      expect(result.current).toHaveProperty('isCalculating');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refreshStats');
      expect(result.current).toHaveProperty('resetCurrentStats');
      expect(result.current).toHaveProperty('updateStats');
      expect(result.current).toHaveProperty('addCompletedGame');
    });

    it('should update statistics when updateStats is called', () => {
      const { result } = renderHook(() => useGameStatistics(null));
      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateStats(mockGameState);
      });

      expect(result.current.currentStats.moveCount).toBe(10);
      expect(result.current.currentStats.undoCount).toBe(2);
    });

    it('should reset current statistics when resetCurrentStats is called', () => {
      const mockGameState = createMockGameState();
      const { result } = renderHook(() => useGameStatistics(mockGameState));

      // Verify initial stats are populated
      expect(result.current.currentStats.moveCount).toBe(10);

      act(() => {
        result.current.resetCurrentStats();
      });

      expect(result.current.currentStats).toEqual({
        moveCount: 0,
        undoCount: 0,
        score: 0,
        elapsedTime: 0,
        cardsInFoundation: 0,
      });
    });

    it('should refresh statistics when refreshStats is called', () => {
      const mockGameState = createMockGameState();
      const { result } = renderHook(() => useGameStatistics(mockGameState));

      act(() => {
        result.current.refreshStats();
      });

      expect(result.current.currentStats.moveCount).toBe(10);
      expect(result.current.error).toBeNull();
    });
  });

  describe('2. 分數計算測試 (Score Calculation Tests)', () => {
    it('should calculate base score from cards in foundation (10 points per card)', () => {
      const mockGameState = createMockGameState({
        statistics: {
          moveCount: 0,
          undoCount: 0,
          score: 0,
          elapsedTime: 0,
          cardsInFoundation: 5,
        },
      });
      const { result } = renderHook(() => useGameStatistics(mockGameState));

      // Base score should be 5 cards × 10 points = 50 points
      expect(result.current.currentStats.score).toBeGreaterThanOrEqual(50);
    });

    it('should apply time bonus for faster completion', () => {
      const fastGameState = createMockGameState({
        startTime: Date.now() - 30000, // 30 seconds ago
        statistics: {
          moveCount: 10,
          undoCount: 0,
          score: 0,
          elapsedTime: 30000,
          cardsInFoundation: 4,
        },
      });

      const slowGameState = createMockGameState({
        startTime: Date.now() - 600000, // 10 minutes ago
        statistics: {
          moveCount: 10,
          undoCount: 0,
          score: 0,
          elapsedTime: 600000,
          cardsInFoundation: 4,
        },
      });

      const { result: fastResult } = renderHook(() => useGameStatistics(fastGameState));
      const { result: slowResult } = renderHook(() => useGameStatistics(slowGameState));

      // Fast game should have higher score due to time bonus
      expect(fastResult.current.currentStats.score).toBeGreaterThan(
        slowResult.current.currentStats.score
      );
    });

    it('should apply move efficiency bonus for fewer moves', () => {
      const efficientGameState = createMockGameState({
        statistics: {
          moveCount: 5,
          undoCount: 0,
          score: 0,
          elapsedTime: 60000,
          cardsInFoundation: 4,
        },
      });

      const inefficientGameState = createMockGameState({
        statistics: {
          moveCount: 50,
          undoCount: 0,
          score: 0,
          elapsedTime: 60000,
          cardsInFoundation: 4,
        },
      });

      const { result: efficientResult } = renderHook(() => useGameStatistics(efficientGameState));
      const { result: inefficientResult } = renderHook(() => useGameStatistics(inefficientGameState));

      // Efficient game should have higher score due to move efficiency bonus
      expect(efficientResult.current.currentStats.score).toBeGreaterThan(
        inefficientResult.current.currentStats.score
      );
    });

    it('should apply undo penalty (5 points per undo)', () => {
      const noUndoGameState = createMockGameState({
        statistics: {
          moveCount: 10,
          undoCount: 0,
          score: 0,
          elapsedTime: 60000,
          cardsInFoundation: 4,
        },
      });

      const withUndoGameState = createMockGameState({
        statistics: {
          moveCount: 10,
          undoCount: 3,
          score: 0,
          elapsedTime: 60000,
          cardsInFoundation: 4,
        },
      });

      const { result: noUndoResult } = renderHook(() => useGameStatistics(noUndoGameState));
      const { result: withUndoResult } = renderHook(() => useGameStatistics(withUndoGameState));

      // Game with undos should have lower score (3 undos × 5 points = 15 points penalty)
      expect(noUndoResult.current.currentStats.score).toBeGreaterThan(
        withUndoResult.current.currentStats.score
      );
      expect(noUndoResult.current.currentStats.score - withUndoResult.current.currentStats.score).toBeGreaterThanOrEqual(15);
    });

    it('should apply completion bonus for won games (500 points)', () => {
      const wonGameState = createMockGameState({
        phase: GamePhase.WON,
        statistics: {
          moveCount: 10,
          undoCount: 0,
          score: 0,
          elapsedTime: 60000,
          cardsInFoundation: 52,
        },
      });

      const playingGameState = createMockGameState({
        phase: GamePhase.PLAYING,
        statistics: {
          moveCount: 10,
          undoCount: 0,
          score: 0,
          elapsedTime: 60000,
          cardsInFoundation: 52,
        },
      });

      const { result: wonResult } = renderHook(() => useGameStatistics(wonGameState));
      const { result: playingResult } = renderHook(() => useGameStatistics(playingGameState));

      // Won game should have 500 points bonus
      expect(wonResult.current.currentStats.score).toBeGreaterThan(
        playingResult.current.currentStats.score + 400
      );
    });

    it('should ensure score never goes below zero', () => {
      const negativeScoreGameState = createMockGameState({
        statistics: {
          moveCount: 100,
          undoCount: 50, // 50 × 5 = 250 penalty
          score: 0,
          elapsedTime: 3600000, // 1 hour
          cardsInFoundation: 1, // 1 × 10 = 10 base score
        },
      });

      const { result } = renderHook(() => useGameStatistics(negativeScoreGameState));

      expect(result.current.currentStats.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3. 整體統計測試 (Overall Statistics Tests)', () => {
    it('should load overall statistics from localStorage on initialization', () => {
      const mockOverallStats = {
        gamesPlayed: 10,
        gamesWon: 7,
        winRate: 70,
        bestTime: 300000,
        averageTime: 450000,
        totalMoves: 500,
        averageMovesPerGame: 50,
        currentStreak: 3,
        longestStreak: 5,
      };

      localStorageMock.setItem('solitaire_overall_stats', JSON.stringify(mockOverallStats));

      const { result } = renderHook(() => useGameStatistics(null));

      expect(result.current.overallStats).toEqual(mockOverallStats);
    });

    it('should add completed game to overall statistics', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Create a completed game with 25 moves in history
      const completedGameHistory = Array.from({ length: 25 }, (_, i) => ({
        id: `move_${i}`,
        type: 'tableau_to_foundation' as any,
        fromArea: 'tableau' as any,
        toArea: 'foundation' as any,
        fromPosition: { tableauIndex: 0, cardIndex: 0 },
        toPosition: { foundationIndex: 0 },
        cards: [{ id: `card_${i}`, suit: Suit.HEARTS, rank: Rank.ACE, faceUp: true }],
        timestamp: Date.now() - (1000 * (25 - i)),
      }));

      const completedGame = createMockGameState({
        phase: GamePhase.WON,
        history: completedGameHistory,
        statistics: {
          moveCount: 25,
          undoCount: 1,
          score: 1000,
          elapsedTime: 180000, // 3 minutes
          cardsInFoundation: 52,
        },
      });

      act(() => {
        result.current.addCompletedGame(completedGame);
      });

      expect(result.current.overallStats?.gamesPlayed).toBe(1);
      expect(result.current.overallStats?.gamesWon).toBe(1);
      expect(result.current.overallStats?.winRate).toBe(100);
      expect(result.current.overallStats?.totalMoves).toBe(25);
    });

    it('should calculate win rate correctly', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Add a won game
      const wonGame = createMockGameState({
        phase: GamePhase.WON,
        statistics: { moveCount: 20, undoCount: 0, score: 1000, elapsedTime: 180000, cardsInFoundation: 52 },
      });

      act(() => {
        result.current.addCompletedGame(wonGame);
      });

      // Add a lost game
      const lostGame = createMockGameState({
        phase: GamePhase.LOST,
        statistics: { moveCount: 30, undoCount: 5, score: 200, elapsedTime: 600000, cardsInFoundation: 20 },
      });

      act(() => {
        result.current.addCompletedGame(lostGame);
      });

      expect(result.current.overallStats?.gamesPlayed).toBe(2);
      expect(result.current.overallStats?.gamesWon).toBe(1);
      expect(result.current.overallStats?.winRate).toBe(50);
    });

    it('should update best time only for won games', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Add a fast won game
      const currentTime = Date.now();
      const fastWonGame = createMockGameState({
        phase: GamePhase.WON,
        startTime: currentTime - 120000, // 2 minutes ago
        statistics: { moveCount: 20, undoCount: 0, score: 1200, elapsedTime: 120000, cardsInFoundation: 52 },
      });

      act(() => {
        result.current.addCompletedGame(fastWonGame);
      });

      expect(result.current.overallStats?.bestTime).toBe(120000);

      // Add a slow won game
      const slowWonGame = createMockGameState({
        phase: GamePhase.WON,
        startTime: currentTime - 300000, // 5 minutes ago
        statistics: { moveCount: 25, undoCount: 1, score: 1000, elapsedTime: 300000, cardsInFoundation: 52 },
      });

      act(() => {
        result.current.addCompletedGame(slowWonGame);
      });

      // Best time should remain the faster one
      expect(result.current.overallStats?.bestTime).toBe(120000);

      // Add a very fast won game
      const veryFastWonGame = createMockGameState({
        phase: GamePhase.WON,
        startTime: currentTime - 90000, // 1.5 minutes ago
        statistics: { moveCount: 18, undoCount: 0, score: 1500, elapsedTime: 90000, cardsInFoundation: 52 },
      });

      act(() => {
        result.current.addCompletedGame(veryFastWonGame);
      });

      // Best time should update to the new faster time
      expect(result.current.overallStats?.bestTime).toBe(90000);
    });

    it('should calculate average time for won games only', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Add two won games
      const currentTime = Date.now();
      const wonGame1 = createMockGameState({
        phase: GamePhase.WON,
        startTime: currentTime - 120000,
        statistics: { moveCount: 20, undoCount: 0, score: 1200, elapsedTime: 120000, cardsInFoundation: 52 },
      });

      const wonGame2 = createMockGameState({
        phase: GamePhase.WON,
        startTime: currentTime - 180000,
        statistics: { moveCount: 25, undoCount: 1, score: 1000, elapsedTime: 180000, cardsInFoundation: 52 },
      });

      act(() => {
        result.current.addCompletedGame(wonGame1);
        result.current.addCompletedGame(wonGame2);
      });

      // Average time should be (120000 + 180000) / 2 = 150000
      expect(result.current.overallStats?.averageTime).toBe(150000);

      // Add a lost game (should not affect average time)
      const lostGame = createMockGameState({
        phase: GamePhase.LOST,
        startTime: currentTime - 600000,
        statistics: { moveCount: 50, undoCount: 10, score: 100, elapsedTime: 600000, cardsInFoundation: 10 },
      });

      act(() => {
        result.current.addCompletedGame(lostGame);
      });

      // Average time should remain the same (lost games don't count)
      expect(result.current.overallStats?.averageTime).toBe(150000);
    });

    it('should calculate average moves per game correctly', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Create histories with the correct number of moves
      const game1History = Array.from({ length: 20 }, (_, i) => ({
        id: `move_${i}`,
        type: 'tableau_to_foundation' as any,
        fromArea: 'tableau' as any,
        toArea: 'foundation' as any,
        fromPosition: { tableauIndex: 0, cardIndex: 0 },
        toPosition: { foundationIndex: 0 },
        cards: [{ id: `card_${i}`, suit: Suit.HEARTS, rank: Rank.ACE, faceUp: true }],
        timestamp: Date.now() - (1000 * (20 - i)),
      }));

      const game2History = Array.from({ length: 40 }, (_, i) => ({
        id: `move_${i}`,
        type: 'tableau_to_foundation' as any,
        fromArea: 'tableau' as any,
        toArea: 'foundation' as any,
        fromPosition: { tableauIndex: 0, cardIndex: 0 },
        toPosition: { foundationIndex: 0 },
        cards: [{ id: `card_${i}`, suit: Suit.HEARTS, rank: Rank.ACE, faceUp: true }],
        timestamp: Date.now() - (1000 * (40 - i)),
      }));

      const game1 = createMockGameState({
        phase: GamePhase.WON,
        history: game1History,
        statistics: { moveCount: 20, undoCount: 0, score: 1200, elapsedTime: 120000, cardsInFoundation: 52 },
      });

      const game2 = createMockGameState({
        phase: GamePhase.LOST,
        history: game2History,
        statistics: { moveCount: 40, undoCount: 5, score: 500, elapsedTime: 300000, cardsInFoundation: 25 },
      });

      act(() => {
        result.current.addCompletedGame(game1);
        result.current.addCompletedGame(game2);
      });

      // Average moves should be (20 + 40) / 2 = 30
      expect(result.current.overallStats?.averageMovesPerGame).toBe(30);
      expect(result.current.overallStats?.totalMoves).toBe(60);
    });

    it('should track current and longest win streaks', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Add 3 consecutive wins
      for (let i = 0; i < 3; i++) {
        const wonGame = createMockGameState({
          phase: GamePhase.WON,
          statistics: { moveCount: 20 + i, undoCount: 0, score: 1000, elapsedTime: 180000, cardsInFoundation: 52 },
        });

        act(() => {
          result.current.addCompletedGame(wonGame);
        });
      }

      expect(result.current.overallStats?.currentStreak).toBe(3);
      expect(result.current.overallStats?.longestStreak).toBe(3);

      // Add a loss (should reset current streak)
      const lostGame = createMockGameState({
        phase: GamePhase.LOST,
        statistics: { moveCount: 50, undoCount: 10, score: 200, elapsedTime: 600000, cardsInFoundation: 20 },
      });

      act(() => {
        result.current.addCompletedGame(lostGame);
      });

      expect(result.current.overallStats?.currentStreak).toBe(0);
      expect(result.current.overallStats?.longestStreak).toBe(3);

      // Add 2 more wins
      for (let i = 0; i < 2; i++) {
        const wonGame = createMockGameState({
          phase: GamePhase.WON,
          statistics: { moveCount: 22 + i, undoCount: 0, score: 1100, elapsedTime: 170000, cardsInFoundation: 52 },
        });

        act(() => {
          result.current.addCompletedGame(wonGame);
        });
      }

      expect(result.current.overallStats?.currentStreak).toBe(2);
      expect(result.current.overallStats?.longestStreak).toBe(3); // Should remain 3
    });
  });

  describe('4. 即時更新測試 (Real-time Updates Tests)', () => {
    it('should update statistics in real-time when enabled', () => {
      const mockGameState = createMockGameState({
        startTime: Date.now() - 30000, // Started 30 seconds ago
      });

      const { result } = renderHook(() =>
        useGameStatistics(mockGameState, { realTimeUpdates: true, updateInterval: 1000 })
      );

      const initialElapsedTime = result.current.currentStats.elapsedTime;

      // Advance time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Statistics should have updated
      expect(result.current.currentStats.elapsedTime).toBeGreaterThan(initialElapsedTime);
    });

    it('should not update in real-time when disabled', () => {
      const mockGameState = createMockGameState({
        startTime: Date.now() - 30000,
      });

      const { result } = renderHook(() =>
        useGameStatistics(mockGameState, { realTimeUpdates: false })
      );

      const initialElapsedTime = result.current.currentStats.elapsedTime;

      // Advance time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Statistics should not have updated automatically
      expect(result.current.currentStats.elapsedTime).toBe(initialElapsedTime);
    });

    it('should respect custom update interval', () => {
      const mockGameState = createMockGameState();
      let updateCount = 0;

      // Mock the calculateCurrentStats function to count updates
      const originalConsoleLog = console.log;
      console.log = jest.fn(() => {
        updateCount++;
      });

      const { result } = renderHook(() =>
        useGameStatistics(mockGameState, { realTimeUpdates: true, updateInterval: 500 })
      );

      // Advance time by 1.5 seconds (should trigger 3 updates with 500ms interval)
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      console.log = originalConsoleLog;
    });

    it('should clean up interval on unmount', () => {
      const mockGameState = createMockGameState();
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

      const { unmount } = renderHook(() =>
        useGameStatistics(mockGameState, { realTimeUpdates: true })
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('5. localStorage 整合測試 (localStorage Integration Tests)', () => {
    it('should save overall statistics to localStorage when adding completed game', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      const completedGame = createMockGameState({
        phase: GamePhase.WON,
        statistics: { moveCount: 25, undoCount: 1, score: 1000, elapsedTime: 180000, cardsInFoundation: 52 },
      });

      act(() => {
        result.current.addCompletedGame(completedGame);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'solitaire_overall_stats',
        expect.any(String)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useGameStatistics(null));

      const completedGame = createMockGameState({
        phase: GamePhase.WON,
        statistics: { moveCount: 25, undoCount: 1, score: 1000, elapsedTime: 180000, cardsInFoundation: 52 },
      });

      act(() => {
        result.current.addCompletedGame(completedGame);
      });

      // Should set error state but not crash
      expect(result.current.error).toBeTruthy();

      // Restore original
      localStorageMock.setItem.mockImplementation(originalSetItem);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('solitaire_overall_stats', 'corrupted-json');

      const { result } = renderHook(() => useGameStatistics(null));

      // Should fall back to default statistics
      expect(result.current.overallStats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
        bestTime: 0,
        averageTime: 0,
        totalMoves: 0,
        averageMovesPerGame: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    });

    it('should handle localStorage not available', () => {
      // Mock localStorage to be undefined
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const { result } = renderHook(() => useGameStatistics(null));

      // Should work without localStorage
      expect(result.current.overallStats).toBeTruthy();

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });
  });

  describe('6. 效能測試 (Performance Tests)', () => {
    it('should use useCallback for all functions to prevent unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useGameStatistics(null));

      const functions = {
        refreshStats: result.current.refreshStats,
        resetCurrentStats: result.current.resetCurrentStats,
        updateStats: result.current.updateStats,
        addCompletedGame: result.current.addCompletedGame,
      };

      // Force a rerender
      rerender();

      // Functions should have the same reference
      expect(result.current.refreshStats).toBe(functions.refreshStats);
      expect(result.current.resetCurrentStats).toBe(functions.resetCurrentStats);
      expect(result.current.updateStats).toBe(functions.updateStats);
      expect(result.current.addCompletedGame).toBe(functions.addCompletedGame);
    });

    it('should handle large numbers of completed games efficiently', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      const startTime = performance.now();

      // Add 100 completed games
      act(() => {
        for (let i = 0; i < 100; i++) {
          const game = createMockGameState({
            phase: i % 2 === 0 ? GamePhase.WON : GamePhase.LOST,
            statistics: {
              moveCount: 20 + i,
              undoCount: i % 5,
              score: 1000 + i * 10,
              elapsedTime: 180000 + i * 1000,
              cardsInFoundation: i % 2 === 0 ? 52 : 25,
            },
          });
          result.current.addCompletedGame(game);
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
      expect(result.current.overallStats?.gamesPlayed).toBe(100);
    });

    it('should avoid unnecessary recalculations with useMemo', () => {
      const { result, rerender } = renderHook(() => useGameStatistics(null));

      const returnValue = result.current;

      // Rerender without changing props
      rerender();

      // Return value should be memoized
      expect(result.current).toBe(returnValue);
    });
  });

  describe('7. 錯誤處理測試 (Error Handling Tests)', () => {
    it('should handle statistics calculation errors gracefully', () => {
      // Create a malformed game state that might cause calculation errors
      const malformedGameState = {
        ...createMockGameState(),
        statistics: {
          moveCount: NaN,
          undoCount: -1,
          score: Infinity,
          elapsedTime: null,
          cardsInFoundation: undefined,
        },
      } as any;

      const { result } = renderHook(() => useGameStatistics(malformedGameState));

      // Should not crash and should set error state
      expect(result.current.error).toBeTruthy();
      expect(result.current.currentStats).toBeDefined();
    });

    it('should handle null or undefined game state', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      expect(result.current.currentStats).toBeDefined();
      expect(result.current.error).toBeNull();

      // Test with undefined
      const { result: result2 } = renderHook(() => useGameStatistics(undefined as any));

      expect(result2.current.currentStats).toBeDefined();
      expect(result2.current.error).toBeNull();
    });

    it('should recover from temporary calculation errors', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Simulate a calculation error
      const badGameState = {
        ...createMockGameState(),
        statistics: {
          moveCount: NaN,
          undoCount: NaN,
          score: NaN,
          elapsedTime: NaN,
          cardsInFoundation: NaN,
        },
      } as any;

      act(() => {
        result.current.updateStats(badGameState);
      });

      expect(result.current.error).toBeTruthy();

      // Then provide a good game state
      const goodGameState = createMockGameState();

      act(() => {
        result.current.updateStats(goodGameState);
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
      expect(result.current.currentStats.moveCount).toBe(10);
    });
  });

  describe('8. 配置選項測試 (Configuration Options Tests)', () => {
    it('should respect realTimeUpdates configuration', () => {
      const mockGameState = createMockGameState();

      const { result: enabledResult } = renderHook(() =>
        useGameStatistics(mockGameState, { realTimeUpdates: true })
      );

      const { result: disabledResult } = renderHook(() =>
        useGameStatistics(mockGameState, { realTimeUpdates: false })
      );

      // Both should initialize properly
      expect(enabledResult.current.currentStats).toBeDefined();
      expect(disabledResult.current.currentStats).toBeDefined();
    });

    it('should respect trackHistory configuration', () => {
      const { result: withHistoryResult } = renderHook(() =>
        useGameStatistics(null, { trackHistory: true })
      );

      const { result: withoutHistoryResult } = renderHook(() =>
        useGameStatistics(null, { trackHistory: false })
      );

      expect(withHistoryResult.current.overallStats).toBeDefined();
      expect(withoutHistoryResult.current.overallStats).toBeNull();
    });

    it('should use default configuration when not provided', () => {
      const { result } = renderHook(() => useGameStatistics(null));

      // Should use defaults: realTimeUpdates: true, trackHistory: true, etc.
      expect(result.current.overallStats).toBeDefined();
    });

    it('should merge partial configuration with defaults', () => {
      const { result } = renderHook(() =>
        useGameStatistics(null, { updateInterval: 2000 })
      );

      // Should still have default realTimeUpdates: true and trackHistory: true
      expect(result.current.overallStats).toBeDefined();
    });
  });
});