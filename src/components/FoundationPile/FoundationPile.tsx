/**
 * FoundationPile Component
 *
 * A React component for one of the four foundation piles in Desktop Solitaire.
 * Supports drag-and-drop operations, accessibility features, and game rule validation.
 * Following TDD principles and constitutional requirements for code quality.
 */

import React, { useCallback, useMemo, KeyboardEvent, MouseEvent } from 'react';
import { useDrop } from 'react-dnd';
import { Card, Suit, Rank, CardPosition } from '../../types/index';
import { FoundationPile as FoundationPileModel } from '../../models/foundation-pile';
import { CardDragItem, CardDropResult } from '../Card/Card.types';
import {
  FoundationPileContainer,
  FoundationPileContent,
  FoundationPileLabel,
  FoundationPilePlaceholder,
  SuitIndicator,
  TopCard,
  CompletionBadge,
} from './FoundationPile.styles';

/**
 * Props interface for the FoundationPile component
 */
export interface FoundationPileProps {
  /** The FoundationPile model containing game logic */
  pile: FoundationPileModel;

  /** Position information for this foundation pile */
  position: CardPosition;

  /** Index of this foundation pile (0-3) */
  index: number;

  /** Whether this pile is currently disabled */
  isDisabled?: boolean;

  /** Whether this pile is selected for keyboard navigation */
  isSelected?: boolean;

  /** Callback when a card is added to this pile */
  onCardAdd?: (card: Card, targetPile: FoundationPileModel) => void;

  /** Callback when a card is removed from this pile */
  onCardRemove?: (card: Card, sourcePile: FoundationPileModel) => void;

  /** Callback when this pile is clicked */
  onClick?: (
    event: MouseEvent<HTMLDivElement>,
    pile: FoundationPileModel
  ) => void;

  /** Callback when this pile is double-clicked */
  onDoubleClick?: (
    event: MouseEvent<HTMLDivElement>,
    pile: FoundationPileModel
  ) => void;

  /** Keyboard event handler */
  onKeyDown?: (
    event: KeyboardEvent<HTMLDivElement>,
    pile: FoundationPileModel
  ) => void;

  /** Test ID for automated testing */
  'data-testid'?: string;

  /** Additional CSS class names */
  className?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Helper function to get suit display symbol
 */
const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS:
      return '♥';
    case Suit.DIAMONDS:
      return '♦';
    case Suit.CLUBS:
      return '♣';
    case Suit.SPADES:
      return '♠';
    default:
      return '';
  }
};

/**
 * Helper function to get suit color
 */
const getSuitColor = (suit: Suit): 'red' | 'black' => {
  return suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'red' : 'black';
};

/**
 * Helper function to generate ARIA label for foundation pile
 */
const getFoundationAriaLabel = (
  pile: FoundationPileModel,
  index: number
): string => {
  const pileNumber = index + 1;

  if (pile.isEmpty()) {
    if (pile.suit) {
      const suitName = pile.suit.charAt(0).toUpperCase() + pile.suit.slice(1);
      return `Foundation pile ${pileNumber} for ${suitName}, empty, accepts Ace`;
    }
    return `Foundation pile ${pileNumber}, empty, accepts any Ace`;
  }

  const topCard = pile.getTopCard();
  if (!topCard) {
    return `Foundation pile ${pileNumber}, empty`;
  }

  const suitName = pile.suit?.charAt(0).toUpperCase() + pile.suit?.slice(1);
  const cardCount = pile.cards.length;
  const nextRank = pile.getExpectedNextRank();
  const nextRankName = nextRank ? getRankName(nextRank) : 'complete';

  if (pile.isComplete()) {
    return `Foundation pile ${pileNumber} for ${suitName}, complete with all 13 cards`;
  }

  return `Foundation pile ${pileNumber} for ${suitName}, ${cardCount} cards, top card ${getRankName(topCard.rank)}, accepts ${nextRankName}`;
};

/**
 * Helper function to get rank name for accessibility
 */
const getRankName = (rank: Rank): string => {
  switch (rank) {
    case Rank.ACE:
      return 'Ace';
    case Rank.JACK:
      return 'Jack';
    case Rank.QUEEN:
      return 'Queen';
    case Rank.KING:
      return 'King';
    default:
      return rank.toString();
  }
};

/**
 * FoundationPile Component Implementation
 *
 * Features:
 * - Drag and drop with React DnD
 * - Game rule validation using FoundationPile model
 * - Accessibility with ARIA labels and keyboard navigation
 * - Visual feedback for drag states and completion
 * - Suit indicators and empty pile placeholders
 * - Performance optimized with React.memo
 */
export const FoundationPile: React.FC<FoundationPileProps> = React.memo(
  ({
    pile,
    position,
    index,
    isDisabled = false,
    isSelected = false,
    onCardAdd,
    onClick,
    onDoubleClick,
    onKeyDown,
    'data-testid': testId,
    className,
    style,
    ...props
  }) => {
    // Get top card for display
    const topCard = pile.getTopCard();

    // Generate ARIA label
    const ariaLabel = useMemo(
      () => getFoundationAriaLabel(pile, index),
      [pile, index]
    );

    // React DnD drop configuration
    const [{ isOver, canDrop }, dropRef] = useDrop<
      CardDragItem,
      CardDropResult,
      { isOver: boolean; canDrop: boolean }
    >({
      accept: 'card',
      drop: item => {
        if (pile.canAddCard(item.card)) {
          onCardAdd?.(item.card, pile);
          return {
            targetPosition: position,
            success: true,
            droppedCard: item.card,
          };
        }
        return {
          targetPosition: position,
          success: false,
        };
      },
      canDrop: item => {
        return !isDisabled && pile.canAddCard(item.card);
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    // Click event handler
    const handleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        onClick?.(event, pile);
      },
      [onClick, pile, isDisabled]
    );

    // Double-click event handler
    const handleDoubleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        onDoubleClick?.(event, pile);
      },
      [onDoubleClick, pile, isDisabled]
    );

    // Keyboard event handler for accessibility
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        // Handle Enter and Space as click
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(event as unknown as MouseEvent<HTMLDivElement>, pile);
        }

        // Handle arrow keys for navigation
        if (
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
            event.key
          )
        ) {
          event.preventDefault();
          // Navigation logic would be handled by parent component
        }

        onKeyDown?.(event, pile);
      },
      [onKeyDown, onClick, pile, isDisabled]
    );

    // Render suit indicator for empty piles
    const renderSuitIndicator = () => {
      if (!pile.isEmpty()) return null;

      if (pile.suit) {
        return (
          <SuitIndicator suit={pile.suit} color={getSuitColor(pile.suit)}>
            {getSuitSymbol(pile.suit)}
          </SuitIndicator>
        );
      }

      // Show placeholder for unassigned pile
      return (
        <FoundationPilePlaceholder>
          <span>A</span>
        </FoundationPilePlaceholder>
      );
    };

    // Render top card if pile has cards
    const renderTopCard = () => {
      if (!topCard) return null;

      return (
        <TopCard
          card={topCard}
          position={position}
          isDraggable={false}
          scale={0.9}
          zIndex={1}
        />
      );
    };

    // Render completion badge for completed piles
    const renderCompletionBadge = () => {
      if (!pile.isComplete()) return null;

      return <CompletionBadge>✓</CompletionBadge>;
    };

    return (
      <FoundationPileContainer
        ref={dropRef}
        isOver={isOver}
        canDrop={canDrop}
        isDisabled={isDisabled}
        isSelected={isSelected}
        isComplete={pile.isComplete()}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={isDisabled ? -1 : 0}
        role="button"
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        aria-disabled={isDisabled}
        data-testid={testId || `foundation-pile-${index}`}
        className={className}
        style={style}
        {...props}
      >
        <FoundationPileContent>
          {renderSuitIndicator()}
          {renderTopCard()}
          {renderCompletionBadge()}
        </FoundationPileContent>

        <FoundationPileLabel>Foundation {index + 1}</FoundationPileLabel>
      </FoundationPileContainer>
    );
  }
);

// Display name for debugging
FoundationPile.displayName = 'FoundationPile';

export default FoundationPile;
