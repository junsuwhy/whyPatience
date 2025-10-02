# T015. Game state types in src/types/game-state.ts

## 描述

建立遊戲狀態相關的 TypeScript 型別定義，包含完整的遊戲狀態結構、遊戲階段枚舉、以及相關的型別介面。此任務需要定義紙牌遊戲中所有可能的遊戲狀態，確保型別安全並符合 Constitution 中的 Code Quality Excellence 原則。

根據 plan.md 中的技術規格，需要支援：

- 遊戲狀態管理 (新遊戲、進行中、勝利、暫停等)
- 七個 tableau 欄位的狀態
- 四個 foundation pile 的狀態
- Stock pile 和 waste pile 的狀態
- 遊戲統計和計分系統
- 撤銷/重做功能的狀態追蹤
- LocalStorage 持久化的狀態結構

## 工項 tasks

- [ ] 定義 `GamePhase` 枚舉 (NEW_GAME, PLAYING, PAUSED, WON, LOST)
- [ ] 定義 `GameState` 主要介面，包含所有遊戲區域狀態
- [ ] 定義 `TableauState` 介面，管理七個 tableau 欄位
- [ ] 定義 `FoundationState` 介面，管理四個 foundation pile
- [ ] 定義 `StockState` 介面，管理 stock 和 waste pile
- [ ] 定義 `GameStatistics` 介面，追蹤得分、時間、移動次數
- [ ] 定義 `GameHistory` 介面，支援撤銷/重做功能
- [ ] 定義 `GameSettings` 介面，管理遊戲偏好設定
- [ ] 加入完整的 JSDoc 註釋說明所有型別
- [ ] 確保所有型別符合 TypeScript strict mode 要求

## 測試方式

### 測試流程

驗證 TypeScript 型別定義的正確性：

1. 確認 `src/types/game-state.ts` 檔案已建立
2. 執行 TypeScript 編譯檢查，確保無型別錯誤
3. 驗證所有枚舉值和介面屬性都有適當的型別註釋
4. 確認型別定義與 data-model.md 中的規格一致
5. 檢查型別定義支援後續實作需求 (models, services, components)

### 執行測試語法指令

```bash
# 執行 TypeScript 型別檢查測試
node specs/001-game-rules-md/tests/T015_Game-state-types_test.mjs

# 或是直接執行編譯檢查
npx tsc --noEmit --strict src/types/game-state.ts
npm run lint src/types/game-state.ts
```

## AI 使用工具

- **Read**: 讀取 constitution.md, plan.md, data-model.md 了解需求規格
- **Write**: 建立 src/types/game-state.ts 檔案
- **Edit**: 修改和優化型別定義
- **Bash**: 執行 TypeScript 編譯檢查和 lint 驗證

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
