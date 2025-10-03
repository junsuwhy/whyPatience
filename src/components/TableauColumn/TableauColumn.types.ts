/**
 * TableauColumn Component Type Definitions
 * Defines the props interface and supporting types for the TableauColumn component
 * Following TypeScript strict mode and React best practices
 */

import React, { MouseEvent, KeyboardEvent } from 'react';
import { Card } from '../../types/card';
import { Position } from '../../types/game-state';

/**
 * Props interface for the TableauColumn component
 * Supports drag-and-drop, cascade display, accessibility, and performance optimization
 */
export interface TableauColumnProps {
  /** Array of cards in this tableau column */
  cards: Card[];

  /** Column index (0-6 for standard solitaire) */
  columnIndex: number;

  /** Whether the column can accept dropped cards */
  canDrop?: boolean;

  /** Whether a card is currently being dragged over this column */
  isOver?: boolean;

  /** Whether this column is highlighted for valid drop target */
  isValidDropTarget?: boolean;

  /** Whether the column is disabled (not interactive) */
  isDisabled?: boolean;

  /** Click event handler for cards in the column */
  onClick?: (
    event: MouseEvent<HTMLDivElement>,
    card: Card,
    cardIndex: number
  ) => void;

  /** Double-click event handler for quick moves */
  onDoubleClick?: (
    event: MouseEvent<HTMLDivElement>,
    card: Card,
    cardIndex: number
  ) => void;

  /** Keyboard event handler for accessibility */
  onKeyDown?: (
    event: KeyboardEvent<HTMLDivElement>,
    card: Card,
    cardIndex: number
  ) => void;

  /** Callback when cards are moved to this column */
  onMoveCards?: (
    cards: Card[],
    fromPosition: Position,
    toPosition: Position
  ) => void;

  /** Callback when a face-down card is revealed */
  onReveal?: (card: Card, columnIndex: number) => void;

  /** Test ID for automated testing */
  'data-testid'?: string;

  /** Additional CSS class names */
  className?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Drag item type for tableau column drops
 * Used by React DnD for drag-and-drop operations
 */
export interface TableauDropItem {
  /** Type identifier for React DnD */
  type: 'card' | 'card-stack';

  /** The cards being dragged */
  cards: Card[];

  /** Source position of the drag operation */
  sourcePosition: Position;

  /** Source column index */
  sourceColumnIndex?: number;

  /** Index of the first card in the source stack */
  sourceCardIndex?: number;
}

/**
 * Drop result for tableau column drops
 * Returned by React DnD drop operations
 */
export interface TableauDropResult {
  /** Target column index */
  targetColumnIndex: number;

  /** Target position */
  targetPosition: Position;

  /** Whether the drop was successful */
  success: boolean;

  /** The cards that were dropped */
  droppedCards?: Card[];

  /** Additional data from the drop operation */
  data?: Record<string, unknown>;
}

/**
 * Card position within the tableau column
 * Used for cascade effect calculations
 */
export interface CardCascadePosition {
  /** Index of the card in the column */
  index: number;

  /** Vertical offset from the top of the column */
  offsetY: number;

  /** Z-index for stacking */
  zIndex: number;

  /** Whether this card is face-up */
  isFaceUp: boolean;

  /** Whether this card is the top card in the column */
  isTopCard: boolean;

  /** Whether this card can be dragged */
  isDraggable: boolean;
}

/**
 * Game rule validation result
 * Used to determine if moves are valid
 */
export interface MoveValidationResult {
  /** Whether the move is valid */
  isValid: boolean;

  /** Reason for invalid move (if applicable) */
  reason?: string;

  /** Error code for specific rule violations */
  errorCode?:
    | 'INVALID_SEQUENCE'
    | 'WRONG_COLOR'
    | 'NOT_DESCENDING'
    | 'EMPTY_COLUMN_KING_ONLY';
}

/**
 * Animation state for tableau column
 * Used for hover effects and drag states
 */
export interface TableauAnimationState {
  /** Whether the column is currently animating */
  isAnimating: boolean;

  /** Type of animation being performed */
  animationType?:
    | 'drop-highlight'
    | 'card-flip'
    | 'card-move'
    | 'cascade-reflow';

  /** Duration of the animation in milliseconds */
  duration?: number;

  /** Easing function for the animation */
  easing?: string;
}

/**
 * Theme settings for tableau column styling
 * Allows customization of column appearance
 */
export interface TableauColumnTheme {
  /** Column background color */
  backgroundColor: string;

  /** Empty column placeholder color */
  placeholderColor: string;

  /** Border color for drop zones */
  borderColor: string;

  /** Border radius */
  borderRadius: string;

  /** Card cascade offset in pixels */
  cascadeOffset: number;

  /** Spacing between cards */
  cardSpacing: number;

  /** Drop zone highlight color */
  dropZoneColor: string;

  /** Hover state colors */
  hoverColors: {
    backgroundColor: string;
    borderColor: string;
  };

  /** Animation settings */
  animations: {
    dropDuration: number;
    flipDuration: number;
    moveDuration: number;
  };
}

/**
 * Default tableau column theme
 * Provides sensible defaults for column styling
 */
export const defaultTableauColumnTheme: TableauColumnTheme = {
  backgroundColor: 'transparent',
  placeholderColor: '#f8f9fa',
  borderColor: '#dee2e6',
  borderRadius: '8px',
  cascadeOffset: 20,
  cardSpacing: 4,
  dropZoneColor: '#e3f2fd',
  hoverColors: {
    backgroundColor: '#f1f3f4',
    borderColor: '#007bff',
  },
  animations: {
    dropDuration: 300,
    flipDuration: 600,
    moveDuration: 250,
  },
};
