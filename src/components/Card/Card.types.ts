/**
 * Card Component Type Definitions
 * Defines the props interface and supporting types for the Card component
 * Following TypeScript strict mode and React best practices
 */

import React, { MouseEvent, KeyboardEvent } from 'react';
import { Card, CardPosition } from '../../types/card';
import { AnimationMode } from '../../types/preferences';

/**
 * Props interface for the Card component
 * Supports drag-and-drop, accessibility, and performance optimization
 */
export interface CardProps {
  /** The card data containing suit, rank, and visibility */
  card: Card;

  /** Position information for drag-and-drop operations */
  position: CardPosition;

  /** Whether the card is currently draggable */
  isDraggable?: boolean;

  /** Whether the card is currently being dragged */
  isDragging?: boolean;

  /** Whether the card is in a valid drop zone */
  isValidDropTarget?: boolean;

  /** Whether the card is highlighted (e.g., during a move preview) */
  isHighlighted?: boolean;

  /** Whether the card is selected (for keyboard navigation) */
  isSelected?: boolean;

  /** Whether the card is disabled (not interactive) */
  isDisabled?: boolean;

  /** Scale factor for the card (for different sizes) */
  scale?: number;

  /** Z-index for layering cards in stacks */
  zIndex?: number;

  /** Animation mode for controlling animation complexity */
  animationMode?: AnimationMode;

  /** Click event handler */
  onClick?: (event: MouseEvent<HTMLDivElement>, card: Card) => void;

  /** Double-click event handler for quick moves */
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>, card: Card) => void;

  /** Keyboard event handler for accessibility */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>, card: Card) => void;

  /** Drag start callback */
  onDragStart?: (card: Card, position: CardPosition) => void;

  /** Drag end callback */
  onDragEnd?: (card: Card, position: CardPosition) => void;

  /** Drop callback */
  onDrop?: (draggedCard: Card, targetPosition: CardPosition) => void;

  /** Hover callback for drag operations */
  onDragHover?: (draggedCard: Card, targetPosition: CardPosition) => void;

  /** Test ID for automated testing */
  'data-testid'?: string;

  /** Additional CSS class names */
  className?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Drag state for the card component
 * Used by React DnD for drag-and-drop operations
 */
export interface CardDragItem {
  /** Type identifier for React DnD */
  type: 'card';

  /** The card being dragged */
  card: Card;

  /** Source position of the drag operation */
  sourcePosition: CardPosition;

  /** Index in the source stack (for multi-card drags) */
  sourceIndex?: number;
}

/**
 * Drop result for the card component
 * Returned by React DnD drop operations
 */
export interface CardDropResult {
  /** Target position for the drop */
  targetPosition: CardPosition;

  /** Whether the drop was successful */
  success: boolean;

  /** The card that was dropped */
  droppedCard?: Card;

  /** Additional data from the drop operation */
  data?: Record<string, unknown>;
}

/**
 * Animation state for card transitions
 * Used for hover effects and drag states
 */
export interface CardAnimationState {
  /** Whether the card is currently animating */
  isAnimating: boolean;

  /** Type of animation being performed */
  animationType?: 'hover' | 'drag' | 'flip' | 'move' | 'scale';

  /** Duration of the animation in milliseconds */
  duration?: number;

  /** Easing function for the animation */
  easing?: string;
}

/**
 * Card theme settings for styling
 * Allows customization of card appearance
 */
export interface CardTheme {
  /** Card background color */
  backgroundColor: string;

  /** Card border color */
  borderColor: string;

  /** Card border radius */
  borderRadius: string;

  /** Card shadow */
  boxShadow: string;

  /** Font family for card text */
  fontFamily: string;

  /** Color scheme for suits */
  suitColors: {
    red: string;
    black: string;
  };

  /** Hover state colors */
  hoverColors: {
    backgroundColor: string;
    borderColor: string;
  };

  /** Drag state colors */
  dragColors: {
    backgroundColor: string;
    opacity: number;
  };
}

/**
 * Default card theme
 * Provides sensible defaults for card styling
 */
export const defaultCardTheme: CardTheme = {
  backgroundColor: '#ffffff',
  borderColor: '#cccccc',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Arial, sans-serif',
  suitColors: {
    red: '#dc3545',
    black: '#212529',
  },
  hoverColors: {
    backgroundColor: '#f8f9fa',
    borderColor: '#007bff',
  },
  dragColors: {
    backgroundColor: '#e3f2fd',
    opacity: 0.8,
  },
};
