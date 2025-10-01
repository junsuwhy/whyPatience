/**
 * Card model with validation for the Desktop Solitaire game.
 * This class provides complete card validation mechanisms and business logic.
 * It serves as the core for all card operations in the Solitaire game.
 *
 * Following Constitution Principle I (Code Quality Excellence) and II (Test-Driven Development),
 * this model includes comprehensive validation logic, clear error handling,
 * and corresponding tests must exist before implementation.
 */

import {
  Suit,
  Rank,
  Color,
  Card as CardInterface,
  getCardColor,
  createCardId,
} from '../types/card';

/**
 * Card validation error class for handling card-specific errors.
 */
export class CardValidationError extends Error {
  constructor(
    message: string,
    public readonly cardData?: Partial<CardInterface>
  ) {
    super(message);
    this.name = 'CardValidationError';
  }
}

/**
 * Card class representing a single playing card in the Solitaire game.
 * Implements comprehensive validation, game logic, and state management.
 */
export class Card implements CardInterface {
  /** Unique identifier for the card */
  public readonly id: string;

  /** The suit of the card (Spades, Hearts, Diamonds, Clubs) */
  public readonly suit: Suit;

  /** The rank/value of the card (Ace through King) */
  public readonly rank: Rank;

  /** The color of the card (Red or Black) */
  public readonly color: Color;

  /** Whether the card is face-up (visible) or face-down */
  public isVisible: boolean;

  /**
   * Creates a new Card instance.
   * @param suit - The suit of the card
   * @param rank - The rank/value of the card
   * @param isVisible - Whether the card is face-up (default: false)
   * @throws {CardValidationError} If the card parameters are invalid
   */
  constructor(suit: Suit, rank: Rank, isVisible: boolean = false) {
    // Validate input parameters
    if (!Object.values(Suit).includes(suit)) {
      throw new CardValidationError(`Invalid suit: ${suit}`);
    }

    if (!Object.values(Rank).includes(rank)) {
      throw new CardValidationError(`Invalid rank: ${rank}`);
    }

    if (typeof isVisible !== 'boolean') {
      throw new CardValidationError(
        `isVisible must be a boolean, got: ${typeof isVisible}`
      );
    }

    this.suit = suit;
    this.rank = rank;
    this.color = getCardColor(suit);
    this.isVisible = isVisible;
    this.id = createCardId(suit, rank);

    // Validate the created card
    this.validate();
  }

  /**
   * Validates the card's properties to ensure it represents a legal playing card.
   * @returns {boolean} True if the card is valid
   * @throws {CardValidationError} If the card is invalid
   */
  public validate(): boolean {
    // Check if all required properties exist
    if (!this.id || !this.suit || this.rank === undefined || !this.color) {
      throw new CardValidationError('Card is missing required properties', {
        id: this.id,
        suit: this.suit,
        rank: this.rank,
        color: this.color,
        isVisible: this.isVisible,
      });
    }

    // Validate suit
    if (!Object.values(Suit).includes(this.suit)) {
      throw new CardValidationError(`Invalid suit: ${this.suit}`);
    }

    // Validate rank
    if (!Object.values(Rank).includes(this.rank)) {
      throw new CardValidationError(`Invalid rank: ${this.rank}`);
    }

    // Validate color matches suit
    const expectedColor = getCardColor(this.suit);
    if (this.color !== expectedColor) {
      throw new CardValidationError(
        `Color ${this.color} does not match suit ${this.suit}. Expected: ${expectedColor}`
      );
    }

    // Validate ID format
    const expectedId = createCardId(this.suit, this.rank);
    if (this.id !== expectedId) {
      throw new CardValidationError(
        `Invalid ID format. Expected: ${expectedId}, got: ${this.id}`
      );
    }

    return true;
  }

  /**
   * Checks if the card is red (Hearts or Diamonds).
   * @returns {boolean} True if the card is red
   */
  public isRed(): boolean {
    return this.color === Color.RED;
  }

  /**
   * Checks if the card is black (Spades or Clubs).
   * @returns {boolean} True if the card is black
   */
  public isBlack(): boolean {
    return this.color === Color.BLACK;
  }

  /**
   * Determines if this card can be placed on top of the target card in tableau columns.
   * Following Solitaire rules: the card must be one rank lower and opposite color.
   * @param targetCard - The card to potentially place this card on
   * @returns {boolean} True if this card can be placed on the target card
   */
  public canPlaceOn(targetCard: Card | null): boolean {
    // Can always place a King on an empty column
    if (!targetCard) {
      return this.rank === Rank.KING;
    }

    // Must be one rank lower than the target card
    const isOneRankLower = this.rank === targetCard.rank - 1;

    // Must be opposite color
    const isOppositeColor = this.color !== targetCard.color;

    return isOneRankLower && isOppositeColor;
  }

  /**
   * Gets the next rank in sequence (for foundation pile placement).
   * @returns {Rank | null} The next rank, or null if this is a King
   */
  public getNextRank(): Rank | null {
    if (this.rank === Rank.KING) {
      return null;
    }
    return (this.rank + 1) as Rank;
  }

  /**
   * Gets the previous rank in sequence.
   * @returns {Rank | null} The previous rank, or null if this is an Ace
   */
  public getPreviousRank(): Rank | null {
    if (this.rank === Rank.ACE) {
      return null;
    }
    return (this.rank - 1) as Rank;
  }

  /**
   * Flips the card to toggle its visibility state.
   * @returns {Card} This card instance for method chaining
   */
  public flip(): Card {
    this.isVisible = !this.isVisible;
    return this;
  }

  /**
   * Compares this card with another card for equality.
   * Two cards are equal if they have the same suit and rank.
   * @param otherCard - The card to compare with
   * @returns {boolean} True if the cards are equal
   */
  public equals(otherCard: Card | null): boolean {
    if (!otherCard) {
      return false;
    }

    return this.suit === otherCard.suit && this.rank === otherCard.rank;
  }

  /**
   * Creates a deep copy of this card.
   * @returns {Card} A new Card instance with the same properties
   */
  public clone(): Card {
    return new Card(this.suit, this.rank, this.isVisible);
  }

  /**
   * Converts the card to a JSON-serializable object.
   * @returns {CardInterface} Plain object representation of the card
   */
  public toJSON(): CardInterface {
    return {
      id: this.id,
      suit: this.suit,
      rank: this.rank,
      color: this.color,
      isVisible: this.isVisible,
    };
  }

  /**
   * Creates a Card instance from a JSON object.
   * @param json - The JSON object containing card data
   * @returns {Card} A new Card instance
   * @throws {CardValidationError} If the JSON data is invalid
   */
  public static fromJSON(json: unknown): Card {
    if (!json || typeof json !== 'object') {
      throw new CardValidationError('Invalid JSON: must be an object');
    }

    const data = json as Partial<CardInterface>;

    if (!data.suit || !data.rank) {
      throw new CardValidationError('Invalid JSON: missing suit or rank', data);
    }

    // Create card with the visible state from JSON, defaulting to false
    const card = new Card(data.suit, data.rank, data.isVisible ?? false);

    // Verify that the deserialized card matches the original data
    if (data.id && card.id !== data.id) {
      throw new CardValidationError(
        `ID mismatch: expected ${data.id}, got ${card.id}`,
        data
      );
    }

    if (data.color && card.color !== data.color) {
      throw new CardValidationError(
        `Color mismatch: expected ${data.color}, got ${card.color}`,
        data
      );
    }

    return card;
  }

  /**
   * Returns a string representation of the card for debugging.
   * @returns {string} Human-readable card description
   */
  public toString(): string {
    const visibilityStr = this.isVisible ? 'face-up' : 'face-down';
    return `${this.rank} of ${this.suit} (${this.color}, ${visibilityStr})`;
  }
}

/**
 * Utility function to create a standard 52-card deck.
 * @returns {Card[]} Array of all 52 playing cards in a standard deck
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank).filter(
      value => typeof value === 'number'
    ) as Rank[]) {
      deck.push(new Card(suit, rank, false));
    }
  }

  return deck;
}

/**
 * Utility function to shuffle an array of cards using Fisher-Yates algorithm.
 * @param cards - Array of cards to shuffle
 * @returns {Card[]} New array with shuffled cards
 */
export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Export the Card class as default and named export
export default Card;
