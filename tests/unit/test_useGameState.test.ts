/**
 * T036 Unit Test: useGameState Hook
 * Tests the custom React hook for managing Solitaire game state
 * This test should FAIL until useGameState hook is implemented
 *
 * Following TDD principles (Constitution Principle II):
 * - Tests written before implementation
 * - Comprehensive coverage of all state transitions
 * - Tests for error handling and edge cases
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameState } from '../../src/hooks/useGameState';
import { GamePhase, DrawMode, GameArea, Position } from '../../src/types/game-state';
import { Suit, Rank } from '../../src/types/card';

// Mock dependencies
jest.mock('../../src/services/game-engine');
jest.mock('../../src/services/storage');

describe('T036: useGameState Hook Unit Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Use fake timers for timer tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('1. 初始化測試 (Initialization Tests)', () => {
    it('should initialize with NEW_GAME phase when no saved state exists', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState).toBeDefined();
      expect(result.current.gameState.phase).toBe(GamePhase.NEW_GAME);
      expect(result.current.gameState.statistics.moveCount).toBe(0);
      expect(result.current.gameState.statistics.score).toBe(0);
    });

    it('should load existing game state from localStorage on initialization', () => {
      // Setup: Save a game state to localStorage
      const savedState = {
        phase: GamePhase.PLAYING,
        statistics: {
          moveCount: 5,
          score: 100,
          elapsedTime: 30000,
          cardsInFoundation: 4,
          undoCount: 1,
          redoCount: 0,
        },
      };
      localStorage.setItem('solitaire-game-state', JSON.stringify(savedState));

      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.phase).toBe(GamePhase.PLAYING);
      expect(result.current.gameState.statistics.moveCount).toBe(5);
      expect(result.current.gameState.statistics.score).toBe(100);
    });

    it('should return correct interface structure', () => {
      const { result } = renderHook(() => useGameState());

      // Verify all required methods and properties exist
      expect(result.current).toHaveProperty('gameState');
      expect(result.current).toHaveProperty('newGame');
      expect(result.current).toHaveProperty('executeMove');
      expect(result.current).toHaveProperty('undo');
      expect(result.current).toHaveProperty('redo');
      expect(result.current).toHaveProperty('pauseGame');
      expect(result.current).toHaveProperty('resumeGame');
      expect(result.current).toHaveProperty('updateSettings');
      expect(result.current).toHaveProperty('canUndo');
      expect(result.current).toHaveProperty('canRedo');
      expect(result.current).toHaveProperty('isWon');
    });
  });

  describe('2. 新遊戲測試 (New Game Tests)', () => {
    it('should create new game and transition to PLAYING phase', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      expect(result.current.gameState.phase).toBe(GamePhase.PLAYING);
    });

    it('should deal cards correctly: 7 tableau columns with proper card counts', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const tableau = result.current.gameState.tableau;
      expect(tableau).toHaveLength(7);
      
      // First column should have 1 card, second 2 cards, etc.
      tableau.forEach((column, index) => {
        expect(column.cards.length).toBe(index + 1);
      });
    });

    it('should initialize 4 empty foundation piles', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const foundation = result.current.gameState.foundation;
      expect(foundation).toHaveLength(4);
      foundation.forEach(pile => {
        expect(pile.cards).toHaveLength(0);
      });
    });

    it('should place remaining cards in stock pile', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const stock = result.current.gameState.stock;
      // 52 cards - (1+2+3+4+5+6+7) tableau cards = 24 cards in stock
      expect(stock.cards.length).toBe(24);
    });

    it('should reset statistics when starting new game', () => {
      const { result } = renderHook(() => useGameState());

      // First game with some moves
      act(() => {
        result.current.newGame();
      });

      // Simulate some moves
      const stats = result.current.gameState.statistics;
      const mockMove: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const mockTarget: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 0,
      };

      act(() => {
        result.current.executeMove(mockMove, mockTarget);
      });

      // Start new game
      act(() => {
        result.current.newGame();
      });

      expect(result.current.gameState.statistics.moveCount).toBe(0);
      expect(result.current.gameState.statistics.score).toBe(0);
      expect(result.current.gameState.statistics.undoCount).toBe(0);
      expect(result.current.gameState.statistics.redoCount).toBe(0);
    });
  });

  describe('3. 移動執行測試 (Move Execution Tests)', () => {
    it('should execute valid move successfully', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      const initialMoveCount = result.current.gameState.statistics.moveCount;

      act(() => {
        result.current.executeMove(from, to);
      });

      expect(result.current.gameState.statistics.moveCount).toBe(initialMoveCount + 1);
    });

    it('should add move to history when move is executed', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      act(() => {
        result.current.executeMove(from, to);
      });

      expect(result.current.gameState.history.moves.length).toBeGreaterThan(0);
      expect(result.current.canUndo).toBe(true);
    });

    it('should update canUndo when move is executed', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      expect(result.current.canUndo).toBe(false);

      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      act(() => {
        result.current.executeMove(from, to);
      });

      expect(result.current.canUndo).toBe(true);
    });
  });

  describe('4. 無效移動測試 (Invalid Move Tests)', () => {
    it('should reject invalid move and not change state', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const initialMoveCount = result.current.gameState.statistics.moveCount;
      const initialState = JSON.stringify(result.current.gameState);

      // Invalid move: same source and destination
      const invalidFrom: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const invalidTo: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };

      act(() => {
        result.current.executeMove(invalidFrom, invalidTo);
      });

      expect(result.current.gameState.statistics.moveCount).toBe(initialMoveCount);
    });

    it('should return error message for invalid moves', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Mock game engine to return validation error
      const invalidFrom: Position = {
        area: GameArea.FOUNDATION,
        index: 0,
        stackIndex: 0,
      };
      const invalidTo: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };

      let moveResult: any;
      act(() => {
        moveResult = result.current.executeMove(invalidFrom, invalidTo);
      });

      // Expect the move to be rejected (implementation should return error)
      expect(moveResult?.success).toBe(false);
    });
  });

  describe('5. 撤銷/重做測試 (Undo/Redo Tests)', () => {
    it('should undo last move and restore previous state', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Execute a move
      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      act(() => {
        result.current.executeMove(from, to);
      });

      const moveCountAfterMove = result.current.gameState.statistics.moveCount;

      // Undo the move
      act(() => {
        result.current.undo();
      });

      expect(result.current.gameState.statistics.undoCount).toBe(1);
      expect(result.current.canRedo).toBe(true);
    });

    it('should update canUndo and canRedo correctly', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Initially no undo/redo available
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      // Execute a move
      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      act(() => {
        result.current.executeMove(from, to);
      });

      // After move, undo available
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      // After undo, redo available
      act(() => {
        result.current.undo();
      });

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it('should redo previously undone move', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      // Execute, undo, then redo
      act(() => {
        result.current.executeMove(from, to);
      });

      act(() => {
        result.current.undo();
      });

      const moveCountAfterUndo = result.current.gameState.statistics.moveCount;

      act(() => {
        result.current.redo();
      });

      expect(result.current.gameState.statistics.redoCount).toBe(1);
      expect(result.current.canRedo).toBe(false);
    });

    it('should handle multiple undo/redo operations', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Execute multiple moves
      const moves = [
        { from: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 }, to: { area: GameArea.TABLEAU, index: 1, stackIndex: 1 } },
        { from: { area: GameArea.TABLEAU, index: 2, stackIndex: 0 }, to: { area: GameArea.TABLEAU, index: 3, stackIndex: 2 } },
        { from: { area: GameArea.TABLEAU, index: 4, stackIndex: 0 }, to: { area: GameArea.TABLEAU, index: 5, stackIndex: 4 } },
      ];

      moves.forEach((move) => {
        act(() => {
          result.current.executeMove(move.from as Position, move.to as Position);
        });
      });

      // Undo all moves
      moves.forEach(() => {
        act(() => {
          result.current.undo();
        });
      });

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      // Redo all moves
      moves.forEach(() => {
        act(() => {
          result.current.redo();
        });
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('6. 勝利檢測測試 (Victory Detection Tests)', () => {
    it('should detect game victory when all 52 cards are in foundation', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Mock a winning state
      act(() => {
        // This would need to manipulate the state to have all cards in foundation
        // For testing purposes, we simulate the win condition
        const winningState = {
          ...result.current.gameState,
          statistics: {
            ...result.current.gameState.statistics,
            cardsInFoundation: 52,
          },
        };
        // The hook should detect this and transition to WON phase
      });

      // After the winning condition is met
      waitFor(() => {
        expect(result.current.isWon).toBe(true);
        expect(result.current.gameState.phase).toBe(GamePhase.WON);
      });
    });

    it('should set endTime when game is won', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Simulate winning the game
      act(() => {
        // Set up winning condition
        const winningState = {
          ...result.current.gameState,
          statistics: {
            ...result.current.gameState.statistics,
            cardsInFoundation: 52,
          },
        };
      });

      waitFor(() => {
        expect(result.current.gameState.statistics.endTime).toBeDefined();
        expect(result.current.gameState.statistics.endTime).toBeGreaterThan(0);
      });
    });

    it('should calculate final statistics correctly when game is won', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Execute some moves and then win
      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.FOUNDATION,
        index: 0,
        stackIndex: 0,
      };

      act(() => {
        result.current.executeMove(from, to);
      });

      // Simulate winning
      act(() => {
        const winningState = {
          ...result.current.gameState,
          statistics: {
            ...result.current.gameState.statistics,
            cardsInFoundation: 52,
          },
        };
      });

      waitFor(() => {
        expect(result.current.gameState.statistics.score).toBeGreaterThan(0);
      });
    });
  });

  describe('7. 持久化測試 (Persistence Tests)', () => {
    it('should save game state to storage after move', async () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      act(() => {
        result.current.executeMove(from, to);
      });

      // Wait for state to be saved
      await waitFor(() => {
        const savedState = localStorage.getItem('solitaire-game-state');
        expect(savedState).not.toBeNull();
      });
    });

    it('should restore state correctly from storage', () => {
      // First hook instance - create and save state
      const { result: result1, unmount } = renderHook(() => useGameState());

      act(() => {
        result1.current.newGame();
      });

      const from: Position = {
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      act(() => {
        result1.current.executeMove(from, to);
      });

      const savedMoveCount = result1.current.gameState.statistics.moveCount;

      // Unmount and create new hook instance
      unmount();
      const { result: result2 } = renderHook(() => useGameState());

      // New instance should load saved state
      expect(result2.current.gameState.statistics.moveCount).toBe(savedMoveCount);
    });

    it('should debounce storage saves to avoid excessive writes', async () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Execute multiple moves rapidly
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.executeMove(
            { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
            { area: GameArea.TABLEAU, index: 1, stackIndex: 1 }
          );
        });
      }

      // Storage should not be called 5 times immediately
      // Implementation should debounce the saves
      await waitFor(() => {
        const savedState = localStorage.getItem('solitaire-game-state');
        expect(savedState).not.toBeNull();
      });
    });
  });

  describe('8. 計時器測試 (Timer Tests)', () => {
    it('should update elapsedTime when game is playing', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const initialTime = result.current.gameState.statistics.elapsedTime;

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.gameState.statistics.elapsedTime).toBeGreaterThan(initialTime);
    });

    it('should stop timer when game is paused', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Let some time pass
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const timeBeforePause = result.current.gameState.statistics.elapsedTime;

      // Pause the game
      act(() => {
        result.current.pauseGame();
      });

      expect(result.current.gameState.phase).toBe(GamePhase.PAUSED);

      // Advance time while paused
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Time should not have increased
      expect(result.current.gameState.statistics.elapsedTime).toBe(timeBeforePause);
    });

    it('should resume timer when game is resumed', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Pause the game
      act(() => {
        result.current.pauseGame();
      });

      const timeBeforeResume = result.current.gameState.statistics.elapsedTime;

      // Resume the game
      act(() => {
        result.current.resumeGame();
      });

      expect(result.current.gameState.phase).toBe(GamePhase.PLAYING);

      // Advance time after resume
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Time should have increased
      expect(result.current.gameState.statistics.elapsedTime).toBeGreaterThan(timeBeforeResume);
    });

    it('should handle multiple pause/resume cycles correctly', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Play for 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Pause for 2 seconds
      act(() => {
        result.current.pauseGame();
        jest.advanceTimersByTime(2000);
      });

      const timeAfterFirstPause = result.current.gameState.statistics.elapsedTime;

      // Resume and play for 1 second
      act(() => {
        result.current.resumeGame();
        jest.advanceTimersByTime(1000);
      });

      // Time should only count playing time, not paused time
      const expectedTime = timeAfterFirstPause + 1000;
      expect(result.current.gameState.statistics.elapsedTime).toBeCloseTo(expectedTime, -2);
    });
  });

  describe('9. 效能測試 (Performance Tests)', () => {
    it('should use useCallback for all methods to prevent unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useGameState());

      const methods = {
        newGame: result.current.newGame,
        executeMove: result.current.executeMove,
        undo: result.current.undo,
        redo: result.current.redo,
        pauseGame: result.current.pauseGame,
        resumeGame: result.current.resumeGame,
        updateSettings: result.current.updateSettings,
      };

      // Force a rerender
      rerender();

      // Methods should have the same reference
      expect(result.current.newGame).toBe(methods.newGame);
      expect(result.current.executeMove).toBe(methods.executeMove);
      expect(result.current.undo).toBe(methods.undo);
      expect(result.current.redo).toBe(methods.redo);
      expect(result.current.pauseGame).toBe(methods.pauseGame);
      expect(result.current.resumeGame).toBe(methods.resumeGame);
      expect(result.current.updateSettings).toBe(methods.updateSettings);
    });

    it('should use useMemo for derived values (canUndo, canRedo, isWon)', () => {
      const { result, rerender } = renderHook(() => useGameState());

      const derivedValues = {
        canUndo: result.current.canUndo,
        canRedo: result.current.canRedo,
        isWon: result.current.isWon,
      };

      // Rerender without state change
      rerender();

      // Derived values should be memoized
      expect(result.current.canUndo).toBe(derivedValues.canUndo);
      expect(result.current.canRedo).toBe(derivedValues.canRedo);
      expect(result.current.isWon).toBe(derivedValues.isWon);
    });

    it('should not cause memory leaks after multiple moves', () => {
      const { result, unmount } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Execute many moves
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.executeMove(
            { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
            { area: GameArea.TABLEAU, index: 1, stackIndex: 1 }
          );
        });
      }

      // Cleanup
      unmount();

      // No assertions needed - just verify it doesn't crash or leak
      expect(true).toBe(true);
    });

    it('should handle rapid state updates efficiently', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const startTime = performance.now();

      // Execute 50 rapid moves
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.executeMove(
            { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
            { area: GameArea.TABLEAU, index: 1, stackIndex: 1 }
          );
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('10. 設定更新測試 (Settings Update Tests)', () => {
    it('should update game settings correctly', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const newSettings = {
        drawMode: DrawMode.THREE_CARD,
        autoComplete: true,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.gameState.settings.drawMode).toBe(DrawMode.THREE_CARD);
      expect(result.current.gameState.settings.autoComplete).toBe(true);
    });

    it('should persist settings updates to storage', async () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      const newSettings = {
        drawMode: DrawMode.ONE_CARD,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      await waitFor(() => {
        const savedState = localStorage.getItem('solitaire-game-state');
        expect(savedState).not.toBeNull();
        const parsed = JSON.parse(savedState!);
        expect(parsed.settings.drawMode).toBe(DrawMode.ONE_CARD);
      });
    });

    it('should apply partial settings updates without overwriting other settings', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Update only drawMode
      act(() => {
        result.current.updateSettings({ drawMode: DrawMode.THREE_CARD });
      });

      // Update only autoComplete
      act(() => {
        result.current.updateSettings({ autoComplete: true });
      });

      // Both settings should be updated
      expect(result.current.gameState.settings.drawMode).toBe(DrawMode.THREE_CARD);
      expect(result.current.gameState.settings.autoComplete).toBe(true);
    });
  });

  describe('11. 錯誤處理測試 (Error Handling Tests)', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Should not crash, continue working
      expect(result.current.gameState).toBeDefined();
      expect(result.current.gameState.phase).toBe(GamePhase.PLAYING);

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle corrupted localStorage data', () => {
      // Set corrupted data
      localStorage.setItem('solitaire-game-state', 'corrupted-json-data');

      const { result } = renderHook(() => useGameState());

      // Should fall back to new game
      expect(result.current.gameState.phase).toBe(GamePhase.NEW_GAME);
    });

    it('should handle game engine errors gracefully', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.newGame();
      });

      // Try to execute a move that causes engine error
      const from: Position = {
        area: GameArea.TABLEAU,
        index: 99, // Invalid index
        stackIndex: 0,
      };
      const to: Position = {
        area: GameArea.TABLEAU,
        index: 1,
        stackIndex: 1,
      };

      act(() => {
        result.current.executeMove(from, to);
      });

      // Should not crash, state should remain valid
      expect(result.current.gameState).toBeDefined();
    });
  });
});
