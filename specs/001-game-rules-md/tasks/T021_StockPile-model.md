# T021. StockPile model

## 描述

建立 Stock Pile 模型類別，用於管理 Solitaire 遊戲中的庫存牌堆。此模型將負責處理剩餘卡牌的管理、翻牌機制（1張或3張模式）、廢牌堆的循環使用，以及追蹤庫存牌堆的狀態。

根據 Constitution 原則 I (Code Quality Excellence) 和 II (Test-Driven Development)，此模型必須有完整的驗證邏輯、清楚的錯誤處理，並且在實作前必須先有對應的測試。

此任務依賴 T014-T018 (類型定義和卡牌模型) 的完成，並為後續的 T024-T026 (服務層) 和 T030 (StockPile 元件) 奠定基礎。StockPile 包含兩個區域：庫存牌堆（face-down）和廢牌堆（face-up），支援 1張/3張翻牌模式。

## 工項 tasks

- [x] 實作 `StockPile` 類別包含 constructor 和基本屬性 (stock, waste, drawMode)
- [x] 加入 `draw()` 方法根據模式翻牌到廢牌堆 (1張或3張)
- [x] 實作 `canDraw()` 方法檢查是否可以翻牌
- [x] 實作 `reset()` 方法將廢牌堆卡牌回收到庫存牌堆
- [x] 加入 `getTopWasteCard()` 方法取得廢牌堆最上層卡牌
- [x] 實作 `removeTopWasteCard()` 方法移除廢牌堆最上層卡牌
- [x] 實作 `isEmpty()` 和 `isStockEmpty()` 狀態判斷方法
- [x] 加入 `getDrawMode()` 和 `setDrawMode()` 方法管理翻牌模式
- [x] 實作 `getRemainingCards()` 方法取得剩餘卡牌數量
- [x] 實作 `validate()` 方法驗證整個庫存牌堆狀態合法性
- [x] 實作 `clone()` 方法建立庫存牌堆副本
- [x] 實作 `toJSON()` 和靜態 `fromJSON()` 方法支援序列化
- [x] 加入完整的 JSDoc 註解和錯誤處理
- [x] 導出 StockPile 類別和相關工具函數

## 測試方式

### 測試流程

驗證 `src/models/stock-pile.ts` 檔案已建立且包含：

1. StockPile 類別正確實作所有必要方法和屬性
2. 翻牌機制正確運作，支援 1張/3張模式
3. 廢牌堆循環機制正確處理空庫存的情況
4. 狀態判斷方法正確回傳庫存牌堆狀態
5. 序列化和反序列化功能正常運作
6. 所有方法都有適當的錯誤處理和邊界情況處理
7. 通過對應的契約測試 (T004) 和單元測試 (T047)
8. 符合 TypeScript strict mode、ESLint 和 Prettier 規範

### 執行測試語法指令

```bash
# 執行專用 T021 StockPile 單元測試 (TDD 測試)
npm test tests/unit/T021_StockPile-model.test.ts

# 執行契約測試 (應該從失敗轉為通過)
npm test tests/contract/test_game_engine.test.ts

# 執行所有模型單元測試
npm test tests/unit/test_models.test.ts

# 執行 TypeScript 編譯檢查
npm run typecheck

# 執行 ESLint 檢查
npm run lint

# 驗證模型邏輯正確性 (需要先實作 StockPile)
node -e "
const { StockPile } = require('./src/models/stock-pile.ts');
const { Card } = require('./src/models/card.ts');
const { Suit, Rank, DrawMode } = require('./src/types/card.ts');
const cards = [new Card(Suit.HEARTS, Rank.ACE), new Card(Suit.SPADES, Rank.KING)];
const stockPile = new StockPile(cards, DrawMode.ONE);
console.log('Can draw:', stockPile.canDraw());
stockPile.draw();
console.log('Top waste card:', stockPile.getTopWasteCard());
console.log('Remaining cards:', stockPile.getRemainingCards());
"
```

## AI 使用工具

需要使用以下工具：

- **Write**: 建立 `src/models/stock-pile.ts` 檔案
- **Read**: 讀取類型定義檔案 (`src/types/card.ts`, `src/types/game-state.ts`) 和 Card 模型
- **Bash**: 執行測試、TypeScript 編譯檢查和 linting
- **LS**: 驗證目錄結構
- **Grep**: 檢查相關的測試檔案和契約

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶