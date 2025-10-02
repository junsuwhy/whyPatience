# T036. useGameState Hook 實作

## 描述

實作自訂的 React Hook `useGameState` 用於管理整個 Solitaire 遊戲的狀態，提供統一的狀態管理介面給所有元件使用。此 Hook 負責：

- 初始化和維護遊戲狀態（GameState）
- 提供遊戲操作方法（新遊戲、執行移動、撤銷/重做、暫停/恢復）
- 管理遊戲階段轉換（NEW_GAME → PLAYING → WON/LOST）
- 整合 game-engine 服務進行遊戲邏輯驗證
- 整合 storage 服務進行狀態持久化
- 提供遊戲統計資料更新（移動次數、得分、時間）
- 確保符合《Constitution》四大原則：
  - Code Quality：清晰的介面設計、型別安全、錯誤處理完善
  - TDD：先撰寫測試，確保所有狀態轉換和操作都有測試覆蓋
  - UX Consistency：提供一致的狀態更新機制，確保 UI 即時反映狀態變化
  - Performance：使用 useReducer 管理複雜狀態、避免不必要的重新渲染、使用 useMemo/useCallback 優化效能

## 工項 tasks

- [ ] 審查現有的 GameState 型別定義（`src/types/game-state.ts`）
- [ ] 審查 GameState 模型（`src/models/game-state.ts`）
- [ ] 審查 game-engine 服務介面（`src/services/game-engine.ts`）
- [ ] 審查 storage 服務介面（`src/services/storage.ts`）
- [ ] 設計 useGameState hook 的回傳介面結構
- [ ] 建立 `src/hooks/useGameState.ts` 檔案
- [ ] 實作狀態初始化邏輯（從 localStorage 載入或建立新遊戲）
- [ ] 實作 useReducer 進行狀態管理（actions: NEW_GAME, MOVE, UNDO, REDO, PAUSE, RESUME, UPDATE_SETTINGS）
- [ ] 實作 `newGame()` 方法：建立新遊戲、發牌、重置統計
- [ ] 實作 `executeMove(from: Position, to: Position)` 方法：驗證並執行移動、更新歷史記錄
- [ ] 實作 `undo()` 方法：撤銷上一步移動、恢復前一個狀態
- [ ] 實作 `redo()` 方法：重做已撤銷的移動
- [ ] 實作 `pauseGame()` 和 `resumeGame()` 方法：暫停和恢復計時器
- [ ] 實作 `updateSettings(settings: Partial<GameSettings>)` 方法：更新遊戲設定
- [ ] 實作遊戲勝利檢測邏輯（當所有卡片都在 foundation 中）
- [ ] 整合 game-engine 進行移動驗證
- [ ] 整合 storage 服務自動儲存狀態（使用 useEffect 監聽狀態變化）
- [ ] 實作計時器邏輯（使用 useEffect 和 setInterval 更新 elapsedTime）
- [ ] 使用 useMemo 優化派生狀態（如 canUndo, canRedo, isWon）
- [ ] 使用 useCallback 包裹所有方法避免不必要的重新建立
- [ ] 加入型別定義和 JSDoc 註解
- [ ] 處理錯誤情況（無效移動、載入失敗等）
- [ ] 撰寫對應測試檔 `tests/unit/test_useGameState.test.ts`
- [ ] 測試：初始化新遊戲狀態
- [ ] 測試：從 localStorage 載入既有遊戲
- [ ] 測試：執行有效移動並更新狀態
- [ ] 測試：拒絕無效移動
- [ ] 測試：撤銷/重做功能正常運作
- [ ] 測試：遊戲勝利檢測正確觸發
- [ ] 測試：狀態變更自動儲存到 storage
- [ ] 測試：計時器正確更新 elapsedTime
- [ ] 測試：暫停/恢復遊戲停止/啟動計時器
- [ ] 測試：更新設定正確套用並持久化
- [ ] 確保測試覆蓋率達到 90% 以上
- [ ] 在 `specs/001-game-rules-md/tasks.md` 將 T036 標記為完成

## 測試方式

### 測試流程

1. **初始化測試**：
   - 渲染使用 useGameState 的測試元件
   - 驗證回傳的狀態符合 GameState 介面
   - 驗證初始遊戲階段為 NEW_GAME 或載入的狀態

2. **新遊戲測試**：
   - 呼叫 newGame() 方法
   - 驗證遊戲階段轉換為 PLAYING
   - 驗證 tableau 有 7 個欄位，每個欄位有對應數量的牌
   - 驗證 foundation 有 4 個空堆疊
   - 驗證 stock 包含剩餘的牌
   - 驗證統計資料重置（moveCount = 0, score = 0）

3. **移動執行測試**：
   - 設定有效的移動情境（例如：紅7移到黑8）
   - 呼叫 executeMove(from, to)
   - 驗證移動成功執行
   - 驗證 moveCount 增加
   - 驗證歷史記錄新增一筆

4. **無效移動測試**：
   - 設定無效的移動情境（例如：紅7移到紅8）
   - 呼叫 executeMove(from, to)
   - 驗證移動被拒絕（狀態不變）
   - 驗證錯誤訊息正確回傳

5. **撤銷/重做測試**：
   - 執行幾個移動
   - 呼叫 undo()，驗證狀態恢復到前一步
   - 驗證 canUndo 和 canRedo 正確更新
   - 呼叫 redo()，驗證移動重新執行

6. **勝利檢測測試**：
   - 模擬所有 52 張牌都在 foundation 的狀態
   - 驗證遊戲階段轉換為 WON
   - 驗證 endTime 被設定
   - 驗證統計資料正確記錄

7. **持久化測試**：
   - 執行移動並等待儲存
   - 驗證 storage.saveGameState 被呼叫
   - 建立新的 hook 實例
   - 驗證狀態從 storage 正確載入

8. **計時器測試**：
   - 使用 jest.useFakeTimers()
   - 啟動遊戲並推進時間
   - 驗證 elapsedTime 持續更新
   - 呼叫 pauseGame()，驗證計時器停止
   - 呼叫 resumeGame()，驗證計時器恢復

9. **效能測試**：
   - 驗證方法使用 useCallback（比較參考位址）
   - 驗證派生值使用 useMemo
   - 執行多次移動，確認不會造成記憶體洩漏

### 執行測試語法指令

```bash
# 執行單一測試檔
npm test -- --testPathPattern=test_useGameState.test.ts

# 執行所有 unit tests
npm test -- --testPathPattern=unit

# 執行測試並顯示覆蓋率
npm test -- --coverage --testPathPattern=test_useGameState.test.ts

# Lint 程式碼品質檢查
npm run lint

# TypeScript 型別檢查
npm run typecheck || tsc --noEmit

# 監聽模式持續測試（開發時使用）
npm test -- --watch --testPathPattern=test_useGameState.test.ts
```

## AI 使用工具

- **Read**: 讀取現有型別定義、模型、服務介面
  - `src/types/game-state.ts`
  - `src/models/game-state.ts`
  - `src/services/game-engine.ts`
  - `src/services/storage.ts`
  - React Hooks 最佳實踐參考
- **Write**: 建立新檔案
  - `src/hooks/useGameState.ts`
  - `tests/unit/test_useGameState.test.ts`
- **Bash**: 執行測試、lint、型別檢查
- **Edit**: 如需修改相關型別或介面（應盡量避免，優先使用現有定義）

## 完成流程

- 確保所有測試通過（綠燈）
- 確保程式碼覆蓋率達到 90% 以上
- 確保 lint 和 TypeScript 檢查無錯誤
- 在 `specs/001-game-rules-md/tasks.md` 將本任務 `- [ ] T036` 改為 `- [x] T036`
- 提交變更：`git add . && git commit -m "feat: implement useGameState hook (T036)"`
- 清除執行記憶
