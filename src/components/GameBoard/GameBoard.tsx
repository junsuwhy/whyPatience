/**
 * GameBoard Component
 *
 * Main game board component that integrates all game areas and manages the overall
 * solitaire game layout. Supports drag-and-drop, keyboard navigation, accessibility,
 * and responsive design. Following constitutional requirements for code quality,
 * TDD, user experience consistency, and performance standards.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  KeyboardEvent,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import components
import { FoundationPile } from '../FoundationPile';
import { TableauColumn } from '../TableauColumn';
import { StockPile } from '../StockPile';
import { GameControls } from '../GameControls';
import { EnhancedGameStatistics as GameStatistics } from '../GameStatistics/GameStatistics';

// Import types and models
import {
  GameState,
  GamePhase,
  GameArea,
  Position,
} from '../../types/game-state';
import { Card } from '../../types/card';
import { GameEngine, MoveResult } from '../../services/game-engine';

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
    // Game engine instance
    const gameEngine = useRef<GameEngine>();

    // Initialize game engine
    if (!gameEngine.current) {
      gameEngine.current = new GameEngine(initialGameState);
      if (!initialGameState) {
        gameEngine.current.initializeGame();
      }
    }

    // Component state
    const [gameState, setGameState] = useState<GameState>(() =>
      gameEngine.current!.getGameState()
    );
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [gameMessage, setGameMessage] = useState<string>('');
    const [focusedElement, setFocusedElement] = useState<{
      area: GameArea;
      index: number;
    } | null>(null);

    // Refs for focus management
    const gameBoardRef = useRef<HTMLDivElement>(null);
    const foundationRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tableauRefs = useRef<(HTMLDivElement | null)[]>([]);
    const stockRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);

    // Memoized game statistics for performance
    const gameStatistics = useMemo(
      () => gameEngine.current!.getGameStatistics(),
      [gameState]
    );

    // Check if game is won
    const isGameWon = gameState.phase === GamePhase.WON;

    // Check if moves can be undone
    const canUndo = gameEngine.current!.canUndo();

    /**
     * Updates the game state and notifies listeners
     */
    const updateGameState = useCallback(
      (newState: GameState) => {
        setGameState(newState);
        onGameStateChange?.(newState);

        // Check for victory
        if (
          newState.phase === GamePhase.WON &&
          gameState.phase !== GamePhase.WON
        ) {
          onGameWon?.(newState);
          setGameMessage('Congratulations! You won!');
        }
      },
      [onGameStateChange, onGameWon, gameState.phase]
    );

    /**
     * Handles card movement between different game areas
     */
    const handleCardMove = useCallback(
      (cards: Card[], from: Position, to: Position) => {
        if (isDisabled || isGameWon) return;

        try {
          const result = gameEngine.current!.moveCards(cards, from, to);

          if (result.success) {
            updateGameState(result.newState);
            onMove?.(result);
            setGameMessage('');
            setSelectedCard(null);
          } else {
            setGameMessage(result.error || 'Invalid move');
            onError?.(new Error(result.error || 'Move failed'), 'card_move');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          setGameMessage(errorMessage);
          onError?.(error as Error, 'card_move');
        }
      },
      [isDisabled, isGameWon, updateGameState, onMove, onError]
    );

    /**
     * Handles stock pile card drawing
     */
    const handleStockDraw = useCallback(() => {
      if (isDisabled || isGameWon) return;

      try {
        const result = gameEngine.current!.drawFromStock();

        if (result.success) {
          const newState = gameEngine.current!.getGameState();
          updateGameState(newState);
          setGameMessage('');
        } else {
          setGameMessage('Cannot draw cards');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Draw failed';
        setGameMessage(errorMessage);
        onError?.(error as Error, 'stock_draw');
      }
    }, [isDisabled, isGameWon, updateGameState, onError]);

    /**
     * Handles undo operation
     */
    const handleUndo = useCallback(() => {
      if (isDisabled || !canUndo) return;

      try {
        const result = gameEngine.current!.undoMove();

        if (result.success) {
          updateGameState(result.newState);
          setGameMessage('Move undone');
          setSelectedCard(null);
        } else {
          setGameMessage(result.error || 'Cannot undo');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Undo failed';
        setGameMessage(errorMessage);
        onError?.(error as Error, 'undo');
      }
    }, [isDisabled, canUndo, updateGameState, onError]);

    /**
     * Handles new game creation
     */
    const handleNewGame = useCallback(() => {
      if (isDisabled) return;

      try {
        const newState = gameEngine.current!.initializeGame(
          gameState.settings.drawMode
        );
        updateGameState(newState);
        onNewGame?.(newState);
        setGameMessage('New game started');
        setSelectedCard(null);
        setFocusedElement(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to start new game';
        setGameMessage(errorMessage);
        onError?.(error as Error, 'new_game');
      }
    }, [
      isDisabled,
      gameState.settings.drawMode,
      updateGameState,
      onNewGame,
      onError,
    ]);

    /**
     * Handles game restart
     */
    const handleRestart = useCallback(() => {
      if (isDisabled) return;

      try {
        const newState = gameEngine.current!.resetGame();
        updateGameState(newState);
        setGameMessage('Game restarted');
        setSelectedCard(null);
        setFocusedElement(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to restart game';
        setGameMessage(errorMessage);
        onError?.(error as Error, 'restart');
      }
    }, [isDisabled, updateGameState, onError]);

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

        // Navigation keys
        switch (key) {
          case 'ArrowUp':
          case 'ArrowDown':
          case 'ArrowLeft':
          case 'ArrowRight':
            event.preventDefault();
            handleFocusNavigation(key);
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            handleFocusedElementAction();
            break;
          case 'Escape':
            setSelectedCard(null);
            setGameMessage('');
            break;
          default:
            break;
        }
      },
      [isDisabled, handleNewGame, handleRestart, handleUndo, handleFocusNavigation, handleFocusedElementAction]
    );

    /**
     * Handles focus navigation with arrow keys
     */
    const handleFocusNavigation = useCallback(
      (key: string) => {
        if (!focusedElement) {
          // Start navigation from first foundation pile
          setFocusedElement({ area: GameArea.FOUNDATION, index: 0 });
          return;
        }

        const { area, index } = focusedElement;
        let newArea = area;
        let newIndex = index;

        switch (key) {
          case 'ArrowRight':
            if (area === GameArea.FOUNDATION && index < 3) {
              newIndex = index + 1;
            } else if (area === GameArea.TABLEAU && index < 6) {
              newIndex = index + 1;
            } else if (area === GameArea.FOUNDATION && index === 3) {
              newArea = GameArea.STOCK;
              newIndex = 0;
            }
            break;
          case 'ArrowLeft':
            if (area === GameArea.FOUNDATION && index > 0) {
              newIndex = index - 1;
            } else if (area === GameArea.TABLEAU && index > 0) {
              newIndex = index - 1;
            } else if (area === GameArea.STOCK) {
              newArea = GameArea.FOUNDATION;
              newIndex = 3;
            }
            break;
          case 'ArrowDown':
            if (area === GameArea.FOUNDATION) {
              newArea = GameArea.TABLEAU;
              newIndex = Math.min(index, 6);
            }
            break;
          case 'ArrowUp':
            if (area === GameArea.TABLEAU) {
              newArea = GameArea.FOUNDATION;
              newIndex = Math.min(index, 3);
            }
            break;
        }

        setFocusedElement({ area: newArea, index: newIndex });

        // Focus the corresponding DOM element
        focusElement(newArea, newIndex);
      },
      [focusedElement]
    );

    /**
     * Focuses the DOM element for the given area and index
     */
    const focusElement = useCallback((area: GameArea, index: number) => {
      switch (area) {
        case GameArea.FOUNDATION:
          foundationRefs.current[index]?.focus();
          break;
        case GameArea.TABLEAU:
          tableauRefs.current[index]?.focus();
          break;
        case GameArea.STOCK:
          stockRef.current?.focus();
          break;
      }
    }, []);

    /**
     * Handles action on focused element (Enter/Space)
     */
    const handleFocusedElementAction = useCallback(() => {
      if (!focusedElement) return;

      const { area, index } = focusedElement;

      if (area === GameArea.STOCK) {
        handleStockDraw();
      } else if (selectedCard) {
        // Try to move selected card to focused position
        const cardPosition = gameEngine
          .current!.getGameState()
          .tableau.concat(gameEngine.current!.getGameState().foundation)
          .find(pile => pile.cards.some(c => c.id === selectedCard.id));

        if (cardPosition) {
          const from: Position = { area: GameArea.TABLEAU, index: 0 }; // Simplified
          const to: Position = { area, index };
          handleCardMove([selectedCard], from, to);
        }
      }
    }, [focusedElement, selectedCard, handleStockDraw, handleCardMove]);

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
     * Update game statistics periodically
     */
    useEffect(() => {
      if (gameState.phase === GamePhase.PLAYING) {
        const interval = window.setInterval(() => {
          const newState = gameEngine.current!.getGameState();
          if (
            newState.statistics.elapsedTime !== gameState.statistics.elapsedTime
          ) {
            setGameState(newState);
          }
        }, 1000);

        return () => window.clearInterval(interval);
      }
    }, [gameState.phase, gameState.statistics.elapsedTime]);

    /**
     * Render foundation piles area
     */
    const renderFoundationArea = () => (
      <FoundationArea role="region" aria-label="Foundation piles">
        {gameState.foundation.map((pile, index) => (
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
            ref={el => (foundationRefs.current[index] = el)}
            data-testid={`foundation-pile-${index}`}
          />
        ))}
      </FoundationArea>
    );

    /**
     * Render tableau columns area
     */
    const renderTableauArea = () => (
      <TableauArea role="region" aria-label="Tableau columns">
        {gameState.tableau.map((column, index) => (
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
            ref={el => (tableauRefs.current[index] = el)}
            data-testid={`tableau-column-${index}`}
          />
        ))}
      </TableauArea>
    );

    /**
     * Render stock and waste pile area
     */
    const renderStockArea = () => (
      <StockArea role="region" aria-label="Stock and waste piles">
        <StockPile
          pile={gameState.stock}
          position={{ area: GameArea.STOCK, index: 0 }}
          isDisabled={isDisabled}
          animationsEnabled={animationsEnabled}
          soundEnabled={soundEnabled}
          onDraw={handleStockDraw}
          onWasteCardRemove={() => {
            // Card will be moved by drag-and-drop handlers
          }}
          ref={stockRef}
          data-testid="stock-pile"
        />
      </StockArea>
    );

    /**
     * Render game controls area
     */
    const renderControlsArea = () => (
      <ControlsArea>
        <GameControls
          gameState={gameState}
          canUndo={canUndo}
          canRedo={false} // Not implemented yet
          isPaused={gameState.phase === GamePhase.PAUSED}
          isLoading={false}
          onNewGame={handleNewGame}
          onRestart={handleRestart}
          onUndo={handleUndo}
          onRedo={() => {}} // Not implemented yet
          onPause={() => {}} // Not implemented yet
          onResume={() => {}} // Not implemented yet
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
          currentStats={gameStatistics}
          overallStats={null} // To be connected to overall statistics
          showRealTimeUpdates={gameState.phase === GamePhase.PLAYING}
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
            <p>You completed the game in {gameStatistics.moveCount} moves!</p>
            <p>Time: {Math.floor(gameStatistics.elapsedTime / 1000)} seconds</p>
            <button onClick={handleNewGame} autoFocus>
              Play Again
            </button>
          </VictoryMessage>
        </VictoryOverlay>
      );

    return (
      <DndProvider backend={HTML5Backend}>
        <GameBoardContainer
          ref={gameBoardRef}
          className={className}
          style={style}
          isDisabled={isDisabled}
          isGameWon={isGameWon}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="application"
          aria-label="Solitaire game board"
          aria-describedby="game-instructions"
          data-testid={testId || 'game-board'}
        >
          <FocusManager
            id="game-instructions"
            aria-live="polite"
            aria-atomic="true"
          >
            Use arrow keys to navigate, Enter/Space to select, Ctrl+N for new
            game, Ctrl+Z to undo
          </FocusManager>

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
      </DndProvider>
    );
  }
);

// Display name for debugging
GameBoard.displayName = 'GameBoard';

export default GameBoard;
