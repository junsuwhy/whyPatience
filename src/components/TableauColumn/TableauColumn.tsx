/**
 * TableauColumn Component
 * Displays and manages a column of cards in the tableau area of the solitaire game
 * Supports drag-and-drop, cascade effect, game rule validation, and accessibility
 */

import React, {
  FC,
  useMemo,
  useCallback,
  KeyboardEvent,
  MouseEvent,
} from 'react';
import { useDrop } from 'react-dnd';
import { Card as CardComponent } from '../Card';
import { Card, Rank, Suit } from '../../types/card';
import { Position, GameArea } from '../../types/game-state';
import {
  TableauColumnProps,
  TableauDropItem,
  TableauDropResult,
  CardCascadePosition,
  MoveValidationResult,
} from './TableauColumn.types';
import {
  TableauColumnContainer,
  CardSlot,
  EmptySlot,
  CardStack,
  DropZoneIndicator,
  ScreenReaderText,
  RevealButton,
} from './TableauColumn.styled';

/**
 * Game rule validation functions
 */
const isOppositeColor = (card1: Card, card2: Card): boolean => {
  const redSuits = [Suit.HEARTS, Suit.DIAMONDS];

  const card1IsRed = redSuits.includes(card1.suit);
  const card2IsRed = redSuits.includes(card2.suit);

  return card1IsRed !== card2IsRed;
};

const isDescending = (topCard: Card, bottomCard: Card): boolean => {
  return topCard.rank === bottomCard.rank - 1;
};

const canPlaceCard = (cardToPlace: Card, targetCard: Card | null): boolean => {
  // Empty column - only Kings allowed
  if (!targetCard) {
    return cardToPlace.rank === Rank.KING;
  }

  // Must be descending sequence with alternating colors
  return (
    isDescending(cardToPlace, targetCard) &&
    isOppositeColor(cardToPlace, targetCard)
  );
};

const isValidMove = (
  cards: Card[],
  targetColumn: Card[]
): MoveValidationResult => {
  if (cards.length === 0) {
    return { isValid: false, reason: 'No cards to move' };
  }

  const cardToPlace = cards[0];
  const targetCard =
    targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null;

  // Check if we can place the first card
  if (!canPlaceCard(cardToPlace, targetCard)) {
    if (!targetCard && cardToPlace.rank !== Rank.KING) {
      return {
        isValid: false,
        reason: 'Only Kings can be placed on empty columns',
        errorCode: 'EMPTY_COLUMN_KING_ONLY',
      };
    }

    if (targetCard && !isDescending(cardToPlace, targetCard)) {
      return {
        isValid: false,
        reason: 'Cards must be in descending rank order',
        errorCode: 'NOT_DESCENDING',
      };
    }

    if (targetCard && !isOppositeColor(cardToPlace, targetCard)) {
      return {
        isValid: false,
        reason: 'Cards must alternate colors',
        errorCode: 'WRONG_COLOR',
      };
    }

    return {
      isValid: false,
      reason: 'Invalid move',
      errorCode: 'INVALID_SEQUENCE',
    };
  }

  // For multiple cards, verify they form a valid descending sequence
  if (cards.length > 1) {
    for (let i = 0; i < cards.length - 1; i++) {
      const currentCard = cards[i];
      const nextCard = cards[i + 1];

      if (
        !isDescending(nextCard, currentCard) ||
        !isOppositeColor(currentCard, nextCard)
      ) {
        return {
          isValid: false,
          reason: 'Card sequence is not valid',
          errorCode: 'INVALID_SEQUENCE',
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * TableauColumn Component
 * A functional component that renders a column of cards with cascade effect
 */
export const TableauColumn: FC<TableauColumnProps> = React.memo(
  ({
    cards = [],
    columnIndex,
    canDrop: canDropProp,
    isOver: isOverProp,
    isValidDropTarget,
    isDisabled = false,
    onClick,
    onDoubleClick,
    onKeyDown,
    onMoveCards,
    onReveal,
    'data-testid': dataTestId,
    className,
    style,
  }) => {
    // React DnD drop functionality
    const [{ canDrop, isOver }, drop] = useDrop<
      TableauDropItem,
      TableauDropResult,
      { canDrop: boolean; isOver: boolean }
    >({
      accept: ['card', 'card-stack'],
      canDrop: item => {
        if (isDisabled) return false;

        // Don't allow dropping on the same column
        if (item.sourceColumnIndex === columnIndex) return false;

        const validation = isValidMove(item.cards, cards);
        return validation.isValid;
      },
      drop: item => {
        if (!onMoveCards) {
          return {
            success: false,
            targetColumnIndex: columnIndex,
            targetPosition: { area: GameArea.TABLEAU, index: columnIndex },
          };
        }

        const fromPosition: Position = item.sourcePosition;
        const toPosition: Position = {
          area: GameArea.TABLEAU,
          index: columnIndex,
        };

        onMoveCards(item.cards, fromPosition, toPosition);

        return {
          success: true,
          targetColumnIndex: columnIndex,
          targetPosition: toPosition,
          droppedCards: item.cards,
        };
      },
      collect: monitor => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      }),
    });

    // Calculate cascade positions for cards
    const cascadePositions = useMemo((): CardCascadePosition[] => {
      return cards.map((card, index) => ({
        index,
        offsetY: index * 20,
        zIndex: index + 1,
        isFaceUp: card.faceUp,
        isTopCard: index === cards.length - 1,
        isDraggable: card.faceUp && index >= cards.findIndex(c => c.faceUp),
      }));
    }, [cards]);

    // Handle card click events
    const handleCardClick = useCallback(
      (event: MouseEvent<HTMLDivElement>, card: Card, cardIndex: number) => {
        if (isDisabled) return;
        onClick?.(event, card, cardIndex);
      },
      [isDisabled, onClick]
    );

    // Handle card double-click events
    const handleCardDoubleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>, card: Card, cardIndex: number) => {
        if (isDisabled) return;
        onDoubleClick?.(event, card, cardIndex);
      },
      [isDisabled, onDoubleClick]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>, card: Card, cardIndex: number) => {
        if (isDisabled) return;

        // Space or Enter to select/move card
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          handleCardClick(
            event as unknown as MouseEvent<HTMLDivElement>,
            card,
            cardIndex
          );
        }

        onKeyDown?.(event, card, cardIndex);
      },
      [isDisabled, onKeyDown, handleCardClick]
    );

    // Handle card reveal
    const handleReveal = useCallback(
      (card: Card) => {
        if (isDisabled) return;
        onReveal?.(card, columnIndex);
      },
      [isDisabled, onReveal, columnIndex]
    );

    // Determine if column is empty
    const isEmpty = cards.length === 0;

    // Accessibility label
    const ariaLabel = `Tableau column ${columnIndex + 1}${isEmpty ? ' (empty)' : ` with ${cards.length} cards`}`;
    const ariaDescription = isEmpty
      ? 'Empty column. Only Kings can be placed here.'
      : `Column contains ${cards.filter(c => c.faceUp).length} face-up cards and ${cards.filter(c => !c.faceUp).length} face-down cards.`;

    return (
      <TableauColumnContainer
        ref={drop}
        className={className}
        style={style}
        data-testid={dataTestId || `tableau-column-${columnIndex}`}
        canDrop={canDropProp ?? canDrop}
        isOver={isOverProp ?? isOver}
        isValidDropTarget={isValidDropTarget}
        isEmpty={isEmpty}
        tabIndex={0}
        role="region"
        aria-label={ariaLabel}
        aria-describedby={`tableau-column-${columnIndex}-description`}
      >
        <ScreenReaderText id={`tableau-column-${columnIndex}-description`}>
          {ariaDescription}
        </ScreenReaderText>

        <DropZoneIndicator
          isActive={(canDropProp ?? canDrop) && (isOverProp ?? isOver)}
        />

        {isEmpty ? (
          <EmptySlot
            role="button"
            tabIndex={0}
            aria-label="Empty tableau column. Only Kings can be placed here."
            onKeyDown={e => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                // Focus management for keyboard users
                e.currentTarget.focus();
              }
            }}
          />
        ) : (
          <CardStack>
            {cards.map((card, index) => {
              const position = cascadePositions[index];

              return (
                <CardSlot
                  key={card.id}
                  cascadeIndex={index}
                  isFaceUp={position.isFaceUp}
                  isDraggable={position.isDraggable}
                  isTopCard={position.isTopCard}
                  tabIndex={position.isDraggable ? 0 : -1}
                  role="button"
                  aria-label={
                    position.isFaceUp
                      ? `${card.rank} of ${card.suit}`
                      : 'Face-down card'
                  }
                  aria-describedby={`card-${card.id}-description`}
                  onKeyDown={e => handleKeyDown(e, card, index)}
                >
                  <ScreenReaderText id={`card-${card.id}-description`}>
                    {position.isFaceUp
                      ? `${card.rank} of ${card.suit}. Position ${index + 1} of ${cards.length} in column ${columnIndex + 1}.`
                      : `Face-down card at position ${index + 1} of ${cards.length} in column ${columnIndex + 1}.`}
                    {position.isDraggable && ' Press space or enter to select.'}
                  </ScreenReaderText>

                  <CardComponent
                    card={card}
                    position={{
                      type: 'tableau',
                      index: columnIndex,
                      stackPosition: index,
                    }}
                    isDraggable={position.isDraggable}
                    scale={position.isTopCard ? 1 : 0.95}
                    zIndex={position.zIndex}
                    onClick={e => handleCardClick(e, card, index)}
                    onDoubleClick={e => handleCardDoubleClick(e, card, index)}
                    data-testid={`tableau-card-${columnIndex}-${index}`}
                  />

                  {!position.isFaceUp && position.isTopCard && (
                    <RevealButton
                      type="button"
                      onClick={() => handleReveal(card)}
                      aria-label={`Reveal face-down card in column ${columnIndex + 1}`}
                      tabIndex={0}
                    >
                      ?
                    </RevealButton>
                  )}
                </CardSlot>
              );
            })}
          </CardStack>
        )}
      </TableauColumnContainer>
    );
  }
);

TableauColumn.displayName = 'TableauColumn';

export default TableauColumn;
