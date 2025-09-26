# 資料模型：桌面版接龍網頁應用程式

## 核心實體

### 紙牌
```typescript
interface Card {
  id: string;           // 唯一識別符（例如："AS"表示黑桃A）
  rank: CardRank;       // A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
  suit: CardSuit;       // 黑桃、紅心、方塊、梅花
  faceUp: boolean;      // 如果紙牌正面朝上為true，背面朝上為false
  position: Position;   // 紙牌的當前位置
}

enum CardRank {
  ACE = 1, TWO, THREE, FOUR, FIVE, SIX, SEVEN, 
  EIGHT, NINE, TEN, JACK, QUEEN, KING
}

enum CardSuit {
  SPADES = 'spades',    // 黑桃
  HEARTS = 'hearts',    // 紅心
  DIAMONDS = 'diamonds', // 方塊
  CLUBS = 'clubs'       // 梅花
}
```

### 位置
```typescript
interface Position {
  area: GameArea;       // 紙牌所在位置
  index: number;        // 該區域內的位置
  stackIndex?: number;  // 堆疊內的位置（用於牌列）
}

enum GameArea {
  TABLEAU = 'tableau',      // 主要遊戲區域（7列）
  FOUNDATION = 'foundation', // 收集堆（4堆）
  STOCK = 'stock',          // 抽牌堆
  WASTE = 'waste'           // 從抽牌堆棄牌的牌堆
}
```

### 牌列
```typescript
interface TableauColumn {
  id: number;           // 列索引（0-6）
  cards: Card[];        // 此列中的紙牌（從底到頂）
  faceDownCount: number; // 底部朝下紙牌的數量
}
```

### 基礎堆
```typescript
interface FoundationPile {
  id: number;           // 堆索引（0-3）
  suit: CardSuit | null; // 此堆的花色（如果空則為null）
  cards: Card[];        // 按升序排列的紙牌（A到K）
  topRank: CardRank | null; // 當前頂牌點數（如果空則為null）
}
```

### 抽牌堆
```typescript
interface StockPile {
  cards: Card[];        // 剩餘未發的紙牌
  drawMode: DrawMode;   // 1張或3張抽牌
  currentDraw: Card[];  // 當前從抽牌堆抽出的紙牌
  cycleCount: number;   // 循環整副牌的次數
}

enum DrawMode {
  ONE_CARD = 1,   // 一次一張
  THREE_CARD = 3  // 一次三張
}
```

### 移動
```typescript
interface Move {
  id: string;           // 唯一移動識別符
  timestamp: number;    // 移動執行時間
  type: MoveType;       // 執行的移動類型
  cards: Card[];        // 被移動的紙牌
  from: Position;       // 來源位置
  to: Position;         // 目標位置
  revealed?: Card;      // 此移動揭露的紙牌（如果有）
}

enum MoveType {
  TABLEAU_TO_TABLEAU = 'tableau_to_tableau',         // 牌列到牌列
  TABLEAU_TO_FOUNDATION = 'tableau_to_foundation',   // 牌列到基礎堆
  STOCK_TO_WASTE = 'stock_to_waste',                 // 抽牌堆到棄牌堆
  WASTE_TO_TABLEAU = 'waste_to_tableau',             // 棄牌堆到牌列
  WASTE_TO_FOUNDATION = 'waste_to_foundation',       // 棄牌堆到基礎堆
  FOUNDATION_TO_TABLEAU = 'foundation_to_tableau'    // 基礎堆到牌列
}
```

### 遊戲狀態
```typescript
interface GameState {
  id: string;               // 遊戲會話識別符
  status: GameStatus;       // 當前遊戲狀態
  tableau: TableauColumn[]; // 7個牌列
  foundation: FoundationPile[]; // 4個基礎堆
  stock: StockPile;         // 抽牌堆狀態
  moves: Move[];            // 移動歷史用於復原功能
  statistics: GameStatistics; // 遊戲指標
  startTime: number;        // 遊戲開始時間戳
  endTime?: number;         // 遊戲結束時間戳（如果結束）
}

enum GameStatus {
  NOT_STARTED = 'not_started', // 尚未開始
  IN_PROGRESS = 'in_progress', // 進行中
  WON = 'won',                 // 獲勝
  PAUSED = 'paused'            // 暫停
}
```

### 遊戲統計
```typescript
interface GameStatistics {
  moveCount: number;        // 總移動次數
  undoCount: number;        // 使用復原的次數
  score: number;            // 當前遊戲分數
  elapsedTime: number;      // 遊戲時間（毫秒）
  cardsInFoundation: number; // 成功放置的紙牌數
}
```

### 用戶偏好設定
```typescript
interface UserPreferences {
  drawMode: DrawMode;       // 偏好的抽牌模式
  animationSpeed: number;   // 動畫持續時間（毫秒）
  soundEnabled: boolean;    // 音效回饋啟用
  theme: GameTheme;         // 視覺主題選擇
  autoComplete: boolean;    // 自動移動明顯的紙牌
}

enum GameTheme {
  CLASSIC = 'classic',              // 經典
  MODERN = 'modern',                // 現代
  HIGH_CONTRAST = 'high_contrast'   // 高對比
}
```

## 狀態轉換

### 紙牌狀態轉換
- 朝下 → 朝上：當紙牌成為牌列頂牌時
- 任何位置 → 牌列：遵循點數/顏色規則
- 牌列 → 基礎堆：遵循花色/點數規則
- 基礎堆 → 牌列：構建序列時

### 遊戲狀態轉換
- 尚未開始 → 進行中：首次移動時
- 進行中 → 獲勝：所有紙牌在基礎堆時
- 進行中 → 暫停：遊戲最小化/分頁不活躍時
- 暫停 → 進行中：遊戲恢復時

### 抽牌堆轉換
- 抽牌堆 → 棄牌堆：抽牌時
- 棄牌堆 → 抽牌堆：抽牌堆空時（循環）
- 棄牌堆 → 牌列/基礎堆：移動已抽紙牌時

## 驗證規則

### 紙牌移動規則
```typescript
// 牌列放置規則
function canPlaceOnTableau(card: Card, targetColumn: TableauColumn): boolean {
  const topCard = getTopCard(targetColumn);
  if (!topCard) return card.rank === CardRank.KING;
  
  return (
    card.rank === topCard.rank - 1 &&
    getCardColor(card) !== getCardColor(topCard)
  );
}

// 基礎堆放置規則
function canPlaceOnFoundation(card: Card, pile: FoundationPile): boolean {
  if (!pile.suit) return card.rank === CardRank.ACE;
  
  return (
    card.suit === pile.suit &&
    card.rank === pile.topRank! + 1
  );
}
```

### 勝利條件
```typescript
function isGameWon(gameState: GameState): boolean {
  return gameState.foundation.every(pile => 
    pile.cards.length === 13 && 
    pile.topRank === CardRank.KING
  );
}
```

## 資料持久化

### 本地存儲架構
```typescript
interface PersistedGameState {
  version: string;          // 遷移用的架構版本
  currentGame?: GameState;  // 活躍遊戲狀態
  preferences: UserPreferences; // 用戶設定
  statistics: OverallStatistics; // 跨遊戲統計
}

interface OverallStatistics {
  gamesPlayed: number;  // 已玩遊戲數
  gamesWon: number;     // 獲勝遊戲數
  winRate: number;      // 勝率
  bestTime: number;     // 最佳時間
  averageTime: number;  // 平均時間
  totalMoves: number;   // 總移動次數
}
```