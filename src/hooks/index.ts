/**
 * Hooks Index
 *
 * Central export file for all custom React hooks in the application.
 * Provides a single import point for all hook functionality.
 */

// Game State Management Hook
export { useGameState, type UseGameStateReturn } from './useGameState';

// Game Statistics Hook
export { useGameStatistics } from './useGameStatistics';

// Drag and Drop Hooks
export {
  useDragAndDrop,
  useDraggableCard,
  useDraggableCardStack,
  useDropTarget,
  useKeyboardDrag,
  DragItemTypes,
  type DragItemType,
  type ExtendedDragItem,
  type ExtendedDropResult,
  type DraggableCardResult,
  type DropTargetResult,
  type KeyboardDragState,
  type UseDraggableCardOptions,
  type UseDraggableCardStackOptions,
  type UseDropTargetOptions,
  type KeyboardDragOptions,
  type UseDragAndDropOptions,
  type UseDragAndDropResult,
} from './useDragAndDrop';

// Local Storage Hook
export {
  useLocalStorage,
  type UseLocalStorageOptions,
  type UseLocalStorageReturn,
} from './useLocalStorage';
