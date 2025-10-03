/**
 * useFocusNavigation Hook
 *
 * Manages keyboard focus navigation for the solitaire game using roving tabindex pattern.
 * Provides comprehensive focus management for all game areas with accessibility support.
 */

import React, { useCallback, useRef, useState, useMemo } from 'react';
import { GameArea, Position } from '../types/game-state';
import { GameState } from '../types/game-state';

export interface FocusedElement {
  area: GameArea;
  index: number;
  cardIndex?: number; // For navigating within a column/pile
}

export interface FocusNavigationOptions {
  announceNavigation?: boolean;
  announceActions?: boolean;
  enableHints?: boolean;
  enableAutoMove?: boolean;
}

export interface FocusNavigationState {
  focusedElement: FocusedElement | null;
  selectedCard: unknown | null;
  isHintMode: boolean;
  possibleMoves: Position[];
  ariaLiveMessage: string;
}

export interface FocusNavigationActions {
  setFocusedElement: (element: FocusedElement | null) => void;
  setSelectedCard: (card: unknown | null) => void;
  navigateByKey: (key: string) => void;
  selectCurrentElement: () => void;
  cancelSelection: () => void;
  showHints: () => void;
  performAutoMove: () => void;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  clearMessage: () => void;
}

export interface UseFocusNavigationReturn
  extends FocusNavigationState,
    FocusNavigationActions {
  // DOM refs for focus management
  elementRefs: {
    foundation: React.MutableRefObject<(HTMLElement | null)[]>;
    tableau: React.MutableRefObject<(HTMLElement | null)[]>;
    stock: React.MutableRefObject<HTMLElement | null>;
    waste: React.MutableRefObject<HTMLElement | null>;
  };

  // ARIA attributes for main container
  mainContainerProps: {
    tabIndex: number;
    role: string;
    'aria-label': string;
    'aria-describedby': string;
    onKeyDown: (event: React.KeyboardEvent) => void;
  };

  // Props for individual game elements
  getElementProps: (
    area: GameArea,
    index: number,
    cardIndex?: number
  ) => {
    tabIndex: number;
    role: string;
    'aria-label': string;
    'aria-current'?: 'true' | 'false';
    'aria-selected'?: 'true' | 'false';
    'aria-describedby'?: string;
    ref: (el: HTMLElement | null) => void;
    onFocus: () => void;
  };

  // Props for ARIA live regions
  ariaLiveProps: {
    'aria-live': 'polite' | 'assertive';
    'aria-atomic': 'true';
    role: 'status';
  };
}

/**
 * Hook for managing keyboard focus navigation in the solitaire game
 */
export const useFocusNavigation = (
  gameState: GameState,
  options: FocusNavigationOptions = {}
): UseFocusNavigationReturn => {
  const {
    announceNavigation = true,
    announceActions = true,
    enableHints = true,
    enableAutoMove = true,
  } = options;

  // State
  const [focusedElement, setFocusedElement] = useState<FocusedElement | null>(
    null
  );
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [isHintMode, setIsHintMode] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [ariaLiveMessage, setAriaLiveMessage] = useState<string>('');
  const [liveMessagePriority, setLiveMessagePriority] = useState<
    'polite' | 'assertive'
  >('polite');

  // DOM refs
  const foundationRefs = useRef<(HTMLElement | null)[]>([]);
  const tableauRefs = useRef<(HTMLElement | null)[]>([]);
  const stockRef = useRef<HTMLElement | null>(null);
  const wasteRef = useRef<HTMLElement | null>(null);

  /**
   * Get the total number of elements in each area
   */
  const areaCounts = useMemo(
    () => ({
      foundation: 4,
      tableau: 7,
      stock: 1,
      waste: 1,
    }),
    []
  );

  /**
   * Focus a specific DOM element
   */
  const focusElement = useCallback((area: GameArea, index: number) => {
    let element: HTMLElement | null = null;

    switch (area) {
      case GameArea.FOUNDATION:
        element = foundationRefs.current[index];
        break;
      case GameArea.TABLEAU:
        element = tableauRefs.current[index];
        break;
      case GameArea.STOCK:
        element = stockRef.current;
        break;
      case GameArea.WASTE:
        element = wasteRef.current;
        break;
    }

    if (element) {
      element.focus();
    }
  }, []);

  /**
   * Generate descriptive text for current position
   */
  const getPositionDescription = useCallback(
    (element: FocusedElement): string => {
      const { area, index } = element;

      switch (area) {
        case GameArea.FOUNDATION:
          const foundationPile = gameState.foundation[index];
          const foundationTopCard =
            foundationPile?.cards[foundationPile.cards.length - 1];
          if (foundationTopCard) {
            return `Foundation pile ${index + 1}, top card: ${foundationTopCard.rank} of ${foundationTopCard.suit}`;
          }
          return `Empty foundation pile ${index + 1}, needs Ace to start`;

        case GameArea.TABLEAU:
          const tableauColumn = gameState.tableau[index];
          const visibleCards =
            tableauColumn?.cards.filter(card => card.isVisible) || [];
          if (visibleCards.length > 0) {
            const topCard = visibleCards[visibleCards.length - 1];
            return `Tableau column ${index + 1}, ${visibleCards.length} visible cards, top card: ${topCard.rank} of ${topCard.suit}`;
          }
          return `Empty tableau column ${index + 1}, can place King`;

        case GameArea.STOCK:
          const stockCount = gameState.stock.cards.length;
          return `Stock pile, ${stockCount} cards remaining`;

        case GameArea.WASTE:
          const wasteCards = gameState.stock.wasteCards || [];
          if (wasteCards.length > 0) {
            const topWasteCard = wasteCards[wasteCards.length - 1];
            return `Waste pile, top card: ${topWasteCard.rank} of ${topWasteCard.suit}`;
          }
          return `Empty waste pile`;

        default:
          return 'Unknown position';
      }
    },
    [gameState]
  );

  /**
   * Navigate focus based on arrow key direction
   */
  const navigateByKey = useCallback(
    (key: string) => {
      if (!focusedElement) {
        // Start navigation from first foundation pile
        const newElement = { area: GameArea.FOUNDATION, index: 0 };
        setFocusedElement(newElement);
        focusElement(GameArea.FOUNDATION, 0);

        if (announceNavigation) {
          announceMessage(getPositionDescription(newElement));
        }
        return;
      }

      const { area, index } = focusedElement;
      let newArea = area;
      let newIndex = index;

      switch (key) {
        case 'ArrowRight':
          if (
            area === GameArea.FOUNDATION &&
            index < areaCounts.foundation - 1
          ) {
            newIndex = index + 1;
          } else if (
            area === GameArea.TABLEAU &&
            index < areaCounts.tableau - 1
          ) {
            newIndex = index + 1;
          } else if (
            area === GameArea.FOUNDATION &&
            index === areaCounts.foundation - 1
          ) {
            newArea = GameArea.STOCK;
            newIndex = 0;
          } else if (area === GameArea.STOCK) {
            newArea = GameArea.WASTE;
            newIndex = 0;
          }
          break;

        case 'ArrowLeft':
          if (area === GameArea.FOUNDATION && index > 0) {
            newIndex = index - 1;
          } else if (area === GameArea.TABLEAU && index > 0) {
            newIndex = index - 1;
          } else if (area === GameArea.WASTE) {
            newArea = GameArea.STOCK;
            newIndex = 0;
          } else if (area === GameArea.STOCK) {
            newArea = GameArea.FOUNDATION;
            newIndex = areaCounts.foundation - 1;
          }
          break;

        case 'ArrowDown':
          if (area === GameArea.FOUNDATION) {
            newArea = GameArea.TABLEAU;
            newIndex = Math.min(index, areaCounts.tableau - 1);
          }
          break;

        case 'ArrowUp':
          if (area === GameArea.TABLEAU) {
            newArea = GameArea.FOUNDATION;
            newIndex = Math.min(index, areaCounts.foundation - 1);
          }
          break;
      }

      const newElement = { area: newArea, index: newIndex };
      setFocusedElement(newElement);
      focusElement(newArea, newIndex);

      if (announceNavigation) {
        announceMessage(getPositionDescription(newElement));
      }
    },
    [
      focusedElement,
      areaCounts,
      focusElement,
      announceNavigation,
      getPositionDescription,
    ]
  );

  /**
   * Select/action on current focused element
   */
  const selectCurrentElement = useCallback(() => {
    if (!focusedElement) return;

    const { area, index } = focusedElement;

    if (area === GameArea.STOCK) {
      // Handle stock draw
      if (announceActions) {
        announceMessage('Drawing card from stock pile');
      }
      // Stock draw logic would be handled by parent component
      return;
    }

    // Handle card selection logic
    let targetCard = null;

    if (area === GameArea.FOUNDATION) {
      const pile = gameState.foundation[index];
      targetCard = pile?.cards[pile.cards.length - 1];
    } else if (area === GameArea.TABLEAU) {
      const column = gameState.tableau[index];
      const visibleCards = column?.cards.filter(card => card.isVisible) || [];
      targetCard = visibleCards[visibleCards.length - 1];
    } else if (area === GameArea.WASTE) {
      const wasteCards = gameState.stock.wasteCards || [];
      targetCard = wasteCards[wasteCards.length - 1];
    }

    if (selectedCard) {
      // Try to move selected card to focused position
      if (announceActions) {
        announceMessage(
          `Attempting to move ${selectedCard.rank} of ${selectedCard.suit} to ${getPositionDescription(focusedElement)}`
        );
      }
      // Move logic would be handled by parent component
      setSelectedCard(null);
    } else if (targetCard) {
      // Select the card
      setSelectedCard(targetCard);
      if (announceActions) {
        announceMessage(
          `Selected ${targetCard.rank} of ${targetCard.suit} from ${getPositionDescription(focusedElement)}`
        );
      }
    } else {
      // No card to select
      if (announceActions) {
        announceMessage('No card available to select');
      }
    }
  }, [
    focusedElement,
    selectedCard,
    gameState,
    announceActions,
    getPositionDescription,
  ]);

  /**
   * Cancel current selection
   */
  const cancelSelection = useCallback(() => {
    if (selectedCard) {
      setSelectedCard(null);
      if (announceActions) {
        announceMessage('Selection cancelled');
      }
    }
    setIsHintMode(false);
    setPossibleMoves([]);
  }, [selectedCard, announceActions]);

  /**
   * Show possible moves (hints)
   */
  const showHints = useCallback(() => {
    if (!enableHints) return;

    setIsHintMode(true);
    // Calculate possible moves logic would be implemented here
    // For now, set empty array
    setPossibleMoves([]);

    if (announceActions) {
      announceMessage('Highlighting possible moves');
    }

    // Auto-clear hints after 3 seconds
    setTimeout(() => {
      setIsHintMode(false);
      setPossibleMoves([]);
    }, 3000);
  }, [enableHints, announceActions]);

  /**
   * Perform automatic move to foundation if possible
   */
  const performAutoMove = useCallback(() => {
    if (!enableAutoMove) return;

    // Auto-move logic would be implemented here
    if (announceActions) {
      announceMessage('Checking for automatic moves to foundation');
    }

    // For now, just announce no moves available
    setTimeout(() => {
      announceMessage('No automatic moves available');
    }, 100);
  }, [enableAutoMove, announceActions]);

  /**
   * Announce message to screen readers
   */
  const announceMessage = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      setAriaLiveMessage(message);
      setLiveMessagePriority(priority);

      // Clear message after a delay to ensure it's announced
      setTimeout(() => {
        setAriaLiveMessage('');
      }, 100);
    },
    []
  );

  /**
   * Clear ARIA live message
   */
  const clearMessage = useCallback(() => {
    setAriaLiveMessage('');
  }, []);

  /**
   * Handle main container keyboard events
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key, ctrlKey, metaKey } = event;

      // Don't handle if modifier keys are pressed (let parent handle global shortcuts)
      if (ctrlKey || metaKey) return;

      switch (key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          event.preventDefault();
          navigateByKey(key);
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          selectCurrentElement();
          break;

        case 'Escape':
          event.preventDefault();
          cancelSelection();
          break;

        case 'h':
        case 'H':
          event.preventDefault();
          showHints();
          break;

        case 'a':
        case 'A':
          event.preventDefault();
          performAutoMove();
          break;
      }
    },
    [
      navigateByKey,
      selectCurrentElement,
      cancelSelection,
      showHints,
      performAutoMove,
    ]
  );

  /**
   * Get props for individual game elements
   */
  const getElementProps = useCallback(
    (area: GameArea, index: number, cardIndex?: number) => {
      const isFocused =
        focusedElement?.area === area && focusedElement?.index === index;
      const isSelected =
        selectedCard &&
        focusedElement?.area === area &&
        focusedElement?.index === index;

      return {
        tabIndex: isFocused ? 0 : -1,
        role:
          area === GameArea.STOCK || area === GameArea.WASTE
            ? 'button'
            : 'gridcell',
        'aria-label': getPositionDescription({ area, index }),
        'aria-current': isFocused ? ('true' as const) : ('false' as const),
        'aria-selected': isSelected ? ('true' as const) : ('false' as const),
        'aria-describedby': 'game-instructions',
        ref: (el: HTMLElement | null) => {
          switch (area) {
            case GameArea.FOUNDATION:
              foundationRefs.current[index] = el;
              break;
            case GameArea.TABLEAU:
              tableauRefs.current[index] = el;
              break;
            case GameArea.STOCK:
              stockRef.current = el;
              break;
            case GameArea.WASTE:
              wasteRef.current = el;
              break;
          }
        },
        onFocus: () => {
          setFocusedElement({ area, index });
        },
      };
    },
    [focusedElement, selectedCard, getPositionDescription]
  );

  return {
    // State
    focusedElement,
    selectedCard,
    isHintMode,
    possibleMoves,
    ariaLiveMessage,

    // Actions
    setFocusedElement,
    setSelectedCard,
    navigateByKey,
    selectCurrentElement,
    cancelSelection,
    showHints,
    performAutoMove,
    announceMessage,
    clearMessage,

    // DOM refs
    elementRefs: {
      foundation: foundationRefs,
      tableau: tableauRefs,
      stock: stockRef,
      waste: wasteRef,
    },

    // Main container props
    mainContainerProps: {
      tabIndex: 0,
      role: 'application',
      'aria-label': 'Solitaire game board',
      'aria-describedby': 'game-instructions',
      onKeyDown: handleKeyDown,
    },

    // Element props getter
    getElementProps,

    // ARIA live props
    ariaLiveProps: {
      'aria-live': liveMessagePriority,
      'aria-atomic': 'true' as const,
      role: 'status' as const,
    },
  };
};

export default useFocusNavigation;
