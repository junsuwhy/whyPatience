/**
 * StockPile model for the Desktop Solitaire game.
 * This class manages the stock pile (draw pile) and waste pile functionality.
 * The stock pile contains undealt cards and supports 1-card or 3-card draw modes.
 *
 * Following Constitution Principle I (Code Quality Excellence) and II (Test-Driven Development),
 * this model includes comprehensive validation logic, clear error handling,
 * and corresponding tests must exist before implementation.
 */

import { DrawMode } from '../types/game-state';
import { Card } from './card';

/**
 * StockPile validation error class for handling stock-specific errors.
 */
export class StockPileError extends Error {
  constructor(
    message: string,
    public readonly pileData?: {
      stockCards?: Card[];
      wasteCards?: Card[];
      drawMode?: DrawMode;
    }
  ) {
    super(message);
    this.name = 'StockPileError';
  }
}

/**
 * StockPile interface for type safety and consistency.
 */
export interface IStockPile {
  stock: Card[];
  waste: Card[];
  drawMode: DrawMode;
  draw(): number;
  canDraw(): boolean;
  reset(): void;
  getTopWasteCard(): Card | null;
  removeTopWasteCard(): Card | null;
  isEmpty(): boolean;
  isStockEmpty(): boolean;
  getDrawMode(): DrawMode;
  setDrawMode(mode: DrawMode): void;
  getRemainingCards(): number;
  validate(): boolean;
  clone(): StockPile;
  toJSON(): object;
}

/**
 * StockPile class representing the stock and waste piles in Solitaire.
 * Manages card drawing, waste pile operations, and pile cycling.
 */
export class StockPile implements IStockPile {
  /** Face-down cards in the stock pile */
  public stock: Card[];

  /** Face-up cards in the waste pile */
  public waste: Card[];

  /** Current draw mode (1-card or 3-card) */
  public drawMode: DrawMode;

  /**
   * Creates a new StockPile instance.
   * @param stockCards - Initial cards for the stock pile (default: empty array)
   * @param drawMode - Drawing mode (default: THREE_CARD)
   * @throws {StockPileError} If the parameters are invalid
   */
  constructor(
    stockCards: Card[] = [],
    drawMode: DrawMode = DrawMode.THREE_CARD
  ) {
    // Validate input parameters
    if (!Array.isArray(stockCards)) {
      throw new StockPileError('Stock cards must be an array');
    }

    if (!Object.values(DrawMode).includes(drawMode)) {
      throw new StockPileError(`Invalid draw mode: ${drawMode}`);
    }

    // Validate that all stock cards are Card instances
    for (const card of stockCards) {
      if (!(card instanceof Card)) {
        throw new StockPileError('All stock cards must be Card instances');
      }
    }

    this.stock = [...stockCards];
    this.waste = [];
    this.drawMode = drawMode;

    // Ensure all stock cards are face-down
    this.stock.forEach(card => {
      if (card.isVisible) {
        card.isVisible = false;
      }
    });

    // Validate the created pile
    this.validate();
  }

  /**
   * Draws cards from the stock pile to the waste pile based on draw mode.
   * @returns {number} Number of cards actually drawn
   * @throws {StockPileError} If drawing is not possible
   */
  public draw(): number {
    if (!this.canDraw()) {
      throw new StockPileError('Cannot draw: stock pile is empty');
    }

    const cardsToDraw = Math.min(this.drawMode, this.stock.length);
    const drawnCards: Card[] = [];

    // Draw the specified number of cards
    for (let i = 0; i < cardsToDraw; i++) {
      const card = this.stock.pop();
      if (card) {
        card.isVisible = true; // Make card face-up in waste pile
        drawnCards.push(card);
      }
    }

    // Add drawn cards to waste pile (in reverse order to maintain proper stacking)
    this.waste.push(...drawnCards.reverse());

    return cardsToDraw;
  }

  /**
   * Checks if cards can be drawn from the stock pile.
   * @returns {boolean} True if the stock pile has cards to draw
   */
  public canDraw(): boolean {
    return this.stock.length > 0;
  }

  /**
   * Resets the stock pile by moving all waste cards back to stock.
   * Cards are shuffled back in reverse order and made face-down.
   */
  public reset(): void {
    if (this.waste.length === 0) {
      return; // Nothing to reset
    }

    // Move waste cards back to stock in reverse order
    while (this.waste.length > 0) {
      const card = this.waste.pop();
      if (card) {
        card.isVisible = false; // Make card face-down in stock
        this.stock.push(card);
      }
    }
  }

  /**
   * Gets the top card from the waste pile without removing it.
   * @returns {Card | null} The top waste card, or null if waste is empty
   */
  public getTopWasteCard(): Card | null {
    return this.waste.length > 0 ? this.waste[this.waste.length - 1] : null;
  }

  /**
   * Removes and returns the top card from the waste pile.
   * @returns {Card | null} The removed card, or null if waste is empty
   */
  public removeTopWasteCard(): Card | null {
    return this.waste.length > 0 ? this.waste.pop() || null : null;
  }

  /**
   * Checks if both stock and waste piles are empty.
   * @returns {boolean} True if no cards remain in either pile
   */
  public isEmpty(): boolean {
    return this.stock.length === 0 && this.waste.length === 0;
  }

  /**
   * Checks if the stock pile is empty (waste may still have cards).
   * @returns {boolean} True if the stock pile has no cards
   */
  public isStockEmpty(): boolean {
    return this.stock.length === 0;
  }

  /**
   * Gets the current draw mode.
   * @returns {DrawMode} The current draw mode
   */
  public getDrawMode(): DrawMode {
    return this.drawMode;
  }

  /**
   * Sets the draw mode for future draws.
   * @param mode - The new draw mode to set
   * @throws {StockPileError} If the draw mode is invalid
   */
  public setDrawMode(mode: DrawMode): void {
    if (!Object.values(DrawMode).includes(mode)) {
      throw new StockPileError(`Invalid draw mode: ${mode}`);
    }
    this.drawMode = mode;
  }

  /**
   * Gets the total number of remaining cards in both piles.
   * @returns {number} Total number of cards in stock and waste combined
   */
  public getRemainingCards(): number {
    return this.stock.length + this.waste.length;
  }

  /**
   * Validates the stock pile's state to ensure it's consistent.
   * @returns {boolean} True if the pile is valid
   * @throws {StockPileError} If the pile state is invalid
   */
  public validate(): boolean {
    // Check that arrays exist
    if (!Array.isArray(this.stock) || !Array.isArray(this.waste)) {
      throw new StockPileError('Stock and waste must be arrays');
    }

    // Check draw mode
    if (!Object.values(DrawMode).includes(this.drawMode)) {
      throw new StockPileError(`Invalid draw mode: ${this.drawMode}`);
    }

    // Validate all cards in stock pile
    for (const card of this.stock) {
      if (!(card instanceof Card)) {
        throw new StockPileError('All stock cards must be Card instances');
      }
      card.validate();

      // Stock cards should typically be face-down
      if (card.isVisible) {
        console.warn('Stock card is face-up, this may be unexpected');
      }
    }

    // Validate all cards in waste pile
    for (const card of this.waste) {
      if (!(card instanceof Card)) {
        throw new StockPileError('All waste cards must be Card instances');
      }
      card.validate();

      // Waste cards should typically be face-up
      if (!card.isVisible) {
        console.warn('Waste card is face-down, this may be unexpected');
      }
    }

    // Check for duplicate cards
    const allCards = [...this.stock, ...this.waste];
    const cardIds = allCards.map(card => card.id);
    const uniqueIds = new Set(cardIds);

    if (cardIds.length !== uniqueIds.size) {
      throw new StockPileError('Duplicate cards found in stock pile');
    }

    return true;
  }

  /**
   * Creates a deep copy of this stock pile.
   * @returns {StockPile} A new StockPile instance with the same properties
   */
  public clone(): StockPile {
    const clonedStock = this.stock.map(card => card.clone());
    const clonedPile = new StockPile(clonedStock, this.drawMode);

    // Clone waste cards separately to maintain state
    clonedPile.waste = this.waste.map(card => card.clone());

    return clonedPile;
  }

  /**
   * Converts the stock pile to a JSON-serializable object.
   * @returns {object} Plain object representation of the stock pile
   */
  public toJSON(): object {
    return {
      stock: this.stock.map(card => card.toJSON()),
      waste: this.waste.map(card => card.toJSON()),
      drawMode: this.drawMode,
      stockCount: this.stock.length,
      wasteCount: this.waste.length,
      totalCards: this.getRemainingCards(),
    };
  }

  /**
   * Creates a StockPile instance from a JSON object.
   * @param json - The JSON object containing stock pile data
   * @returns {StockPile} A new StockPile instance
   * @throws {StockPileError} If the JSON data is invalid
   */
  public static fromJSON(json: unknown): StockPile {
    if (!json || typeof json !== 'object') {
      throw new StockPileError('Invalid JSON: must be an object');
    }

    const data = json as {
      stock?: unknown[];
      waste?: unknown[];
      drawMode?: DrawMode;
    };

    if (!Array.isArray(data.stock)) {
      throw new StockPileError('Invalid JSON: stock must be an array');
    }

    if (!Array.isArray(data.waste)) {
      throw new StockPileError('Invalid JSON: waste must be an array');
    }

    if (!data.drawMode || !Object.values(DrawMode).includes(data.drawMode)) {
      throw new StockPileError('Invalid JSON: missing or invalid drawMode');
    }

    try {
      // Reconstruct cards from JSON
      const stockCards = data.stock.map(cardData => Card.fromJSON(cardData));
      const wasteCards = data.waste.map(cardData => Card.fromJSON(cardData));

      // Create new stock pile and restore waste pile state
      const stockPile = new StockPile(stockCards, data.drawMode);
      stockPile.waste = wasteCards;

      return stockPile;
    } catch (error) {
      throw new StockPileError(
        `Failed to deserialize stock pile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Returns a string representation of the stock pile for debugging.
   * @returns {string} Human-readable stock pile description
   */
  public toString(): string {
    const topWaste = this.getTopWasteCard();
    const topWasteStr = topWaste ? topWaste.toString() : 'none';

    return (
      `StockPile(stock: ${this.stock.length} cards, waste: ${this.waste.length} cards, ` +
      `draw mode: ${this.drawMode}-card, top waste: ${topWasteStr})`
    );
  }
}

/**
 * Utility function to create a stock pile with a shuffled deck.
 * @param cards - Array of cards to use for the stock pile
 * @param drawMode - Draw mode to use (default: THREE_CARD)
 * @returns {StockPile} A new StockPile with the provided cards
 */
export function createStockPileFromDeck(
  cards: Card[],
  drawMode: DrawMode = DrawMode.THREE_CARD
): StockPile {
  // Ensure all cards are face-down for stock pile
  const stockCards = cards.map(card => {
    const cloned = card.clone();
    cloned.isVisible = false;
    return cloned;
  });

  return new StockPile(stockCards, drawMode);
}

// Export the StockPile class as default and named export
export default StockPile;
