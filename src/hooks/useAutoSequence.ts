/**
 * useAutoSequence Hook
 *
 * Manages automated card movement sequences (like auto-complete to foundation)
 * with proper timing, animation scheduling, and performance optimization.
 * Follows Constitutional principles for performance and user experience.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { Card, CardPosition } from '../types/card';
import { DURATIONS, PERFORMANCE, LAYER_NAMES } from '../styles/animation';

/**
 * Auto-sequence move step interface.
 */
interface SequenceMove {
  /** Unique identifier for this move */
  id: string;
  /** Card to move */
  card: Card;
  /** Source position */
  from: CardPosition;
  /** Target position */
  to: CardPosition;
  /** Delay before executing this move (ms) */
  delay: number;
  /** Duration of the animation (ms) */
  duration: number;
  /** Callback when move starts */
  onStart?: () => void;
  /** Callback when move completes */
  onComplete?: () => void;
}

/**
 * Sequence execution state.
 */
interface SequenceState {
  /** Whether a sequence is currently running */
  isRunning: boolean;
  /** Current sequence identifier */
  sequenceId: string | null;
  /** Number of moves in current sequence */
  totalMoves: number;
  /** Number of completed moves */
  completedMoves: number;
  /** Current move being executed */
  currentMove: SequenceMove | null;
  /** Queue of pending moves */
  pendingMoves: SequenceMove[];
  /** Whether sequence execution is paused */
  isPaused: boolean;
}

/**
 * Sequence configuration options.
 */
interface SequenceOptions {
  /** Maximum delay between moves (ms) */
  maxMoveDelay?: number;
  /** Base animation duration (ms) */
  baseDuration?: number;
  /** Whether to pause sequence on user interaction */
  pauseOnInteraction?: boolean;
  /** Callback when entire sequence completes */
  onSequenceComplete?: () => void;
  /** Callback when sequence is interrupted */
  onSequenceInterrupt?: () => void;
  /** Maximum number of concurrent animations */
  maxConcurrentAnimations?: number;
}

/**
 * Auto-sequence hook return interface.
 */
interface UseAutoSequenceReturn {
  /** Current sequence state */
  sequenceState: SequenceState;
  /** Start a new auto-sequence */
  startSequence: (moves: SequenceMove[], options?: SequenceOptions) => void;
  /** Pause current sequence */
  pauseSequence: () => void;
  /** Resume paused sequence */
  resumeSequence: () => void;
  /** Stop current sequence immediately */
  stopSequence: () => void;
  /** Check if auto-sequences are currently enabled */
  isSequenceEnabled: () => boolean;
  /** Add a single move to current sequence */
  addMove: (move: SequenceMove) => void;
  /** Get sequence progress (0-1) */
  getProgress: () => number;
}

/**
 * Custom hook for managing auto-complete and other automated card sequences.
 *
 * @param animationMode - User's animation preference
 * @returns Auto-sequence control interface
 */
export function useAutoSequence(
  animationMode: 'full' | 'reduced' | 'off' = 'full'
): UseAutoSequenceReturn {
  // Sequence state management
  const [sequenceState, setSequenceState] = useState<SequenceState>({
    isRunning: false,
    sequenceId: null,
    totalMoves: 0,
    completedMoves: 0,
    currentMove: null,
    pendingMoves: [],
    isPaused: false,
  });

  // Refs for tracking timeouts and RAF callbacks
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const rafCallbacks = useRef<Set<number>>(new Set());
  const currentOptions = useRef<SequenceOptions>({});
  const performanceMonitor = useRef({
    startTime: 0,
    frameCount: 0,
    avgFrameTime: 0,
  });

  // Check if sequences are enabled based on animation mode
  const isSequenceEnabled = useCallback((): boolean => {
    if (animationMode === 'off') return false;
    if (animationMode === 'reduced') return false; // Reduced motion disables auto-sequences
    return true;
  }, [animationMode]);

  // Performance monitoring for sequence execution
  const monitorPerformance = useCallback(() => {
    const now = performance.now();
    const monitor = performanceMonitor.current;

    if (monitor.startTime === 0) {
      monitor.startTime = now;
      monitor.frameCount = 0;
      return;
    }

    monitor.frameCount++;
    const elapsed = now - monitor.startTime;
    monitor.avgFrameTime = elapsed / monitor.frameCount;

    // Warn if performance degrades
    if (monitor.avgFrameTime > PERFORMANCE.MAX_FRAME_TIME) {
      console.warn(
        `Auto-sequence performance warning: ${monitor.avgFrameTime}ms avg frame time`
      );
    }
  }, []);

  // Execute a single move in the sequence
  const executeMove = useCallback(
    (move: SequenceMove) => {
      // Performance monitoring
      monitorPerformance();

      // Mark move as current
      setSequenceState(prev => ({
        ...prev,
        currentMove: move,
      }));

      // Call start callback
      move.onStart?.();

      // Schedule move completion
      const timeout = setTimeout(() => {
        // Call completion callback
        move.onComplete?.();

        // Update sequence state
        setSequenceState(prev => ({
          ...prev,
          completedMoves: prev.completedMoves + 1,
          currentMove: null,
        }));

        // Clean up timeout
        timeouts.current.delete(timeout);
      }, move.duration);

      // Track timeout for cleanup
      timeouts.current.add(timeout);
    },
    [monitorPerformance]
  );

  // Process the next move in the sequence
  const processNextMove = useCallback(() => {
    setSequenceState(prev => {
      if (prev.isPaused || prev.pendingMoves.length === 0) {
        return prev;
      }

      const [nextMove, ...remainingMoves] = prev.pendingMoves;

      // Schedule the move execution with appropriate delay
      const delay = nextMove.delay || 0;

      if (delay > 0) {
        const timeout = setTimeout(() => {
          executeMove(nextMove);
          timeouts.current.delete(timeout);
        }, delay);
        timeouts.current.add(timeout);
      } else {
        // Execute immediately using RAF for better performance
        const rafId = requestAnimationFrame(() => {
          executeMove(nextMove);
          rafCallbacks.current.delete(rafId);
        });
        rafCallbacks.current.add(rafId);
      }

      return {
        ...prev,
        pendingMoves: remainingMoves,
      };
    });
  }, [executeMove]);

  // Start a new auto-sequence
  const startSequence = useCallback(
    (moves: SequenceMove[], options: SequenceOptions = {}) => {
      // Check if sequences are enabled
      if (!isSequenceEnabled()) {
        console.log('Auto-sequences disabled by animation preferences');
        return;
      }

      // Stop any running sequence
      stopSequence();

      // Store options
      currentOptions.current = {
        maxMoveDelay: DURATIONS.NORMAL,
        baseDuration: DURATIONS.NORMAL,
        pauseOnInteraction: true,
        maxConcurrentAnimations: PERFORMANCE.MAX_CONCURRENT_ANIMATIONS,
        ...options,
      };

      // Generate sequence ID
      const sequenceId = `sequence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Reset performance monitoring
      performanceMonitor.current = {
        startTime: 0,
        frameCount: 0,
        avgFrameTime: 0,
      };

      // Initialize sequence state
      setSequenceState({
        isRunning: true,
        sequenceId,
        totalMoves: moves.length,
        completedMoves: 0,
        currentMove: null,
        pendingMoves: [...moves],
        isPaused: false,
      });

      // Start processing moves
      processNextMove();
    },
    [isSequenceEnabled, stopSequence, processNextMove]
  );

  // Pause current sequence
  const pauseSequence = useCallback(() => {
    setSequenceState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  // Resume paused sequence
  const resumeSequence = useCallback(() => {
    setSequenceState(prev => {
      if (!prev.isPaused) return prev;

      const newState = {
        ...prev,
        isPaused: false,
      };

      // Resume processing if there are pending moves
      if (newState.pendingMoves.length > 0) {
        setTimeout(() => processNextMove(), 0);
      }

      return newState;
    });
  }, [processNextMove]);

  // Stop current sequence immediately
  const stopSequence = useCallback(() => {
    // Clear all timeouts
    timeouts.current.forEach(timeout => clearTimeout(timeout));
    timeouts.current.clear();

    // Cancel all RAF callbacks
    rafCallbacks.current.forEach(rafId => cancelAnimationFrame(rafId));
    rafCallbacks.current.clear();

    // Call interrupt callback if sequence was running
    if (sequenceState.isRunning) {
      currentOptions.current.onSequenceInterrupt?.();
    }

    // Reset state
    setSequenceState({
      isRunning: false,
      sequenceId: null,
      totalMoves: 0,
      completedMoves: 0,
      currentMove: null,
      pendingMoves: [],
      isPaused: false,
    });
  }, [sequenceState.isRunning]);

  // Add a move to current sequence
  const addMove = useCallback((move: SequenceMove) => {
    setSequenceState(prev => {
      if (!prev.isRunning) return prev;

      return {
        ...prev,
        pendingMoves: [...prev.pendingMoves, move],
        totalMoves: prev.totalMoves + 1,
      };
    });
  }, []);

  // Get sequence progress
  const getProgress = useCallback((): number => {
    if (sequenceState.totalMoves === 0) return 0;
    return sequenceState.completedMoves / sequenceState.totalMoves;
  }, [sequenceState.completedMoves, sequenceState.totalMoves]);

  // Auto-process next move when sequence state changes
  useEffect(() => {
    if (
      sequenceState.isRunning &&
      !sequenceState.isPaused &&
      sequenceState.pendingMoves.length > 0
    ) {
      processNextMove();
    }
  }, [
    sequenceState.isRunning,
    sequenceState.isPaused,
    sequenceState.pendingMoves.length,
    processNextMove,
  ]);

  // Check for sequence completion
  useEffect(() => {
    if (
      sequenceState.isRunning &&
      sequenceState.pendingMoves.length === 0 &&
      sequenceState.currentMove === null
    ) {
      // Sequence completed
      currentOptions.current.onSequenceComplete?.();

      setSequenceState(prev => ({
        ...prev,
        isRunning: false,
        sequenceId: null,
      }));
    }
  }, [
    sequenceState.isRunning,
    sequenceState.pendingMoves.length,
    sequenceState.currentMove,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSequence();
    };
  }, [stopSequence]);

  // Pause on user interaction if enabled
  useEffect(() => {
    if (
      !currentOptions.current.pauseOnInteraction ||
      !sequenceState.isRunning
    ) {
      return;
    }

    const handleUserInteraction = () => {
      if (sequenceState.isRunning && !sequenceState.isPaused) {
        pauseSequence();
      }
    };

    // Listen for various user interaction events
    const events = ['mousedown', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, {
        passive: true,
      });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [sequenceState.isRunning, sequenceState.isPaused, pauseSequence]);

  return {
    sequenceState,
    startSequence,
    pauseSequence,
    resumeSequence,
    stopSequence,
    isSequenceEnabled,
    addMove,
    getProgress,
  };
}

/**
 * Utility function to create a sequence move.
 */
export function createSequenceMove(
  card: Card,
  from: CardPosition,
  to: CardPosition,
  options: Partial<SequenceMove> = {}
): SequenceMove {
  return {
    id: `move-${card.id}-${Date.now()}`,
    card,
    from,
    to,
    delay: DURATIONS.NORMAL,
    duration: DURATIONS.NORMAL,
    ...options,
  };
}

/**
 * Utility function to create an auto-complete sequence for foundation.
 */
export function createAutoCompleteSequence(
  moves: Array<{ card: Card; from: CardPosition; to: CardPosition }>
): SequenceMove[] {
  return moves.map((move, index) =>
    createSequenceMove(move.card, move.from, move.to, {
      delay: index * (DURATIONS.NORMAL + 100), // Stagger moves
      duration: DURATIONS.NORMAL,
    })
  );
}
