/**
 * useDragAndDrop Hook Implementation
 *
 * A comprehensive React hook that encapsulates React DnD drag-and-drop logic,
 * providing reusable drag-and-drop functionality for all card components.
 *
 * This hook provides unified drag-and-drop interfaces, handling:
 * - Drag item type definitions (CARD, CARD_STACK)
 * - Drag state management (isDragging, canDrop, isOver)
 * - Drop validation logic integration
 * - Drag-and-drop event callback handling
 * - Accessibility support (keyboard drag-and-drop)
 * - Performance optimization (useMemo, useCallback)
 *
 * Follows Constitution principles:
 * - Code Quality Excellence: Clean interface design, type safety, comprehensive error handling
 * - TDD: Tests written first, ensuring all operations have test coverage
 * - UX Consistency: Unified drag-drop behavior across all components
 * - Performance Standards: Optimized with memoization, avoiding unnecessary re-renders
 */

import { useCallback, useMemo, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import {
  useDrag,
  useDrop,
  ConnectDragSource,
  ConnectDropTarget,
  ConnectDragPreview,
  DragSourceMonitor,
  DropTargetMonitor,
} from 'react-dnd';
import { Card } from '../types/card';
import { Position } from '../types/position';

/**
 * Local drag item interface (based on contracts but self-contained)
 */
export interface DragItem {
  type: 'CARD' | 'CARD_STACK';
  cards: Card[];
  sourcePosition: Position;
}

/**
 * Local drop result interface (based on contracts but self-contained)
 */
export interface DropResult {
  targetPosition: Position;
  isValidDrop: boolean;
}

/**
 * Drag item types for React DnD
 */
export const DragItemTypes = {
  CARD: 'CARD',
  CARD_STACK: 'CARD_STACK',
} as const;

export type DragItemType = (typeof DragItemTypes)[keyof typeof DragItemTypes];

/**
 * Extended drag item interface with additional metadata
 */
export interface ExtendedDragItem extends DragItem {
  /** Unique identifier for the drag operation */
  id: string;
  /** Additional metadata for drag operation */
  metadata?: Record<string, unknown>;
}

/**
 * Extended drop result interface with additional metadata
 */
export interface ExtendedDropResult extends DropResult {
  /** Whether the drop was accepted by the target */
  accepted: boolean;
  /** Additional metadata for drop operation */
  metadata?: Record<string, unknown>;
}

/**
 * Draggable card hook result interface
 */
export interface DraggableCardResult {
  /** React DnD drag source ref */
  dragRef: ConnectDragSource;
  /** React DnD drag preview ref */
  dragPreviewRef: ConnectDragPreview;
  /** Whether the card is currently being dragged */
  isDragging: boolean;
  /** Whether the card can be dragged */
  canDrag: boolean;
  /** The dragged item data */
  draggedItem: ExtendedDragItem | null;
}

/**
 * Drop target hook result interface
 */
export interface DropTargetResult {
  /** React DnD drop target ref */
  dropRef: ConnectDropTarget;
  /** Whether a valid item can be dropped here */
  canDrop: boolean;
  /** Whether a dragged item is over this target */
  isOver: boolean;
  /** Whether a dragged item is over this specific target (not nested) */
  isOverCurrent: boolean;
  /** The item currently being hovered over this target */
  hoveredItem: ExtendedDragItem | null;
}

/**
 * Keyboard drag-and-drop state
 */
export interface KeyboardDragState {
  /** Whether keyboard drag mode is active */
  isKeyboardDragging: boolean;
  /** The currently selected item for keyboard dragging */
  selectedItem: ExtendedDragItem | null;
  /** The current keyboard focus position */
  focusPosition: Position | null;
}

/**
 * Options for useDraggableCard hook
 */
export interface UseDraggableCardOptions {
  /** The card item to make draggable */
  item: ExtendedDragItem;
  /** Whether the card can be dragged */
  canDrag?: boolean;
  /** Callback fired when drag starts */
  onDragStart?: (item: ExtendedDragItem, monitor: DragSourceMonitor) => void;
  /** Callback fired when drag ends */
  onDragEnd?: (
    item: ExtendedDragItem,
    dropResult: ExtendedDropResult | null,
    monitor: DragSourceMonitor
  ) => void;
  /** Custom drag preview element */
  dragPreview?: HTMLElement | null;
  /** Whether to use default drag preview */
  useDragPreview?: boolean;
}

/**
 * Options for useDraggableCardStack hook
 */
export interface UseDraggableCardStackOptions extends UseDraggableCardOptions {
  /** Multiple cards to drag as a stack */
  cards: Card[];
  /** Maximum number of cards that can be dragged together */
  maxStackSize?: number;
}

/**
 * Options for useDropTarget hook
 */
export interface UseDropTargetOptions {
  /** Types of drag items this target accepts */
  acceptedTypes: DragItemType[];
  /** Function to determine if an item can be dropped */
  canDrop?: (item: ExtendedDragItem, monitor: DropTargetMonitor) => boolean;
  /** Callback fired when an item is dropped */
  onDrop?: (
    item: ExtendedDragItem,
    monitor: DropTargetMonitor
  ) => ExtendedDropResult;
  /** Callback fired when an item hovers over the target */
  onHover?: (item: ExtendedDragItem, monitor: DropTargetMonitor) => void;
  /** Whether this target should collect hover events */
  collectHover?: boolean;
}

/**
 * Options for keyboard drag-and-drop
 */
export interface KeyboardDragOptions {
  /** Whether keyboard dragging is enabled */
  enabled?: boolean;
  /** Callback for keyboard navigation */
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Callback for keyboard selection */
  onSelect?: (item: ExtendedDragItem) => void;
  /** Callback for keyboard drop */
  onDrop?: (item: ExtendedDragItem, target: Position) => void;
}

/**
 * Custom hook for draggable cards
 *
 * @param options - Configuration options for the draggable card
 * @returns DraggableCardResult with drag refs and state
 */
export function useDraggableCard(
  options: UseDraggableCardOptions
): DraggableCardResult {
  const {
    item,
    canDrag = true,
    onDragStart,
    onDragEnd,
    dragPreview,
    useDragPreview = true,
  } = options;

  // Memoize the drag item to prevent unnecessary re-renders
  const dragItem = useMemo(
    () => ({
      ...item,
      type: DragItemTypes.CARD as DragItemType,
    }),
    [item]
  );

  // Memoize callbacks to prevent unnecessary re-renders
  const handleDragStart = useCallback(
    (monitor: DragSourceMonitor) => {
      onDragStart?.(dragItem, monitor);
    },
    [onDragStart, dragItem]
  );

  const handleDragEnd = useCallback(
    (item: ExtendedDragItem | null, monitor: DragSourceMonitor) => {
      const dropResult = monitor.getDropResult<ExtendedDropResult>();
      onDragEnd?.(dragItem, dropResult, monitor);
    },
    [onDragEnd, dragItem]
  );

  // React DnD useDrag hook
  const [{ isDragging, draggedItem }, dragRef, dragPreviewRef] = useDrag<
    ExtendedDragItem,
    ExtendedDropResult,
    { isDragging: boolean; draggedItem: ExtendedDragItem | null }
  >({
    type: DragItemTypes.CARD,
    item: monitor => {
      handleDragStart(monitor);
      return dragItem;
    },
    end: handleDragEnd,
    canDrag: () => canDrag,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      draggedItem: monitor.getItem(),
    }),
  });

  // Set custom drag preview if provided
  if (useDragPreview && dragPreview) {
    dragPreviewRef(dragPreview);
  }

  return {
    dragRef,
    dragPreviewRef,
    isDragging,
    canDrag,
    draggedItem,
  };
}

/**
 * Custom hook for draggable card stacks
 *
 * @param options - Configuration options for the draggable card stack
 * @returns DraggableCardResult with drag refs and state
 */
export function useDraggableCardStack(
  options: UseDraggableCardStackOptions
): DraggableCardResult {
  const {
    cards,
    maxStackSize = 13, // Maximum cards in a solitaire stack
    ...baseOptions
  } = options;

  // Validate stack size
  const validatedCards = useMemo(() => {
    return cards.slice(0, maxStackSize);
  }, [cards, maxStackSize]);

  // Create stack drag item
  const stackItem = useMemo(
    (): ExtendedDragItem => ({
      ...baseOptions.item,
      type: DragItemTypes.CARD_STACK,
      cards: validatedCards,
      metadata: {
        ...baseOptions.item.metadata,
        stackSize: validatedCards.length,
      },
    }),
    [baseOptions.item, validatedCards]
  );

  // Use the single card draggable hook with modified item
  return useDraggableCard({
    ...baseOptions,
    item: stackItem,
  });
}

/**
 * Custom hook for drop targets
 *
 * @param options - Configuration options for the drop target
 * @returns DropTargetResult with drop refs and state
 */
export function useDropTarget(options: UseDropTargetOptions): DropTargetResult {
  const {
    acceptedTypes,
    canDrop: canDropCallback,
    onDrop,
    onHover,
    collectHover = true,
  } = options;

  // Memoize callbacks to prevent unnecessary re-renders
  const handleDrop = useCallback(
    (
      item: ExtendedDragItem,
      monitor: DropTargetMonitor
    ): ExtendedDropResult => {
      const result = onDrop?.(item, monitor);
      return (
        result || {
          targetPosition: { x: 0, y: 0 },
          isValidDrop: true,
          accepted: true,
        }
      );
    },
    [onDrop]
  );

  const handleHover = useCallback(
    (item: ExtendedDragItem, monitor: DropTargetMonitor) => {
      if (collectHover) {
        onHover?.(item, monitor);
      }
    },
    [onHover, collectHover]
  );

  const handleCanDrop = useCallback(
    (item: ExtendedDragItem, monitor: DropTargetMonitor) => {
      return canDropCallback?.(item, monitor) ?? true;
    },
    [canDropCallback]
  );

  // React DnD useDrop hook
  const [{ canDrop, isOver, isOverCurrent, hoveredItem }, dropRef] = useDrop<
    ExtendedDragItem,
    ExtendedDropResult,
    {
      canDrop: boolean;
      isOver: boolean;
      isOverCurrent: boolean;
      hoveredItem: ExtendedDragItem | null;
    }
  >({
    accept: acceptedTypes,
    drop: handleDrop,
    hover: handleHover,
    canDrop: handleCanDrop,
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      hoveredItem: collectHover ? monitor.getItem() : null,
    }),
  });

  return {
    dropRef,
    canDrop,
    isOver,
    isOverCurrent,
    hoveredItem,
  };
}

/**
 * Custom hook for keyboard drag-and-drop functionality
 *
 * @param options - Configuration options for keyboard dragging
 * @returns KeyboardDragState and control functions
 */
export function useKeyboardDrag(options: KeyboardDragOptions = {}) {
  const { enabled = true, onNavigate, onSelect, onDrop } = options;

  const keyboardStateRef = useRef<KeyboardDragState>({
    isKeyboardDragging: false,
    selectedItem: null,
    focusPosition: null,
  });

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { key } = event;
      const state = keyboardStateRef.current;

      switch (key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          if (state.selectedItem) {
            // Toggle selection or perform drop
            if (state.isKeyboardDragging) {
              onDrop?.(
                state.selectedItem,
                state.focusPosition || { x: 0, y: 0 }
              );
              keyboardStateRef.current = {
                isKeyboardDragging: false,
                selectedItem: null,
                focusPosition: null,
              };
            } else {
              keyboardStateRef.current.isKeyboardDragging = true;
            }
          }
          break;

        case 'Escape':
          event.preventDefault();
          // Cancel keyboard dragging
          keyboardStateRef.current = {
            isKeyboardDragging: false,
            selectedItem: null,
            focusPosition: null,
          };
          break;

        case 'ArrowUp':
          event.preventDefault();
          onNavigate?.('up');
          break;

        case 'ArrowDown':
          event.preventDefault();
          onNavigate?.('down');
          break;

        case 'ArrowLeft':
          event.preventDefault();
          onNavigate?.('left');
          break;

        case 'ArrowRight':
          event.preventDefault();
          onNavigate?.('right');
          break;
      }
    },
    [enabled, onNavigate, onDrop]
  );

  // Select item for keyboard dragging
  const selectItem = useCallback(
    (item: ExtendedDragItem) => {
      if (!enabled) return;

      keyboardStateRef.current.selectedItem = item;
      onSelect?.(item);
    },
    [enabled, onSelect]
  );

  // Update focus position
  const updateFocusPosition = useCallback(
    (position: Position) => {
      if (!enabled) return;

      keyboardStateRef.current.focusPosition = position;
    },
    [enabled]
  );

  return {
    keyboardState: keyboardStateRef.current,
    handleKeyDown,
    selectItem,
    updateFocusPosition,
  };
}

/**
 * Main useDragAndDrop hook that combines all drag-and-drop functionality
 *
 * @param options - Combined options for drag-and-drop functionality
 * @returns Complete drag-and-drop interface
 */
export interface UseDragAndDropOptions {
  /** Draggable card options */
  draggable?: UseDraggableCardOptions;
  /** Card stack draggable options */
  draggableStack?: UseDraggableCardStackOptions;
  /** Drop target options */
  dropTarget?: UseDropTargetOptions;
  /** Keyboard drag options */
  keyboard?: KeyboardDragOptions;
}

export interface UseDragAndDropResult {
  /** Draggable card result */
  draggable: DraggableCardResult | null;
  /** Draggable card stack result */
  draggableStack: DraggableCardResult | null;
  /** Drop target result */
  dropTarget: DropTargetResult | null;
  /** Keyboard drag functionality */
  keyboard: ReturnType<typeof useKeyboardDrag>;
}

/**
 * Main useDragAndDrop hook
 *
 * @param options - Configuration options
 * @returns Complete drag-and-drop functionality
 */
export function useDragAndDrop(
  options: UseDragAndDropOptions = {}
): UseDragAndDropResult {
  const { draggable, draggableStack, dropTarget, keyboard } = options;

  // Always call hooks with default values to maintain hook call order
  const draggableResult = useDraggableCard(
    draggable || {
      item: {
        id: '',
        type: 'CARD',
        cards: [],
        sourcePosition: { x: 0, y: 0 },
      },
      canDrag: false,
    }
  );

  const draggableStackResult = useDraggableCardStack(
    draggableStack || {
      item: {
        id: '',
        type: 'CARD_STACK',
        cards: [],
        sourcePosition: { x: 0, y: 0 },
      },
      cards: [],
      canDrag: false,
    }
  );

  const dropTargetResult = useDropTarget(
    dropTarget || {
      acceptedTypes: [],
      canDrop: () => false,
    }
  );

  const keyboardResult = useKeyboardDrag(keyboard);

  return {
    // Only return results if options were provided
    draggable: draggable ? draggableResult : null,
    draggableStack: draggableStack ? draggableStackResult : null,
    dropTarget: dropTarget ? dropTargetResult : null,
    keyboard: keyboardResult,
  };
}

export default useDragAndDrop;
