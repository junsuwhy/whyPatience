/**
 * Game state type definitions for the Desktop Solitaire game.
 * This file contains all the game state management types including game phases,
 * tableau states, foundation states, stock states, statistics, and history tracking.
 */

import { Card, Suit, Rank } from './card';

/**
 * Game phase enumeration representing all possible states of the game.
 */
export enum GamePhase {
  /** Initial state before the first move */
  NEW_GAME = 'new_game',
  /** Game is actively being played */
  PLAYING = 'playing',
  /** Game is temporarily paused */
  PAUSED = 'paused',
  /** Game has been won successfully */
  WON = 'won',
  /** Game has been lost or abandoned */
  LOST = 'lost',
}

/**
 * Game area enumeration for card positioning.
 */
export enum GameArea {
  /** Main playing area with 7 columns */
  TABLEAU = 'tableau',
  /** Collection piles (4 piles, one per suit) */
  FOUNDATION = 'foundation',
  /** Draw pile containing undealt cards */
  STOCK = 'stock',
  /** Discard pile for cards drawn from stock */
  WASTE = 'waste',
}

/**
 * Draw mode enumeration for stock pile operations.
 */
export enum DrawMode {
  /** Draw one card at a time from stock */
  ONE_CARD = 1,
  /** Draw three cards at a time from stock */
  THREE_CARD = 3,
}

/**
 * Move type enumeration for tracking different types of card movements.
 */
export enum MoveType {
  /** Moving cards between tableau columns */
  TABLEAU_TO_TABLEAU = 'tableau_to_tableau',
  /** Moving cards from tableau to foundation */
  TABLEAU_TO_FOUNDATION = 'tableau_to_foundation',
  /** Drawing cards from stock to waste */
  STOCK_TO_WASTE = 'stock_to_waste',
  /** Moving cards from waste to tableau */
  WASTE_TO_TABLEAU = 'waste_to_tableau',
  /** Moving cards from waste to foundation */
  WASTE_TO_FOUNDATION = 'waste_to_foundation',
  /** Moving cards from foundation back to tableau */
  FOUNDATION_TO_TABLEAU = 'foundation_to_tableau',
  /** Cycling through stock when waste is full */
  CYCLE_STOCK = 'cycle_stock',
}

/**
 * Card position interface for tracking card locations.
 */
export interface Position {
  /** The game area where the card is located */
  area: GameArea;
  /** Index within the area (column number, pile number, etc.) */
  index: number;
  /** Position within a stack (for tableau columns) */
  stackIndex?: number;
}

/**
 * Tableau column state interface managing one of the seven tableau columns.
 */
export interface TableauState {
  /** Column identifier (0-6) */
  id: number;
  /** All cards in this column from bottom to top */
  cards: Card[];
  /** Number of face-down cards at the bottom of the column */
  faceDownCount: number;
}

/**
 * Foundation pile state interface managing one of the four foundation piles.
 */
export interface FoundationState {
  /** Pile identifier (0-3) */
  id: number;
  /** The suit assigned to this pile (null if empty) */
  suit: Suit | null;
  /** Cards in ascending rank order (Ace to King) */
  cards: Card[];
  /** Current top card rank (null if empty) */
  topRank: Rank | null;
}

/**
 * Stock pile state interface managing the draw pile and waste pile.
 */
export interface StockState {
  /** Remaining undealt cards in the stock pile */
  cards: Card[];
  /** Drawing mode (1-card or 3-card draw) */
  drawMode: DrawMode;
  /** Currently visible cards in the waste pile */
  wasteCards: Card[];
  /** Number of times the stock has been cycled through */
  cycleCount: number;
}

/**
 * Game statistics interface for tracking player performance metrics.
 */
export interface GameStatistics {
  /** Total number of moves made in the current game */
  moveCount: number;
  /** Number of undo operations performed */
  undoCount: number;
  /** Current game score based on moves and time */
  score: number;
  /** Time elapsed since game start (in milliseconds) */
  elapsedTime: number;
  /** Number of cards successfully placed in foundation piles */
  cardsInFoundation: number;
  /** Best completion time for this session */
  bestTime?: number;
}

/**
 * Move history interface for implementing undo/redo functionality.
 */
export interface GameHistory {
  /** Unique identifier for this move */
  id: string;
  /** Timestamp when the move was made */
  timestamp: number;
  /** Type of move performed */
  type: MoveType;
  /** Cards that were moved */
  cards: Card[];
  /** Source position of the move */
  from: Position;
  /** Destination position of the move */
  to: Position;
  /** Card that was revealed as a result of this move (if any) */
  revealed?: Card;
  /** Previous game state snapshot for undo capability */
  previousState?: Partial<GameState>;
}

/**
 * Game settings interface for managing user preferences.
 */
export interface GameSettings {
  /** Preferred stock draw mode */
  drawMode: DrawMode;
  /** Animation duration in milliseconds */
  animationSpeed: number;
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
  /** Auto-move cards to foundation when possible */
  autoComplete: boolean;
  /** Show move hints to the player */
  showHints: boolean;
  /** Timer display preference */
  showTimer: boolean;
}

/**
 * Main game state interface containing all game information.
 * This is the root state object that encompasses the entire game state.
 */
export interface GameState {
  /** Unique identifier for this game session */
  id: string;
  /** Current phase of the game */
  phase: GamePhase;
  /** State of all seven tableau columns */
  tableau: TableauState[];
  /** State of all four foundation piles */
  foundation: FoundationState[];
  /** State of the stock and waste piles */
  stock: StockState;
  /** Complete move history for undo/redo functionality */
  history: GameHistory[];
  /** Current position in history for undo/redo */
  historyIndex: number;
  /** Game performance statistics */
  statistics: GameStatistics;
  /** User preferences and settings */
  settings: GameSettings;
  /** Timestamp when the game was started */
  startTime: number;
  /** Timestamp when the game ended (if finished) */
  endTime?: number;
  /** Last modified timestamp for persistence */
  lastModified: number;
}

/**
 * Persisted game state interface for localStorage.
 * Contains the game state plus metadata for versioning and migration.
 */
export interface PersistedGameState {
  /** Schema version for handling data migration */
  version: string;
  /** The current active game state (null if no game in progress) */
  currentGame: GameState | null;
  /** User preferences that persist across sessions */
  preferences: GameSettings;
  /** Overall statistics across all games */
  overallStatistics: OverallStatistics;
  /** Timestamp of last save */
  lastSaved: number;
}

/**
 * Overall statistics interface for tracking long-term player performance.
 */
export interface OverallStatistics {
  /** Total number of games played */
  gamesPlayed: number;
  /** Total number of games won */
  gamesWon: number;
  /** Win rate percentage (0-100) */
  winRate: number;
  /** Best completion time across all games (in milliseconds) */
  bestTime: number;
  /** Average completion time for won games (in milliseconds) */
  averageTime: number;
  /** Total moves made across all games */
  totalMoves: number;
  /** Average moves per game */
  averageMovesPerGame: number;
  /** Current win streak */
  currentStreak: number;
  /** Longest win streak achieved */
  longestStreak: number;
}

/**
 * Type guard to check if a game state is valid.
 * @param state - The state object to validate
 * @returns True if the state is a valid GameState
 */
export function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') return false;

  const s = state as Partial<GameState>;
  return !!(
    s.id &&
    s.phase &&
    s.tableau &&
    s.foundation &&
    s.stock &&
    s.history &&
    s.statistics &&
    s.settings &&
    s.startTime
  );
}

/**
 * Creates a new empty game state with default values.
 * @param settings - Optional game settings to use
 * @returns A new GameState initialized for a new game
 */
export function createNewGameState(
  settings?: Partial<GameSettings>
): GameState {
  const defaultSettings: GameSettings = {
    drawMode: DrawMode.THREE_CARD,
    animationSpeed: 300,
    soundEnabled: true,
    autoComplete: false,
    showHints: false,
    showTimer: true,
    ...settings,
  };

  return {
    id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    phase: GamePhase.NEW_GAME,
    tableau: Array.from({ length: 7 }, (_, i) => ({
      id: i,
      cards: [],
      faceDownCount: 0,
    })),
    foundation: Array.from({ length: 4 }, (_, i) => ({
      id: i,
      suit: null,
      cards: [],
      topRank: null,
    })),
    stock: {
      cards: [],
      drawMode: defaultSettings.drawMode,
      wasteCards: [],
      cycleCount: 0,
    },
    history: [],
    historyIndex: -1,
    statistics: {
      moveCount: 0,
      undoCount: 0,
      score: 0,
      elapsedTime: 0,
      cardsInFoundation: 0,
    },
    settings: defaultSettings,
    startTime: Date.now(),
    lastModified: Date.now(),
  };
}
