/**
 * UI Component Interface Contracts
 * Defines the interface contracts for React components
 */

// Main game board component
export interface GameBoardProps {
  gameState: GameState;
  onMove: (cards: Card[], from: Position, to: Position) => void;
  onUndo: () => void;
  onNewGame: () => void;
  onDrawFromStock: () => void;
  preferences: UserPreferences;
}

// Individual card component
export interface CardProps {
  card: Card;
  isDraggable: boolean;
  isSelected: boolean;
  isDropTarget: boolean;
  onSelect?: (card: Card) => void;
  onDragStart?: (card: Card) => void;
  onDragEnd?: (card: Card, position: Position) => void;
  style?: React.CSSProperties;
}

// Tableau column component
export interface TableauColumnProps {
  column: TableauColumn;
  columnIndex: number;
  onCardMove: (cards: Card[], from: Position, to: Position) => void;
  onCardSelect: (card: Card) => void;
  selectedCards?: Card[];
  validDropTarget: boolean;
}

// Foundation pile component  
export interface FoundationPileProps {
  pile: FoundationPile;
  pileIndex: number;
  onCardMove: (card: Card, from: Position) => void;
  canAcceptCard: (card: Card) => boolean;
  isHighlighted: boolean;
}

// Stock pile component
export interface StockPileProps {
  stock: StockPile;
  onDraw: () => void;
  onCycle: () => void;
  drawMode: DrawMode;
  remainingCards: number;
}

// Game controls component
export interface GameControlsProps {
  canUndo: boolean;
  gameStatus: GameStatus;
  statistics: GameStatistics;
  onUndo: () => void;
  onNewGame: () => void;
  onPause: () => void;
  onResume: () => void;
  onSettings: () => void;
}

// Settings modal component
export interface SettingsModalProps {
  isOpen: boolean;
  preferences: UserPreferences;
  onClose: () => void;
  onSave: (preferences: UserPreferences) => void;
  onReset: () => void;
}

// Game statistics component
export interface GameStatisticsProps {
  statistics: GameStatistics;
  overallStats: OverallStatistics;
  isGameActive: boolean;
  elapsedTime: number;
}

// Drag and drop interfaces
export interface DragItem {
  type: 'CARD' | 'CARD_STACK';
  cards: Card[];
  sourcePosition: Position;
}

export interface DropResult {
  targetPosition: Position;
  isValidDrop: boolean;
}

// Animation interfaces
export interface CardAnimation {
  type: 'MOVE' | 'FLIP' | 'DEAL' | 'COLLECT';
  duration: number;
  easing: string;
  onComplete?: () => void;
}

export interface AnimationConfig {
  moveCards: CardAnimation;
  flipCard: CardAnimation;
  dealCards: CardAnimation;
  collectCards: CardAnimation;
  winCelebration: CardAnimation;
}

// Accessibility interfaces
export interface AccessibilityProps {
  ariaLabel: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// Theme interfaces
export interface ThemeConfig {
  name: GameTheme;
  colors: {
    background: string;
    cardBackground: string;
    cardBorder: string;
    tableau: string;
    foundation: string;
    stock: string;
    text: string;
    accent: string;
  };
  fonts: {
    primary: string;
    monospace: string;
  };
  spacing: {
    cardGap: number;
    columnGap: number;
    padding: number;
  };
  animations: AnimationConfig;
}