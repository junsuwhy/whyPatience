/**
 * Game Engine Interface Contract
 * Defines the core game logic interface for solitaire operations
 */

export interface GameEngineContract {
  // Game lifecycle methods
  initializeGame(drawMode: DrawMode): GameState;
  dealCards(): GameState;
  resetGame(): GameState;

  // Card movement operations
  moveCards(cards: Card[], from: Position, to: Position): MoveResult;
  undoMove(): UndoResult;
  autoComplete(): boolean;

  // Game state queries
  isValidMove(cards: Card[], from: Position, to: Position): boolean;
  getValidMoves(card: Card): Position[];
  isGameWon(): boolean;
  canUndo(): boolean;

  // Stock pile operations
  drawFromStock(): DrawResult;
  cycleStock(): boolean;

  // Game statistics
  getGameStatistics(): GameStatistics;
  updateStatistics(move: Move): void;
}

export interface MoveResult {
  success: boolean;
  newState: GameState;
  move?: Move;
  revealed?: Card;
  error?: string;
}

export interface UndoResult {
  success: boolean;
  newState: GameState;
  undoneMove?: Move;
  error?: string;
}

export interface DrawResult {
  success: boolean;
  drawnCards: Card[];
  remainingStock: number;
  cycled: boolean;
}

// Event system for game state changes
export interface GameEngineEvents {
  onGameStart: (gameState: GameState) => void;
  onMove: (move: Move, newState: GameState) => void;
  onUndo: (undoneMove: Move, newState: GameState) => void;
  onGameWon: (finalState: GameState, statistics: GameStatistics) => void;
  onCardRevealed: (card: Card, position: Position) => void;
  onStockCycled: (cycleCount: number) => void;
}
