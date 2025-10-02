/**
 * useGameStatistics hook for managing and calculating game statistics.
 * Provides real-time statistics calculation, performance tracking,
 * and historical data management for the solitaire game.
 *
 * Following Constitution principles for performance and maintainability.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GameState,
  GameStatistics,
  OverallStatistics,
} from '../types/game-state';

/**
 * Configuration interface for the useGameStatistics hook
 */
export interface UseGameStatisticsConfig {
  /** Whether to update statistics in real-time */
  realTimeUpdates?: boolean;
  /** Update interval in milliseconds for real-time updates */
  updateInterval?: number;
  /** Whether to calculate performance metrics */
  calculatePerformance?: boolean;
  /** Whether to track historical statistics */
  trackHistory?: boolean;
}

/**
 * Return type for the useGameStatistics hook
 */
export interface UseGameStatisticsReturn {
  /** Current game statistics */
  currentStats: GameStatistics;
  /** Overall statistics across all games */
  overallStats: OverallStatistics | null;
  /** Whether statistics are being calculated */
  isCalculating: boolean;
  /** Error state if calculation fails */
  error: string | null;
  /** Manually refresh statistics */
  refreshStats: () => void;
  /** Reset current game statistics */
  resetCurrentStats: () => void;
  /** Update statistics with new game state */
  updateStats: (gameState: GameState) => void;
  /** Add completed game to overall statistics */
  addCompletedGame: (gameState: GameState) => void;
}

/**
 * Default configuration for the hook
 */
const DEFAULT_CONFIG: Required<UseGameStatisticsConfig> = {
  realTimeUpdates: true,
  updateInterval: 1000,
  calculatePerformance: true,
  trackHistory: true,
};

/**
 * Calculate score based on moves, time, and other factors
 */
const calculateScore = (gameState: GameState): number => {
  const { statistics, phase } = gameState;
  const { moveCount, elapsedTime, cardsInFoundation, undoCount } = statistics;

  // Base score from cards in foundation
  let score = cardsInFoundation * 10;

  // Time bonus (faster completion = higher score)
  const timeInMinutes = elapsedTime / (1000 * 60);
  const timeBonus = Math.max(0, 1000 - timeInMinutes * 10);
  score += timeBonus;

  // Move efficiency bonus (fewer moves = higher score)
  const moveEfficiency = Math.max(0, 200 - moveCount);
  score += moveEfficiency;

  // Undo penalty
  score -= undoCount * 5;

  // Completion bonus
  if (phase === 'won') {
    score += 500;
  }

  return Math.max(0, Math.round(score));
};

/**
 * Calculate current game statistics from game state
 */
const calculateCurrentStats = (gameState: GameState): GameStatistics => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - gameState.startTime;

  return {
    moveCount: gameState.history.length,
    undoCount: gameState.statistics.undoCount,
    score: calculateScore(gameState),
    elapsedTime,
    cardsInFoundation: gameState.foundation.reduce(
      (total, pile) => total + pile.cards.length,
      0
    ),
    bestTime: gameState.statistics.bestTime,
  };
};

/**
 * Load overall statistics from localStorage
 */
const loadOverallStats = (): OverallStatistics => {
  try {
    const stored = window.localStorage.getItem('solitaire_overall_stats');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load overall statistics:', error);
  }

  // Return default statistics
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    bestTime: 0,
    averageTime: 0,
    totalMoves: 0,
    averageMovesPerGame: 0,
    currentStreak: 0,
    longestStreak: 0,
  };
};

/**
 * Save overall statistics to localStorage
 */
const saveOverallStats = (stats: OverallStatistics): void => {
  try {
    window.localStorage.setItem(
      'solitaire_overall_stats',
      JSON.stringify(stats)
    );
  } catch (error) {
    console.warn('Failed to save overall statistics:', error);
  }
};

/**
 * Update overall statistics with completed game
 */
const updateOverallStats = (
  currentStats: OverallStatistics,
  completedGame: GameState
): OverallStatistics => {
  const gameStats = calculateCurrentStats(completedGame);
  const isWon = completedGame.phase === 'won';

  const newStats: OverallStatistics = {
    gamesPlayed: currentStats.gamesPlayed + 1,
    gamesWon: currentStats.gamesWon + (isWon ? 1 : 0),
    winRate: 0, // Will be calculated below
    bestTime: currentStats.bestTime,
    averageTime: currentStats.averageTime,
    totalMoves: currentStats.totalMoves + gameStats.moveCount,
    averageMovesPerGame: 0, // Will be calculated below
    currentStreak: isWon ? currentStats.currentStreak + 1 : 0,
    longestStreak: currentStats.longestStreak,
  };

  // Calculate win rate
  newStats.winRate = (newStats.gamesWon / newStats.gamesPlayed) * 100;

  // Calculate average moves per game
  newStats.averageMovesPerGame = newStats.totalMoves / newStats.gamesPlayed;

  // Update best time if this game was won
  if (isWon) {
    if (newStats.bestTime === 0 || gameStats.elapsedTime < newStats.bestTime) {
      newStats.bestTime = gameStats.elapsedTime;
    }

    // Calculate average time for won games
    const wonGames = newStats.gamesWon;
    const previousTotalTime = currentStats.averageTime * (wonGames - 1);
    newStats.averageTime =
      (previousTotalTime + gameStats.elapsedTime) / wonGames;
  }

  // Update longest streak
  if (newStats.currentStreak > newStats.longestStreak) {
    newStats.longestStreak = newStats.currentStreak;
  }

  return newStats;
};

/**
 * Custom hook for managing game statistics
 */
export const useGameStatistics = (
  gameState: GameState | null,
  config: UseGameStatisticsConfig = {}
): UseGameStatisticsReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // State management
  const [currentStats, setCurrentStats] = useState<GameStatistics>(() => {
    if (gameState) {
      return calculateCurrentStats(gameState);
    }
    return {
      moveCount: 0,
      undoCount: 0,
      score: 0,
      elapsedTime: 0,
      cardsInFoundation: 0,
    };
  });

  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(
    () => {
      if (finalConfig.trackHistory) {
        return loadOverallStats();
      }
      return null;
    }
  );

  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate and update current statistics
   */
  const updateCurrentStats = useCallback((newGameState: GameState) => {
    try {
      setIsCalculating(true);
      setError(null);

      const newStats = calculateCurrentStats(newGameState);
      setCurrentStats(newStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to calculate statistics'
      );
    } finally {
      setIsCalculating(false);
    }
  }, []);

  /**
   * Real-time statistics updates
   */
  useEffect(() => {
    if (!finalConfig.realTimeUpdates || !gameState) {
      return;
    }

    const interval = window.setInterval(() => {
      updateCurrentStats(gameState);
    }, finalConfig.updateInterval);

    return () => window.clearInterval(interval);
  }, [
    gameState,
    finalConfig.realTimeUpdates,
    finalConfig.updateInterval,
    updateCurrentStats,
  ]);

  /**
   * Update statistics when game state changes
   */
  useEffect(() => {
    if (gameState) {
      updateCurrentStats(gameState);
    }
  }, [gameState, updateCurrentStats]);

  /**
   * Manually refresh statistics
   */
  const refreshStats = useCallback(() => {
    if (gameState) {
      updateCurrentStats(gameState);
    }

    if (finalConfig.trackHistory) {
      setOverallStats(loadOverallStats());
    }
  }, [gameState, finalConfig.trackHistory, updateCurrentStats]);

  /**
   * Reset current game statistics
   */
  const resetCurrentStats = useCallback(() => {
    setCurrentStats({
      moveCount: 0,
      undoCount: 0,
      score: 0,
      elapsedTime: 0,
      cardsInFoundation: 0,
    });
    setError(null);
  }, []);

  /**
   * Update statistics with new game state
   */
  const updateStats = useCallback(
    (newGameState: GameState) => {
      updateCurrentStats(newGameState);
    },
    [updateCurrentStats]
  );

  /**
   * Add completed game to overall statistics
   */
  const addCompletedGame = useCallback(
    (completedGameState: GameState) => {
      if (!finalConfig.trackHistory || !overallStats) {
        return;
      }

      try {
        const newOverallStats = updateOverallStats(
          overallStats,
          completedGameState
        );
        setOverallStats(newOverallStats);
        saveOverallStats(newOverallStats);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update overall statistics'
        );
      }
    },
    [overallStats, finalConfig.trackHistory]
  );

  /**
   * Memoized return value for performance
   */
  return useMemo(
    () => ({
      currentStats,
      overallStats,
      isCalculating,
      error,
      refreshStats,
      resetCurrentStats,
      updateStats,
      addCompletedGame,
    }),
    [
      currentStats,
      overallStats,
      isCalculating,
      error,
      refreshStats,
      resetCurrentStats,
      updateStats,
      addCompletedGame,
    ]
  );
};

export default useGameStatistics;
