/**
 * FoundationPile model for the Desktop Solitaire game.
 * This class manages one of the four foundation piles (Hearts, Diamonds, Clubs, Spades).
 * Foundation piles are built from Ace to King in ascending order within the same suit.
 *
 * Following Constitution Principle I (Code Quality Excellence) and II (Test-Driven Development),
 * this model includes comprehensive validation logic, clear error handling,
 * and corresponding tests must exist before implementation.
 */

import { Suit, Rank } from '../types/card';
import { Card } from './card';

/**
 * FoundationPile validation error class for handling foundation-specific errors.
 */
export class FoundationPileError extends Error {
  constructor(
    message: string,
    public readonly pileData?: {
      suit?: Suit | null;
      cards?: Card[];
      topRank?: Rank | null;
    }
  ) {
    super(message);
    this.name = 'FoundationPileError';
  }
}

/**
 * FoundationPile interface for type safety and consistency.
 */
export interface IFoundationPile {
  suit: Suit | null;
  cards: Card[];
  canAddCard(card: Card): boolean;
  addCard(card: Card): void;
  removeTopCard(): Card | null;
  getTopCard(): Card | null;
  isEmpty(): boolean;
  isFull(): boolean;
  isComplete(): boolean;
  getExpectedNextRank(): Rank | null;
  validate(): boolean;
  getScore(): number;
  clone(): FoundationPile;
  toJSON(): object;
}

/**
 * FoundationPile class representing one of the four foundation piles in Solitaire.
 * Each pile is dedicated to a single suit and must be built from Ace to King in ascending order.
 */
export class FoundationPile implements IFoundationPile {
  /** The suit assigned to this foundation pile (null if empty) */
  public suit: Suit | null;

  /** Cards in ascending rank order (Ace to King) */
  public cards: Card[];

  /**
   * Creates a new FoundationPile instance.
   * @param suit - The suit for this pile (optional, determined by first card)
   * @param cards - Initial cards in the pile (optional, default empty)
   * @throws {FoundationPileError} If the pile parameters are invalid
   */
  constructor(suit: Suit | null = null, cards: Card[] = []) {
    // Validate suit parameter if provided
    if (suit !== null && !Object.values(Suit).includes(suit)) {
      throw new FoundationPileError(`Invalid suit: ${suit}`);
    }

    this.suit = suit;
    this.cards = [...cards]; // Create a copy to avoid external mutations

    // Validate the pile after initialization
    this.validate();
  }

  /**
   * Checks if a card can be added to this foundation pile.
   * @param card - The card to check
   * @returns True if the card can be placed on this pile
   */
  public canAddCard(card: Card): boolean {
    if (!card) {
      return false;
    }

    // If pile is empty, only accept Ace
    if (this.isEmpty()) {
      return card.rank === Rank.ACE;
    }

    // Must be same suit as the pile
    if (this.suit && card.suit !== this.suit) {
      return false;
    }

    // Must be next rank in sequence
    const expectedRank = this.getExpectedNextRank();
    return expectedRank !== null && card.rank === expectedRank;
  }

  /**
   * Adds a card to the foundation pile.
   * @param card - The card to add
   * @throws {FoundationPileError} If the card cannot be added
   */
  public addCard(card: Card): void {
    if (!card) {
      throw new FoundationPileError('Cannot add null or undefined card');
    }

    if (!this.canAddCard(card)) {
      const expectedRank = this.getExpectedNextRank();
      throw new FoundationPileError(
        `Cannot add ${card.rank} of ${card.suit}. Expected: ${
          expectedRank ? `${expectedRank} of ${this.suit}` : 'Ace (empty pile)'
        }`,
        { suit: this.suit, cards: this.cards }
      );
    }

    // Set the pile suit if this is the first card
    if (this.isEmpty()) {
      this.suit = card.suit;
    }

    // Add the card to the pile (preserve its visibility state)
    this.cards.push(card);

    // Validate the pile after adding
    this.validate();
  }

  /**
   * Removes and returns the top card from the foundation pile.
   * @returns The removed card, or null if the pile is empty
   * @throws {FoundationPileError} If trying to remove from an empty pile
   */
  public removeTopCard(): Card | null {
    if (this.isEmpty()) {
      throw new FoundationPileError(
        'Cannot remove card from empty foundation pile'
      );
    }

    const removedCard = this.cards.pop() || null;

    // Note: We don't reset the suit when pile becomes empty
    // as foundation piles can maintain their assigned suit

    return removedCard;
  }

  /**
   * Returns the top card without removing it.
   * @returns The top card, or null if the pile is empty
   */
  public getTopCard(): Card | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.cards[this.cards.length - 1];
  }

  /**
   * Checks if the foundation pile is empty.
   * @returns True if the pile has no cards
   */
  public isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * Checks if the foundation pile is full (contains all 13 cards).
   * @returns True if the pile contains all cards from Ace to King
   */
  public isFull(): boolean {
    return this.cards.length === 13;
  }

  /**
   * Checks if the foundation pile is complete (Ace to King in sequence).
   * @returns True if the pile contains all cards from Ace to King in correct order
   */
  public isComplete(): boolean {
    if (!this.isFull()) {
      return false;
    }

    // Check that all cards are in correct ascending order
    for (let i = 0; i < this.cards.length; i++) {
      const expectedRank = (i + 1) as Rank; // Ace = 1, Two = 2, ..., King = 13
      if (this.cards[i].rank !== expectedRank) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the rank of the next card that should be placed on this pile.
   * @returns The expected next rank, or null if the pile is complete
   */
  public getExpectedNextRank(): Rank | null {
    if (this.isEmpty()) {
      return Rank.ACE;
    }

    if (this.isFull()) {
      return null; // Pile is complete
    }

    const topCard = this.getTopCard();
    if (!topCard) {
      return Rank.ACE;
    }

    const nextRank = topCard.getNextRank();
    return nextRank;
  }

  /**
   * Validates the foundation pile state to ensure it follows Solitaire rules.
   * @returns True if the pile is valid
   * @throws {FoundationPileError} If the pile is invalid
   */
  public validate(): boolean {
    // Empty pile is always valid (can have predetermined suit or null)
    if (this.isEmpty()) {
      return true;
    }

    // Check that all cards are the same suit
    const pilesuit = this.suit;
    if (!pilesuit) {
      throw new FoundationPileError('Non-empty pile must have a suit');
    }

    for (const card of this.cards) {
      if (card.suit !== pilesuit) {
        throw new FoundationPileError(
          `All cards must be ${pilesuit}, found ${card.suit}`,
          { suit: this.suit, cards: this.cards }
        );
      }
    }

    // Check that cards are in ascending order starting from Ace
    for (let i = 0; i < this.cards.length; i++) {
      const expectedRank = (i + 1) as Rank; // Ace = 1, Two = 2, etc.
      if (this.cards[i].rank !== expectedRank) {
        throw new FoundationPileError(
          `Card at position ${i} should be rank ${expectedRank}, found ${this.cards[i].rank}`,
          { suit: this.suit, cards: this.cards }
        );
      }
    }

    // Check that no card appears twice
    const ranksSeen = new Set<Rank>();
    for (const card of this.cards) {
      if (ranksSeen.has(card.rank)) {
        throw new FoundationPileError(
          `Duplicate rank ${card.rank} found in pile`,
          { suit: this.suit, cards: this.cards }
        );
      }
      ranksSeen.add(card.rank);
    }

    return true;
  }

  /**
   * Calculates the score for this foundation pile.
   * Standard scoring: 10 points per card in foundation.
   * Bonus: 50 points for complete pile (Ace to King).
   * @returns The score for this pile
   */
  public getScore(): number {
    const baseScore = this.cards.length * 10;
    const completionBonus = this.isComplete() ? 50 : 0;
    return baseScore + completionBonus;
  }

  /**
   * Creates a deep copy of this foundation pile.
   * @returns A new FoundationPile instance with the same state
   */
  public clone(): FoundationPile {
    const clonedCards = this.cards.map(card => card.clone());
    return new FoundationPile(this.suit, clonedCards);
  }

  /**
   * Converts the foundation pile to a JSON-serializable object.
   * @returns Plain object representation of the pile
   */
  public toJSON(): object {
    return {
      suit: this.suit,
      cards: this.cards.map(card => card.toJSON()),
      topRank: this.getTopCard()?.rank || null,
      isEmpty: this.isEmpty(),
      isFull: this.isFull(),
      isComplete: this.isComplete(),
      score: this.getScore(),
    };
  }

  /**
   * Creates a FoundationPile instance from a JSON object.
   * @param json - The JSON object containing pile data
   * @returns A new FoundationPile instance
   * @throws {FoundationPileError} If the JSON data is invalid
   */
  public static fromJSON(json: unknown): FoundationPile {
    if (!json || typeof json !== 'object') {
      throw new FoundationPileError('Invalid JSON: must be an object');
    }

    const data = json as {
      suit?: Suit | null;
      cards?: unknown[];
      topRank?: Rank | null;
    };

    // Check if this is an empty object (invalid)
    if (Object.keys(data).length === 0) {
      throw new FoundationPileError('Invalid JSON: empty object');
    }

    // Validate suit if provided
    if (
      data.suit !== undefined &&
      data.suit !== null &&
      !Object.values(Suit).includes(data.suit)
    ) {
      throw new FoundationPileError(`Invalid JSON: invalid suit ${data.suit}`);
    }

    // Deserialize cards
    const cards: Card[] = [];
    if (data.cards && Array.isArray(data.cards)) {
      for (const cardData of data.cards) {
        cards.push(Card.fromJSON(cardData));
      }
    }

    // Create the pile
    const pile = new FoundationPile(data.suit || null, cards);

    // Validate that the deserialized pile is consistent
    pile.validate();

    return pile;
  }

  /**
   * Returns a string representation of the foundation pile for debugging.
   * @returns Human-readable pile description
   */
  public toString(): string {
    if (this.isEmpty()) {
      return 'Empty foundation pile';
    }

    const topCard = this.getTopCard();
    const completionStatus = this.isComplete() ? 'complete' : 'incomplete';
    return `Foundation pile (${this.suit}): ${this.cards.length} cards, top: ${topCard?.toString()}, ${completionStatus}`;
  }
}

/**
 * Utility function to create all four empty foundation piles.
 * @returns Array of four empty FoundationPile instances
 */
export function createFoundationPiles(): FoundationPile[] {
  return [
    new FoundationPile(), // Hearts foundation
    new FoundationPile(), // Diamonds foundation
    new FoundationPile(), // Clubs foundation
    new FoundationPile(), // Spades foundation
  ];
}

/**
 * Utility function to check if all foundation piles are complete.
 * @param piles - Array of foundation piles to check
 * @returns True if all piles are complete (game won)
 */
export function areAllFoundationsComplete(piles: FoundationPile[]): boolean {
  return piles.length === 4 && piles.every(pile => pile.isComplete());
}

// Export the FoundationPile class as default and named export
export default FoundationPile;
