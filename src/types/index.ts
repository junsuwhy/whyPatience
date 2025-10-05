// Re-export card types from the main card module
export {
  Suit,
  Rank,
  Color,
  Card,
  CardPosition,
  getCardColor,
  createCardId
} from './card';

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

// Export position and movement types
export type {
  Position as SpatialPosition,
  Dimensions,
  Rectangle,
  DragState,
  DropZone,
  MovementDirection,
  AnimationState,
  DropResult,
} from './position';

export {
  positionsEqual,
  calculateDistance,
  isPositionInRectangle,
  createRectangle,
  interpolatePosition,
} from './position';

// Export storage types and interfaces
export type {
  StorageContract,
  StorageInfo,
  StorageError,
  StorageConfig,
  StorageEvents,
  DataMigration,
  BackupContract,
  BackupData,
  BackupMetadata,
} from '../interfaces/storage-interface';

// Export storage service
export {
  StorageService,
  StorageServiceError,
  storageService,
} from '../services/storage';
