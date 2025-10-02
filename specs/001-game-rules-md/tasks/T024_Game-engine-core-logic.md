# T024. Game engine core logic in src/services/game-engine.ts

## 描述

建立遊戲引擎的核心邏輯實作，負責處理所有遊戲規則、卡牌移動驗證、遊戲狀態管理和勝利條件檢查。此任務為核心實作階段的遊戲引擎部分，將實現完整的接龍遊戲邏輯，包括卡牌移動規則、自動移動到基礎堆疊、撤銷功能和遊戲勝利檢測。

根據 Constitution 原則 I (Code Quality Excellence)，遊戲引擎必須遵循清晰的架構模式，保持高可維護性和可測試性。根據原則 II (Test-Driven Development)，此實作必須使所有相關的契約測試和整合測試通過，確保遊戲邏輯的正確性和可靠性。根據原則 IV (Performance Standards)，遊戲引擎必須滿足 60fps 動畫和 <16ms 渲染時間的效能要求。

## 工項 tasks

- [x] 建立 `src/services/game-engine.ts` 檔案
- [x] 實作 `GameEngine` 類別基本結構
- [x] 實作 `initializeGame()` 方法 - 建立新遊戲、洗牌、發牌
- [x] 實作 `validateMove()` 方法 - 驗證卡牌移動是否合法
- [x] 實作 `executeMove()` 方法 - 執行有效的卡牌移動
- [x] 實作 `canMoveToFoundation()` 方法 - 檢查是否可移動到基礎堆疊
- [x] 實作 `autoMoveToFoundation()` 方法 - 自動移動符合條件的卡牌
- [x] 實作 `canMoveToTableau()` 方法 - 檢查是否可移動到牌組欄位
- [x] 實作 `flipStockCard()` 方法 - 翻開庫存堆疊卡牌
- [x] 實作 `resetStock()` 方法 - 重置庫存堆疊到廢牌堆
- [x] 實作 `undoLastMove()` 方法 - 撤銷上一步移動
- [x] 實作 `checkVictory()` 方法 - 檢查遊戲勝利條件
- [x] 實作 `getValidMoves()` 方法 - 取得當前可用的移動選項
- [x] 實作 `calculateScore()` 方法 - 計算遊戲分數
- [x] 實作 `getGameStatistics()` 方法 - 取得遊戲統計資料
- [x] 添加完整的 JSDoc 文檔說明所有方法
- [x] 確保所有方法符合 GameEngineContract 介面
- [x] 實作錯誤處理和邊界條件檢查
- [x] 最佳化效能以滿足 60fps 要求

## 測試方式

### 測試流程

執行所有相關的契約測試和整合測試，確保遊戲引擎正確實作所有遊戲規則。測試包括新遊戲建立、卡牌移動驗證、勝利條件檢查、撤銷功能和效能要求。

### 執行測試語法指令

```bash
# 執行遊戲引擎契約測試
npm test tests/contract/test_game_engine.test.ts

# 執行新遊戲設置整合測試
npm test tests/integration/test_new_game.test.ts

# 執行卡牌移動整合測試
npm test tests/integration/test_card_movement.test.ts

# 執行基礎堆疊整合測試
npm test tests/integration/test_foundation.test.ts

# 執行庫存堆疊整合測試
npm test tests/integration/test_stock_pile.test.ts

# 執行勝利流程整合測試
npm test tests/integration/test_victory.test.ts

# 執行撤銷功能整合測試
npm test tests/integration/test_undo.test.ts

# TypeScript 編譯檢查
npx tsc --noEmit

# 程式碼品質檢查
npm run lint

# 效能測試
npm run test:performance

# T024 單元測試
npm test tests/unit/T024_Game-engine-core-logic.test.ts
```

## AI 使用工具

此任務需要使用以下工具：

- **Write**: 建立新的遊戲引擎服務檔案
- **Edit**: 編輯和修改遊戲邏輯實作
- **Read**: 讀取相關的類型定義、模型和契約檔案
- **Bash**: 執行測試命令和品質檢查
- **Grep**: 搜尋相關的測試檔案和介面定義

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
