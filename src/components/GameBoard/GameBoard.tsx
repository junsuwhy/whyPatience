/**
 * GameBoard Component
 *
 * Main game board component that integrates all game areas and manages the overall
 * solitaire game layout. Supports drag-and-drop, keyboard navigation, accessibility,
 * and responsive design. Following constitutional requirements for code quality,
 * TDD, user experience consistency, and performance standards.
 */

import React, {
  useEffect,
  useCallback,
  useRef,
  KeyboardEvent,
  useState,
  useMemo,
} from 'react';

// Import components
import { FoundationPile } from '../FoundationPile';
import { TableauColumn } from '../TableauColumn';
import { StockPile } from '../StockPile';
import { GameControls } from '../GameControls';
import { EnhancedGameStatistics as GameStatistics } from '../GameStatistics/GameStatistics';

// Import hooks
import { useGameState } from '../../hooks/useGameState';
import { useFocusNavigation } from '../../hooks/useFocusNavigation';

// Import types and models
import { GameState, GameArea, Position } from '../../types/game-state';
import { Card } from '../../types/card';
import { MoveResult } from '../../services/game-engine';
import { FoundationPile as FoundationPileModel } from '../../models/foundation-pile';
import { TableauColumn as TableauColumnModel } from '../../models/tableau-column';
import { StockPile as StockPileModel } from '../../models/stock-pile';
import { Card as CardModel } from '../../models/card';

// Import styled components
import {
  GameBoardContainer,
  GameBoardContent,
  FoundationArea,
  TableauArea,
  StockArea,
  ControlsArea,
  StatisticsArea,
  VictoryOverlay,
  VictoryMessage,
  GameMessage,
  FocusManager,
} from './GameBoard.styles';

/**
 * Props interface for GameBoard component
 */
export interface GameBoardProps {
  /** Initial game state (optional) */
  initialGameState?: GameState;

  /** Whether the game is disabled */
  isDisabled?: boolean;

  /** Whether animations are enabled */
  animationsEnabled?: boolean;

  /** Whether sound effects are enabled */
  soundEnabled?: boolean;

  /** Callback when game state changes */
  onGameStateChange?: (gameState: GameState) => void;

  /** Callback when a move is made */
  onMove?: (moveResult: MoveResult) => void;

  /** Callback when game is won */
  onGameWon?: (gameState: GameState) => void;

  /** Callback when new game is started */
  onNewGame?: (gameState: GameState) => void;

  /** Callback for error handling */
  onError?: (error: Error, context?: string) => void;

  /** Test ID for testing */
  'data-testid'?: string;

  /** Additional CSS class names */
  className?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * GameBoard Component Implementation
 *
 * Features:
 * - Complete solitaire game layout with all game areas
 * - React DnD integration for drag-and-drop functionality
 * - Game state management with GameEngine
 * - Keyboard navigation and accessibility support
 * - Victory condition detection and celebration
 * - Responsive design with styled-components
 * - Performance optimized with React.memo and useMemo
 */
export const GameBoard: React.FC<GameBoardProps> = React.memo(
  ({
    initialGameState,
    isDisabled = false,
    animationsEnabled = true,
    soundEnabled = false,
    onGameStateChange,
    onMove,
    onGameWon,
    onNewGame,
    onError,
    'data-testid': testId,
    className,
    style,
  }) => {
    // Use the useGameState hook for state management
    const {
      gameState,
      canUndo,
      canRedo,
      isWon,
      isPaused,
      isPlaying,
      newGame,
      executeMove,
      undo,
      redo,
      pauseGame,
      resumeGame,
      statistics,
      error,
      clearError,
      isLoading,
    } = useGameState(initialGameState?.settings);

    // Component local state
    const [gameMessage, setGameMessage] = useState<string>('');

    // Initialize focus navigation
    const {
      focusedElement,
      selectedCard,
      ariaLiveMessage,
      setSelectedCard,
      setFocusedElement,
      mainContainerProps,
      getElementProps,
      ariaLiveProps,
    } = useFocusNavigation(gameState, {
      announceNavigation: true,
      announceActions: true,
      enableHints: true,
      enableAutoMove: true,
    });

    // Refs for focus management
    const gameBoardRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);

    // Check if game is won
    const isGameWon = isWon;

    // Convert plain state objects to model instances for components
    const foundationPileModels = useMemo(() => {
      return gameState.foundation.map(foundationState => {
        const cards = foundationState.cards.map(card =>
          CardModel.fromJSON(card)
        );
        return new FoundationPileModel(
          foundationState.suit || undefined,
          cards
        );
      });
    }, [gameState.foundation]);

    // TODO: Use tableauColumnModels for enhanced functionality
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tableauColumnModels = useMemo(() => {
      return gameState.tableau.map(tableauState => {
        const cards = tableauState.cards.map(card => CardModel.fromJSON(card));
        return new TableauColumnModel(
          tableauState.id,
          cards,
          tableauState.faceDownCount
        );
      });
    }, [gameState.tableau]);

    const stockPileModel = useMemo(() => {
      const stockCards = gameState.stock.cards.map(card =>
        CardModel.fromJSON(card)
      );
      const pile = new StockPileModel(stockCards, gameState.stock.drawMode);
      // Set waste cards if they exist
      if (gameState.stock.wasteCards && gameState.stock.wasteCards.length > 0) {
        const wasteCards = gameState.stock.wasteCards.map(card =>
          CardModel.fromJSON(card)
        );
        pile.waste = wasteCards;
      }
      return pile;
    }, [gameState.stock]);

    /**
     * Handles card movement between different game areas
     */
    const handleCardMove = useCallback(
      async (cards: Card[], from: Position, to: Position) => {
        if (isDisabled || isGameWon) return;

        try {
          const success = await executeMove(from, to, cards);

          if (success) {
            onMove?.({ success: true, newState: gameState, move: undefined });
            setGameMessage('');
            setSelectedCard(null);
          } else {
            const errorMessage = error || 'Invalid move';
            setGameMessage(errorMessage);
            onError?.(new Error(errorMessage), 'card_move');
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          setGameMessage(errorMessage);
          onError?.(err as Error, 'card_move');
        }
      },
      [isDisabled, isGameWon, executeMove, gameState, onMove, onError, error]
    );

    /**
     * Handles stock pile card drawing
     */
    const handleStockDraw = useCallback(async () => {
      if (isDisabled || isGameWon) return;

      try {
        // For stock draw, we need to execute a move from stock to waste
        const from: Position = { area: GameArea.STOCK, index: 0 };
        const to: Position = { area: GameArea.WASTE, index: 0 };

        const success = await executeMove(from, to, []);

        if (success) {
          setGameMessage('');
        } else {
          setGameMessage(error || 'Cannot draw cards');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Draw failed';
        setGameMessage(errorMessage);
        onError?.(err as Error, 'stock_draw');
      }
    }, [isDisabled, isGameWon, executeMove, error, onError]);

    /**
     * Handles undo operation
     */
    const handleUndo = useCallback(async () => {
      if (isDisabled || !canUndo) return;

      try {
        const success = await undo();

        if (success) {
          setGameMessage('Move undone');
          setSelectedCard(null);
        } else {
          setGameMessage(error || 'Cannot undo');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Undo failed';
        setGameMessage(errorMessage);
        onError?.(err as Error, 'undo');
      }
    }, [isDisabled, canUndo, undo, error, onError]);

    /**
     * Handles new game creation
     */
    const handleNewGame = useCallback(() => {
      if (isDisabled) return;

      try {
        newGame();
        onNewGame?.(gameState);
        setGameMessage('New game started');
        setSelectedCard(null);
        setFocusedElement(null);
        clearError();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to start new game';
        setGameMessage(errorMessage);
        onError?.(err as Error, 'new_game');
      }
    }, [isDisabled, newGame, gameState, onNewGame, clearError, onError, setSelectedCard, setFocusedElement]);

    /**
     * Handles game restart
     */
    const handleRestart = useCallback(() => {
      if (isDisabled) return;

      try {
        newGame(); // Use newGame for restart as well
        setGameMessage('Game restarted');
        setSelectedCard(null);
        setFocusedElement(null);
        clearError();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to restart game';
        setGameMessage(errorMessage);
        onError?.(err as Error, 'restart');
      }
    }, [isDisabled, newGame, clearError, onError, setSelectedCard, setFocusedElement]);

    /**
     * Handles keyboard navigation
     */
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        const { key, ctrlKey, metaKey } = event;
        const isCtrlPressed = ctrlKey || metaKey;

        // Global keyboard shortcuts
        if (isCtrlPressed) {
          switch (key.toLowerCase()) {
            case 'n':
              event.preventDefault();
              handleNewGame();
              break;
            case 'r':
              event.preventDefault();
              handleRestart();
              break;
            case 'z':
              event.preventDefault();
              handleUndo();
              break;
            default:
              break;
          }
          return;
        }

        // Use the focus navigation's keyboard handler
        mainContainerProps.onKeyDown(event);
      },
      [isDisabled, handleNewGame, handleRestart, handleUndo, mainContainerProps]
    );

    /**
     * Clear game message after timeout
     */
    useEffect(() => {
      if (gameMessage) {
        const timer = window.setTimeout(() => setGameMessage(''), 3000);
        return () => window.clearTimeout(timer);
      }
    }, [gameMessage]);

    /**
     * Update error message when error state changes
     */
    useEffect(() => {
      if (error) {
        setGameMessage(error);
      }
    }, [error]);

    /**
     * Notify parent components when game state changes
     */
    useEffect(() => {
      onGameStateChange?.(gameState);

      // Check for victory
      if (isWon && !gameMessage.includes('Congratulations')) {
        onGameWon?.(gameState);
        setGameMessage('Congratulations! You won!');
      }
    }, [gameState, isWon, onGameStateChange, onGameWon, gameMessage]);

    /**
     * Render foundation piles area
     */
    const renderFoundationArea = () => (
      <FoundationArea
        role="region"
        aria-label="Foundation piles"
        id="game-area-foundation"
      >
        {foundationPileModels.map((pile, index) => {
          const elementProps = getElementProps(GameArea.FOUNDATION, index);
          return (
            <FoundationPile
              key={`foundation-${index}`}
              pile={pile}
              position={{ area: GameArea.FOUNDATION, index }}
              index={index}
              isDisabled={isDisabled}
              isSelected={
                focusedElement?.area === GameArea.FOUNDATION &&
                focusedElement.index === index
              }
              onCardAdd={card => {
                const from: Position = { area: GameArea.TABLEAU, index: 0 }; // Simplified
                const to: Position = { area: GameArea.FOUNDATION, index };
                handleCardMove([card], from, to);
              }}
              ref={elementProps.ref}
              onFocus={elementProps.onFocus}
              tabIndex={elementProps.tabIndex}
              role={elementProps.role}
              aria-label={elementProps['aria-label']}
              aria-current={elementProps['aria-current']}
              aria-selected={elementProps['aria-selected']}
              aria-describedby={elementProps['aria-describedby']}
              data-testid={`foundation-pile-${index}`}
            />
          );
        })}
      </FoundationArea>
    );

    /**
     * Render tableau columns area
     */
    const renderTableauArea = () => (
      <TableauArea
        role="region"
        aria-label="Tableau columns"
        id="game-area-tableau"
      >
        {gameState.tableau.map((column, index) => {
          const elementProps = getElementProps(GameArea.TABLEAU, index);
          return (
            <TableauColumn
              key={`tableau-${index}`}
              cards={column.cards}
              columnIndex={index}
              isDisabled={isDisabled}
              onMoveCards={handleCardMove}
              onClick={(event, card) => {
                if (card.isVisible) {
                  setSelectedCard(selectedCard?.id === card.id ? null : card);
                }
              }}
              ref={elementProps.ref}
              onFocus={elementProps.onFocus}
              tabIndex={elementProps.tabIndex}
              role={elementProps.role}
              aria-label={elementProps['aria-label']}
              aria-current={elementProps['aria-current']}
              aria-selected={elementProps['aria-selected']}
              aria-describedby={elementProps['aria-describedby']}
              data-testid={`tableau-column-${index}`}
            />
          );
        })}
      </TableauArea>
    );

    /**
     * Render stock and waste pile area
     */
    const renderStockArea = () => {
      const stockElementProps = getElementProps(GameArea.STOCK, 0);

      return (
        <StockArea
          role="region"
          aria-label="Stock and waste piles"
          id="game-area-stock"
        >
          <StockPile
            pile={stockPileModel}
            position={{ area: GameArea.STOCK, index: 0 }}
            isDisabled={isDisabled}
            animationsEnabled={animationsEnabled}
            soundEnabled={soundEnabled}
            onDraw={handleStockDraw}
            onWasteCardRemove={() => {
              // Card will be moved by drag-and-drop handlers
            }}
            ref={stockElementProps.ref}
            onFocus={stockElementProps.onFocus}
            tabIndex={stockElementProps.tabIndex}
            role={stockElementProps.role}
            aria-label={stockElementProps['aria-label']}
            aria-current={stockElementProps['aria-current']}
            aria-selected={stockElementProps['aria-selected']}
            aria-describedby={stockElementProps['aria-describedby']}
            data-testid="stock-pile"
          />
        </StockArea>
      );
    };

    /**
     * Render game controls area
     */
    const renderControlsArea = () => (
      <ControlsArea>
        <GameControls
          gameState={gameState}
          canUndo={canUndo}
          canRedo={canRedo}
          isPaused={isPaused}
          isLoading={isLoading}
          onNewGame={handleNewGame}
          onRestart={handleRestart}
          onUndo={handleUndo}
          onRedo={async () => await redo()}
          onPause={pauseGame}
          onResume={resumeGame}
          onSettings={() => {}} // To be connected to settings modal
          onStatistics={() => {}} // To be connected to statistics modal
          ref={controlsRef}
          data-testid="game-controls"
        />
      </ControlsArea>
    );

    /**
     * Render game statistics area
     */
    const renderStatisticsArea = () => (
      <StatisticsArea>
        <GameStatistics
          currentStats={statistics}
          overallStats={null} // To be connected to overall statistics
          showRealTimeUpdates={isPlaying}
          isCompact={true}
          data-testid="game-statistics"
        />
      </StatisticsArea>
    );

    /**
     * Render victory overlay when game is won
     */
    const renderVictoryOverlay = () =>
      isGameWon && (
        <VictoryOverlay
          role="dialog"
          aria-modal="true"
          aria-labelledby="victory-message"
        >
          <VictoryMessage id="victory-message">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You completed the game in {statistics.moveCount} moves!</p>
            <p>Time: {Math.floor(statistics.elapsedTime / 1000)} seconds</p>
            <p>Score: {statistics.score}</p>
            <button onClick={handleNewGame} autoFocus>
              Play Again
            </button>
          </VictoryMessage>
        </VictoryOverlay>
      );

    return (
      <GameBoardContainer
        ref={gameBoardRef}
        className={className}
        style={style}
        isDisabled={isDisabled}
        isGameWon={isGameWon}
        onKeyDown={handleKeyDown}
        {...mainContainerProps}
        data-testid={testId || 'game-board'}
      >
        <FocusManager
          id="game-instructions"
          aria-live="polite"
          aria-atomic="true"
        >
          Use arrow keys to navigate, Enter/Space to select, H for hints, A for
          auto-move, Ctrl+N for new game, Ctrl+Z to undo
        </FocusManager>

        {/* ARIA Live Region for game announcements */}
        <div
          {...ariaLiveProps}
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {ariaLiveMessage}
        </div>

        <GameBoardContent>
          {renderFoundationArea()}
          {renderStockArea()}
          {renderTableauArea()}
          {renderControlsArea()}
          {renderStatisticsArea()}
        </GameBoardContent>

        {gameMessage && (
          <GameMessage role="status" aria-live="polite">
            {gameMessage}
          </GameMessage>
        )}

        {renderVictoryOverlay()}
      </GameBoardContainer>
    );
  }
);

// Display name for debugging
GameBoard.displayName = 'GameBoard';

export default GameBoard;
