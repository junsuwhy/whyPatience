/**
 * Move model and history management for the Desktop Solitaire game.
 * This module handles recording and managing all card movement operations,
 * supporting undo/redo functionality with complete move history tracking.
 *
 * Following Constitution Principle I (Code Quality Excellence) and II (Test-Driven Development),
 * this model includes comprehensive move validation logic, clear error handling,
 * and corresponding tests must exist before implementation.
 */

import {
  MoveType,
  GameArea,
  Position,
  GameState as GameStateInterface,
} from '../types/game-state';
import { Card } from '../types/card';

/**
 * Move validation error class for handling move-specific errors.
 */
export class MoveError extends Error {
  constructor(
    message: string,
    public readonly moveData?: Partial<Move>
  ) {
    super(message);
    this.name = 'MoveError';
  }
}

/**
 * Move history error class for handling history-specific errors.
 */
export class MoveHistoryError extends Error {
  constructor(
    message: string,
    public readonly historyData?: Partial<MoveHistory>
  ) {
    super(message);
    this.name = 'MoveHistoryError';
  }
}

/**
 * Interface for move execution result.
 */
export interface MoveExecutionResult {
  /** Whether the move was executed successfully */
  success: boolean;
  /** Cards that were revealed as a result of the move */
  revealedCards?: Card[];
  /** Error message if execution failed */
  error?: string;
}

/**
 * Interface for serializable move data.
 */
export interface SerializableMove {
  /** Unique identifier for the move */
  id: string;
  /** Type of move performed */
  moveType: MoveType;
  /** Source position of the move */
  from: Position;
  /** Destination position of the move */
  to: Position;
  /** Cards that were moved */
  cardIds: string[];
  /** Timestamp when the move was made */
  timestamp: number;
  /** Card that was revealed as a result of this move */
  revealedCardId?: string;
}

/**
 * Move class representing a single card movement operation in the Solitaire game.
 * Handles move validation, execution, and undo operations.
 */
export class Move {
  /** Unique identifier for this move */
  public readonly id: string;

  /** Type of move performed */
  public readonly moveType: MoveType;

  /** Source position of the move */
  public readonly from: Position;

  /** Destination position of the move */
  public readonly to: Position;

  /** Cards that were moved */
  public readonly cards: Card[];

  /** Timestamp when the move was made */
  public readonly timestamp: number;

  /** Card that was revealed as a result of this move (if any) */
  public readonly revealedCard?: Card;

  /** Reference to the card ID being moved (primary card) */
  public readonly cardId: string;

  /**
   * Creates a new Move instance.
   * @param from - Source position
   * @param to - Destination position
   * @param cards - Cards being moved
   * @param moveType - Type of move
   * @param revealedCard - Optional card revealed by this move
   * @throws {MoveError} If move parameters are invalid
   */
  constructor(
    from: Position,
    to: Position,
    cards: Card[],
    moveType: MoveType,
    revealedCard?: Card
  ) {
    if (!from || !to) {
      throw new MoveError('From and to positions are required');
    }

    if (!cards || cards.length === 0) {
      throw new MoveError('At least one card is required for a move');
    }

    if (!Object.values(MoveType).includes(moveType)) {
      throw new MoveError(`Invalid move type: ${moveType}`);
    }

    this.id = `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.from = { ...from };
    this.to = { ...to };
    this.cards = [...cards];
    this.moveType = moveType;
    this.timestamp = Date.now();
    this.revealedCard = revealedCard;
    this.cardId = cards[0].id; // Primary card being moved
  }

  /**
   * Validates if this move is legal in the given game state.
   * @param gameState - Current game state to validate against
   * @returns {boolean} True if the move is valid
   * @throws {MoveError} If validation fails due to invalid parameters
   */
  public validate(gameState: GameStateInterface): boolean {
    if (!gameState) {
      throw new MoveError('Game state is required for validation');
    }

    try {
      // Basic position validation
      if (!this.isValidPosition(this.from) || !this.isValidPosition(this.to)) {
        return false;
      }

      // Move type specific validation
      switch (this.moveType) {
        case MoveType.TABLEAU_TO_TABLEAU:
          return this.validateTableauToTableau(gameState);
        case MoveType.TABLEAU_TO_FOUNDATION:
          return this.validateTableauToFoundation(gameState);
        case MoveType.WASTE_TO_TABLEAU:
          return this.validateWasteToTableau(gameState);
        case MoveType.WASTE_TO_FOUNDATION:
          return this.validateWasteToFoundation(gameState);
        case MoveType.STOCK_TO_WASTE:
          return this.validateStockToWaste(gameState);
        case MoveType.FOUNDATION_TO_TABLEAU:
          return this.validateFoundationToTableau(gameState);
        case MoveType.CYCLE_STOCK:
          return this.validateCycleStock(gameState);
        default:
          return false;
      }
    } catch (error) {
      throw new MoveError(
        `Move validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validates if a position is valid for the given game state.
   * @private
   */
  private isValidPosition(position: Position): boolean {
    switch (position.area) {
      case GameArea.TABLEAU:
        return position.index >= 0 && position.index < 7;
      case GameArea.FOUNDATION:
        return position.index >= 0 && position.index < 4;
      case GameArea.STOCK:
      case GameArea.WASTE:
        return position.index === 0 || position.index === undefined;
      default:
        return false;
    }
  }

  /**
   * Validates tableau to tableau move.
   * @private
   */
  private validateTableauToTableau(gameState: GameStateInterface): boolean {
    if (
      this.from.area !== GameArea.TABLEAU ||
      this.to.area !== GameArea.TABLEAU
    ) {
      return false;
    }

    const sourceColumn = gameState.tableau[this.from.index];
    const targetColumn = gameState.tableau[this.to.index];

    if (!sourceColumn || !targetColumn) {
      return false;
    }

    // Can't move to the same column
    if (this.from.index === this.to.index) {
      return false;
    }

    // Validate card sequence and placement rules
    return (
      this.validateCardSequence() && this.validateTableauPlacement(targetColumn)
    );
  }

  /**
   * Validates tableau to foundation move.
   * @private
   */
  private validateTableauToFoundation(gameState: GameStateInterface): boolean {
    if (
      this.from.area !== GameArea.TABLEAU ||
      this.to.area !== GameArea.FOUNDATION
    ) {
      return false;
    }

    // Only single cards can move to foundation
    if (this.cards.length !== 1) {
      return false;
    }

    const targetPile = gameState.foundation[this.to.index];
    if (!targetPile) {
      return false;
    }

    return this.validateFoundationPlacement(targetPile);
  }

  /**
   * Validates waste to tableau move.
   * @private
   */
  private validateWasteToTableau(gameState: GameStateInterface): boolean {
    if (
      this.from.area !== GameArea.WASTE ||
      this.to.area !== GameArea.TABLEAU
    ) {
      return false;
    }

    // Only single cards from waste
    if (this.cards.length !== 1) {
      return false;
    }

    const targetColumn = gameState.tableau[this.to.index];
    return targetColumn ? this.validateTableauPlacement(targetColumn) : false;
  }

  /**
   * Validates waste to foundation move.
   * @private
   */
  private validateWasteToFoundation(gameState: GameStateInterface): boolean {
    if (
      this.from.area !== GameArea.WASTE ||
      this.to.area !== GameArea.FOUNDATION
    ) {
      return false;
    }

    // Only single cards from waste
    if (this.cards.length !== 1) {
      return false;
    }

    const targetPile = gameState.foundation[this.to.index];
    return targetPile ? this.validateFoundationPlacement(targetPile) : false;
  }

  /**
   * Validates stock to waste move.
   * @private
   */
  private validateStockToWaste(gameState: GameStateInterface): boolean {
    if (this.from.area !== GameArea.STOCK || this.to.area !== GameArea.WASTE) {
      return false;
    }

    // Check if stock has cards to draw
    return gameState.stock.cards.length > 0;
  }

  /**
   * Validates foundation to tableau move.
   * @private
   */
  private validateFoundationToTableau(gameState: GameStateInterface): boolean {
    if (
      this.from.area !== GameArea.FOUNDATION ||
      this.to.area !== GameArea.TABLEAU
    ) {
      return false;
    }

    // Only single cards from foundation
    if (this.cards.length !== 1) {
      return false;
    }

    const targetColumn = gameState.tableau[this.to.index];
    return targetColumn ? this.validateTableauPlacement(targetColumn) : false;
  }

  /**
   * Validates cycle stock move.
   * @private
   */
  private validateCycleStock(gameState: GameStateInterface): boolean {
    // Can only cycle when stock is empty and waste has cards
    return (
      gameState.stock.cards.length === 0 &&
      gameState.stock.wasteCards.length > 0
    );
  }

  /**
   * Validates card sequence for tableau moves.
   * @private
   */
  private validateCardSequence(): boolean {
    if (this.cards.length === 1) {
      return true; // Single card is always valid sequence
    }

    // Check descending rank and alternating colors
    for (let i = 0; i < this.cards.length - 1; i++) {
      const current = this.cards[i];
      const next = this.cards[i + 1];

      if (current.rank !== next.rank + 1 || current.color === next.color) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validates tableau placement rules.
   * @private
   */
  private validateTableauPlacement(targetColumn: { cards: Card[] }): boolean {
    const cardToPlace = this.cards[0];

    if (targetColumn.cards.length === 0) {
      // Empty column - only Kings can be placed
      return cardToPlace.rank === 13; // King
    }

    const topCard = targetColumn.cards[targetColumn.cards.length - 1];

    // Must be descending rank and alternating color
    return (
      topCard.rank === cardToPlace.rank + 1 &&
      topCard.color !== cardToPlace.color
    );
  }

  /**
   * Validates foundation placement rules.
   * @private
   */
  private validateFoundationPlacement(targetPile: { cards: Card[] }): boolean {
    const cardToPlace = this.cards[0];

    if (targetPile.cards.length === 0) {
      // Empty foundation - only Aces can be placed
      return cardToPlace.rank === 1; // Ace
    }

    // Must be same suit and ascending rank
    const topCard = targetPile.cards[targetPile.cards.length - 1];
    return (
      topCard.suit === cardToPlace.suit && topCard.rank === cardToPlace.rank - 1
    );
  }

  /**
   * Executes this move on the given game state.
   * @param gameState - Game state to modify
   * @returns {MoveExecutionResult} Result of the execution
   * @throws {MoveError} If execution fails
   */
  public execute(gameState: GameStateInterface): MoveExecutionResult {
    if (!this.validate(gameState)) {
      throw new MoveError('Cannot execute invalid move');
    }

    try {
      let revealedCards: Card[] = [];

      // Execute based on move type
      switch (this.moveType) {
        case MoveType.TABLEAU_TO_TABLEAU:
          revealedCards = this.executeTableauToTableau(gameState);
          break;
        case MoveType.TABLEAU_TO_FOUNDATION:
          revealedCards = this.executeTableauToFoundation(gameState);
          break;
        case MoveType.WASTE_TO_TABLEAU:
          this.executeWasteToTableau(gameState);
          break;
        case MoveType.WASTE_TO_FOUNDATION:
          this.executeWasteToFoundation(gameState);
          break;
        case MoveType.STOCK_TO_WASTE:
          this.executeStockToWaste(gameState);
          break;
        case MoveType.FOUNDATION_TO_TABLEAU:
          this.executeFoundationToTableau(gameState);
          break;
        case MoveType.CYCLE_STOCK:
          this.executeCycleStock(gameState);
          break;
        default:
          throw new MoveError(`Unsupported move type: ${this.moveType}`);
      }

      return {
        success: true,
        revealedCards: revealedCards.length > 0 ? revealedCards : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown execution error',
      };
    }
  }

  /**
   * Executes tableau to tableau move.
   * @private
   */
  private executeTableauToTableau(gameState: GameStateInterface): Card[] {
    const sourceColumn = gameState.tableau[this.from.index];
    const targetColumn = gameState.tableau[this.to.index];

    // Remove cards from source
    const removedCount = this.cards.length;
    const removedCards = sourceColumn.cards.splice(-removedCount, removedCount);

    // Add cards to target
    targetColumn.cards.push(...removedCards);

    // Check if we revealed a card
    const revealedCards: Card[] = [];
    if (sourceColumn.cards.length > 0 && sourceColumn.faceDownCount > 0) {
      const lastCard = sourceColumn.cards[sourceColumn.cards.length - 1];
      if (!lastCard.isVisible) {
        lastCard.isVisible = true;
        sourceColumn.faceDownCount--;
        revealedCards.push(lastCard);
      }
    }

    return revealedCards;
  }

  /**
   * Executes tableau to foundation move.
   * @private
   */
  private executeTableauToFoundation(gameState: GameStateInterface): Card[] {
    const sourceColumn = gameState.tableau[this.from.index];
    const targetPile = gameState.foundation[this.to.index];

    // Remove card from source
    const removedCard = sourceColumn.cards.pop();
    if (removedCard) {
      // Add to foundation
      targetPile.cards.push(removedCard);
      targetPile.topRank = removedCard.rank;

      if (!targetPile.suit) {
        targetPile.suit = removedCard.suit;
      }
    }

    // Check if we revealed a card
    const revealedCards: Card[] = [];
    if (sourceColumn.cards.length > 0 && sourceColumn.faceDownCount > 0) {
      const lastCard = sourceColumn.cards[sourceColumn.cards.length - 1];
      if (!lastCard.isVisible) {
        lastCard.isVisible = true;
        sourceColumn.faceDownCount--;
        revealedCards.push(lastCard);
      }
    }

    return revealedCards;
  }

  /**
   * Executes waste to tableau move.
   * @private
   */
  private executeWasteToTableau(gameState: GameStateInterface): Card[] {
    const targetColumn = gameState.tableau[this.to.index];

    // Remove card from waste
    const removedCard = gameState.stock.wasteCards.pop();
    if (removedCard) {
      // Add to tableau
      targetColumn.cards.push(removedCard);
    }

    return [];
  }

  /**
   * Executes waste to foundation move.
   * @private
   */
  private executeWasteToFoundation(gameState: GameStateInterface): Card[] {
    const targetPile = gameState.foundation[this.to.index];

    // Remove card from waste
    const removedCard = gameState.stock.wasteCards.pop();
    if (removedCard) {
      // Add to foundation
      targetPile.cards.push(removedCard);
      targetPile.topRank = removedCard.rank;

      if (!targetPile.suit) {
        targetPile.suit = removedCard.suit;
      }
    }

    return [];
  }

  /**
   * Executes stock to waste move.
   * @private
   */
  private executeStockToWaste(gameState: GameStateInterface): Card[] {
    const drawCount = gameState.stock.drawMode;
    const cardsToMove = Math.min(drawCount, gameState.stock.cards.length);

    // Move cards from stock to waste
    for (let i = 0; i < cardsToMove; i++) {
      const card = gameState.stock.cards.pop();
      if (card) {
        card.isVisible = true;
        gameState.stock.wasteCards.push(card);
      }
    }

    return [];
  }

  /**
   * Executes foundation to tableau move.
   * @private
   */
  private executeFoundationToTableau(gameState: GameStateInterface): Card[] {
    const sourcePile = gameState.foundation[this.from.index];
    const targetColumn = gameState.tableau[this.to.index];

    // Remove card from foundation
    const removedCard = sourcePile.cards.pop();
    if (removedCard) {
      // Add to tableau
      targetColumn.cards.push(removedCard);

      // Update foundation state
      sourcePile.topRank =
        sourcePile.cards.length > 0
          ? sourcePile.cards[sourcePile.cards.length - 1].rank
          : null;

      if (sourcePile.cards.length === 0) {
        sourcePile.suit = null;
      }
    }

    return [];
  }

  /**
   * Executes cycle stock move.
   * @private
   */
  private executeCycleStock(gameState: GameStateInterface): Card[] {
    // Move all waste cards back to stock (face-down)
    while (gameState.stock.wasteCards.length > 0) {
      const card = gameState.stock.wasteCards.pop();
      if (card) {
        card.isVisible = false;
        gameState.stock.cards.unshift(card); // Add to beginning (reverse order)
      }
    }

    gameState.stock.cycleCount++;
    return [];
  }

  /**
   * Creates an undo move that reverses this move.
   * @param gameState - Game state after this move was executed
   * @returns {Move} Move that undoes this move
   * @throws {MoveError} If undo move cannot be created
   */
  public undo(gameState: GameStateInterface): Move {
    // Create reverse move based on move type
    const reverseMove = this.createReverseMove();

    if (!reverseMove.validate(gameState)) {
      throw new MoveError('Cannot create valid undo move');
    }

    return reverseMove;
  }

  /**
   * Creates a reverse move for undo functionality.
   * @private
   */
  private createReverseMove(): Move {
    // Create reverse move with swapped from/to positions
    const reverseMoveType = this.getReverseMovetype();

    return new Move(this.to, this.from, this.cards, reverseMoveType);
  }

  /**
   * Gets the reverse move type for undo operations.
   * @private
   */
  private getReverseMovetype(): MoveType {
    switch (this.moveType) {
      case MoveType.TABLEAU_TO_TABLEAU:
        return MoveType.TABLEAU_TO_TABLEAU;
      case MoveType.TABLEAU_TO_FOUNDATION:
        return MoveType.FOUNDATION_TO_TABLEAU;
      case MoveType.WASTE_TO_TABLEAU:
        return MoveType.TABLEAU_TO_FOUNDATION; // Simplified
      case MoveType.WASTE_TO_FOUNDATION:
        return MoveType.FOUNDATION_TO_TABLEAU; // Simplified
      case MoveType.FOUNDATION_TO_TABLEAU:
        return MoveType.TABLEAU_TO_FOUNDATION;
      default:
        throw new MoveError(`Cannot reverse move type: ${this.moveType}`);
    }
  }

  /**
   * Converts the move to a JSON-serializable object.
   * @returns {SerializableMove} Plain object representation of the move
   */
  public toJSON(): SerializableMove {
    return {
      id: this.id,
      moveType: this.moveType,
      from: this.from,
      to: this.to,
      cardIds: this.cards.map(card => card.id),
      timestamp: this.timestamp,
      revealedCardId: this.revealedCard?.id,
    };
  }

  /**
   * Creates a Move instance from a JSON object and card data.
   * @param json - The JSON object containing move data
   * @param cardLookup - Function to look up cards by ID
   * @returns {Move} A new Move instance
   * @throws {MoveError} If the JSON data is invalid
   */
  public static fromJSON(
    json: SerializableMove,
    cardLookup: (id: string) => Card | undefined
  ): Move {
    if (!json || typeof json !== 'object') {
      throw new MoveError('Invalid JSON: must be an object');
    }

    const { id, moveType, from, to, cardIds, timestamp, revealedCardId } = json;

    if (!id || !moveType || !from || !to || !cardIds || !timestamp) {
      throw new MoveError('Missing required move properties in JSON');
    }

    // Look up cards
    const cards = cardIds.map(cardId => {
      const card = cardLookup(cardId);
      if (!card) {
        throw new MoveError(`Card not found: ${cardId}`);
      }
      return card;
    });

    const revealedCard = revealedCardId
      ? cardLookup(revealedCardId)
      : undefined;

    const move = new Move(from, to, cards, moveType, revealedCard);

    // Override generated ID with the one from JSON
    Object.defineProperty(move, 'id', { value: id });
    Object.defineProperty(move, 'timestamp', { value: timestamp });

    return move;
  }
}

/**
 * MoveHistory class managing the complete move history with undo/redo functionality.
 * Provides efficient storage and retrieval of move sequences.
 */
export class MoveHistory {
  /** Array of all moves made in the game */
  private moves: Move[];

  /** Current position in the move history for undo/redo */
  private currentIndex: number;

  /** Maximum number of moves to store (for memory management) */
  private readonly maxHistorySize: number;

  /**
   * Creates a new MoveHistory instance.
   * @param maxHistorySize - Maximum number of moves to store (default: 1000)
   */
  constructor(maxHistorySize: number = 1000) {
    this.moves = [];
    this.currentIndex = -1;
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Adds a new move to the history.
   * @param move - The move to add
   * @throws {MoveHistoryError} If the move is invalid
   */
  public addMove(move: Move): void {
    if (!move) {
      throw new MoveHistoryError('Move is required');
    }

    // Remove any moves after current index (for redo cleanup)
    if (this.currentIndex < this.moves.length - 1) {
      this.moves.splice(this.currentIndex + 1);
    }

    // Add the new move
    this.moves.push(move);
    this.currentIndex++;

    // Maintain history size limit
    if (this.moves.length > this.maxHistorySize) {
      this.moves.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undoes the last move.
   * @returns {Move | null} The move that was undone, or null if no move to undo
   * @throws {MoveHistoryError} If undo is not possible
   */
  public undoLastMove(): Move | null {
    if (!this.canUndo()) {
      return null;
    }

    const lastMove = this.moves[this.currentIndex];
    this.currentIndex--;

    return lastMove;
  }

  /**
   * Redoes the next move.
   * @returns {Move | null} The move that was redone, or null if no move to redo
   * @throws {MoveHistoryError} If redo is not possible
   */
  public redoMove(): Move | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.moves[this.currentIndex];
  }

  /**
   * Checks if undo is possible.
   * @returns {boolean} True if there are moves to undo
   */
  public canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Checks if redo is possible.
   * @returns {boolean} True if there are moves to redo
   */
  public canRedo(): boolean {
    return this.currentIndex < this.moves.length - 1;
  }

  /**
   * Clears all move history.
   */
  public clear(): void {
    this.moves = [];
    this.currentIndex = -1;
  }

  /**
   * Gets the total number of moves in history.
   * @returns {number} Number of moves
   */
  public getMoveeCount(): number {
    return this.moves.length;
  }

  /**
   * Gets the current position in history.
   * @returns {number} Current index
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Gets all moves in the history.
   * @returns {Move[]} Copy of the moves array
   */
  public getAllMoves(): Move[] {
    return [...this.moves];
  }

  /**
   * Gets the last N moves from history.
   * @param count - Number of moves to retrieve
   * @returns {Move[]} Array of recent moves
   */
  public getRecentMoves(count: number): Move[] {
    const startIndex = Math.max(0, this.moves.length - count);
    return this.moves.slice(startIndex);
  }

  /**
   * Converts the move history to a JSON-serializable object.
   * @returns {object} Plain object representation
   */
  public toJSON(): {
    moves: SerializableMove[];
    currentIndex: number;
    maxHistorySize: number;
  } {
    return {
      moves: this.moves.map(move => move.toJSON()),
      currentIndex: this.currentIndex,
      maxHistorySize: this.maxHistorySize,
    };
  }

  /**
   * Creates a MoveHistory instance from a JSON object.
   * @param json - The JSON object containing history data
   * @param cardLookup - Function to look up cards by ID
   * @returns {MoveHistory} A new MoveHistory instance
   * @throws {MoveHistoryError} If the JSON data is invalid
   */
  public static fromJSON(
    json: {
      moves: SerializableMove[];
      currentIndex: number;
      maxHistorySize?: number;
    },
    cardLookup: (id: string) => Card | undefined
  ): MoveHistory {
    if (!json || typeof json !== 'object') {
      throw new MoveHistoryError('Invalid JSON: must be an object');
    }

    const { moves, currentIndex, maxHistorySize } = json;

    if (!Array.isArray(moves) || typeof currentIndex !== 'number') {
      throw new MoveHistoryError('Invalid history JSON structure');
    }

    const history = new MoveHistory(maxHistorySize || 1000);

    // Reconstruct moves
    history.moves = moves.map((moveJson: SerializableMove) =>
      Move.fromJSON(moveJson, cardLookup)
    );
    history.currentIndex = currentIndex;

    return history;
  }
}
