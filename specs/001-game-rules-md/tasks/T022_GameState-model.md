# T022. GameState model

## 描述

建立遊戲狀態模型類別，包含完整的狀態管理和驗證機制。此模型將作為整個 Solitaire 遊戲的核心狀態容器，負責管理遊戲的所有元件狀態、歷史記錄和遊戲邏輯驗證。

根據 Constitution 原則 I (Code Quality Excellence) 和 II (Test-Driven Development)，此模型必須有完整的狀態驗證邏輯、清楚的錯誤處理，並且在實作前必須先有對應的測試。

此任務依賴 T014-T021 (類型定義和基礎模型) 的完成，並為後續的 T023 (Move 模型) 和 T024-T026 (服務層) 奠定基礎。

## 工項 tasks

- [ ] 建立 `src/models/game-state.ts` 檔案
- [ ] 實作 `GameState` 類別包含 constructor 和基本屬性
- [ ] 加入遊戲狀態驗證方法 `validate()` 檢查狀態合法性
- [ ] 實作 `isGameWon()` 方法檢查遊戲是否勝利
- [ ] 實作 `canMove(from, to)` 方法驗證移動的合法性
- [ ] 實作 `makeMove(move)` 方法執行卡牌移動
- [ ] 實作 `undoLastMove()` 方法撤銷上一步移動
- [ ] 加入 `getValidMoves()` 方法取得所有合法移動
- [ ] 實作 `newGame()` 靜態方法建立新遊戲狀態
- [ ] 實作 `clone()` 方法建立遊戲狀態副本
- [ ] 實作 `toJSON()` 和靜態 `fromJSON()` 方法支援序列化
- [ ] 加入完整的 JSDoc 註解和錯誤處理
- [ ] 導出 GameState 類別和相關工具函數

## 測試方式

### 測試流程

驗證 `src/models/game-state.ts` 檔案已建立且包含：

1. GameState 類別正確實作所有必要方法和屬性
2. 遊戲狀態驗證邏輯正確運作，能檢測非法狀態
3. 移動驗證和執行邏輯符合 Solitaire 遊戲規則
4. 勝利條件檢查正確實作
5. 撤銷功能和歷史記錄管理正常運作
6. 序列化和反序列化功能正常運作
7. 所有方法都有適當的錯誤處理和邊界情況處理
8. 通過對應的契約測試 (T004) 和單元測試 (T047)
9. 符合 TypeScript strict mode、ESLint 和 Prettier 規範

### 執行測試語法指令

```bash
# 執行契約測試 (應該從失敗轉為通過)
npm test tests/contract/test_game_engine.test.ts

# 執行專用單元測試 (TDD 測試)
npm test tests/unit/test_models.test.ts

# 執行 TypeScript 編譯檢查
npm run typecheck

# 執行 ESLint 檢查
npm run lint

# 驗證模型邏輯正確性
node -e "
const { GameState } = require('./src/models/game-state.ts');
const gameState = GameState.newGame();
console.log('Game validation:', gameState.validate());
console.log('Is game won:', gameState.isGameWon());
"

# 執行 T022 專用單元測試
npm test tests/unit/T022_GameState-model.test.ts
```

## AI 使用工具

需要使用以下工具：

- **Write**: 建立 `src/models/game-state.ts` 檔案
- **Read**: 讀取類型定義檔案 (`src/types/game-state.ts`, `src/types/card.ts`, `src/types/position.ts`)
- **Read**: 讀取已完成的模型檔案 (`src/models/card.ts`, `src/models/tableau-column.ts`, `src/models/foundation-pile.ts`, `src/models/stock-pile.ts`)
- **Bash**: 執行測試、TypeScript 編譯檢查和 linting
- **LS**: 驗證目錄結構
- **Grep**: 檢查相關的測試檔案和契約

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶