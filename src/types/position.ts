/**
 * Position and movement type definitions for the Desktop Solitaire game.
 * This file contains types for drag-and-drop operations, spatial calculations,
 * animation states, and movement tracking for the card game interface.
 */

/**
 * 2D coordinate position interface.
 * Represents pixel coordinates for UI positioning and calculations.
 */
export interface Position {
  /** Horizontal coordinate in pixels */
  x: number;
  /** Vertical coordinate in pixels */
  y: number;
}

/**
 * Dimensions interface for width and height measurements.
 * Used for calculating layout and collision detection.
 */
export interface Dimensions {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Rectangle interface combining position and dimensions.
 * Represents a rectangular area for drop zones and collision detection.
 */
export interface Rectangle extends Position, Dimensions {
  /** Horizontal coordinate in pixels */
  x: number;
  /** Vertical coordinate in pixels */
  y: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Drag state enumeration for tracking drag-and-drop operations.
 * Represents the current state of a draggable element.
 */
export type DragState = 'idle' | 'dragging' | 'dropping';

/**
 * Drop zone interface for defining valid drop targets.
 * Contains metadata about where cards can be dropped and validation rules.
 */
export interface DropZone {
  /** Unique identifier for the drop zone */
  id: string;
  /** Type of drop zone (tableau, foundation, etc.) */
  type: 'tableau' | 'foundation' | 'stock' | 'waste';
  /** Rules for accepting cards in this drop zone */
  acceptRules: string[];
}

/**
 * Movement direction enumeration for animation and navigation.
 * Used for directional animations and keyboard navigation.
 */
export type MovementDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Animation state interface for managing card movement animations.
 * Controls timing, easing, and state tracking for smooth animations.
 */
export interface AnimationState {
  /** Whether animation is currently active */
  isAnimating: boolean;
  /** Animation duration in milliseconds */
  duration: number;
  /** Easing function type */
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Current progress of the animation (0-1) */
  progress: number;
}

/**
 * Drop result interface for handling drag-and-drop operation outcomes.
 * Contains information about the drop operation success and effects.
 */
export interface DropResult {
  /** Whether the drop operation was successful */
  success: boolean;
  /** The target zone where the drop occurred */
  targetZone: string;
  /** Position where the cards were dropped */
  position: Position;
  /** Optional message about the drop result */
  message?: string;
}

/**
 * Helper function to check if two positions are equal.
 * @param pos1 - First position to compare
 * @param pos2 - Second position to compare
 * @returns True if positions have the same x and y coordinates
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Helper function to calculate distance between two positions.
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Euclidean distance between the positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Helper function to check if a position is within a rectangle.
 * @param position - Position to check
 * @param rectangle - Rectangle to check against
 * @returns True if position is inside the rectangle
 */
export function isPositionInRectangle(
  position: Position,
  rectangle: Rectangle
): boolean {
  return (
    position.x >= rectangle.x &&
    position.x <= rectangle.x + rectangle.width &&
    position.y >= rectangle.y &&
    position.y <= rectangle.y + rectangle.height
  );
}

/**
 * Helper function to create a rectangle from position and dimensions.
 * @param position - Top-left corner position
 * @param dimensions - Width and height
 * @returns Rectangle combining position and dimensions
 */
export function createRectangle(
  position: Position,
  dimensions: Dimensions
): Rectangle {
  return {
    x: position.x,
    y: position.y,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * Helper function to interpolate between two positions based on progress.
 * @param from - Starting position
 * @param to - Target position
 * @param progress - Animation progress (0-1)
 * @returns Interpolated position
 */
export function interpolatePosition(
  from: Position,
  to: Position,
  progress: number
): Position {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}
