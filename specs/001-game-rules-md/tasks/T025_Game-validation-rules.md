# T025. Game validation rules in src/services/game-validation.ts

## 描述

實作遊戲驗證規則服務，負責驗證接龍遊戲中所有移動操作的合法性。此服務包含牌組移動規則、基礎牌堆建構規則、以及遊戲狀態驗證等核心邏輯。

依據憲章 Principle II (TDD)，此實作必須讓所有相關的失敗測試通過，特別是 contract test 和 integration test。

此服務將提供：

- 牌組移動合法性驗證（Tableau 之間的移動）
- Foundation pile 建構規則驗證
- Stock pile 操作驗證
- 遊戲勝利條件檢查
- 移動歷史驗證

## 工項 tasks

- [ ] 建立 `src/services/game-validation.ts` 檔案
- [ ] 實作 `validateTableauMove()` - 驗證 tableau 間牌組移動
- [ ] 實作 `validateFoundationMove()` - 驗證移動到 foundation pile
- [ ] 實作 `validateStockPileOperation()` - 驗證 stock pile 操作
- [ ] 實作 `isValidCardSequence()` - 驗證牌組序列合法性
- [ ] 實作 `canPlaceOnFoundation()` - 檢查是否可放置到 foundation
- [ ] 實作 `canPlaceOnTableau()` - 檢查是否可放置到 tableau
- [ ] 實作 `isGameWon()` - 檢查遊戲是否獲勝
- [ ] 實作 `validateGameState()` - 驗證整體遊戲狀態
- [ ] 加入適當的 TypeScript 型別定義和錯誤處理
- [ ] 確保通過 T004 GameEngineContract 的 contract test
- [ ] 確保符合 Constitution 的 Code Quality Excellence 原則

## 測試方式

### 測試流程

1. 執行相關的 contract test 檢查介面實作：

   ```bash
   npm test tests/contract/test_game_engine.test.ts
   ```

2. 執行 integration test 驗證遊戲流程：

   ```bash
   npm test tests/integration/test_card_movement.test.ts
   npm test tests/integration/test_foundation.test.ts
   npm test tests/integration/test_stock_pile.test.ts
   ```

3. 檢查 TypeScript 編譯和程式碼品質：

   ```bash
   npm run typecheck
   npm run lint
   ```

4. 驗證函數功能：
   - 測試各種合法和非法的牌組移動
   - 測試 foundation pile 建構規則（A-K 遞增、同花色）
   - 測試 tableau 移動規則（K-A 遞減、交替顏色）
   - 測試遊戲勝利條件（所有牌移到 foundation）

### 執行測試語法指令

```bash
npm test -- --testPathPattern="(test_game_engine|test_card_movement|test_foundation|test_stock_pile)" --verbose
```

**TDD專用測試指令（測試T025實作）：**

```bash
node specs/001-game-rules-md/tests/T025_Game-validation-rules_test.mjs
```

## AI 使用工具

- **Write** - 建立 game-validation.ts 檔案
- **Read** - 讀取相關的 type definitions 和 model 檔案
- **Bash** - 執行測試指令和程式碼品質檢查
- **Edit** - 修改檔案內容以符合測試需求

需要參考的檔案：

- `src/types/card.ts` - 卡牌型別定義
- `src/types/game-state.ts` - 遊戲狀態型別
- `src/models/` - 相關的 model 實作
- `tests/contract/test_game_engine.test.ts` - 合約測試

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
