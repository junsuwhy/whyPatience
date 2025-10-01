# T020. FoundationPile model

## 描述

建立 Foundation Pile 模型類別，用於管理 Solitaire 遊戲中的四個基礎牌堆（Hearts、Diamonds、Clubs、Spades）。此模型將負責處理卡牌的正確堆疊順序、驗證放置規則，以及追蹤每個花色基礎牌堆的狀態。

根據 Constitution 原則 I (Code Quality Excellence) 和 II (Test-Driven Development)，此模型必須有完整的驗證邏輯、清楚的錯誤處理，並且在實作前必須先有對應的測試。

此任務依賴 T014-T018 (類型定義和卡牌模型) 的完成，並為後續的 T024-T026 (服務層) 和 T029 (FoundationPile 元件) 奠定基礎。FoundationPile 必須按照花色分組，從 Ace 開始按序堆疊到 King。

## 工項 tasks

- [x] 實作 `FoundationPile` 類別包含 constructor 和基本屬性 (suit, cards)
- [x] 加入堆疊驗證方法 `canAddCard(card)` 檢查卡牌是否可放置
- [x] 實作 `addCard(card)` 方法添加合法卡牌到基礎牌堆
- [x] 實作 `removeTopCard()` 方法移除最上層卡牌
- [x] 加入 `getTopCard()` 方法取得最上層卡牌
- [x] 實作 `isEmpty()` 和 `isFull()` 狀態判斷方法
- [x] 加入 `isComplete()` 方法檢查是否從 Ace 到 King 完整堆疊
- [x] 實作 `getExpectedNextRank()` 方法取得下一張預期的點數
- [x] 加入 `validate()` 方法驗證整個牌堆狀態合法性
- [x] 實作 `getScore()` 方法計算基礎牌堆分數
- [x] 實作 `clone()` 方法建立牌堆副本
- [x] 實作 `toJSON()` 和靜態 `fromJSON()` 方法支援序列化
- [x] 加入完整的 JSDoc 註解和錯誤處理
- [x] 導出 FoundationPile 類別和相關工具函數

## 測試方式

### 測試流程

驗證 `src/models/foundation-pile.ts` 檔案已建立且包含：

1. FoundationPile 類別正確實作所有必要方法和屬性
2. 卡牌放置規則正確運作，只允許同花色且按序堆疊
3. Ace 必須是第一張卡牌，King 必須是最後一張
4. 狀態判斷方法正確回傳牌堆狀態
5. 序列化和反序列化功能正常運作
6. 所有方法都有適當的錯誤處理和邊界情況處理
7. 通過對應的契約測試 (T004) 和單元測試 (T047)
8. 符合 TypeScript strict mode、ESLint 和 Prettier 規範

### 執行測試語法指令

```bash
# 執行專用 T020 FoundationPile 單元測試 (TDD 測試)
npm test tests/unit/T020_FoundationPile-model.test.ts

# 執行契約測試 (應該從失敗轉為通過)
npm test tests/contract/test_game_engine.test.ts

# 執行所有模型單元測試
npm test tests/unit/test_models.test.ts

# 執行 TypeScript 編譯檢查
npm run typecheck

# 執行 ESLint 檢查
npm run lint

# 驗證模型邏輯正確性 (需要先實作 FoundationPile)
node -e "
const { FoundationPile } = require('./src/models/foundation-pile.ts');
const { Card } = require('./src/models/card.ts');
const { Suit, Rank } = require('./src/types/card.ts');
const pile = new FoundationPile(Suit.HEARTS);
const aceHearts = new Card(Suit.HEARTS, Rank.ACE);
console.log('Can add Ace:', pile.canAddCard(aceHearts));
pile.addCard(aceHearts);
console.log('Is empty:', pile.isEmpty());
console.log('Expected next rank:', pile.getExpectedNextRank());
"
```

## AI 使用工具

需要使用以下工具：

- **Write**: 建立 `src/models/foundation-pile.ts` 檔案
- **Read**: 讀取類型定義檔案 (`src/types/card.ts`, `src/types/game-state.ts`) 和 Card 模型
- **Bash**: 執行測試、TypeScript 編譯檢查和 linting
- **LS**: 驗證目錄結構
- **Grep**: 檢查相關的測試檔案和契約

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶