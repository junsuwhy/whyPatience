# T040. 將 GameBoard 連接至遊戲引擎服務

## 描述

將 GameBoard 主要元件與遊戲引擎服務 (game-engine.ts) 進行整合連接，實現完整的遊戲邏輯流程。此任務確保 GameBoard 可以正確調用遊戲引擎的核心功能，包括初始化遊戲、處理卡片移動、撤銷操作、勝利檢查等關鍵操作。

**主要目標**:

1. 整合 useGameState hook 與 GameBoard 元件，確保狀態管理正確
2. 連接遊戲引擎的卡片移動邏輯到拖放操作
3. 實現遊戲生命週期管理（新遊戲、暫停、恢復、重置）
4. 整合遊戲統計和計時器更新機制
5. 確保勝利條件檢查和遊戲結束流程運作正常
6. 實現錯誤處理和使用者回饋機制

**技術考量**:

- 使用 useGameState hook 作為 GameBoard 與遊戲引擎之間的橋樑
- 確保 GameEngine service 的所有方法被正確調用
- 實現事件處理機制，包括卡片移動、撤銷/重做、遊戲控制
- 維持 React 元件的響應式特性，確保狀態變更立即反映到 UI
- 遵循 Constitution 的效能標準（60fps 動畫、<16ms 渲染時間）

**相關文件參考**:

- `specs/001-game-rules-md/plan.md` - 整體實作計劃
- `specs/001-game-rules-md/data-model.md` - 資料模型定義
- `specs/001-game-rules-md/contracts/game-engine-interface.ts` - 遊戲引擎介面合約
- `specs/001-game-rules-md/quickstart.md` - 核心使用者流程
- `.specify/memory/constitution.md` - 開發憲法與品質標準

## 工項 tasks

- [x] 在 `src/components/GameBoard/GameBoard.tsx` 中整合 useGameState hook
  - 初始化 useGameState，取得遊戲狀態和操作方法
  - 將 gameState 傳遞給子元件（TableauColumn、FoundationPile、StockPile）
  - 設定遊戲初始化邏輯（新遊戲按鈕觸發）

- [x] 實現卡片移動處理邏輯
  - 連接 onCardMove 事件處理器到 useGameState 的 executeMove 方法
  - 實現拖放結束時的移動驗證和執行
  - 處理移動成功和失敗的情況，顯示適當的使用者回饋
  - 確保移動後遊戲統計（移動次數、分數）正確更新

- [x] 整合遊戲控制功能
  - 連接「新遊戲」按鈕到 newGame 方法
  - 連接「撤銷」按鈕到 undo 方法（檢查 canUndo）
  - 連接「重做」按鈕到 redo 方法（檢查 canRedo）
  - 實現暫停/恢復遊戲功能
  - 確保按鈕的啟用/禁用狀態根據遊戲狀態動態更新

- [x] 實現勝利條件檢查與遊戲結束流程
  - 在每次移動後檢查是否達成勝利條件
  - 顯示勝利覆蓋層和訊息（VictoryOverlay、VictoryMessage）
  - 記錄最終遊戲統計（總時間、總移動數、分數）
  - 提供「再玩一次」選項

- [x] 整合計時器和統計更新機制
  - 確保遊戲計時器在遊戲進行中正確運作
  - 實時更新 GameStatistics 元件顯示的統計資訊
  - 實現暫停時計時器停止、恢復時繼續計時

- [x] 實現錯誤處理和使用者回饋
  - 捕捉並顯示遊戲引擎返回的錯誤訊息
  - 實現視覺回饋機制（無效移動時的提示）
  - 確保錯誤不會導致遊戲崩潰或狀態不一致
  - 提供清晰的錯誤訊息給使用者

- [x] 最佳化效能和響應性
  - 使用 useCallback 包裝事件處理函數，避免不必要的重新渲染
  - 使用 useMemo 快取計算結果（如可用移動、遊戲狀態衍生值）
  - 確保拖放操作流暢，達到 60fps 效能目標
  - 檢查記憶體使用，確保符合 <50MB 限制

- [x] 確保無障礙性（Accessibility）
  - 確保所有遊戲控制可透過鍵盤操作
  - 提供適當的 ARIA 標籤和角色
  - 確保螢幕閱讀器可以正確讀取遊戲狀態
  - 實現焦點管理，確保鍵盤導航順序合理

## 測試方式

### 測試流程

**整合測試**:

1. 新遊戲初始化測試
   - 啟動應用程式
   - 點擊「新遊戲」按鈕
   - 驗證遊戲狀態正確初始化（7個 tableau 列、4個 foundation 堆、stock pile）
   - 檢查遊戲計時器開始運作
   - 確認移動計數器歸零

2. 卡片移動測試
   - 執行一個有效的卡片移動（例如：紅色牌移到黑色牌上）
   - 驗證移動被正確執行
   - 檢查移動計數器增加
   - 確認撤銷按鈕變為可用
   - 檢查遊戲統計更新

3. 撤銷/重做測試
   - 執行數個移動
   - 點擊撤銷按鈕，驗證最後一個移動被撤銷
   - 點擊重做按鈕，驗證移動被重新執行
   - 檢查移動歷史正確維護

4. 勝利條件測試
   - 使用開發者工具或測試模式快速達成勝利條件（所有卡片移至 foundation）
   - 驗證勝利覆蓋層顯示
   - 檢查最終統計資訊正確顯示
   - 確認「再玩一次」功能正常

5. 錯誤處理測試
   - 嘗試執行無效移動（例如：紅色牌移到紅色牌上）
   - 驗證錯誤訊息顯示
   - 確認遊戲狀態不變
   - 檢查無錯誤拋出到控制台

6. 效能測試
   - 使用 React DevTools Profiler 檢查渲染效能
   - 執行多次快速移動，驗證 UI 保持流暢（60fps）
   - 檢查記憶體使用不超過限制
   - 驗證沒有記憶體洩漏

**單元測試**:

執行相關整合測試，確保 GameBoard 與遊戲引擎的互動符合預期：

- `tests/integration/test_new_game.test.ts` - 新遊戲設置流程測試（T007）
- `tests/integration/test_card_movement.test.ts` - 基本卡片移動測試（T008）
- `tests/integration/test_foundation.test.ts` - Foundation 建構測試（T009）
- `tests/integration/test_stock_pile.test.ts` - Stock pile 操作測試（T010）
- `tests/integration/test_victory.test.ts` - 遊戲勝利流程測試（T011）
- `tests/integration/test_undo.test.ts` - 撤銷功能測試（T012）

### 執行測試語法指令

```bash
# 執行 T040 特定測試檔案
npm test -- tests/integration/T040_Connect-GameBoard-to-game-engine-service_test.ts

# 執行所有整合測試
npm test -- tests/integration

# 執行特定整合測試
npm test -- tests/integration/test_new_game.test.ts
npm test -- tests/integration/test_card_movement.test.ts
npm test -- tests/integration/test_victory.test.ts

# 執行 GameBoard 元件測試
npm test -- src/components/GameBoard

# 執行所有測試並生成覆蓋率報告
npm test -- --coverage

# 在開發模式下執行測試（watch mode）
npm test -- --watch

# 執行 E2E 測試（如果有）
npm run test:e2e
```

### 驗證檢查清單

執行測試後，確認以下項目：

- [ ] 所有整合測試通過（T007-T012）
- [ ] GameBoard 元件測試通過
- [ ] 測試覆蓋率達到要求的最低門檻（如 80%）
- [ ] 無 console 錯誤或警告
- [ ] React DevTools Profiler 顯示無效能瓶頸
- [ ] 手動測試確認 UI 互動流暢且直觀
- [ ] 無障礙性檢查通過（鍵盤導航、螢幕閱讀器）
- [ ] 跨瀏覽器測試通過（Chrome、Firefox、Safari）

## AI 使用工具

在執行本任務時，AI 將使用以下工具：

1. **檔案編輯工具** (`str_replace_editor`)
   - 檢視和編輯 `src/components/GameBoard/GameBoard.tsx`
   - 檢視 `src/hooks/useGameState.ts`
   - 檢視 `src/services/game-engine.ts`
   - 確保程式碼變更最小化且精準

2. **Bash 命令工具** (`bash`)
   - 執行測試指令 `npm test`
   - 執行 linting 檢查 `npm run lint`
   - 執行開發伺服器 `npm run dev`（如需手動測試）
   - 檢查檔案結構和相依性

3. **可能使用的 MCP 工具**
   - **Playwright** (如果有 E2E 測試): 用於自動化瀏覽器測試
   - **測試執行工具**: 用於執行 Jest 測試並生成報告

**注意事項**:

- 所有程式碼變更必須遵循專案既有的程式碼風格和慣例
- 必須確保測試通過後才能將任務標記為完成
- 如果需要修改其他檔案（如型別定義、介面），應該最小化變更範圍
- 保持與 Constitution 原則的一致性，特別是 TDD 和效能標準

## 完成流程

1. 完成所有工項並確保測試通過
2. 執行 `npm run lint` 確保程式碼品質
3. 執行所有相關測試並確認通過
4. 在 `specs/001-game-rules-md/tasks.md` 中，將 `- [ ] T040` 改為 `- [x] T040`
5. 如有待處理或需要後續檢查的項目，將 `[ ]` 改為 `[?]` 並註記原因
6. 清除執行記憶，準備進行下一個任務

**驗收標準**:

- GameBoard 成功連接到遊戲引擎服務
- 所有核心遊戲功能正常運作（新遊戲、移動、撤銷、勝利檢查）
- 所有整合測試通過（T007-T012）
- 效能符合標準（60fps、<16ms 渲染時間）
- 無障礙性符合 WCAG 2.1 AA 標準
- 程式碼品質通過 ESLint 檢查
- 無已知的錯誤或警告

完成後，將準備好進行 Phase 3.4 的下一個任務（T041: Integrate React DnD with card components）。
