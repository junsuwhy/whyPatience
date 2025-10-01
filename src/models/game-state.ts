/**
 * GameState model for the Desktop Solitaire game.
 * This class serves as the core state container for the entire Solitaire game,
 * managing all game components, state validation, move history, and game logic.
 *
 * Following Constitution Principle I (Code Quality Excellence) and II (Test-Driven Development),
 * this model includes comprehensive state validation logic, clear error handling,
 * and corresponding tests must exist before implementation.
 */

import {
  GameState as GameStateInterface,
  GamePhase,
  GameArea,
  MoveType,
  TableauState,
  FoundationState,
  StockState,
  GameHistory,
  GameStatistics,
  GameSettings,
  Position,
  createNewGameState,
  isValidGameState,
} from '../types/game-state';
import { Card } from '../types/card';
import { Card as CardModel, createStandardDeck, shuffleDeck } from './card';
import { TableauColumn } from './tableau-column';
import { FoundationPile } from './foundation-pile';
import { StockPile } from './stock-pile';

/**
 * GameState validation error class for handling game state specific errors.
 */
export class GameStateError extends Error {
  constructor(
    message: string,
    public readonly gameData?: Partial<GameStateInterface>
  ) {
    super(message);
    this.name = 'GameStateError';
  }
}

/**
 * Move validation result interface.
 */
export interface MoveValidationResult {
  /** Whether the move is valid */
  valid: boolean;
  /** Error message if move is invalid */
  error?: string;
  /** Cards that would be moved */
  cards?: Card[];
  /** Card that would be revealed as a result */
  revealed?: Card;
}

/**
 * GameState class representing the complete state of a Solitaire game.
 * Manages all game components, validation, move execution, and persistence.
 */
export class GameState implements GameStateInterface {
  /** Unique identifier for this game session */
  public readonly id: string;

  /** Current phase of the game */
  public phase: GamePhase;

  /** State of all seven tableau columns */
  public tableau: TableauState[];

  /** State of all four foundation piles */
  public foundation: FoundationState[];

  /** State of the stock and waste piles */
  public stock: StockState;

  /** Complete move history for undo/redo functionality */
  public history: GameHistory[];

  /** Current position in history for undo/redo */
  public historyIndex: number;

  /** Game performance statistics */
  public statistics: GameStatistics;

  /** User preferences and settings */
  public settings: GameSettings;

  /** Timestamp when the game was started */
  public readonly startTime: number;

  /** Timestamp when the game ended (if finished) */
  public endTime?: number;

  /** Last modified timestamp for persistence */
  public lastModified: number;

  // Internal model instances for game logic
  private tableauColumns: TableauColumn[];
  private foundationPiles: FoundationPile[];
  private stockPile: StockPile;

  /**
   * Creates a new GameState instance.
   * @param gameData - Initial game state data (optional, creates new game if not provided)
   * @throws {GameStateError} If the game state data is invalid
   */
  constructor(gameData?: Partial<GameStateInterface>) {
    if (gameData && !isValidGameState(gameData)) {
      throw new GameStateError('Invalid game state data provided', gameData);
    }

    // Initialize from provided data or create new game
    const initialState = gameData || createNewGameState();

    this.id = initialState.id;
    this.phase = initialState.phase;
    this.tableau = [...initialState.tableau];
    this.foundation = [...initialState.foundation];
    this.stock = { ...initialState.stock };
    this.history = [...initialState.history];
    this.historyIndex = initialState.historyIndex;
    this.statistics = { ...initialState.statistics };
    this.settings = { ...initialState.settings };
    this.startTime = initialState.startTime;
    this.endTime = initialState.endTime;
    this.lastModified = initialState.lastModified;

    // Initialize internal model instances
    this.initializeModels();

    // Validate the initial state
    this.validate();
  }

  /**
   * Initializes internal model instances from state data.
   * @private
   */
  private initializeModels(): void {
    // Initialize tableau columns
    this.tableauColumns = this.tableau.map(column => {
      const cards = column.cards.map(cardData => CardModel.fromJSON(cardData));
      return new TableauColumn(column.id, cards, column.faceDownCount);
    });

    // Initialize foundation piles
    this.foundationPiles = this.foundation.map(foundation => {
      const cards = foundation.cards.map(cardData =>
        CardModel.fromJSON(cardData)
      );
      return new FoundationPile(foundation.suit, cards);
    });

    // Initialize stock pile
    const stockCards = this.stock.cards.map(cardData =>
      CardModel.fromJSON(cardData)
    );
    const wasteCards = this.stock.wasteCards.map(cardData =>
      CardModel.fromJSON(cardData)
    );
    this.stockPile = new StockPile(stockCards, this.stock.drawMode);
    this.stockPile.waste = wasteCards;
  }

  /**
   * Validates the current game state to ensure consistency.
   * @returns {boolean} True if the game state is valid
   * @throws {GameStateError} If the game state is invalid
   */
  public validate(): boolean {
    // Validate basic properties
    if (!this.id || typeof this.id !== 'string') {
      throw new GameStateError('Invalid game ID');
    }

    if (!Object.values(GamePhase).includes(this.phase)) {
      throw new GameStateError(`Invalid game phase: ${this.phase}`);
    }

    // Validate tableau
    if (!Array.isArray(this.tableau) || this.tableau.length !== 7) {
      throw new GameStateError('Tableau must have exactly 7 columns');
    }

    // Validate foundation
    if (!Array.isArray(this.foundation) || this.foundation.length !== 4) {
      throw new GameStateError('Foundation must have exactly 4 piles');
    }

    // Validate internal models
    try {
      this.tableauColumns.forEach(column => column.validate());
      this.foundationPiles.forEach(pile => pile.validate());
      this.stockPile.validate();
    } catch (error) {
      throw new GameStateError(
        `Model validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Validate card uniqueness across the entire game
    this.validateCardUniqueness();

    // Sync state data with models
    this.syncStateWithModels();

    return true;
  }

  /**
   * Validates that each card appears exactly once in the game.
   * @private
   * @throws {GameStateError} If duplicate cards are found
   */
  private validateCardUniqueness(): void {
    const allCards: Card[] = [];

    // Collect all cards from all areas
    this.tableauColumns.forEach(column => {
      allCards.push(...column.getAllCards());
    });

    this.foundationPiles.forEach(pile => {
      allCards.push(...pile.cards);
    });

    allCards.push(...this.stockPile.stock);
    allCards.push(...this.stockPile.waste);

    // Check for duplicates
    const cardIds = allCards.map(card => card.id);
    const uniqueIds = new Set(cardIds);

    if (cardIds.length !== uniqueIds.size) {
      throw new GameStateError('Duplicate cards found in game state');
    }

    // Verify we have exactly 52 cards
    if (allCards.length !== 52) {
      throw new GameStateError(`Expected 52 cards, found ${allCards.length}`);
    }
  }

  /**
   * Synchronizes the state data with internal model instances.
   * @private
   */
  private syncStateWithModels(): void {
    // Update tableau state
    this.tableau = this.tableauColumns.map(column => ({
      id: column.id,
      cards: column.getAllCards().map(card => card.toJSON()),
      faceDownCount: column.getFaceDownCount(),
    }));

    // Update foundation state
    this.foundation = this.foundationPiles.map((pile, index) => ({
      id: index,
      suit: pile.suit,
      cards: pile.cards.map(card => card.toJSON()),
      topRank: pile.getTopCard()?.rank || null,
    }));

    // Update stock state
    this.stock = {
      cards: this.stockPile.stock.map(card => card.toJSON()),
      drawMode: this.stockPile.drawMode,
      wasteCards: this.stockPile.waste.map(card => card.toJSON()),
      cycleCount: this.stock.cycleCount, // Preserve cycle count
    };

    this.lastModified = Date.now();
  }

  /**
   * Checks if the game has been won (all cards in foundation piles).
   * @returns {boolean} True if the game is won
   */
  public isGameWon(): boolean {
    return this.foundationPiles.every(pile => pile.isComplete());
  }

  /**
   * Validates if a move from one position to another is legal.
   * @param from - Source position
   * @param to - Destination position
   * @returns {MoveValidationResult} Validation result with details
   */
  public canMove(from: Position, to: Position): MoveValidationResult {
    try {
      // Get source cards
      const sourceResult = this.getCardsAtPosition(from);
      if (
        !sourceResult.success ||
        !sourceResult.cards ||
        sourceResult.cards.length === 0
      ) {
        return { valid: false, error: 'No cards found at source position' };
      }

      const cardsToMove = sourceResult.cards;
      const cardToMove = cardsToMove[0]; // Primary card being moved

      // Validate move based on destination area
      switch (to.area) {
        case GameArea.TABLEAU:
          return this.validateTableauMove(cardsToMove, to.index);

        case GameArea.FOUNDATION:
          if (cardsToMove.length > 1) {
            return {
              valid: false,
              error: 'Can only move one card to foundation',
            };
          }
          return this.validateFoundationMove(cardToMove, to.index);

        default:
          return { valid: false, error: 'Invalid destination area' };
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validates a move to a tableau column.
   * @private
   */
  private validateTableauMove(
    cards: Card[],
    columnIndex: number
  ): MoveValidationResult {
    if (columnIndex < 0 || columnIndex >= 7) {
      return { valid: false, error: 'Invalid tableau column index' };
    }

    const targetColumn = this.tableauColumns[columnIndex];
    const cardToPlace = cards[0];

    if (targetColumn.canPlaceCard(cardToPlace)) {
      return { valid: true, cards };
    }

    return { valid: false, error: 'Cannot place card on target column' };
  }

  /**
   * Validates a move to a foundation pile.
   * @private
   */
  private validateFoundationMove(
    card: Card,
    pileIndex: number
  ): MoveValidationResult {
    if (pileIndex < 0 || pileIndex >= 4) {
      return { valid: false, error: 'Invalid foundation pile index' };
    }

    const targetPile = this.foundationPiles[pileIndex];

    if (targetPile.canAddCard(card)) {
      return { valid: true, cards: [card] };
    }

    return { valid: false, error: 'Cannot add card to foundation pile' };
  }

  /**
   * Gets cards at a specific position.
   * @private
   */
  private getCardsAtPosition(position: Position): {
    success: boolean;
    cards?: Card[];
  } {
    switch (position.area) {
      case GameArea.TABLEAU: {
        if (position.index < 0 || position.index >= 7) {
          return { success: false };
        }
        const column = this.tableauColumns[position.index];
        if (position.stackIndex !== undefined) {
          const cards = column.getVisibleCards().slice(position.stackIndex);
          return { success: true, cards };
        }
        const topCard = column.getTopCard();
        return { success: true, cards: topCard ? [topCard] : [] };
      }

      case GameArea.FOUNDATION: {
        if (position.index < 0 || position.index >= 4) {
          return { success: false };
        }
        const pile = this.foundationPiles[position.index];
        const foundationCard = pile.getTopCard();
        return { success: true, cards: foundationCard ? [foundationCard] : [] };
      }

      case GameArea.WASTE: {
        const wasteCard = this.stockPile.getTopWasteCard();
        return { success: true, cards: wasteCard ? [wasteCard] : [] };
      }

      default:
        return { success: false };
    }
  }

  /**
   * Executes a move from one position to another.
   * @param move - Move details including from/to positions and metadata
   * @throws {GameStateError} If the move is invalid or execution fails
   */
  public makeMove(
    move: Omit<GameHistory, 'id' | 'timestamp' | 'previousState'>
  ): void {
    // Validate the move first
    const validation = this.canMove(move.from, move.to);
    if (!validation.valid) {
      throw new GameStateError(`Invalid move: ${validation.error}`);
    }

    // Create move history entry
    const historyEntry: GameHistory = {
      id: `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: move.type,
      cards: move.cards,
      from: move.from,
      to: move.to,
      revealed: move.revealed,
      previousState: this.createStateSnapshot(),
    };

    // Execute the move
    this.executeMoveInternal(move);

    // Add to history
    this.history.push(historyEntry);
    this.historyIndex = this.history.length - 1;

    // Update statistics
    this.statistics.moveCount++;
    this.statistics.elapsedTime = Date.now() - this.startTime;

    // Check for game completion
    if (this.isGameWon()) {
      this.phase = GamePhase.WON;
      this.endTime = Date.now();
    } else if (this.phase === GamePhase.NEW_GAME) {
      this.phase = GamePhase.PLAYING;
    }

    // Validate and sync state
    this.validate();
  }

  /**
   * Internal move execution logic.
   * @private
   */
  private executeMoveInternal(
    move: Omit<GameHistory, 'id' | 'timestamp' | 'previousState'>
  ): void {
    // Implementation depends on move type and areas involved
    // This is a simplified version - full implementation would handle all move types

    switch (move.type) {
      case MoveType.TABLEAU_TO_TABLEAU:
        this.executeTableauToTableauMove(move);
        break;
      case MoveType.TABLEAU_TO_FOUNDATION:
        this.executeTableauToFoundationMove(move);
        break;
      case MoveType.WASTE_TO_TABLEAU:
        this.executeWasteToTableauMove(move);
        break;
      case MoveType.WASTE_TO_FOUNDATION:
        this.executeWasteToFoundationMove(move);
        break;
      case MoveType.STOCK_TO_WASTE:
        this.executeStockToWasteMove();
        break;
      default:
        throw new GameStateError(`Unsupported move type: ${move.type}`);
    }
  }

  /**
   * Executes tableau to tableau move.
   * @private
   */
  private executeTableauToTableauMove(
    move: Omit<GameHistory, 'id' | 'timestamp' | 'previousState'>
  ): void {
    const sourceColumn = this.tableauColumns[move.from.index];
    const targetColumn = this.tableauColumns[move.to.index];

    const cardToMove = move.cards[0];
    const removalResult = sourceColumn.removeCard(cardToMove);

    // Add cards to target column
    removalResult.removedCards.forEach(card => {
      targetColumn.addCard(card);
    });
  }

  /**
   * Executes tableau to foundation move.
   * @private
   */
  private executeTableauToFoundationMove(
    move: Omit<GameHistory, 'id' | 'timestamp' | 'previousState'>
  ): void {
    const sourceColumn = this.tableauColumns[move.from.index];
    const targetPile = this.foundationPiles[move.to.index];

    const cardToMove = move.cards[0];
    sourceColumn.removeCard(cardToMove);
    targetPile.addCard(cardToMove);

    this.statistics.cardsInFoundation++;
    this.statistics.score += 10;
  }

  /**
   * Executes waste to tableau move.
   * @private
   */
  private executeWasteToTableauMove(
    move: Omit<GameHistory, 'id' | 'timestamp' | 'previousState'>
  ): void {
    const targetColumn = this.tableauColumns[move.to.index];
    const cardToMove = this.stockPile.removeTopWasteCard();

    if (cardToMove) {
      targetColumn.addCard(cardToMove);
    }
  }

  /**
   * Executes waste to foundation move.
   * @private
   */
  private executeWasteToFoundationMove(
    move: Omit<GameHistory, 'id' | 'timestamp' | 'previousState'>
  ): void {
    const targetPile = this.foundationPiles[move.to.index];
    const cardToMove = this.stockPile.removeTopWasteCard();

    if (cardToMove) {
      targetPile.addCard(cardToMove);
      this.statistics.cardsInFoundation++;
      this.statistics.score += 10;
    }
  }

  /**
   * Executes stock to waste move (drawing cards).
   * @private
   */
  private executeStockToWasteMove(): void {
    if (this.stockPile.canDraw()) {
      this.stockPile.draw();
    } else {
      // Reset stock if empty
      this.stockPile.reset();
      this.stock.cycleCount++;
    }
  }

  /**
   * Undoes the last move.
   * @throws {GameStateError} If there are no moves to undo
   */
  public undoLastMove(): void {
    if (this.historyIndex < 0 || this.history.length === 0) {
      throw new GameStateError('No moves to undo');
    }

    const lastMove = this.history[this.historyIndex];
    if (!lastMove.previousState) {
      throw new GameStateError('Cannot undo: no previous state available');
    }

    // Restore previous state
    this.restoreFromSnapshot(lastMove.previousState);

    // Update history index
    this.historyIndex--;

    // Update statistics
    this.statistics.undoCount++;

    this.validate();
  }

  /**
   * Creates a snapshot of the current game state for undo functionality.
   * @private
   */
  private createStateSnapshot(): Partial<GameStateInterface> {
    return {
      phase: this.phase,
      tableau: JSON.parse(JSON.stringify(this.tableau)),
      foundation: JSON.parse(JSON.stringify(this.foundation)),
      stock: JSON.parse(JSON.stringify(this.stock)),
      statistics: { ...this.statistics },
    };
  }

  /**
   * Restores game state from a snapshot.
   * @private
   */
  private restoreFromSnapshot(snapshot: Partial<GameStateInterface>): void {
    if (snapshot.phase) this.phase = snapshot.phase;
    if (snapshot.tableau) this.tableau = snapshot.tableau;
    if (snapshot.foundation) this.foundation = snapshot.foundation;
    if (snapshot.stock) this.stock = snapshot.stock;
    if (snapshot.statistics) this.statistics = snapshot.statistics;

    this.initializeModels();
  }

  /**
   * Gets all valid moves available in the current state.
   * @returns {Array} Array of valid move positions
   */
  public getValidMoves(): Array<{ from: Position; to: Position }> {
    const validMoves: Array<{ from: Position; to: Position }> = [];

    // Check moves from tableau columns
    for (let i = 0; i < 7; i++) {
      const column = this.tableauColumns[i];
      const visibleCards = column.getVisibleCards();

      for (let j = 0; j < visibleCards.length; j++) {
        const from: Position = {
          area: GameArea.TABLEAU,
          index: i,
          stackIndex: j,
        };

        // Check moves to other tableau columns
        for (let k = 0; k < 7; k++) {
          if (k === i) continue;
          const to: Position = { area: GameArea.TABLEAU, index: k };
          if (this.canMove(from, to).valid) {
            validMoves.push({ from, to });
          }
        }

        // Check moves to foundation piles
        if (j === visibleCards.length - 1) {
          // Only top card to foundation
          for (let k = 0; k < 4; k++) {
            const to: Position = { area: GameArea.FOUNDATION, index: k };
            if (this.canMove(from, to).valid) {
              validMoves.push({ from, to });
            }
          }
        }
      }
    }

    // Check moves from waste pile
    const wasteCard = this.stockPile.getTopWasteCard();
    if (wasteCard) {
      const from: Position = { area: GameArea.WASTE, index: 0 };

      // To tableau columns
      for (let i = 0; i < 7; i++) {
        const to: Position = { area: GameArea.TABLEAU, index: i };
        if (this.canMove(from, to).valid) {
          validMoves.push({ from, to });
        }
      }

      // To foundation piles
      for (let i = 0; i < 4; i++) {
        const to: Position = { area: GameArea.FOUNDATION, index: i };
        if (this.canMove(from, to).valid) {
          validMoves.push({ from, to });
        }
      }
    }

    return validMoves;
  }

  /**
   * Creates a new game state with a shuffled deck.
   * @param settings - Optional game settings
   * @returns {GameState} A new GameState instance
   */
  public static newGame(settings?: Partial<GameSettings>): GameState {
    const deck = shuffleDeck(createStandardDeck());
    let cardIndex = 0;

    // Prepare tableau cards (1 to 7 cards per column)
    const tableauCards: Card[][] = [];
    const faceDownCounts: number[] = [];

    for (let col = 0; col < 7; col++) {
      const columnCards: Card[] = [];
      for (let row = 0; row <= col; row++) {
        const card = deck[cardIndex++];
        if (row === col) {
          card.isVisible = true; // Top card is face-up
        }
        columnCards.push(card);
      }
      tableauCards.push(columnCards);
      faceDownCounts.push(col); // First 'col' cards are face-down
    }

    // Remaining cards go to stock pile
    const remainingCards = deck.slice(cardIndex);

    // Create initial game state with cards
    const initialState = createNewGameState(settings);

    // Update tableau state with dealt cards
    initialState.tableau = tableauCards.map((cards, index) => ({
      id: index,
      cards: cards.map(card => card.toJSON()),
      faceDownCount: faceDownCounts[index],
    }));

    // Update stock state with remaining cards
    initialState.stock.cards = remainingCards.map(card => card.toJSON());

    const gameState = new GameState(initialState);
    return gameState;
  }

  /**
   * Creates a deep copy of this game state.
   * @returns {GameState} A new GameState instance with the same properties
   */
  public clone(): GameState {
    const jsonData = this.toJSON();
    return GameState.fromJSON(jsonData);
  }

  /**
   * Converts the game state to a JSON-serializable object.
   * @returns {GameStateInterface} Plain object representation of the game state
   */
  public toJSON(): GameStateInterface {
    return {
      id: this.id,
      phase: this.phase,
      tableau: this.tableau,
      foundation: this.foundation,
      stock: this.stock,
      history: this.history,
      historyIndex: this.historyIndex,
      statistics: this.statistics,
      settings: this.settings,
      startTime: this.startTime,
      endTime: this.endTime,
      lastModified: this.lastModified,
    };
  }

  /**
   * Creates a GameState instance from a JSON object.
   * @param json - The JSON object containing game state data
   * @returns {GameState} A new GameState instance
   * @throws {GameStateError} If the JSON data is invalid
   */
  public static fromJSON(json: unknown): GameState {
    if (!json || typeof json !== 'object') {
      throw new GameStateError('Invalid JSON: must be an object');
    }

    if (!isValidGameState(json)) {
      throw new GameStateError('Invalid game state JSON structure');
    }

    return new GameState(json as GameStateInterface);
  }

  /**
   * Returns a string representation of the game state for debugging.
   * @returns {string} Human-readable game state description
   */
  public toString(): string {
    const foundationCards = this.foundationPiles.reduce(
      (sum, pile) => sum + pile.cards.length,
      0
    );
    const tableauCards = this.tableauColumns.reduce(
      (sum, col) => sum + col.getCardCount(),
      0
    );
    const stockCards = this.stockPile.getRemainingCards();

    return (
      `GameState(${this.phase}): ${foundationCards} in foundation, ` +
      `${tableauCards} in tableau, ${stockCards} in stock/waste, ` +
      `${this.statistics.moveCount} moves`
    );
  }
}

// Export the GameState class as default and named export
export default GameState;
