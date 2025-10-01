/**
 * TableauColumn model for the Desktop Solitaire game.
 * This class manages one of the seven tableau columns in the game.
 * Each column contains a sequence of cards in descending order with alternating colors.
 *
 * Following Constitution Principle I (Code Quality Excellence) and II (Test-Driven Development),
 * this model includes comprehensive validation logic, clear error handling,
 * and corresponding tests must exist before implementation.
 */

import { Card } from './card';
import { Rank } from '../types/card';

/**
 * TableauColumn validation error class for handling tableau-specific errors.
 */
export class TableauColumnValidationError extends Error {
  constructor(
    message: string,
    public readonly columnId?: number,
    public readonly cardData?: Card
  ) {
    super(message);
    this.name = 'TableauColumnValidationError';
  }
}

/**
 * Result interface for card removal operations.
 */
export interface RemovalResult {
  /** The cards that were removed */
  removedCards: Card[];
  /** Whether a card was flipped as a result of the removal */
  cardFlipped: boolean;
  /** The card that was flipped (if any) */
  flippedCard?: Card;
}

/**
 * TableauColumn class representing one of the seven tableau columns in Solitaire.
 * Manages card placement, removal, validation, and state changes.
 */
export class TableauColumn {
  /** Column identifier (0-6) */
  public readonly id: number;

  /** All cards in this column from bottom to top */
  private cards: Card[];

  /** Number of face-down cards at the bottom of the column */
  private faceDownCount: number;

  /**
   * Creates a new TableauColumn instance.
   * @param id - The column identifier (0-6)
   * @param cards - Initial cards in the column (default: empty array)
   * @param faceDownCount - Number of face-down cards (default: 0)
   * @throws {TableauColumnValidationError} If the parameters are invalid
   */
  constructor(id: number, cards: Card[] = [], faceDownCount: number = 0) {
    // Validate input parameters
    if (!Number.isInteger(id) || id < 0 || id > 6) {
      throw new TableauColumnValidationError(
        `Invalid column ID: ${id}. Must be an integer between 0 and 6.`
      );
    }

    if (!Array.isArray(cards)) {
      throw new TableauColumnValidationError(
        'Cards must be provided as an array'
      );
    }

    if (!Number.isInteger(faceDownCount) || faceDownCount < 0) {
      throw new TableauColumnValidationError(
        `Invalid face-down count: ${faceDownCount}. Must be a non-negative integer.`
      );
    }

    if (faceDownCount > cards.length) {
      throw new TableauColumnValidationError(
        `Face-down count (${faceDownCount}) cannot exceed total cards (${cards.length})`
      );
    }

    this.id = id;
    this.cards = [...cards]; // Create a copy to avoid mutations
    this.faceDownCount = faceDownCount;

    // Validate the initial state
    this.validate();
  }

  /**
   * Validates the current state of the tableau column.
   * @returns {boolean} True if the column is valid
   * @throws {TableauColumnValidationError} If the column state is invalid
   */
  public validate(): boolean {
    // Check face-down count consistency
    if (this.faceDownCount > this.cards.length) {
      throw new TableauColumnValidationError(
        `Face-down count (${this.faceDownCount}) exceeds total cards (${this.cards.length})`,
        this.id
      );
    }

    // Validate card sequence for visible cards
    const visibleCards = this.getVisibleCards();
    for (let i = 1; i < visibleCards.length; i++) {
      const currentCard = visibleCards[i];
      const previousCard = visibleCards[i - 1];

      // Check descending order
      if (currentCard.rank !== previousCard.rank - 1) {
        throw new TableauColumnValidationError(
          `Invalid sequence: ${currentCard.toString()} cannot follow ${previousCard.toString()}`,
          this.id,
          currentCard
        );
      }

      // Check alternating colors
      if (currentCard.color === previousCard.color) {
        throw new TableauColumnValidationError(
          `Invalid color sequence: ${currentCard.toString()} has same color as ${previousCard.toString()}`,
          this.id,
          currentCard
        );
      }
    }

    // Validate card visibility states
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const shouldBeVisible = i >= this.faceDownCount;

      if (card.isVisible !== shouldBeVisible) {
        throw new TableauColumnValidationError(
          `Card visibility mismatch: ${card.toString()} at position ${i} should be ${
            shouldBeVisible ? 'visible' : 'hidden'
          }`,
          this.id,
          card
        );
      }
    }

    return true;
  }

  /**
   * Adds a card to the top of the column.
   * @param card - The card to add
   * @throws {TableauColumnValidationError} If the card cannot be placed
   */
  public addCard(card: Card): void {
    if (!card) {
      throw new TableauColumnValidationError(
        'Cannot add null or undefined card',
        this.id
      );
    }

    if (!this.canPlaceCard(card)) {
      const topCard = this.getTopCard();
      const topCardStr = topCard ? topCard.toString() : 'empty column';
      throw new TableauColumnValidationError(
        `Cannot place ${card.toString()} on ${topCardStr}`,
        this.id,
        card
      );
    }

    // Ensure the card is visible when added to tableau
    if (!card.isVisible) {
      card.flip();
    }

    this.cards.push(card);
    this.validate();
  }

  /**
   * Removes a card and all cards above it from the column.
   * @param card - The card to remove (all cards above it will also be removed)
   * @returns {RemovalResult} The removed cards and flip information
   * @throws {TableauColumnValidationError} If the card cannot be removed
   */
  public removeCard(card: Card): RemovalResult {
    if (!card) {
      throw new TableauColumnValidationError(
        'Cannot remove null or undefined card',
        this.id
      );
    }

    const cardIndex = this.cards.findIndex(c => c.equals(card));
    if (cardIndex === -1) {
      throw new TableauColumnValidationError(
        `Card ${card.toString()} not found in column ${this.id}`,
        this.id,
        card
      );
    }

    // Only allow removal of visible cards
    if (!card.isVisible) {
      throw new TableauColumnValidationError(
        `Cannot remove face-down card: ${card.toString()}`,
        this.id,
        card
      );
    }

    // Remove the card and all cards above it
    const removedCards = this.cards.splice(cardIndex);

    // Check if we need to flip a card
    let cardFlipped = false;
    let flippedCard: Card | undefined;

    if (this.cards.length > 0 && this.faceDownCount > 0) {
      const newTopCard = this.getTopCard();
      if (newTopCard && !newTopCard.isVisible) {
        newTopCard.flip();
        this.faceDownCount--;
        cardFlipped = true;
        flippedCard = newTopCard;
      }
    }

    this.validate();

    return {
      removedCards,
      cardFlipped,
      flippedCard,
    };
  }

  /**
   * Checks if a card can be placed on this column.
   * @param card - The card to check
   * @returns {boolean} True if the card can be placed
   */
  public canPlaceCard(card: Card): boolean {
    if (!card) {
      return false;
    }

    const topCard = this.getTopCard();

    // Empty column: only Kings can be placed
    if (!topCard) {
      return card.rank === Rank.KING;
    }

    // Use the Card model's canPlaceOn method
    return card.canPlaceOn(topCard);
  }

  /**
   * Gets all visible (face-up) cards in the column.
   * @returns {Card[]} Array of visible cards from bottom to top
   */
  public getVisibleCards(): Card[] {
    return this.cards.slice(this.faceDownCount);
  }

  /**
   * Gets the top card of the column (null if empty).
   * @returns {Card | null} The top card or null if the column is empty
   */
  public getTopCard(): Card | null {
    if (this.cards.length === 0) {
      return null;
    }
    return this.cards[this.cards.length - 1];
  }

  /**
   * Flips the top face-down card to make it visible.
   * @returns {Card | null} The flipped card, or null if no card was flipped
   * @throws {TableauColumnValidationError} If there are no face-down cards to flip
   */
  public flipTopCard(): Card | null {
    if (this.faceDownCount === 0) {
      throw new TableauColumnValidationError(
        `No face-down cards to flip in column ${this.id}`,
        this.id
      );
    }

    const cardToFlip = this.cards[this.faceDownCount - 1];
    if (!cardToFlip) {
      throw new TableauColumnValidationError(
        `No card found at face-down position in column ${this.id}`,
        this.id
      );
    }

    cardToFlip.flip();
    this.faceDownCount--;

    this.validate();
    return cardToFlip;
  }

  /**
   * Checks if the column is empty.
   * @returns {boolean} True if the column has no cards
   */
  public isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * Checks if a sequence of cards starting from the given card can be removed.
   * @param startCard - The first card in the sequence to check
   * @returns {boolean} True if the sequence can be moved as a group
   */
  public canRemoveSequence(startCard: Card): boolean {
    if (!startCard) {
      return false;
    }

    const startIndex = this.cards.findIndex(c => c.equals(startCard));
    if (startIndex === -1) {
      return false;
    }

    // Card must be visible to be part of a removable sequence
    if (!startCard.isVisible) {
      return false;
    }

    // Check if all cards from startCard to the top form a valid sequence
    const sequenceCards = this.cards.slice(startIndex);

    for (let i = 1; i < sequenceCards.length; i++) {
      const currentCard = sequenceCards[i];
      const previousCard = sequenceCards[i - 1];

      // Must be descending order
      if (currentCard.rank !== previousCard.rank - 1) {
        return false;
      }

      // Must be alternating colors
      if (currentCard.color === previousCard.color) {
        return false;
      }

      // All cards in the sequence must be visible
      if (!currentCard.isVisible) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the number of face-down cards in the column.
   * @returns {number} The number of face-down cards
   */
  public getFaceDownCount(): number {
    return this.faceDownCount;
  }

  /**
   * Gets the total number of cards in the column.
   * @returns {number} The total number of cards
   */
  public getCardCount(): number {
    return this.cards.length;
  }

  /**
   * Gets all cards in the column (including face-down cards).
   * @returns {Card[]} Array of all cards from bottom to top
   */
  public getAllCards(): Card[] {
    return [...this.cards]; // Return a copy to prevent external mutations
  }

  /**
   * Creates a deep copy of this tableau column.
   * @returns {TableauColumn} A new TableauColumn instance with the same state
   */
  public clone(): TableauColumn {
    const clonedCards = this.cards.map(card => card.clone());
    return new TableauColumn(this.id, clonedCards, this.faceDownCount);
  }

  /**
   * Converts the tableau column to a JSON-serializable object.
   * @returns {object} Plain object representation of the tableau column
   */
  public toJSON(): object {
    return {
      id: this.id,
      cards: this.cards.map(card => card.toJSON()),
      faceDownCount: this.faceDownCount,
    };
  }

  /**
   * Creates a TableauColumn instance from a JSON object.
   * @param json - The JSON object containing tableau column data
   * @returns {TableauColumn} A new TableauColumn instance
   * @throws {TableauColumnValidationError} If the JSON data is invalid
   */
  public static fromJSON(json: unknown): TableauColumn {
    if (!json || typeof json !== 'object') {
      throw new TableauColumnValidationError('Invalid JSON: must be an object');
    }

    const data = json as Record<string, unknown>;

    if (typeof data.id !== 'number') {
      throw new TableauColumnValidationError(
        'Invalid JSON: missing or invalid id'
      );
    }

    if (!Array.isArray(data.cards)) {
      throw new TableauColumnValidationError(
        'Invalid JSON: cards must be an array'
      );
    }

    if (typeof data.faceDownCount !== 'number') {
      throw new TableauColumnValidationError(
        'Invalid JSON: missing or invalid faceDownCount'
      );
    }

    // Reconstruct cards from JSON
    const cards = data.cards.map((cardJson: unknown) =>
      Card.fromJSON(cardJson)
    );

    return new TableauColumn(data.id, cards, data.faceDownCount);
  }

  /**
   * Returns a string representation of the tableau column for debugging.
   * @returns {string} Human-readable tableau column description
   */
  public toString(): string {
    const cardCount = this.cards.length;
    const visibleCount = cardCount - this.faceDownCount;
    return `TableauColumn ${this.id}: ${cardCount} cards (${this.faceDownCount} face-down, ${visibleCount} visible)`;
  }
}

// Export the TableauColumn class as default and named export
export default TableauColumn;
