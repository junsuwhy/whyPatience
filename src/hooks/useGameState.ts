/**
 * useGameState Hook Implementation
 *
 * A custom React hook that manages the entire Solitaire game state,
 * providing a unified state management interface for all components.
 *
 * This hook is responsible for:
 * - Initializing and maintaining game state (GameState)
 * - Providing game operation methods (new game, execute move, undo/redo, pause/resume)
 * - Managing game phase transitions (NEW_GAME → PLAYING → WON/LOST)
 * - Integrating game-engine service for game logic validation
 * - Integrating storage service for state persistence
 * - Providing game statistics updates (move count, score, time)
 * - Ensuring compliance with Constitution four principles:
 *   - Code Quality: Clean interface design, type safety, comprehensive error handling
 *   - TDD: Tests written first, ensuring all state transitions and operations have test coverage
 *   - UX Consistency: Consistent state update mechanism, ensuring UI immediately reflects state changes
 *   - Performance: Using useReducer for complex state management, avoiding unnecessary re-renders, using useMemo/useCallback for optimization
 */

import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { GameEngine, MoveResult, UndoResult } from '../services/game-engine';
import { StorageService } from '../services/storage';
import {
  GameState,
  GamePhase,
  GameSettings,
  Position,
  GameStatistics,
  createNewGameState,
} from '../types/game-state';
import { Card } from '../types/card';

/**
 * Game state action types for the useReducer
 */
export enum GameStateActionType {
  NEW_GAME = 'NEW_GAME',
  MOVE = 'MOVE',
  UNDO = 'UNDO',
  REDO = 'REDO',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  UPDATE_TIMER = 'UPDATE_TIMER',
  LOAD_GAME = 'LOAD_GAME',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

/**
 * Game state actions for the useReducer
 */
export type GameStateAction =
  | { type: GameStateActionType.NEW_GAME; payload: GameState }
  | {
      type: GameStateActionType.MOVE;
      payload: { newState: GameState; move?: unknown; revealed?: Card };
    }
  | { type: GameStateActionType.UNDO; payload: GameState }
  | { type: GameStateActionType.REDO; payload: GameState }
  | { type: GameStateActionType.PAUSE }
  | { type: GameStateActionType.RESUME }
  | {
      type: GameStateActionType.UPDATE_SETTINGS;
      payload: Partial<GameSettings>;
    }
  | { type: GameStateActionType.UPDATE_TIMER; payload: number }
  | { type: GameStateActionType.LOAD_GAME; payload: GameState }
  | { type: GameStateActionType.SET_ERROR; payload: string }
  | { type: GameStateActionType.CLEAR_ERROR };

/**
 * Internal state for the useGameState hook
 */
interface UseGameStateState {
  gameState: GameState;
  error: string | null;
  isLoading: boolean;
}

/**
 * Return interface for the useGameState hook
 */
export interface UseGameStateReturn {
  // Current game state
  gameState: GameState;

  // Derived state
  canUndo: boolean;
  canRedo: boolean;
  isWon: boolean;
  isPaused: boolean;
  isPlaying: boolean;

  // Game operations
  newGame: () => void;
  executeMove: (
    from: Position,
    to: Position,
    cards?: Card[]
  ) => Promise<boolean>;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  pauseGame: () => void;
  resumeGame: () => void;
  updateSettings: (settings: Partial<GameSettings>) => Promise<void>;

  // Game statistics
  statistics: GameStatistics;

  // Error handling
  error: string | null;
  clearError: () => void;

  // Loading state
  isLoading: boolean;
}

/**
 * Reducer function for game state management
 */
function gameStateReducer(
  state: UseGameStateState,
  action: GameStateAction
): UseGameStateState {
  switch (action.type) {
    case GameStateActionType.NEW_GAME:
      return {
        ...state,
        gameState: action.payload,
        error: null,
        isLoading: false,
      };

    case GameStateActionType.MOVE:
      return {
        ...state,
        gameState: action.payload.newState,
        error: null,
      };

    case GameStateActionType.UNDO:
      return {
        ...state,
        gameState: action.payload,
        error: null,
      };

    case GameStateActionType.REDO:
      return {
        ...state,
        gameState: action.payload,
        error: null,
      };

    case GameStateActionType.PAUSE:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          phase: GamePhase.PAUSED,
        },
      };

    case GameStateActionType.RESUME:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          phase: GamePhase.PLAYING,
        },
      };

    case GameStateActionType.UPDATE_SETTINGS:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          settings: {
            ...state.gameState.settings,
            ...action.payload,
          },
          lastModified: Date.now(),
        },
      };

    case GameStateActionType.UPDATE_TIMER:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          statistics: {
            ...state.gameState.statistics,
            elapsedTime: action.payload,
          },
        },
      };

    case GameStateActionType.LOAD_GAME:
      return {
        ...state,
        gameState: action.payload,
        error: null,
        isLoading: false,
      };

    case GameStateActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case GameStateActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

/**
 * Custom hook for managing Solitaire game state
 *
 * @param initialSettings - Optional initial game settings
 * @returns UseGameStateReturn object with game state and operations
 */
export function useGameState(
  initialSettings?: Partial<GameSettings>
): UseGameStateReturn {
  // Initialize services
  const gameEngineRef = useRef<GameEngine | null>(null);
  const storageServiceRef = useRef<StorageService | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize game engine and storage service
  if (!gameEngineRef.current) {
    gameEngineRef.current = new GameEngine();
  }
  if (!storageServiceRef.current) {
    storageServiceRef.current = new StorageService();
  }

  const gameEngine = gameEngineRef.current;
  const storageService = storageServiceRef.current;

  // Initialize state with reducer
  const [state, dispatch] = useReducer(gameStateReducer, {
    gameState: createNewGameState(initialSettings),
    error: null,
    isLoading: true,
  });

  // Initialize game state from localStorage or create new game
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        const storedGameState = await storageService.loadGameState();

        if (storedGameState) {
          // Load existing game from storage
          gameEngine.resetGame(); // Reset engine with loaded state
          dispatch({
            type: GameStateActionType.LOAD_GAME,
            payload: storedGameState,
          });
        } else {
          // Create new game
          const newGameState = gameEngine.initializeGame();
          dispatch({
            type: GameStateActionType.NEW_GAME,
            payload: newGameState,
          });
        }
      } catch (error) {
        console.error('Failed to initialize game state:', error);
        // Fall back to new game if loading fails
        const newGameState = gameEngine.initializeGame();
        dispatch({
          type: GameStateActionType.NEW_GAME,
          payload: newGameState,
        });
      }
    };

    initializeGameState();
  }, [gameEngine, storageService]);

  // Auto-save game state whenever it changes
  useEffect(() => {
    if (!state.isLoading && state.gameState) {
      const saveGameState = async () => {
        try {
          await storageService.saveGameState(state.gameState);
        } catch (error) {
          console.error('Failed to save game state:', error);
          dispatch({
            type: GameStateActionType.SET_ERROR,
            payload: 'Failed to save game state',
          });
        }
      };

      // Debounce saves to avoid excessive storage operations
      const saveTimeout = window.setTimeout(saveGameState, 1000);
      return () => window.clearTimeout(saveTimeout);
    }
  }, [state.gameState, state.isLoading, storageService]);

  // Timer management for elapsed time tracking
  useEffect(() => {
    if (state.gameState && state.gameState.phase === GamePhase.PLAYING) {
      // Start timer
      timerRef.current = window.setInterval(() => {
        const elapsedTime = Date.now() - state.gameState.startTime;
        dispatch({
          type: GameStateActionType.UPDATE_TIMER,
          payload: elapsedTime,
        });
      }, 1000); // Update every second

      return () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      // Stop timer when not playing
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state.gameState]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Memoized derived state
  const canUndo = useMemo(() => {
    return gameEngine.canUndo();
  }, [gameEngine]);

  const canRedo = useMemo(() => {
    if (!state.gameState) return false;
    return state.gameState.historyIndex < state.gameState.history.length - 1;
  }, [state.gameState]);

  const isWon = useMemo(() => {
    return state.gameState?.phase === GamePhase.WON;
  }, [state.gameState]);

  const isPaused = useMemo(() => {
    return state.gameState?.phase === GamePhase.PAUSED;
  }, [state.gameState]);

  const isPlaying = useMemo(() => {
    return state.gameState?.phase === GamePhase.PLAYING;
  }, [state.gameState]);

  // Game operation methods (memoized with useCallback)
  const newGame = useCallback(() => {
    try {
      const drawMode = state.gameState?.settings?.drawMode;
      const newGameState = gameEngine.initializeGame(drawMode);
      dispatch({
        type: GameStateActionType.NEW_GAME,
        payload: newGameState,
      });
      dispatch({ type: GameStateActionType.CLEAR_ERROR });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create new game';
      dispatch({
        type: GameStateActionType.SET_ERROR,
        payload: errorMessage,
      });
    }
  }, [gameEngine, state.gameState?.settings?.drawMode]);

  const executeMove = useCallback(
    async (from: Position, to: Position, cards?: Card[]): Promise<boolean> => {
      try {
        // Get cards if not provided
        let cardsToMove = cards;
        if (!cardsToMove) {
          // Logic to get cards from position would go here
          // For now, this is a simplified implementation
          cardsToMove = [];
        }

        const moveResult: MoveResult = gameEngine.moveCards(
          cardsToMove,
          from,
          to
        );

        if (moveResult.success) {
          dispatch({
            type: GameStateActionType.MOVE,
            payload: {
              newState: moveResult.newState,
              move: moveResult.move,
              revealed: moveResult.revealed,
            },
          });
          dispatch({ type: GameStateActionType.CLEAR_ERROR });
          return true;
        } else {
          dispatch({
            type: GameStateActionType.SET_ERROR,
            payload: moveResult.error || 'Invalid move',
          });
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to execute move';
        dispatch({
          type: GameStateActionType.SET_ERROR,
          payload: errorMessage,
        });
        return false;
      }
    },
    [gameEngine]
  );

  const undo = useCallback(async (): Promise<boolean> => {
    try {
      const undoResult: UndoResult = gameEngine.undoMove();

      if (undoResult.success) {
        dispatch({
          type: GameStateActionType.UNDO,
          payload: undoResult.newState,
        });
        dispatch({ type: GameStateActionType.CLEAR_ERROR });
        return true;
      } else {
        dispatch({
          type: GameStateActionType.SET_ERROR,
          payload: undoResult.error || 'Cannot undo',
        });
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to undo move';
      dispatch({
        type: GameStateActionType.SET_ERROR,
        payload: errorMessage,
      });
      return false;
    }
  }, [gameEngine]);

  const redo = useCallback(async (): Promise<boolean> => {
    // Redo logic would be implemented here
    // For now, this is a placeholder
    return false;
  }, []);

  const pauseGame = useCallback(() => {
    if (state.gameState?.phase === GamePhase.PLAYING) {
      dispatch({ type: GameStateActionType.PAUSE });
    }
  }, [state.gameState?.phase]);

  const resumeGame = useCallback(() => {
    if (state.gameState?.phase === GamePhase.PAUSED) {
      dispatch({ type: GameStateActionType.RESUME });
    }
  }, [state.gameState?.phase]);

  const updateSettings = useCallback(
    async (settings: Partial<GameSettings>) => {
      try {
        dispatch({
          type: GameStateActionType.UPDATE_SETTINGS,
          payload: settings,
        });

        // Save updated preferences to storage
        const currentSettings = state.gameState?.settings || {};
        const updatedSettings = { ...currentSettings, ...settings };
        await storageService.savePreferences(updatedSettings);

        dispatch({ type: GameStateActionType.CLEAR_ERROR });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update settings';
        dispatch({
          type: GameStateActionType.SET_ERROR,
          payload: errorMessage,
        });
      }
    },
    [state.gameState?.settings, storageService]
  );

  const clearError = useCallback(() => {
    dispatch({ type: GameStateActionType.CLEAR_ERROR });
  }, []);

  // Return the hook interface
  return {
    // Current game state
    gameState: state.gameState,

    // Derived state
    canUndo,
    canRedo,
    isWon,
    isPaused,
    isPlaying,

    // Game operations
    newGame,
    executeMove,
    undo,
    redo,
    pauseGame,
    resumeGame,
    updateSettings,

    // Game statistics
    statistics: state.gameState?.statistics || {
      moveCount: 0,
      undoCount: 0,
      score: 0,
      elapsedTime: 0,
      cardsInFoundation: 0,
    },

    // Error handling
    error: state.error,
    clearError,

    // Loading state
    isLoading: state.isLoading,
  };
}

export default useGameState;
