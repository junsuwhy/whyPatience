// Basic type definitions for contract testing
// These will be properly implemented in later tasks

export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades',
}

export enum Rank {
  ACE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  JACK = 11,
  QUEEN = 12,
  KING = 13,
}

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

export enum DrawMode {
  ONE = 1,
  THREE = 3,
}

export interface Position {
  type: 'tableau' | 'foundation' | 'stock' | 'waste';
  index?: number;
}

export interface Move {
  id: string;
  cards: Card[];
  from: Position;
  to: Position;
  timestamp: number;
  revealed?: Card;
}

export interface GameState {
  tableau: Card[][];
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
  drawMode: DrawMode;
  moves: Move[];
  score: number;
  startTime: number;
  isWon: boolean;
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  bestTime: number;
  totalTime: number;
  averageTime: number;
  currentStreak: number;
  bestStreak: number;
}

// Storage related types for contract testing
export interface UserPreferences {
  drawMode: DrawMode;
  autoComplete: boolean;
  animations: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  language: string;
}

export interface OverallStatistics {
  lifetime: GameStatistics;
  monthly: GameStatistics;
  weekly: GameStatistics;
  daily: GameStatistics;
}
