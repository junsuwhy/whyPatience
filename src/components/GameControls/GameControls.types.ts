/**
 * Type definitions for the GameControls component.
 * This file defines interfaces for props and internal state management.
 */

import { GameState } from '../../types/game-state';

/**
 * Callback function types for game control actions.
 */
export interface GameControlCallbacks {
  /** Callback for starting a new game */
  onNewGame: () => void;
  /** Callback for restarting the current game */
  onRestart: () => void;
  /** Callback for undoing the last move */
  onUndo: () => void;
  /** Callback for redoing a previously undone move */
  onRedo: () => void;
  /** Callback for pausing/resuming the game */
  onPause: () => void;
  /** Callback for resuming a paused game */
  onResume: () => void;
  /** Callback for opening the settings modal */
  onSettings: () => void;
  /** Callback for opening the statistics modal */
  onStatistics: () => void;
}

/**
 * Props interface for the GameControls component.
 */
export interface GameControlsProps extends GameControlCallbacks {
  /** Current game state */
  gameState: GameState;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Whether the game is currently paused */
  isPaused: boolean;
  /** Whether the game is loading or processing */
  isLoading?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Whether to show keyboard shortcuts in tooltips */
  showKeyboardShortcuts?: boolean;
  /** Custom aria-label for the control panel */
  ariaLabel?: string;
}

/**
 * Internal component state for button states and animations.
 */
export interface ControlButtonState {
  /** Whether the button is currently being pressed */
  isPressed: boolean;
  /** Whether the button should show a hover effect */
  isHovered: boolean;
  /** Whether the button is disabled */
  isDisabled: boolean;
  /** Whether the button is currently animating */
  isAnimating: boolean;
}

/**
 * Button configuration interface for defining button properties.
 */
export interface ControlButton {
  /** Unique identifier for the button */
  id: string;
  /** Display label for the button */
  label: string;
  /** Icon name or component for the button */
  icon: string;
  /** Keyboard shortcut for the button */
  shortcut: string;
  /** Tooltip text for accessibility */
  tooltip: string;
  /** ARIA label for screen readers */
  ariaLabel: string;
  /** Whether the button is currently disabled */
  disabled: boolean;
  /** Click handler function */
  onClick: () => void;
  /** Button variant for styling */
  variant: 'primary' | 'secondary' | 'danger' | 'success';
}

/**
 * Keyboard shortcut configuration interface.
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., 'Ctrl+N', 'Space', 'Escape') */
  key: string;
  /** Action identifier */
  action: string;
  /** Human-readable description */
  description: string;
  /** Whether Ctrl key is required */
  ctrl?: boolean;
  /** Whether Shift key is required */
  shift?: boolean;
  /** Whether Alt key is required */
  alt?: boolean;
}

/**
 * Animation state interface for button transitions.
 */
export interface AnimationConfig {
  /** Animation duration in milliseconds */
  duration: number;
  /** Animation easing function */
  easing: string;
  /** Whether to use hardware acceleration */
  useGPU: boolean;
  /** Animation delay in milliseconds */
  delay?: number;
}
