/**
 * useCardAnimation Hook
 *
 * Manages card animation states and provides methods for controlling
 * data-animation attributes, respecting user preferences for reduced motion.
 * Follows Constitutional principles for performance and accessibility.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LAYER_NAMES,
  DATA_ATTRIBUTES,
  ANIMATION_MODES,
  PERFORMANCE,
} from '../styles/animation';
import type { AnimationMode } from '../styles/animation';

/**
 * Animation state interface for tracking current animations.
 */
interface AnimationState {
  /** Current animation type being played */
  current: string | null;
  /** Animation phase (start, mid, end) for sequences */
  phase: 'start' | 'mid' | 'end' | null;
  /** Whether animation is currently active */
  isActive: boolean;
  /** Animation start timestamp for performance tracking */
  startTime: number | null;
  /** Sequence identifier for multi-card animations */
  sequenceId: string | null;
}

/**
 * Animation options for controlling animation behavior.
 */
interface AnimationOptions {
  /** Duration override in milliseconds */
  duration?: number;
  /** Delay before starting animation in milliseconds */
  delay?: number;
  /** Whether to force animation even in reduced motion mode */
  force?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Callback when animation starts */
  onStart?: () => void;
  /** Custom CSS variables to set during animation */
  variables?: Record<string, string>;
}

/**
 * Hook return interface providing animation control methods and state.
 */
interface UseCardAnimationReturn {
  /** Current animation state */
  animationState: AnimationState;
  /** Data attributes object for spreading on DOM elements */
  dataAttributes: Record<string, string>;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
  /** Current animation mode */
  animationMode: AnimationMode;
  /** Start a specific animation */
  startAnimation: (type: string, options?: AnimationOptions) => void;
  /** Stop current animation */
  stopAnimation: () => void;
  /** Set dragging state */
  setDragging: (isDragging: boolean) => void;
  /** Set animation sequence */
  setSequence: (sequenceId: string, phase: 'start' | 'mid' | 'end') => void;
  /** Clear all animation states */
  clearAnimations: () => void;
  /** Check if animations are enabled */
  isAnimationEnabled: () => boolean;
}

/**
 * Custom hook for managing card animations with performance monitoring
 * and accessibility support.
 *
 * @param animationMode - User's preferred animation mode
 * @returns Animation control interface
 */
export function useCardAnimation(
  animationMode: AnimationMode = 'full'
): UseCardAnimationReturn {
  // Animation state management
  const [animationState, setAnimationState] = useState<AnimationState>({
    current: null,
    phase: null,
    isActive: false,
    startTime: null,
    sequenceId: null,
  });

  // Track dragging state separately for immediate UI feedback
  const [isDragging, setIsDragging] = useState(false);

  // Performance monitoring
  const animationStartTime = useRef<number | null>(null);
  const animationTimeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  // Detect user's motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Determine effective animation mode based on user preference and system settings
  const effectiveAnimationMode = useMemo((): AnimationMode => {
    if (prefersReducedMotion && animationMode === 'full') {
      return 'reduced';
    }
    return animationMode;
  }, [animationMode, prefersReducedMotion]);

  // Check if animations are enabled
  const isAnimationEnabled = useCallback((): boolean => {
    const mode = ANIMATION_MODES[effectiveAnimationMode];
    return mode.enableTransitions || mode.enableKeyframes;
  }, [effectiveAnimationMode]);

  // Generate data attributes for DOM elements
  const dataAttributes = useMemo(() => {
    const attrs: Record<string, string> = {};

    // Set animation mode
    attrs[DATA_ATTRIBUTES.REDUCED_MOTION] = prefersReducedMotion.toString();

    // Set current animation
    if (animationState.current) {
      attrs[DATA_ATTRIBUTES.ANIMATION] = animationState.current;
    }

    // Set dragging state
    if (isDragging) {
      attrs[DATA_ATTRIBUTES.DRAGGING] = 'true';
    }

    // Set sequence information
    if (animationState.sequenceId) {
      attrs[DATA_ATTRIBUTES.SEQUENCE] = animationState.sequenceId;
    }

    // Set animation phase
    if (animationState.phase) {
      attrs[DATA_ATTRIBUTES.PHASE] = animationState.phase;
    }

    return attrs;
  }, [animationState, isDragging, prefersReducedMotion]);

  // Start animation with performance monitoring
  const startAnimation = useCallback(
    (type: string, options: AnimationOptions = {}) => {
      // Check if animations are disabled and not forced
      if (!isAnimationEnabled() && !options.force) {
        options.onComplete?.();
        return;
      }

      // Performance check: limit concurrent animations
      if (animationState.isActive && !options.force) {
        // Queue animation or skip based on performance budget
        return;
      }

      // Start performance monitoring
      const startTime = performance.now();
      animationStartTime.current = startTime;

      // Set animation state
      setAnimationState(prev => ({
        ...prev,
        current: type,
        isActive: true,
        startTime,
        phase: null,
      }));

      // Call start callback
      options.onStart?.();

      // Set timeout for animation completion
      const duration = options.duration || 300;
      const timeout = setTimeout(
        () => {
          const endTime = performance.now();
          const actualDuration = endTime - startTime;

          // Performance monitoring
          if (actualDuration > PERFORMANCE.MAX_FRAME_TIME * 10) {
            console.warn(
              `Animation ${type} exceeded performance budget: ${actualDuration}ms`
            );
          }

          // Clear animation state
          setAnimationState(prev => ({
            ...prev,
            current: null,
            isActive: false,
            startTime: null,
          }));

          // Call completion callback
          options.onComplete?.();

          // Clean up timeout reference
          animationTimeouts.current.delete(timeout);
        },
        duration + (options.delay || 0)
      );

      // Track timeout for cleanup
      animationTimeouts.current.add(timeout);
    },
    [isAnimationEnabled, animationState.isActive]
  );

  // Stop current animation
  const stopAnimation = useCallback(() => {
    // Clear all timeouts
    animationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    animationTimeouts.current.clear();

    // Reset animation state
    setAnimationState({
      current: null,
      phase: null,
      isActive: false,
      startTime: null,
      sequenceId: null,
    });
  }, []);

  // Set dragging state
  const setDragging = useCallback(
    (dragging: boolean) => {
      setIsDragging(dragging);

      // Automatically trigger lift animation on drag start
      if (dragging && isAnimationEnabled()) {
        startAnimation(LAYER_NAMES.LIFT, {
          duration: 100,
          force: false,
        });
      }
    },
    [startAnimation, isAnimationEnabled]
  );

  // Set animation sequence
  const setSequence = useCallback(
    (sequenceId: string, phase: 'start' | 'mid' | 'end') => {
      setAnimationState(prev => ({
        ...prev,
        sequenceId,
        phase,
      }));
    },
    []
  );

  // Clear all animations
  const clearAnimations = useCallback(() => {
    stopAnimation();
    setIsDragging(false);
  }, [stopAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      animationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      animationTimeouts.current.clear();
    };
  }, []);

  // Monitor reduced motion preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && animationState.isActive) {
        // Stop animations if user enables reduced motion
        stopAnimation();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [animationState.isActive, stopAnimation]);

  return {
    animationState,
    dataAttributes,
    prefersReducedMotion,
    animationMode: effectiveAnimationMode,
    startAnimation,
    stopAnimation,
    setDragging,
    setSequence,
    clearAnimations,
    isAnimationEnabled,
  };
}

/**
 * Utility hook for managing animation sequences across multiple cards.
 * Useful for auto-complete scenarios and deal sequences.
 */
export function useAnimationSequence() {
  const [sequenceId, setSequenceId] = useState<string | null>(null);
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(
    new Set()
  );
  const sequenceTimeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  const startSequence = useCallback((id: string) => {
    setSequenceId(id);
    setActiveAnimations(new Set());
  }, []);

  const addToSequence = useCallback(
    (animationId: string, duration: number = 300) => {
      setActiveAnimations(prev => new Set([...prev, animationId]));

      const timeout = setTimeout(() => {
        setActiveAnimations(prev => {
          const next = new Set(prev);
          next.delete(animationId);
          return next;
        });
        sequenceTimeouts.current.delete(timeout);
      }, duration);

      sequenceTimeouts.current.add(timeout);
    },
    []
  );

  const endSequence = useCallback(() => {
    // Clear all timeouts
    sequenceTimeouts.current.forEach(timeout => clearTimeout(timeout));
    sequenceTimeouts.current.clear();

    setSequenceId(null);
    setActiveAnimations(new Set());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sequenceTimeouts.current.forEach(timeout => clearTimeout(timeout));
      sequenceTimeouts.current.clear();
    };
  }, []);

  return {
    sequenceId,
    activeAnimations,
    startSequence,
    addToSequence,
    endSequence,
    isSequenceActive: sequenceId !== null,
  };
}
