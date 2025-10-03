/**
 * Animation design tokens for card game animations.
 * Centralized configuration for durations, easing functions, z-index layers,
 * and animation performance optimization.
 */

/**
 * Animation duration constants in milliseconds.
 * GPU-friendly durations optimized for 60fps performance.
 */
export const DURATIONS = {
  /** Ultra-fast micro-interactions (button hover, highlights) */
  INSTANT: 100,
  /** Fast transitions (card flip, quick movements) */
  FAST: 200,
  /** Standard animations (card movement, modal open/close) */
  NORMAL: 300,
  /** Slower animations (auto-complete sequences, victory celebration) */
  SLOW: 500,
  /** Long-running animations (deal sequence, complex transitions) */
  EXTENDED: 800,
} as const;

/**
 * CSS easing functions for natural motion.
 * Cubic-bezier curves optimized for card game interactions.
 */
export const EASING = {
  /** Standard ease for most interactions */
  EASE: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  /** Smooth ease for gentle movements */
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Quick start for card flips and snappy actions */
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Anticipation easing for drag operations */
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Bouncy easing for success animations */
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  /** Spring easing for natural card movements */
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

/**
 * Z-index layer system for animation stacking.
 * Ensures proper layering during complex card movements.
 */
export const Z_INDEX = {
  /** Base game board layer */
  BASE: 1,
  /** Card piles (tableau, foundation, stock) */
  PILES: 10,
  /** Regular cards in play */
  CARDS: 20,
  /** Cards being dragged */
  DRAGGING: 100,
  /** Cards in animation sequences */
  ANIMATING: 90,
  /** Highlight overlays and drop zones */
  HIGHLIGHTS: 80,
  /** Modal dialogs and overlays */
  MODAL: 1000,
  /** Tooltips and notifications */
  TOOLTIP: 1100,
} as const;

/**
 * Animation layer names for CSS class management.
 * Used for applying specific animation styles and data attributes.
 */
export const LAYER_NAMES = {
  /** Card flip animation (face up/down transition) */
  FLIP: 'flip',
  /** Card lift animation (drag start, hover effects) */
  LIFT: 'lift',
  /** Card slide animation (movement between piles) */
  SLIDE: 'slide',
  /** Pulse highlight animation (valid drop zones) */
  PULSE: 'pulse',
  /** Sequence animation (auto-complete, deal sequence) */
  SEQUENCE: 'sequence',
  /** Victory celebration animation */
  VICTORY: 'victory',
  /** Error shake animation (invalid moves) */
  ERROR: 'error',
} as const;

/**
 * Animation state data attributes for CSS targeting.
 * These are applied to DOM elements for animation control.
 */
export const DATA_ATTRIBUTES = {
  /** General animation state indicator */
  ANIMATION: 'data-animation',
  /** Dragging state for lift animations */
  DRAGGING: 'data-dragging',
  /** Animation sequence identifier */
  SEQUENCE: 'data-sequence',
  /** Animation phase (start, mid, end) */
  PHASE: 'data-phase',
  /** Reduced motion preference indicator */
  REDUCED_MOTION: 'data-reduced-motion',
} as const;

/**
 * Animation mode configuration matching preferences.
 * Controls the level of animation detail based on user preference.
 */
export type AnimationMode = 'full' | 'reduced' | 'off';

/**
 * Animation mode settings mapping.
 * Defines behavior for each animation mode.
 */
export const ANIMATION_MODES = {
  /** Full animations with all effects */
  full: {
    enableTransitions: true,
    enableKeyframes: true,
    enableSequences: true,
    durationMultiplier: 1,
  },
  /** Reduced animations for accessibility */
  reduced: {
    enableTransitions: true,
    enableKeyframes: false,
    enableSequences: false,
    durationMultiplier: 0.5,
  },
  /** No animations for maximum accessibility */
  off: {
    enableTransitions: false,
    enableKeyframes: false,
    enableSequences: false,
    durationMultiplier: 0,
  },
} as const;

/**
 * Performance thresholds for animation optimization.
 * Used to maintain 60fps performance targets.
 */
export const PERFORMANCE = {
  /** Maximum main thread time per animation frame (ms) */
  MAX_FRAME_TIME: 16,
  /** Maximum concurrent animations for performance */
  MAX_CONCURRENT_ANIMATIONS: 10,
  /** Threshold for enabling performance monitoring */
  PERFORMANCE_MONITORING_THRESHOLD: 5,
  /** RAF timeout for animation scheduling */
  ANIMATION_TIMEOUT: 1000,
} as const;

/**
 * GPU-friendly CSS properties for hardware acceleration.
 * Only transform and opacity for maximum performance.
 */
export const GPU_PROPERTIES = ['transform', 'opacity', 'filter'] as const;

/**
 * Animation configuration presets for common card game actions.
 */
export const ANIMATION_PRESETS = {
  /** Card flip animation configuration */
  CARD_FLIP: {
    duration: DURATIONS.FAST,
    easing: EASING.EASE_OUT,
    properties: ['transform'] as const,
  },
  /** Card movement animation configuration */
  CARD_MOVE: {
    duration: DURATIONS.NORMAL,
    easing: EASING.EASE_IN_OUT,
    properties: ['transform'] as const,
  },
  /** Card lift (drag start) animation configuration */
  CARD_LIFT: {
    duration: DURATIONS.INSTANT,
    easing: EASING.EASE_OUT,
    properties: ['transform', 'filter'] as const,
  },
  /** Drop zone highlight animation configuration */
  DROP_HIGHLIGHT: {
    duration: DURATIONS.FAST,
    easing: EASING.EASE_IN_OUT,
    properties: ['opacity', 'transform'] as const,
  },
  /** Victory celebration animation configuration */
  VICTORY: {
    duration: DURATIONS.EXTENDED,
    easing: EASING.BOUNCE,
    properties: ['transform', 'opacity'] as const,
  },
} as const;
