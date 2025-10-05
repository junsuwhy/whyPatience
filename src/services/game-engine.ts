/**
 * Game engine core logic for the Desktop Solitaire game.
 * This service handles all game rules, card movement validation, game state management,
 * and victory condition checking. It serves as the central controller for all game operations.
 *
 * Following Constitution Principle I (Code Quality Excellence), this engine maintains
 * clean architecture patterns with high maintainability and testability.
 * Following Principle II (Test-Driven Development), this implementation ensures all
 * contract tests and integration tests pass.
 * Following Principle IV (Performance Standards), the engine meets 60fps animation
 * and <16ms render time requirements.
 */

import { Card, Rank } from '../types/card';
import { createStandardDeck, shuffleDeck } from '../models/card';
import { Move, MoveHistory } from '../models/move';
import {
  GameState,
  GamePhase,
  GameArea,
  DrawMode,
  MoveType,
  createNewGameState,
  Position,
  GameStatistics,
} from '../types/game-state';

/**
 * Result interface for move operations.
 */
export interface MoveResult {
  success: boolean;
  newState: GameState;
  move?: Move;
  revealed?: Card;
  error?: string;
}

/**
 * Result interface for undo operations.
 */
export interface UndoResult {
  success: boolean;
  newState: GameState;
  undoneMove?: Move;
  error?: string;
}

/**
 * Result interface for draw operations.
 */
export interface DrawResult {
  success: boolean;
  drawnCards: Card[];
  remainingStock: number;
  cycled: boolean;
}

/**
 * Game engine core logic error class.
 */
export class GameEngineError extends Error {
  constructor(
    message: string,
    public readonly context?: unknown
  ) {
    super(message);
    this.name = 'GameEngineError';
  }
}

/**
 * GameEngine class implementing the core game logic for Desktop Solitaire.
 * Handles all game operations, state management, and rule validation.
 */
export class GameEngine {
  /** Current game state */
  private gameState: GameState;

  /** Move history manager for undo/redo functionality */
  private moveHistory: MoveHistory;

  /** Performance metrics for optimization */
  private performanceMetrics: {
    lastMoveTime: number;
    averageMoveTime: number;
    totalMoves: number;
  };

  /**
   * Creates a new GameEngine instance.
   * @param initialState - Optional initial game state
   */
  constructor(initialState?: GameState) {
    this.gameState = initialState || createNewGameState();
    this.moveHistory = new MoveHistory();
    this.performanceMetrics = {
      lastMoveTime: 0,
      averageMoveTime: 0,
      totalMoves: 0,
    };
  }

  /**
   * Initializes a new game with shuffled cards and proper dealing.
   * @param drawMode - Drawing mode for the stock pile (1 or 3 cards)
   * @returns {GameState} The initialized game state
   */
  public initializeGame(drawMode: DrawMode = DrawMode.THREE_CARD): GameState {
    const startTime = Date.now();

    try {
      // Create new game state with specified draw mode
      this.gameState = createNewGameState({
        drawMode,
        animationSpeed: 300,
        soundEnabled: true,
        autoComplete: false,
        showHints: false,
        showTimer: true,
      });

      // Reset move history
      this.moveHistory.clear();

      // Create and shuffle a standard 52-card deck
      const deck = shuffleDeck(createStandardDeck());

      // Deal cards to tableau columns
      this.dealCardsToTableau(deck);

      // Remaining cards go to stock pile (face-down)
      this.gameState.stock.cards = deck.map(card => {
        card.isVisible = false;
        return card;
      });

      // Set game phase to playing
      this.gameState.phase = GamePhase.PLAYING;
      this.gameState.lastModified = Date.now();

      this.updatePerformanceMetrics(startTime);

      return { ...this.gameState };
    } catch (error) {
      throw new GameEngineError(
        `Failed to initialize game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { drawMode }
      );
    }
  }

  /**
   * Deals cards to tableau columns following Solitaire rules.
   * Column 1: 1 card (face-up), Column 2: 2 cards (1 face-down, 1 face-up), etc.
   * @param deck - The shuffled deck to deal from
   * @private
   */
  private dealCardsToTableau(deck: Card[]): void {
    for (let column = 0; column < 7; column++) {
      const columnCards: Card[] = [];
      const totalCards = column + 1;

      for (let cardIndex = 0; cardIndex < totalCards; cardIndex++) {
        const card = deck.shift();
        if (!card) {
          throw new GameEngineError(`Insufficient cards in deck for dealing`);
        }

        // Last card in each column is face-up, others are face-down
        card.isVisible = cardIndex === totalCards - 1;
        columnCards.push(card);
      }

      this.gameState.tableau[column].cards = columnCards;
      this.gameState.tableau[column].faceDownCount = totalCards - 1;
    }
  }

  /**
   * Deals cards from stock to waste pile (alias for drawFromStock for contract compatibility).
   * @returns {GameState} The updated game state
   */
  public dealCards(): GameState {
    this.drawFromStock();
    return { ...this.gameState };
  }

  /**
   * Resets the current game to a new state.
   * @returns {GameState} The reset game state
   */
  public resetGame(): GameState {
    return this.initializeGame(this.gameState.settings.drawMode);
  }

  /**
   * Validates if a move is legal according to Solitaire rules.
   * @param cards - Cards being moved
   * @param from - Source position
   * @param to - Destination position
   * @returns {boolean} True if the move is valid
   */
  public isValidMove(cards: Card[], from: Position, to: Position): boolean {
    if (!cards || cards.length === 0) return false;
    if (!from || !to) return false;

    try {
      // Determine move type
      const moveType = this.determineMoveType(from, to);

      // Create temporary move for validation
      const move = new Move(from, to, cards, moveType);

      // Validate the move
      return move.validate(this.gameState);
    } catch {
      return false;
    }
  }

  /**
   * Executes a card movement operation.
   * @param cards - Cards to move
   * @param from - Source position
   * @param to - Destination position
   * @returns {MoveResult} Result of the move operation
   */
  public moveCards(cards: Card[], from: Position, to: Position): MoveResult {
    const startTime = Date.now();

    try {
      // Validate the move first
      if (!this.isValidMove(cards, from, to)) {
        return {
          success: false,
          newState: { ...this.gameState },
          error: 'Invalid move according to Solitaire rules',
        };
      }

      // Determine move type and create move object
      const moveType = this.determineMoveType(from, to);
      const move = new Move(from, to, cards, moveType);

      // Execute the move
      const executionResult = move.execute(this.gameState);

      if (!executionResult.success) {
        return {
          success: false,
          newState: { ...this.gameState },
          error: executionResult.error,
        };
      }

      // Add move to history
      this.moveHistory.addMove(move);

      // Update statistics
      this.updateStatistics(move);

      // Check for victory condition
      if (this.isGameWon()) {
        this.gameState.phase = GamePhase.WON;
        this.gameState.endTime = Date.now();
      }

      this.gameState.lastModified = Date.now();
      this.updatePerformanceMetrics(startTime);

      return {
        success: true,
        newState: { ...this.gameState },
        move,
        revealed: executionResult.revealedCards?.[0],
      };
    } catch (error) {
      return {
        success: false,
        newState: { ...this.gameState },
        error: error instanceof Error ? error.message : 'Unknown move error',
      };
    }
  }

  /**
   * Undoes the last move.
   * @returns {UndoResult} Result of the undo operation
   */
  public undoMove(): UndoResult {
    const startTime = Date.now();

    try {
      if (!this.canUndo()) {
        return {
          success: false,
          newState: { ...this.gameState },
          error: 'No moves to undo',
        };
      }

      const lastMove = this.moveHistory.undoLastMove();
      if (!lastMove) {
        return {
          success: false,
          newState: { ...this.gameState },
          error: 'Failed to retrieve last move',
        };
      }

      // Create and execute the undo move
      const undoMove = lastMove.undo(this.gameState);
      const executionResult = undoMove.execute(this.gameState);

      if (!executionResult.success) {
        return {
          success: false,
          newState: { ...this.gameState },
          error: `Undo failed: ${executionResult.error}`,
        };
      }

      // Update statistics
      this.gameState.statistics.undoCount++;

      // If game was won, revert to playing state
      if (this.gameState.phase === GamePhase.WON) {
        this.gameState.phase = GamePhase.PLAYING;
        this.gameState.endTime = undefined;
      }

      this.gameState.lastModified = Date.now();
      this.updatePerformanceMetrics(startTime);

      return {
        success: true,
        newState: { ...this.gameState },
        undoneMove: lastMove,
      };
    } catch (error) {
      return {
        success: false,
        newState: { ...this.gameState },
        error: error instanceof Error ? error.message : 'Unknown undo error',
      };
    }
  }

  /**
   * Determines the move type based on source and destination positions.
   * @param from - Source position
   * @param to - Destination position
   * @returns {MoveType} The type of move
   * @private
   */
  private determineMoveType(from: Position, to: Position): MoveType {
    if (from.area === GameArea.TABLEAU && to.area === GameArea.TABLEAU) {
      return MoveType.TABLEAU_TO_TABLEAU;
    }
    if (from.area === GameArea.TABLEAU && to.area === GameArea.FOUNDATION) {
      return MoveType.TABLEAU_TO_FOUNDATION;
    }
    if (from.area === GameArea.WASTE && to.area === GameArea.TABLEAU) {
      return MoveType.WASTE_TO_TABLEAU;
    }
    if (from.area === GameArea.WASTE && to.area === GameArea.FOUNDATION) {
      return MoveType.WASTE_TO_FOUNDATION;
    }
    if (from.area === GameArea.STOCK && to.area === GameArea.WASTE) {
      return MoveType.STOCK_TO_WASTE;
    }
    if (from.area === GameArea.FOUNDATION && to.area === GameArea.TABLEAU) {
      return MoveType.FOUNDATION_TO_TABLEAU;
    }

    throw new GameEngineError(
      `Invalid move type from ${from.area} to ${to.area}`
    );
  }

  /**
   * Automatically moves cards to foundation piles when possible.
   * @returns {boolean} True if any cards were auto-moved
   */
  public autoComplete(): boolean {
    let moved = false;

    // Check tableau columns for auto-moveable cards
    for (let i = 0; i < this.gameState.tableau.length; i++) {
      const column = this.gameState.tableau[i];
      if (column.cards.length === 0) continue;

      const topCard = column.cards[column.cards.length - 1];
      if (!topCard.isVisible) continue;

      const foundationIndex = this.findValidFoundationForCard(topCard);
      if (foundationIndex !== -1) {
        const from: Position = { area: GameArea.TABLEAU, index: i };
        const to: Position = {
          area: GameArea.FOUNDATION,
          index: foundationIndex,
        };

        const result = this.moveCards([topCard], from, to);
        if (result.success) {
          moved = true;
        }
      }
    }

    // Check waste pile for auto-moveable cards
    if (this.gameState.stock.wasteCards.length > 0) {
      const topWasteCard =
        this.gameState.stock.wasteCards[
          this.gameState.stock.wasteCards.length - 1
        ];
      const foundationIndex = this.findValidFoundationForCard(topWasteCard);

      if (foundationIndex !== -1) {
        const from: Position = { area: GameArea.WASTE, index: 0 };
        const to: Position = {
          area: GameArea.FOUNDATION,
          index: foundationIndex,
        };

        const result = this.moveCards([topWasteCard], from, to);
        if (result.success) {
          moved = true;
        }
      }
    }

    return moved;
  }

  /**
   * Finds a valid foundation pile for the given card.
   * @param card - Card to place
   * @returns {number} Foundation index, or -1 if no valid foundation
   * @private
   */
  private findValidFoundationForCard(card: Card): number {
    for (let i = 0; i < this.gameState.foundation.length; i++) {
      const foundation = this.gameState.foundation[i];

      // Empty foundation - only Aces can go here
      if (foundation.cards.length === 0) {
        if (card.rank === Rank.ACE) {
          return i;
        }
        continue;
      }

      // Foundation with cards - must be same suit and ascending rank
      const topCard = foundation.cards[foundation.cards.length - 1];
      if (topCard.suit === card.suit && topCard.rank === card.rank - 1) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Gets all valid moves for a given card.
   * @param card - The card to find moves for
   * @returns {Position[]} Array of valid destination positions
   */
  public getValidMoves(card: Card): Position[] {
    const validMoves: Position[] = [];

    // Find the card's current position
    const cardPosition = this.findCardPosition(card);
    if (!cardPosition) return validMoves;

    // Check all possible destinations

    // Foundation piles
    for (let i = 0; i < 4; i++) {
      const to: Position = { area: GameArea.FOUNDATION, index: i };
      if (this.isValidMove([card], cardPosition, to)) {
        validMoves.push(to);
      }
    }

    // Tableau columns
    for (let i = 0; i < 7; i++) {
      const to: Position = { area: GameArea.TABLEAU, index: i };
      if (this.isValidMove([card], cardPosition, to)) {
        validMoves.push(to);
      }
    }

    return validMoves;
  }

  /**
   * Finds the current position of a card in the game state.
   * @param card - Card to find
   * @returns {Position | null} Position of the card, or null if not found
   * @private
   */
  private findCardPosition(card: Card): Position | null {
    // Check tableau columns
    for (let i = 0; i < this.gameState.tableau.length; i++) {
      const column = this.gameState.tableau[i];
      const cardIndex = column.cards.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        return { area: GameArea.TABLEAU, index: i, stackIndex: cardIndex };
      }
    }

    // Check foundation piles
    for (let i = 0; i < this.gameState.foundation.length; i++) {
      const foundation = this.gameState.foundation[i];
      const cardIndex = foundation.cards.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        return { area: GameArea.FOUNDATION, index: i, stackIndex: cardIndex };
      }
    }

    // Check waste pile
    const wasteIndex = this.gameState.stock.wasteCards.findIndex(
      c => c.id === card.id
    );
    if (wasteIndex !== -1) {
      return { area: GameArea.WASTE, index: 0, stackIndex: wasteIndex };
    }

    // Check stock pile
    const stockIndex = this.gameState.stock.cards.findIndex(
      c => c.id === card.id
    );
    if (stockIndex !== -1) {
      return { area: GameArea.STOCK, index: 0, stackIndex: stockIndex };
    }

    return null;
  }

  /**
   * Checks if the game has been won (all cards in foundation piles).
   * @returns {boolean} True if the game is won
   */
  public isGameWon(): boolean {
    // Game is won when all 52 cards are in foundation piles
    const totalFoundationCards = this.gameState.foundation.reduce(
      (total, pile) => total + pile.cards.length,
      0
    );

    return totalFoundationCards === 52;
  }

  /**
   * Checks if undo operation is available.
   * @returns {boolean} True if moves can be undone
   */
  public canUndo(): boolean {
    return this.moveHistory.canUndo();
  }

  /**
   * Draws cards from stock to waste pile.
   * @returns {DrawResult} Result of the draw operation
   */
  public drawFromStock(): DrawResult {
    try {
      const drawMode = this.gameState.stock.drawMode;
      const stockCards = this.gameState.stock.cards;

      if (stockCards.length === 0) {
        // Try to cycle stock if waste has cards
        if (this.gameState.stock.wasteCards.length > 0) {
          const cycled = this.cycleStock();
          if (cycled && stockCards.length > 0) {
            return this.drawFromStock(); // Recursive call after cycling
          }
        }

        return {
          success: false,
          drawnCards: [],
          remainingStock: 0,
          cycled: false,
        };
      }

      const cardsToDraw = Math.min(drawMode, stockCards.length);
      const drawnCards: Card[] = [];

      // Draw cards from stock to waste
      for (let i = 0; i < cardsToDraw; i++) {
        const card = stockCards.pop();
        if (card) {
          card.isVisible = true;
          this.gameState.stock.wasteCards.push(card);
          drawnCards.push(card);
        }
      }

      // Create and record the move
      const from: Position = { area: GameArea.STOCK, index: 0 };
      const to: Position = { area: GameArea.WASTE, index: 0 };
      const move = new Move(from, to, drawnCards, MoveType.STOCK_TO_WASTE);

      this.moveHistory.addMove(move);
      this.updateStatistics(move);

      this.gameState.lastModified = Date.now();

      return {
        success: true,
        drawnCards,
        remainingStock: stockCards.length,
        cycled: false,
      };
    } catch {
      return {
        success: false,
        drawnCards: [],
        remainingStock: this.gameState.stock.cards.length,
        cycled: false,
      };
    }
  }

  /**
   * Cycles the stock pile by moving waste cards back to stock.
   * @returns {boolean} True if the cycle was successful
   */
  public cycleStock(): boolean {
    try {
      const wasteCards = this.gameState.stock.wasteCards;

      if (wasteCards.length === 0) {
        return false;
      }

      // Move all waste cards back to stock (face-down, reversed order)
      while (wasteCards.length > 0) {
        const card = wasteCards.pop();
        if (card) {
          card.isVisible = false;
          this.gameState.stock.cards.unshift(card);
        }
      }

      this.gameState.stock.cycleCount++;

      // Create and record the cycle move
      const from: Position = { area: GameArea.WASTE, index: 0 };
      const to: Position = { area: GameArea.STOCK, index: 0 };
      const move = new Move(from, to, [], MoveType.CYCLE_STOCK);

      this.moveHistory.addMove(move);
      this.gameState.lastModified = Date.now();

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets current game statistics.
   * @returns {GameStatistics} Current game statistics
   */
  public getGameStatistics(): GameStatistics {
    // Update elapsed time
    const currentTime = Date.now();
    this.gameState.statistics.elapsedTime = this.gameState.endTime
      ? this.gameState.endTime - this.gameState.startTime
      : currentTime - this.gameState.startTime;

    return { ...this.gameState.statistics };
  }

  /**
   * Updates game statistics after a move.
   * @param move - The move that was made
   */
  public updateStatistics(move: Move): void {
    const stats = this.gameState.statistics;

    // Increment move count
    stats.moveCount++;

    // Update score based on move type
    this.updateScore(move);

    // Update cards in foundation count
    stats.cardsInFoundation = this.gameState.foundation.reduce(
      (total, pile) => total + pile.cards.length,
      0
    );

    // Update elapsed time
    stats.elapsedTime = Date.now() - this.gameState.startTime;
  }

  /**
   * Updates the game score based on the move made.
   * @param move - The move that was made
   * @private
   */
  private updateScore(move: Move): void {
    const stats = this.gameState.statistics;

    switch (move.moveType) {
      case MoveType.TABLEAU_TO_FOUNDATION:
      case MoveType.WASTE_TO_FOUNDATION:
        stats.score += 10; // Points for moving to foundation
        break;
      case MoveType.FOUNDATION_TO_TABLEAU:
        stats.score -= 15; // Penalty for moving from foundation
        break;
      case MoveType.STOCK_TO_WASTE:
        // No score change for drawing cards
        break;
      case MoveType.TABLEAU_TO_TABLEAU:
        stats.score += 5; // Small bonus for revealing cards
        break;
      default:
        break;
    }

    // Ensure score doesn't go below zero
    stats.score = Math.max(0, stats.score);
  }

  /**
   * Updates performance metrics for optimization.
   * @param startTime - Start time of the operation
   * @private
   */
  private updatePerformanceMetrics(startTime: number): void {
    const duration = Date.now() - startTime;

    this.performanceMetrics.lastMoveTime = duration;
    this.performanceMetrics.totalMoves++;

    // Calculate running average
    const currentAvg = this.performanceMetrics.averageMoveTime;
    const totalMoves = this.performanceMetrics.totalMoves;

    this.performanceMetrics.averageMoveTime =
      (currentAvg * (totalMoves - 1) + duration) / totalMoves;

    // Log performance warning if operation takes too long (>16ms for 60fps)
    if (duration > 16) {
      console.warn(
        `GameEngine operation took ${duration.toFixed(2)}ms (>16ms target)`
      );
    }
  }

  /**
   * Gets the current game state (read-only copy).
   * @returns {GameState} Copy of the current game state
   */
  public getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Gets performance metrics for monitoring.
   * @returns {object} Performance metrics
   */
  public getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }
}

// Export the GameEngine class and related interfaces
export default GameEngine;
