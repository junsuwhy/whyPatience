/**
 * StorageContext - Centralized storage management for the Solitaire application
 *
 * Provides unified access to preferences, statistics, and game state storage
 * with error handling, throttling, and React Context integration.
 *
 * Following Constitution principles:
 * - Code Quality Excellence: Clean interfaces, type safety, error boundaries
 * - Test-Driven Development: Comprehensive test coverage for all functionality
 * - User Experience Consistency: Consistent error messaging and state management
 * - Performance Standards: Throttled saves, memoized values, minimal re-renders
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { StorageService } from '../services/storage';
import {
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
} from '../types/preferences';
import { OverallStatistics, GameState } from '../types/game-state';
import { throttle, debounce } from '../utils/throttle';

/**
 * Storage context state interface
 */
export interface StorageContextState {
  storageService: StorageService;
  preferences: UserPreferences;
  statistics: OverallStatistics | null;
  isLoading: boolean;
  lastError: Error | null;
}

/**
 * Storage context actions interface
 */
export interface StorageContextActions {
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  refreshStatistics: () => Promise<void>;
  saveGameState: (gameState: GameState) => void;
  updateGameResult: (
    won: boolean,
    moves: number,
    timeElapsed: number
  ) => Promise<void>;
  clearError: () => void;
}

/**
 * Combined storage context interface
 */
export interface StorageContextValue
  extends StorageContextState,
    StorageContextActions {}

/**
 * Storage action types for useReducer
 */
enum StorageActionType {
  SET_LOADING = 'SET_LOADING',
  SET_PREFERENCES = 'SET_PREFERENCES',
  SET_STATISTICS = 'SET_STATISTICS',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  UPDATE_PREFERENCES = 'UPDATE_PREFERENCES',
}

/**
 * Storage actions for useReducer
 */
type StorageAction =
  | { type: StorageActionType.SET_LOADING; payload: boolean }
  | { type: StorageActionType.SET_PREFERENCES; payload: UserPreferences }
  | {
      type: StorageActionType.SET_STATISTICS;
      payload: OverallStatistics | null;
    }
  | { type: StorageActionType.SET_ERROR; payload: Error }
  | { type: StorageActionType.CLEAR_ERROR }
  | {
      type: StorageActionType.UPDATE_PREFERENCES;
      payload: Partial<UserPreferences>;
    };

/**
 * Storage reducer state
 */
interface StorageState {
  preferences: UserPreferences;
  statistics: OverallStatistics | null;
  isLoading: boolean;
  lastError: Error | null;
}

/**
 * Storage reducer function
 */
function storageReducer(
  state: StorageState,
  action: StorageAction
): StorageState {
  switch (action.type) {
    case StorageActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case StorageActionType.SET_PREFERENCES:
      return { ...state, preferences: action.payload, isLoading: false };

    case StorageActionType.SET_STATISTICS:
      return { ...state, statistics: action.payload, isLoading: false };

    case StorageActionType.SET_ERROR:
      return { ...state, lastError: action.payload, isLoading: false };

    case StorageActionType.CLEAR_ERROR:
      return { ...state, lastError: null };

    case StorageActionType.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
          lastModified: Date.now(),
        },
      };

    default:
      return state;
  }
}

/**
 * Create Storage Context
 */
const StorageContext = createContext<StorageContextValue | null>(null);

/**
 * Storage Provider Props
 */
export interface StorageProviderProps {
  children: ReactNode;
}

/**
 * Storage Provider Component
 */
export const StorageProvider: React.FC<StorageProviderProps> = ({
  children,
}) => {
  // Initialize storage service
  const storageServiceRef = useRef<StorageService | null>(null);
  if (!storageServiceRef.current) {
    storageServiceRef.current = new StorageService();
  }
  const storageService = storageServiceRef.current;

  // Initialize reducer state
  const [state, dispatch] = useReducer(storageReducer, {
    preferences: DEFAULT_USER_PREFERENCES,
    statistics: null,
    isLoading: true,
    lastError: null,
  });

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: StorageActionType.SET_LOADING, payload: true });

      try {
        // Load preferences and statistics in parallel
        const [preferences, statistics] = await Promise.allSettled([
          storageService.loadPreferences(),
          storageService.loadStatistics(),
        ]);

        // Handle preferences result
        if (preferences.status === 'fulfilled') {
          dispatch({
            type: StorageActionType.SET_PREFERENCES,
            payload: preferences.value,
          });
        } else {
          console.error('Failed to load preferences:', preferences.reason);
          dispatch({
            type: StorageActionType.SET_ERROR,
            payload: preferences.reason,
          });
          // Use default preferences on failure
          dispatch({
            type: StorageActionType.SET_PREFERENCES,
            payload: DEFAULT_USER_PREFERENCES,
          });
        }

        // Handle statistics result
        if (statistics.status === 'fulfilled') {
          dispatch({
            type: StorageActionType.SET_STATISTICS,
            payload: statistics.value,
          });
        } else {
          console.error('Failed to load statistics:', statistics.reason);
          if (!state.lastError) {
            dispatch({
              type: StorageActionType.SET_ERROR,
              payload: statistics.reason,
            });
          }
          dispatch({
            type: StorageActionType.SET_STATISTICS,
            payload: null,
          });
        }
      } finally {
        dispatch({ type: StorageActionType.SET_LOADING, payload: false });
      }
    };

    loadInitialData();
  }, [storageService]);

  /**
   * Debounced save preferences function
   */
  const debouncedSavePreferences = useMemo(
    () =>
      debounce(async (preferences: UserPreferences) => {
        try {
          await storageService.savePreferences(preferences);
        } catch (error) {
          console.error('Failed to save preferences:', error);
          dispatch({
            type: StorageActionType.SET_ERROR,
            payload: error as Error,
          });
        }
      }, 300), // 300ms debounce as specified in task
    [storageService]
  );

  /**
   * Throttled save game state function
   */
  const throttledSaveGameState = useMemo(
    () =>
      throttle(async (gameState: GameState) => {
        try {
          await storageService.saveGameState(gameState);
        } catch (error) {
          console.error('Failed to save game state:', error);
          dispatch({
            type: StorageActionType.SET_ERROR,
            payload: error as Error,
          });
        }
      }, 1000), // 1 second throttle as specified in task
    [storageService]
  );

  /**
   * Update preferences with debounced saving
   */
  const updatePreferences = useCallback(
    (partial: Partial<UserPreferences>) => {
      // Update state immediately for responsive UI
      dispatch({
        type: StorageActionType.UPDATE_PREFERENCES,
        payload: partial,
      });

      // Save to storage with debounce
      const updatedPreferences = { ...state.preferences, ...partial };
      debouncedSavePreferences(updatedPreferences);
    },
    [state.preferences, debouncedSavePreferences]
  );

  /**
   * Refresh statistics from storage
   */
  const refreshStatistics = useCallback(async () => {
    try {
      const statistics = await storageService.loadStatistics();
      dispatch({
        type: StorageActionType.SET_STATISTICS,
        payload: statistics,
      });
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      dispatch({
        type: StorageActionType.SET_ERROR,
        payload: error as Error,
      });
    }
  }, [storageService]);

  /**
   * Save game state with throttling and auto-save check
   */
  const saveGameState = useCallback(
    (gameState: GameState) => {
      // Check if auto-save is enabled
      if (!state.preferences.gameplay?.autoSave) {
        return;
      }

      // Use throttled save
      throttledSaveGameState(gameState);
    },
    [state.preferences.gameplay?.autoSave, throttledSaveGameState]
  );

  /**
   * Update game result and refresh statistics
   */
  const updateGameResult = useCallback(
    async (won: boolean, moves: number, timeElapsed: number) => {
      try {
        await storageService.updateGameResult(won, moves, timeElapsed);
        // Refresh statistics to reflect the new result
        await refreshStatistics();
      } catch (error) {
        console.error('Failed to update game result:', error);
        dispatch({
          type: StorageActionType.SET_ERROR,
          payload: error as Error,
        });
      }
    },
    [storageService, refreshStatistics]
  );

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    dispatch({ type: StorageActionType.CLEAR_ERROR });
  }, []);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo<StorageContextValue>(
    () => ({
      // State
      storageService,
      preferences: state.preferences,
      statistics: state.statistics,
      isLoading: state.isLoading,
      lastError: state.lastError,
      // Actions
      updatePreferences,
      refreshStatistics,
      saveGameState,
      updateGameResult,
      clearError,
    }),
    [
      storageService,
      state.preferences,
      state.statistics,
      state.isLoading,
      state.lastError,
      updatePreferences,
      refreshStatistics,
      saveGameState,
      updateGameResult,
      clearError,
    ]
  );

  return (
    <StorageContext.Provider value={contextValue}>
      {children}
    </StorageContext.Provider>
  );
};

/**
 * Hook to use storage context
 */
export const useStorage = (): StorageContextValue => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

export default StorageContext;
