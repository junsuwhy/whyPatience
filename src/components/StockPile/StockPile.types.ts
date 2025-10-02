/**
 * StockPile Component Type Definitions
 * Defines the props interface and supporting types for the StockPile component
 * Following TypeScript strict mode and React best practices
 */

import React, { MouseEvent, KeyboardEvent } from 'react';
import { Card, Position, DrawMode } from '../../types/index';
import { StockPile as StockPileModel } from '../../models/stock-pile';
import { CardDragItem } from '../Card/Card.types';

/**
 * Props interface for the StockPile component
 * Supports 1-card/3-card draw modes, drag-and-drop, and accessibility
 */
export interface StockPileProps {
  /** The StockPile model containing game logic */
  pile: StockPileModel;

  /** Position information for this stock pile */
  position: Position;

  /** Whether this pile is currently disabled */
  isDisabled?: boolean;

  /** Whether this pile is selected for keyboard navigation */
  isSelected?: boolean;

  /** Whether animations are enabled */
  animationsEnabled?: boolean;

  /** Whether sound effects are enabled */
  soundEnabled?: boolean;

  /** Callback when cards are drawn from stock to waste */
  onDraw?: (cardsDrawn: number, stockPile: StockPileModel) => void;

  /** Callback when stock pile is reset (waste cards moved back to stock) */
  onReset?: (stockPile: StockPileModel) => void;

  /** Callback when draw mode is changed */
  onDrawModeChange?: (newMode: DrawMode, stockPile: StockPileModel) => void;

  /** Callback when a card is removed from the waste pile (dragged) */
  onWasteCardRemove?: (card: Card, stockPile: StockPileModel) => void;

  /** Callback when this pile is clicked */
  onClick?: (
    event: MouseEvent<HTMLDivElement>,
    pile: StockPileModel,
    action: 'draw' | 'reset'
  ) => void;

  /** Callback when this pile is double-clicked */
  onDoubleClick?: (
    event: MouseEvent<HTMLDivElement>,
    pile: StockPileModel
  ) => void;

  /** Keyboard event handler */
  onKeyDown?: (
    event: KeyboardEvent<HTMLDivElement>,
    pile: StockPileModel
  ) => void;

  /** Error handler for draw operations */
  onError?: (error: Error, operation: 'draw' | 'reset') => void;

  /** Test ID for automated testing */
  'data-testid'?: string;

  /** Additional CSS class names */
  className?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Stock pile action types for user interactions
 */
export type StockPileAction = 'draw' | 'reset' | 'changeMode';

/**
 * Stock pile drag state for React DnD
 * Used when dragging cards from the waste pile
 */
export interface StockPileDragItem extends CardDragItem {
  /** Source is always from waste pile */
  sourceType: 'waste';

  /** Index of the card in the waste pile */
  wasteIndex: number;
}

/**
 * Stock pile visual states
 */
export interface StockPileState {
  /** Whether the stock pile is being hovered */
  isHovered: boolean;

  /** Whether the stock pile is being clicked */
  isPressed: boolean;

  /** Whether the stock pile can be drawn from */
  canDraw: boolean;

  /** Whether the stock pile can be reset */
  canReset: boolean;

  /** Current animation state */
  animation?: StockPileAnimation;
}

/**
 * Animation configuration for stock pile operations
 */
export interface StockPileAnimation {
  /** Type of animation currently playing */
  type: 'draw' | 'reset' | 'flip' | 'shuffle' | 'error';

  /** Duration of the animation in milliseconds */
  duration: number;

  /** Whether the animation is currently playing */
  isPlaying: boolean;

  /** Animation completion callback */
  onComplete?: () => void;
}

/**
 * Theme configuration for StockPile styling
 */
export interface StockPileTheme {
  /** Container styling */
  container: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: string;
    padding: string;
    gap: string;
  };

  /** Stock pile (face-down cards) styling */
  stockPile: {
    backgroundColor: string;
    borderColor: string;
    borderStyle: string;
    borderWidth: string;
    borderRadius: string;
    minHeight: string;
    minWidth: string;
  };

  /** Waste pile (face-up cards) styling */
  wastePile: {
    backgroundColor: string;
    borderColor: string;
    borderStyle: string;
    borderWidth: string;
    borderRadius: string;
    minHeight: string;
    minWidth: string;
  };

  /** Empty pile placeholder styling */
  placeholder: {
    color: string;
    fontSize: string;
    fontWeight: string;
    opacity: number;
  };

  /** Card counter styling */
  counter: {
    color: string;
    fontSize: string;
    fontWeight: string;
    backgroundColor: string;
    borderRadius: string;
    padding: string;
  };

  /** Hover state styling */
  hover: {
    backgroundColor: string;
    borderColor: string;
    transform: string;
    transition: string;
  };

  /** Disabled state styling */
  disabled: {
    opacity: number;
    cursor: string;
    filter: string;
  };

  /** Animation settings */
  animations: {
    drawDuration: string;
    resetDuration: string;
    flipDuration: string;
    easing: string;
  };
}

/**
 * Default StockPile theme
 */
export const defaultStockPileTheme: StockPileTheme = {
  container: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: '8px',
    padding: '8px',
    gap: '12px',
  },
  stockPile: {
    backgroundColor: '#1a5f3f',
    borderColor: '#2d7a5f',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderRadius: '8px',
    minHeight: '120px',
    minWidth: '85px',
  },
  wastePile: {
    backgroundColor: 'transparent',
    borderColor: '#cccccc',
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderRadius: '8px',
    minHeight: '120px',
    minWidth: '85px',
  },
  placeholder: {
    color: '#666666',
    fontSize: '12px',
    fontWeight: 'normal',
    opacity: 0.7,
  },
  counter: {
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '4px',
    padding: '2px 6px',
  },
  hover: {
    backgroundColor: '#f8f9fa',
    borderColor: '#007bff',
    transform: 'translateY(-2px)',
    transition: 'all 0.15s ease-in-out',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    filter: 'grayscale(50%)',
  },
  animations: {
    drawDuration: '0.3s',
    resetDuration: '0.5s',
    flipDuration: '0.2s',
    easing: 'ease-in-out',
  },
};

/**
 * Stock pile configuration options
 */
export interface StockPileConfig {
  /** Whether to show card count on the stock pile */
  showCardCount: boolean;

  /** Whether to show draw mode indicator */
  showDrawMode: boolean;

  /** Whether to auto-reset when stock is empty and waste has cards */
  autoReset: boolean;

  /** Whether to enable keyboard shortcuts */
  keyboardShortcuts: boolean;

  /** Whether to enable visual feedback for valid/invalid moves */
  visualFeedback: boolean;

  /** Animation settings */
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

/**
 * Default StockPile configuration
 */
export const defaultStockPileConfig: StockPileConfig = {
  showCardCount: true,
  showDrawMode: true,
  autoReset: false,
  keyboardShortcuts: true,
  visualFeedback: true,
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
  },
};
