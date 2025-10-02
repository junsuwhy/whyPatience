/**
 * Card Component
 *
 * A React component that renders a playing card with drag-and-drop functionality,
 * accessibility support, and 60fps animations. Follows TDD principles and
 * constitutional requirements for code quality and performance.
 */

import React, { useCallback, useMemo, KeyboardEvent, MouseEvent } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card as CardType, Rank, Color, getCardColor } from '../../types/card';
import {
  CardProps,
  CardDragItem,
  CardDropResult,
  defaultCardTheme,
} from './Card.types';
import {
  CardContainer,
  CardFront,
  CardBack,
  CardRank,
  CardSuit,
  CardCorner,
  CenterSuit,
  CardBackPattern,
} from './Card.styles';

/**
 * Helper function to get rank display string
 */
const getRankDisplay = (rank: Rank): string => {
  switch (rank) {
    case Rank.ACE:
      return 'A';
    case Rank.JACK:
      return 'J';
    case Rank.QUEEN:
      return 'Q';
    case Rank.KING:
      return 'K';
    default:
      return rank.toString();
  }
};

/**
 * Helper function to generate ARIA label for screen readers
 */
const getCardAriaLabel = (card: CardType, isRevealed: boolean): string => {
  if (!isRevealed) {
    return 'Face down card';
  }

  const rankName = getRankDisplay(card.rank);
  const suitName = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
  const colorName = card.color === Color.RED ? 'red' : 'black';

  return `${rankName} of ${suitName}, ${colorName} card`;
};

/**
 * Card Component Implementation
 *
 * Features:
 * - Drag and drop with React DnD
 * - Accessibility with ARIA labels and keyboard navigation
 * - 60fps animations with CSS transitions
 * - Front/back face display
 * - Responsive design
 * - TypeScript strict mode compliance
 * - React.memo optimization
 */
export const Card: React.FC<CardProps> = React.memo(
  ({
    card,
    position,
    isDraggable = true,
    isDragging = false,
    isValidDropTarget = false,
    isHighlighted = false,
    isSelected = false,
    isDisabled = false,
    scale = 1,
    zIndex = 0,
    onClick,
    onDoubleClick,
    onKeyDown,
    onDragStart,
    onDragEnd,
    onDrop,
    onDragHover,
    'data-testid': testId,
    className,
    style,
    ...props
  }) => {
    // Determine if card is revealed (face up)
    const isRevealed = card.isVisible;

    // Get card color for styling
    const cardColor = useMemo(() => getCardColor(card.suit), [card.suit]);

    // Generate ARIA label
    const ariaLabel = useMemo(
      () => getCardAriaLabel(card, isRevealed),
      [card, isRevealed]
    );

    // React DnD drag configuration
    const [{ isDraggingState }, dragRef] = useDrag<
      CardDragItem,
      CardDropResult,
      { isDragging: boolean }
    >({
      type: 'card',
      item: () => {
        onDragStart?.(card, position);
        return {
          type: 'card',
          card,
          sourcePosition: position,
        };
      },
      end: () => {
        onDragEnd?.(card, position);
      },
      canDrag: () => isDraggable && !isDisabled,
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    });

    // React DnD drop configuration
    const [{ isOver, canDrop }, dropRef] = useDrop<
      CardDragItem,
      CardDropResult,
      { isOver: boolean; canDrop: boolean }
    >({
      accept: 'card',
      drop: item => {
        onDrop?.(item.card, position);
        return {
          targetPosition: position,
          success: true,
          droppedCard: item.card,
        };
      },
      hover: item => {
        onDragHover?.(item.card, position);
      },
      canDrop: () => !isDisabled,
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    // Combine drag and drop refs
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        dragRef(node);
        dropRef(node);
      },
      [dragRef, dropRef]
    );

    // Click event handler
    const handleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        onClick?.(event, card);
      },
      [onClick, card, isDisabled]
    );

    // Double-click event handler
    const handleDoubleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        onDoubleClick?.(event, card);
      },
      [onDoubleClick, card, isDisabled]
    );

    // Keyboard event handler for accessibility
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        // Handle Enter and Space as click
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(event as MouseEvent<HTMLDivElement>, card);
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

        onKeyDown?.(event, card);
      },
      [onKeyDown, onClick, card, isDisabled]
    );

    // Render rank and suit in corners
    const renderCorner = (position: 'top-left' | 'bottom-right') => (
      <CardCorner position={position}>
        <CardRank color={cardColor} size="small">
          {getRankDisplay(card.rank)}
        </CardRank>
        <CardSuit suit={card.suit} color={cardColor} size="small" />
      </CardCorner>
    );

    // Render center content based on rank
    const renderCenterContent = () => {
      // For face cards (J, Q, K) and Ace, show large suit symbol
      if ([Rank.ACE, Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) {
        return (
          <CenterSuit>
            <CardSuit suit={card.suit} color={cardColor} size="large" />
          </CenterSuit>
        );
      }

      // For number cards, show appropriate number of suit symbols
      // This is a simplified version - in a full implementation,
      // you'd arrange the symbols in proper card patterns
      return (
        <CenterSuit>
          <CardSuit suit={card.suit} color={cardColor} size="medium" />
        </CenterSuit>
      );
    };

    return (
      <CardContainer
        ref={ref}
        theme={defaultCardTheme}
        isDragging={isDraggingState || isDragging}
        isValidDropTarget={isValidDropTarget || (isOver && canDrop)}
        isHighlighted={isHighlighted}
        isSelected={isSelected}
        isDisabled={isDisabled}
        scale={scale}
        zIndex={zIndex}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={isDisabled ? -1 : 0}
        role="button"
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        aria-disabled={isDisabled}
        data-testid={testId || `card-${card.id}`}
        className={className}
        style={style}
        {...props}
      >
        {/* Card Front Face */}
        <CardFront isRevealed={isRevealed}>
          {renderCorner('top-left')}
          {renderCenterContent()}
          {renderCorner('bottom-right')}
        </CardFront>

        {/* Card Back Face */}
        <CardBack isRevealed={!isRevealed}>
          <CardBackPattern />
        </CardBack>
      </CardContainer>
    );
  }
);

// Display name for debugging
Card.displayName = 'Card';

// Default props
Card.defaultProps = {
  isDraggable: true,
  isDragging: false,
  isValidDropTarget: false,
  isHighlighted: false,
  isSelected: false,
  isDisabled: false,
  scale: 1,
  zIndex: 0,
};

export default Card;
