# T023. Move model and history

## 描述

建立移動模型和歷史記錄管理系統，負責記錄和管理 Solitaire 遊戲中的所有卡牌移動操作。此模型將支援撤銷/重做功能，並提供完整的移動歷史追蹤機制。

根據 Constitution 原則 I (Code Quality Excellence) 和 II (Test-Driven Development)，此模型必須有完整的移動驗證邏輯、清楚的錯誤處理，並且在實作前必須先有對應的測試。

此任務依賴 T014-T022 (類型定義和基礎模型) 的完成，並為後續的 T024-T026 (服務層) 和撤銷功能奠定基礎。

## 工項 tasks

- [x] 建立 `src/models/move.ts` 檔案
- [x] 實作 `Move` 類別包含 constructor 和基本屬性 (from, to, cardId, moveType)
- [x] 實作 `MoveHistory` 類別管理移動歷史記錄
- [x] 加入移動類型枚舉 (tableau to tableau, tableau to foundation, stock to tableau 等)
- [x] 實作 `Move.validate()` 方法驗證移動的合法性
- [x] 實作 `Move.execute(gameState)` 方法執行移動操作
- [x] 實作 `Move.undo(gameState)` 方法撤銷移動操作
- [x] 實作 `MoveHistory.addMove(move)` 方法記錄新移動
- [x] 實作 `MoveHistory.undoLastMove()` 方法撤銷上一步移動
- [x] 實作 `MoveHistory.redoMove()` 方法重做移動
- [x] 實作 `MoveHistory.canUndo()` 和 `MoveHistory.canRedo()` 檢查方法
- [x] 實作 `MoveHistory.clear()` 方法清空歷史記錄
- [x] 實作序列化方法 `toJSON()` 和 `fromJSON()` 支援持久化
- [x] 加入完整的 JSDoc 註解和錯誤處理
- [x] 導出 Move、MoveHistory 類別和相關枚舉

## 測試方式

### 測試流程

驗證 `src/models/move.ts` 檔案已建立且包含：

1. Move 類別正確實作所有必要方法和屬性
2. MoveHistory 類別正確管理移動歷史記錄
3. 移動驗證邏輯正確運作，能檢測非法移動
4. 移動執行和撤銷邏輯符合 Solitaire 遊戲規則
5. 歷史記錄管理功能 (撤銷/重做) 正常運作
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

# 驗證移動模型邏輯正確性
node -e "
const { Move, MoveHistory } = require('./src/models/move.ts');
const history = new MoveHistory();
console.log('Can undo:', history.canUndo());
console.log('Can redo:', history.canRedo());
"

# 執行 T023 專用單元測試
npm test tests/unit/T023_Move-model.test.ts
```

## AI 使用工具

需要使用以下工具：

- **Write**: 建立 `src/models/move.ts` 檔案
- **Read**: 讀取類型定義檔案 (`src/types/game-state.ts`, `src/types/card.ts`, `src/types/position.ts`)
- **Read**: 讀取已完成的模型檔案 (`src/models/card.ts`, `src/models/tableau-column.ts`, `src/models/foundation-pile.ts`, `src/models/stock-pile.ts`, `src/models/game-state.ts`)
- **Bash**: 執行測試、TypeScript 編譯檢查和 linting
- **LS**: 驗證目錄結構
- **Grep**: 檢查相關的測試檔案和契約

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶