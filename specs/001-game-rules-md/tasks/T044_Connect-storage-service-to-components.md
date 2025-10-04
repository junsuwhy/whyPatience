# T044. 連接 Storage Service 至元件與狀態層 (Connect storage service to components)

## 描述

本任務目標是將已完成的 `StorageService` (`src/services/storage.ts`) 與應用程式的 React 元件 / hooks 進行系統化整合，使 UI 與核心遊戲狀態能：
1. 讀取並顯示使用者偏好設定 (UserPreferences)
2. 於適當時機儲存偏好、統計、遊戲狀態（僅「儲存點掛勾」；實際完整恢復/載入流程放在 T045）
3. 更新並顯示遊戲統計資料 (Overall / GameStatistics)
4. 在錯誤（儲存配額滿、資料損毀、權限失敗）時提供可回復之 UI 回饋
5. 符合《Constitution》之：
   - Code Quality Excellence：明確抽象（Provider / hooks）、型別安全、防錯
   - Test-Driven Development：先寫整合/單元測試（測試失敗 → 實作 → 綠燈）
   - User Experience Consistency：偏好設定立即反映、錯誤有一致訊息
   - Performance Standards：儲存動作非阻塞 UI（非同步、可節流 / debounce / interval），避免 >16ms 主執行緒壓力

⚠️ 與 T045 的邊界釐清：
- T044 僅負責「接線」(wiring) 與觸發儲存；
- 「遊戲初始化時讀取並恢復上次進度」→ 留給 T045；
- 「使用者選擇載入/放棄現有進度邏輯」→ T045。

## 工項 tasks

- [ ] 盤點現況：檢視以下檔案以確認尚未整合 storage 的接點（僅作為記錄，不修改）：
      - `src/hooks/useGameState.ts`
      - `src/components/GameStatistics/GameStatistics.tsx`
      - `src/components/SettingsModal/SettingsModal.tsx`
      - `src/components/App.tsx` 或 `src/App.tsx`
- [ ] 建立 `src/context/StorageContext.tsx`：
      - 匯出 `<StorageProvider>` 與 `useStorage()` hook
      - 提供：`storageService`、`preferences`、`statistics`、`updatePreferences(partial)`、`refreshStatistics()`、`saveGameState(gameState)`、錯誤狀態
      - 初次載入：並行載入 `preferences`、`statistics`（GameState 載入在 T045）
- [ ] 在 `src/types/preferences.ts` 確認/擴充若缺少動畫 / 語言等欄位（對應 StorageService 預設）
- [ ] 在 `App.tsx` 將 `<StorageProvider>` 包覆於根 (Provider tree)：位於 GameState / DnD / Theme Provider 之前或之間，確保下層可使用
- [ ] 調整 `SettingsModal`：
      - 使用 `useStorage()` 讀寫 preferences
      - 變更即時（可 debounce 300ms 後才觸發 savePreferences）
      - 加入錯誤提示 UI（ex: 儲存失敗顯示『偏好儲存失敗，請稍後重試』）
- [ ] 調整 `GameStatistics`：
      - 使用 `useStorage()` 取得 statistics（而非內部自行計算）
      - 提供重新整理按鈕（呼叫 `refreshStatistics()`）
- [ ] 在 `useGameState`（或相等邏輯位置）加入「遊戲進行時定期儲存鉤子」：
      - 觸發條件：
        - 每次成功移動後（throttle：>1s 間隔才進行存檔）
        - 遊戲完成（立即 `saveGameState()` + `updateGameResult()`）
      - 需可停用：若 `preferences.autoSave === false` 則跳過
- [ ] 實作儲存節流工具：`src/utils/throttle.ts`（若尚未存在）
- [ ] 新增錯誤分類 UI 對應：
      - QUOTA_EXCEEDED → 提示使用者清除資料 / 重設
      - DATA_CORRUPTION → 提供『重設資料』按鈕（呼叫 `clearAllData()` + reload）
      - PERMISSION_DENIED → 提示瀏覽器封鎖本地儲存
- [ ] 於 `StorageContext` 實作集中錯誤處理（error boundary pattern light）：
      - 維護 `lastError` 狀態
      - 提供 `clearError()`
- [ ] 在 `GameBoard` 或 `App` 加入簡易 `<StorageErrorBanner>`（條件渲染）
- [ ] 更新文件：
      - `specs/001-game-rules-md/quickstart.md`（若允許）新增：偏好修改 → 立即儲存；遊戲進行中自動儲存
      - 或建立註解於 `StorageContext.tsx` 描述行為（若 quickstart 不允許修改）
- [ ] 新增單元測試：
      - `tests/unit/test_storage_integration.test.ts`（或整合到現有 storage 測試檔）
      - Mock `localStorage`、驗證 `updatePreferences()` 觸發 `savePreferences`
      - 驗證節流：短時間多次 move 只儲存 1 次
      - 驗證 `updateGameResult()` 在遊戲勝利流程被呼叫（可 spy）
- [ ] 新增整合測試：
      - `tests/integration/test_storage_wiring.test.ts`
      - 模擬：執行幾步移動 → 重掛載 GameStatistics → 期待統計更新（勝利流程可先略過，待 T045）
- [ ] 確認效能：
      - 儲存操作不會造成 React re-render storm（Provider value 使用 useMemo）
      - throttle 實測：連續 10 次快速移動僅 1~2 次 save 呼叫
- [ ] 更新 `specs/001-game-rules-md/tasks.md` 將 T044 狀態於完成後改為 `[x]`

## 測試方式

### 測試流程

1. 單元（StorageContext / throttle）：
   - 偏好值初次載入：mock storageService 回傳預設 → 組件渲染後 `preferences.theme === 'light'`
   - 呼叫 `updatePreferences({ theme: 'dark' })` → debounce 後觸發 `savePreferences`
   - 模擬 5 次快速 `executeMove()` → 只觸發 1 次 `saveGameState`
2. 統計更新：
   - 模擬 `updateGameResult(true, moves=123, time=456789)` → `loadStatistics()` 再次呼叫應含 updated win count
3. 錯誤處理：
   - Mock storageService.savePreferences 擲出 QUOTA_EXCEEDED → UI 顯示對應訊息
   - Mock saveGameState 擲出 PERMISSION_DENIED → UI 顯示『瀏覽器封鎖本地儲存』
4. 整合：
   - Render App → 開啟 SettingsModal → 更改語言 / 主題 → 關閉後重新打開仍保持（表示已保存）
   - 進行多次移動（呼叫 hook 模擬）→ spy saveGameState 呼叫次數節流
5. 邊界：
   - preferences.autoSave=false → 移動不觸發 saveGameState
   - statistics 讀取失敗 → fallback 顯示預設值並標記『(暫無資料)』

### 執行測試語法指令

```bash
# 執行 T044 專用單元測試
npm test -- tests/unit/T044_storage_integration.test.ts

# 執行 T044 專用整合測試
npm test -- tests/integration/T044_storage_wiring.test.ts

# 僅跑包含 T044 關鍵字的測試
npm test -- --testNamePattern=T044

# 執行所有 storage 相關測試
npm test -- --testNamePattern=storage

# 全部測試（含覆蓋率）
npm test -- --coverage

# Lint / 型別檢查
npm run lint
npm run type-check || npm run build --dry-run
```

### 驗證檢查清單
- [ ] 單元測試綠燈，初次為紅燈（已遵守 TDD）
- [ ] 整合測試綠燈
- [ ] 節流測試通過（<= 2 次儲存呼叫 / 10 次快速操作）
- [ ] 無 console.error / console.warn（除非刻意測試）
- [ ] UI 變更（偏好、統計）具即時性與一致性
- [ ] 錯誤情境顯示對應提示並可恢復
- [ ] 不影響拖放與遊戲主要互動 FPS（手動 / Profiler 檢視）

## AI 使用工具

- 檔案編輯：`str_replace_editor`（新增 Provider、hook、調整組件）
- 指令執行：`bash`（`npm test`、`npm run lint`）
- （如需要）瀏覽器自動化：Playwright（後續可在 T045 / E2E 內擴充）
- Discord 通知：`discord-webhook` 工具（紀錄進度與完成）

## 完成流程
1. 依 TDD 流程：撰寫失敗測試 → 實作 → 通過
2. 手動驗證偏好即時更新與統計刷新
3. 效能與節流符合預期
4. 更新 `tasks.md`：將 `- [ ] T044` 改為 `- [x] T044`
5. 若仍有後續優化項目 → 改為 `[?]` 並於檔尾添加註記
6. 清除執行記憶，準備進行 T045（完整持久化載入與恢復流程）

**驗收標準**：
- Provider / Hook 架構清晰，無循環依賴
- 偏好 & 統計資料讀寫成功，錯誤有處理
- 遊戲事件（移動、勝利）正確觸發儲存與統計更新
- 無明顯效能退化；React re-render 次數受控
- 與 T045 的責任邊界清楚（未過早實作恢復邏輯）
