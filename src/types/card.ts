/**
 * Card-related type definitions for the Desktop Solitaire game.
 * This file contains all the essential types for playing cards, including
 * suits, ranks, colors, and card positioning for the drag-and-drop system.
 */

/**
 * Playing card suits enumeration.
 * Following traditional playing card convention with four suits.
 */
export enum Suit {
  /** ♠ Spades (black suit) */
  SPADES = 'spades',
  /** ♥ Hearts (red suit) */
  HEARTS = 'hearts',
  /** ♦ Diamonds (red suit) */
  DIAMONDS = 'diamonds',
  /** ♣ Clubs (black suit) */
  CLUBS = 'clubs',
}

/**
 * Playing card ranks enumeration.
 * Represents the face value of each card from Ace to King.
 * Ace is valued as 1 for solitaire game logic.
 */
export enum Rank {
  /** Ace card (value: 1) */
  ACE = 1,
  /** Two card (value: 2) */
  TWO = 2,
  /** Three card (value: 3) */
  THREE = 3,
  /** Four card (value: 4) */
  FOUR = 4,
  /** Five card (value: 5) */
  FIVE = 5,
  /** Six card (value: 6) */
  SIX = 6,
  /** Seven card (value: 7) */
  SEVEN = 7,
  /** Eight card (value: 8) */
  EIGHT = 8,
  /** Nine card (value: 9) */
  NINE = 9,
  /** Ten card (value: 10) */
  TEN = 10,
  /** Jack card (value: 11) */
  JACK = 11,
  /** Queen card (value: 12) */
  QUEEN = 12,
  /** King card (value: 13) */
  KING = 13,
}

/**
 * Playing card color enumeration.
 * Used to determine card color for game logic and visual representation.
 */
export enum Color {
  /** Red color (Hearts and Diamonds) */
  RED = 'red',
  /** Black color (Spades and Clubs) */
  BLACK = 'black',
}

/**
 * Playing card interface representing a single card in the game.
 * Contains all necessary properties for game logic and visual representation.
 */
export interface Card {
  /** Unique identifier for the card */
  id: string;
  /** The suit of the card (Spades, Hearts, Diamonds, Clubs) */
  suit: Suit;
  /** The rank/value of the card (Ace through King) */
  rank: Rank;
  /** The color of the card (Red or Black) */
  color: Color;
  /** Whether the card is face-up (visible) or face-down */
  isVisible: boolean;
}

/**
 * Card position type for the drag-and-drop system.
 * Represents where a card is located or can be moved to.
 */
export interface CardPosition {
  /** The type of game area */
  type: 'tableau' | 'foundation' | 'stock' | 'waste';
  /** The index within the area (for tableau columns or foundation piles) */
  index?: number;
  /** The position within a stack (for ordering cards in a pile) */
  stackPosition?: number;
}

/**
 * Helper function to determine card color based on suit.
 * @param suit - The suit of the card
 * @returns The color of the card (RED or BLACK)
 */
export function getCardColor(suit: Suit): Color {
  return suit === Suit.HEARTS || suit === Suit.DIAMONDS
    ? Color.RED
    : Color.BLACK;
}

/**
 * Helper function to create a unique card ID.
 * @param suit - The suit of the card
 * @param rank - The rank of the card
 * @returns A unique string identifier for the card
 */
export function createCardId(suit: Suit, rank: Rank): string {
  return `${suit}_${rank}`;
}
