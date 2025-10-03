/**
 * StockPile Component
 *
 * A React component for the stock pile and waste pile in Desktop Solitaire.
 * Supports 1-card/3-card draw modes, drag-and-drop operations, keyboard navigation,
 * and accessibility features. Following TDD principles and constitutional requirements.
 */

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  KeyboardEvent,
  MouseEvent,
} from 'react';
import { useDrag } from 'react-dnd';
import { Card as CardComponent } from '../Card/Card';
import { DrawMode } from '../../types/index';
import { StockPile as StockPileModel } from '../../models/stock-pile';
import {
  StockPileProps,
  StockPileState,
  StockPileAnimation,
  StockPileDragItem,
  defaultStockPileTheme,
  defaultStockPileConfig,
} from './StockPile.types';
import { CardDropResult } from '../Card/Card.types';
import {
  StockPileContainer,
  PileContainer,
  CardStack,
  PilePlaceholder,
  CardCounter,
  DrawModeIndicator,
  PileLabel,
  ResetIndicator,
  AnimationOverlay,
} from './StockPile.styles';

/**
 * Helper function to generate ARIA label for stock pile
 */
const getStockPileAriaLabel = (pile: StockPileModel): string => {
  const stockCount = pile.stock.length;
  const wasteCount = pile.waste.length;
  const drawMode = pile.getDrawMode();
  const topWasteCard = pile.getTopWasteCard();

  if (stockCount === 0 && wasteCount === 0) {
    return 'Stock pile empty, no cards remaining';
  }

  if (stockCount === 0) {
    return `Stock pile empty, ${wasteCount} cards in waste pile, click to reset`;
  }

  let label = `Stock pile with ${stockCount} cards, draw mode ${drawMode} card${drawMode > 1 ? 's' : ''}`;

  if (topWasteCard) {
    const topCardName = `${topWasteCard.rank} of ${topWasteCard.suit}`;
    label += `, waste pile top card: ${topCardName}`;
  } else {
    label += ', waste pile empty';
  }

  label += ', click to draw cards or press Enter';

  return label;
};

/**
 * Helper function to generate ARIA label for waste pile
 */
const getWastePileAriaLabel = (pile: StockPileModel): string => {
  const wasteCount = pile.waste.length;
  const topWasteCard = pile.getTopWasteCard();

  if (wasteCount === 0) {
    return 'Waste pile empty';
  }

  if (topWasteCard) {
    const topCardName = `${topWasteCard.rank} of ${topWasteCard.suit}`;
    return `Waste pile with ${wasteCount} cards, top card: ${topCardName}, draggable`;
  }

  return `Waste pile with ${wasteCount} cards`;
};

/**
 * StockPile Component Implementation
 *
 * Features:
 * - Stock pile (face-down cards) with click-to-draw functionality
 * - Waste pile (face-up cards) with drag-and-drop support
 * - 1-card and 3-card draw modes
 * - Auto-reset when stock is empty and waste has cards
 * - Keyboard navigation and accessibility
 * - Visual feedback and animations
 * - Error handling and user feedback
 */
export const StockPile: React.FC<StockPileProps> = React.memo(
  ({
    pile,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    position, // TODO: Use position for enhanced functionality
    isDisabled = false,
    isSelected = false,
    animationsEnabled = true,
    soundEnabled = false,
    onDraw,
    onReset,
    onDrawModeChange,
    onWasteCardRemove,
    onClick,
    onDoubleClick,
    onKeyDown,
    onError,
    'data-testid': testId,
    className,
    style,
    ...props
  }) => {
    // Component state
    const [stockState, setStockState] = useState<StockPileState>({
      isHovered: false,
      isPressed: false,
      canDraw: pile.canDraw(),
      canReset: pile.isStockEmpty() && pile.waste.length > 0,
    });

    const [wasteState] = useState<StockPileState>({
      isHovered: false,
      isPressed: false,
      canDraw: false,
      canReset: false,
    });

    const [currentAnimation, setCurrentAnimation] = useState<
      StockPileAnimation | undefined
    >();

    // Update state when pile changes
    useEffect(() => {
      setStockState(prev => ({
        ...prev,
        canDraw: pile.canDraw(),
        canReset: pile.isStockEmpty() && pile.waste.length > 0,
      }));
    }, [pile]);

    // Get top waste card for display and dragging
    const topWasteCard = pile.getTopWasteCard();

    // Generate ARIA labels
    const stockAriaLabel = useMemo(() => getStockPileAriaLabel(pile), [pile]);
    const wasteAriaLabel = useMemo(() => getWastePileAriaLabel(pile), [pile]);

    // React DnD drag configuration for waste pile top card
    const [{ isDragging }, dragRef] = useDrag<
      StockPileDragItem,
      CardDropResult,
      { isDragging: boolean }
    >({
      type: 'card',
      item: () => {
        if (!topWasteCard) return null;

        return {
          type: 'card',
          card: topWasteCard,
          sourcePosition: { type: 'waste' },
          sourceType: 'waste',
          wasteIndex: pile.waste.length - 1,
        };
      },
      end: () => {
        // Card drag ended - this will be handled by the drop target
      },
      canDrag: () => !isDisabled && topWasteCard !== null,
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    });

    // Animation helper
    const playAnimation = useCallback(
      (
        type: StockPileAnimation['type'],
        duration: number = 300,
        onComplete?: () => void
      ) => {
        if (!animationsEnabled) {
          onComplete?.();
          return;
        }

        setCurrentAnimation({
          type,
          duration,
          isPlaying: true,
          onComplete,
        });

        window.setTimeout(() => {
          setCurrentAnimation(undefined);
          onComplete?.();
        }, duration);
      },
      [animationsEnabled]
    );

    // Draw cards from stock to waste pile
    const handleDraw = useCallback(async () => {
      if (isDisabled || !pile.canDraw()) {
        return;
      }

      try {
        playAnimation('draw', 300);

        const cardsDrawn = pile.draw();
        onDraw?.(cardsDrawn, pile);

        // Play sound effect if enabled
        if (soundEnabled) {
          // Sound implementation would go here
        }
      } catch (error) {
        playAnimation('error', 500);
        onError?.(error as Error, 'draw');
      }
    }, [isDisabled, pile, onDraw, onError, playAnimation, soundEnabled]);

    // Reset stock pile (move waste cards back to stock)
    const handleReset = useCallback(async () => {
      if (isDisabled || !stockState.canReset) {
        return;
      }

      try {
        playAnimation('reset', 500);

        pile.reset();
        onReset?.(pile);

        // Play sound effect if enabled
        if (soundEnabled) {
          // Sound implementation would go here
        }
      } catch (error) {
        playAnimation('error', 500);
        onError?.(error as Error, 'reset');
      }
    }, [
      isDisabled,
      stockState.canReset,
      pile,
      onReset,
      onError,
      playAnimation,
      soundEnabled,
    ]);

    // Handle stock pile click
    const handleStockClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        setStockState(prev => ({ ...prev, isPressed: true }));
        window.setTimeout(
          () => setStockState(prev => ({ ...prev, isPressed: false })),
          150
        );

        const action = stockState.canDraw
          ? 'draw'
          : stockState.canReset
            ? 'reset'
            : 'draw';
        onClick?.(event, pile, action);

        if (stockState.canDraw) {
          handleDraw();
        } else if (stockState.canReset) {
          handleReset();
        }
      },
      [isDisabled, stockState, onClick, pile, handleDraw, handleReset]
    );

    // Handle waste pile click
    const handleWasteClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled || !topWasteCard) return;
        // Waste pile clicks might trigger card selection for keyboard users
        onClick?.(event, pile, 'draw'); // Using 'draw' as placeholder action
      },
      [isDisabled, topWasteCard, onClick, pile]
    );

    // Handle double-click for quick actions
    const handleDoubleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        onDoubleClick?.(event, pile);

        // Double-click might toggle draw mode
        const newMode =
          pile.getDrawMode() === DrawMode.ONE ? DrawMode.THREE : DrawMode.ONE;
        pile.setDrawMode(newMode);
        onDrawModeChange?.(newMode, pile);
      },
      [isDisabled, onDoubleClick, pile, onDrawModeChange]
    );

    // Keyboard event handler
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        // Handle Enter and Space as click
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (stockState.canDraw) {
            handleDraw();
          } else if (stockState.canReset) {
            handleReset();
          }
        }

        // Handle number keys for draw mode
        if (event.key === '1') {
          event.preventDefault();
          pile.setDrawMode(DrawMode.ONE);
          onDrawModeChange?.(DrawMode.ONE, pile);
        } else if (event.key === '3') {
          event.preventDefault();
          pile.setDrawMode(DrawMode.THREE);
          onDrawModeChange?.(DrawMode.THREE, pile);
        }

        // Handle R key for reset
        if (event.key === 'r' || event.key === 'R') {
          event.preventDefault();
          if (stockState.canReset) {
            handleReset();
          }
        }

        onKeyDown?.(event, pile);
      },
      [
        isDisabled,
        stockState,
        handleDraw,
        handleReset,
        pile,
        onDrawModeChange,
        onKeyDown,
      ]
    );

    // Remove top waste card (called when card is dragged)
    const handleWasteCardRemove = useCallback(() => {
      if (!topWasteCard) return;

      const removedCard = pile.removeTopWasteCard();
      if (removedCard) {
        onWasteCardRemove?.(removedCard, pile);
      }
    }, [topWasteCard, pile, onWasteCardRemove]);

    // Render stock pile (face-down cards)
    const renderStockPile = () => {
      const hasCards = pile.stock.length > 0;
      const canInteract = hasCards || stockState.canReset;

      return (
        <PileContainer
          theme={defaultStockPileTheme}
          pileType="stock"
          state={{ ...stockState, animation: currentAnimation }}
          onClick={canInteract ? handleStockClick : undefined}
          onDoubleClick={canInteract ? handleDoubleClick : undefined}
          onKeyDown={handleKeyDown}
          tabIndex={isDisabled ? -1 : 0}
          role="button"
          aria-label={stockAriaLabel}
          aria-pressed={stockState.isPressed}
          aria-disabled={isDisabled || !canInteract}
          data-testid={`${testId || 'stock-pile'}-stock`}
        >
          <CardStack>
            {hasCards ? (
              // Show back of cards in stack
              <>
                <CardComponent
                  card={{
                    ...pile.stock[pile.stock.length - 1],
                    isVisible: false,
                  }}
                  position={{ type: 'stock' }}
                  isDraggable={false}
                  scale={0.9}
                  zIndex={3}
                />
                {pile.stock.length > 1 && (
                  <CardComponent
                    card={{
                      ...pile.stock[pile.stock.length - 2],
                      isVisible: false,
                    }}
                    position={{ type: 'stock' }}
                    isDraggable={false}
                    scale={0.9}
                    zIndex={2}
                  />
                )}
                {pile.stock.length > 2 && (
                  <CardComponent
                    card={{
                      ...pile.stock[pile.stock.length - 3],
                      isVisible: false,
                    }}
                    position={{ type: 'stock' }}
                    isDraggable={false}
                    scale={0.9}
                    zIndex={1}
                  />
                )}
              </>
            ) : (
              <PilePlaceholder theme={defaultStockPileTheme} pileType="stock" />
            )}
          </CardStack>

          {/* Card counter */}
          {defaultStockPileConfig.showCardCount && pile.stock.length > 0 && (
            <CardCounter theme={defaultStockPileTheme}>
              {pile.stock.length}
            </CardCounter>
          )}

          {/* Reset indicator when stock is empty but waste has cards */}
          <ResetIndicator
            theme={defaultStockPileTheme}
            visible={stockState.canReset}
          />

          {/* Animation overlay */}
          <AnimationOverlay
            visible={currentAnimation?.isPlaying || false}
            animationType={currentAnimation?.type || 'draw'}
          />

          <PileLabel theme={defaultStockPileTheme}>Stock</PileLabel>
        </PileContainer>
      );
    };

    // Render waste pile (face-up cards)
    const renderWastePile = () => {
      const hasCards = pile.waste.length > 0;

      return (
        <PileContainer
          ref={hasCards ? dragRef : undefined}
          theme={defaultStockPileTheme}
          pileType="waste"
          state={wasteState}
          onClick={hasCards ? handleWasteClick : undefined}
          tabIndex={isDisabled || !hasCards ? -1 : 0}
          role={hasCards ? 'button' : 'region'}
          aria-label={wasteAriaLabel}
          aria-disabled={isDisabled || !hasCards}
          data-testid={`${testId || 'stock-pile'}-waste`}
        >
          <CardStack>
            {hasCards && topWasteCard ? (
              // Show top 1-3 cards in waste pile
              <>
                <CardComponent
                  card={topWasteCard}
                  position={{ type: 'waste' }}
                  isDraggable={!isDisabled}
                  isDragging={isDragging}
                  scale={0.9}
                  zIndex={3}
                  onDragEnd={handleWasteCardRemove}
                />
                {pile.waste.length > 1 && (
                  <CardComponent
                    card={pile.waste[pile.waste.length - 2]}
                    position={{ type: 'waste' }}
                    isDraggable={false}
                    scale={0.9}
                    zIndex={2}
                  />
                )}
                {pile.waste.length > 2 && (
                  <CardComponent
                    card={pile.waste[pile.waste.length - 3]}
                    position={{ type: 'waste' }}
                    isDraggable={false}
                    scale={0.9}
                    zIndex={1}
                  />
                )}
              </>
            ) : (
              <PilePlaceholder theme={defaultStockPileTheme} pileType="waste" />
            )}
          </CardStack>

          <PileLabel theme={defaultStockPileTheme}>Waste</PileLabel>
        </PileContainer>
      );
    };

    return (
      <StockPileContainer
        theme={defaultStockPileTheme}
        isDisabled={isDisabled}
        isSelected={isSelected}
        data-testid={testId || 'stock-pile'}
        className={className}
        style={style}
        {...props}
      >
        {renderStockPile()}
        {renderWastePile()}

        {/* Draw mode indicator */}
        {defaultStockPileConfig.showDrawMode && (
          <DrawModeIndicator
            theme={defaultStockPileTheme}
            mode={pile.getDrawMode()}
          />
        )}
      </StockPileContainer>
    );
  }
);

// Display name for debugging
StockPile.displayName = 'StockPile';

export default StockPile;
