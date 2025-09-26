# Data Model: Desktop Solitaire Web Application

## Core Entities

### Card
```typescript
interface Card {
  id: string;           // Unique identifier (e.g., "AS" for Ace of Spades)
  rank: CardRank;       // A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
  suit: CardSuit;       // Spades, Hearts, Diamonds, Clubs
  faceUp: boolean;      // True if card is face-up, false if face-down
  position: Position;   // Current location of the card
}

enum CardRank {
  ACE = 1, TWO, THREE, FOUR, FIVE, SIX, SEVEN, 
  EIGHT, NINE, TEN, JACK, QUEEN, KING
}

enum CardSuit {
  SPADES = 'spades',
  HEARTS = 'hearts', 
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs'
}
```

### Position
```typescript
interface Position {
  area: GameArea;       // Where the card is located
  index: number;        // Position within that area
  stackIndex?: number;  // Position within a stack (for tableau)
}

enum GameArea {
  TABLEAU = 'tableau',      // Main playing area (7 columns)
  FOUNDATION = 'foundation', // Collection piles (4 piles)
  STOCK = 'stock',          // Draw pile
  WASTE = 'waste'           // Discard pile from stock
}
```

### TableauColumn
```typescript
interface TableauColumn {
  id: number;           // Column index (0-6)
  cards: Card[];        // Cards in this column (bottom to top)
  faceDownCount: number; // Number of face-down cards at bottom
}
```

### FoundationPile
```typescript
interface FoundationPile {
  id: number;           // Pile index (0-3)
  suit: CardSuit | null; // Suit for this pile (null if empty)
  cards: Card[];        // Cards in ascending order (A to K)
  topRank: CardRank | null; // Current top card rank (null if empty)
}
```

### StockPile
```typescript
interface StockPile {
  cards: Card[];        // Remaining undealt cards
  drawMode: DrawMode;   // 1-card or 3-card draw
  currentDraw: Card[];  // Currently drawn cards from stock
  cycleCount: number;   // Number of times cycled through deck
}

enum DrawMode {
  ONE_CARD = 1,
  THREE_CARD = 3
}
```

### Move
```typescript
interface Move {
  id: string;           // Unique move identifier
  timestamp: number;    // When move was made
  type: MoveType;       // Type of move performed
  cards: Card[];        // Cards that were moved
  from: Position;       // Source position
  to: Position;         // Destination position
  revealed?: Card;      // Card revealed by this move (if any)
}

enum MoveType {
  TABLEAU_TO_TABLEAU = 'tableau_to_tableau',
  TABLEAU_TO_FOUNDATION = 'tableau_to_foundation', 
  STOCK_TO_WASTE = 'stock_to_waste',
  WASTE_TO_TABLEAU = 'waste_to_tableau',
  WASTE_TO_FOUNDATION = 'waste_to_foundation',
  FOUNDATION_TO_TABLEAU = 'foundation_to_tableau'
}
```

### GameState
```typescript
interface GameState {
  id: string;               // Game session identifier
  status: GameStatus;       // Current game status
  tableau: TableauColumn[]; // 7 tableau columns
  foundation: FoundationPile[]; // 4 foundation piles
  stock: StockPile;         // Stock pile state
  moves: Move[];            // Move history for undo functionality
  statistics: GameStatistics; // Game metrics
  startTime: number;        // Game start timestamp
  endTime?: number;         // Game end timestamp (if finished)
}

enum GameStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  PAUSED = 'paused'
}
```

### GameStatistics
```typescript
interface GameStatistics {
  moveCount: number;        // Total moves made
  undoCount: number;        // Number of undos used
  score: number;            // Current game score
  elapsedTime: number;      // Time played in milliseconds
  cardsInFoundation: number; // Cards successfully placed
}
```

### UserPreferences
```typescript
interface UserPreferences {
  drawMode: DrawMode;       // Preferred stock draw mode
  animationSpeed: number;   // Animation duration (ms)
  soundEnabled: boolean;    // Audio feedback enabled
  theme: GameTheme;         // Visual theme selection
  autoComplete: boolean;    // Auto-move obvious cards
}

enum GameTheme {
  CLASSIC = 'classic',
  MODERN = 'modern',
  HIGH_CONTRAST = 'high_contrast'
}
```

## State Transitions

### Card State Transitions
- Face-down → Face-up: When card becomes top of tableau column
- Any position → Tableau: Following rank/color rules
- Tableau → Foundation: Following suit/rank rules  
- Foundation → Tableau: When building sequences

### Game State Transitions
- NOT_STARTED → IN_PROGRESS: On first move
- IN_PROGRESS → WON: When all cards in foundation
- IN_PROGRESS → PAUSED: When game minimized/tab inactive
- PAUSED → IN_PROGRESS: When game resumed

### Stock Pile Transitions
- Stock → Waste: When drawing cards
- Waste → Stock: When stock empty (cycle through)
- Waste → Tableau/Foundation: When moving drawn cards

## Validation Rules

### Card Movement Rules
```typescript
// Tableau placement rules
function canPlaceOnTableau(card: Card, targetColumn: TableauColumn): boolean {
  const topCard = getTopCard(targetColumn);
  if (!topCard) return card.rank === CardRank.KING;
  
  return (
    card.rank === topCard.rank - 1 &&
    getCardColor(card) !== getCardColor(topCard)
  );
}

// Foundation placement rules  
function canPlaceOnFoundation(card: Card, pile: FoundationPile): boolean {
  if (!pile.suit) return card.rank === CardRank.ACE;
  
  return (
    card.suit === pile.suit &&
    card.rank === pile.topRank! + 1
  );
}
```

### Win Condition
```typescript
function isGameWon(gameState: GameState): boolean {
  return gameState.foundation.every(pile => 
    pile.cards.length === 13 && 
    pile.topRank === CardRank.KING
  );
}
```

## Data Persistence

### Local Storage Schema
```typescript
interface PersistedGameState {
  version: string;          // Schema version for migration
  currentGame?: GameState;  // Active game state
  preferences: UserPreferences; // User settings
  statistics: OverallStatistics; // Cross-game stats
}

interface OverallStatistics {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  bestTime: number;
  averageTime: number;
  totalMoves: number;
}
```