# T039. useGameStatistics 自訂 Hook 實作

## 描述

實作 `useGameStatistics` 自訂 React Hook，提供遊戲統計資料的管理與計算功能。此 Hook 負責追蹤和計算當前遊戲的統計數據（移動次數、分數、時間等），以及跨遊戲的整體統計資料（勝率、最佳時間、平均移動數等）。

此 Hook 遵循 React Hooks 最佳實踐，支援即時統計更新、效能最佳化、本地儲存整合，並與遊戲狀態完美同步。

### 主要功能

1. **當前遊戲統計**：追蹤當前遊戲的移動次數、分數、時間、撤銷次數等
2. **整體統計追蹤**：管理跨遊戲的統計資料（遊戲數、勝率、最佳時間等）
3. **即時更新**：自動計算並更新統計資料
4. **分數計算**：根據移動效率、時間、完成度計算遊戲分數
5. **資料持久化**：整合 localStorage 儲存整體統計資料
6. **效能最佳化**：使用 useMemo 和 useCallback 避免不必要的重新計算

### 技術規格

- **檔案位置**：`src/hooks/useGameStatistics.ts`
- **相依性**：`src/types/game-state.ts`, React hooks (useState, useEffect, useCallback, useMemo)
- **型別定義**：
  - `UseGameStatisticsConfig`: Hook 配置介面
  - `UseGameStatisticsReturn`: Hook 回傳值介面
  - `GameStatistics`: 當前遊戲統計
  - `OverallStatistics`: 整體統計資料
- **localStorage key**: `solitaire_overall_stats`
- **測試覆蓋率**：需配合單元測試確保功能正確性

### 設計原則

遵循 Constitution 四大原則：

1. **Code Quality Excellence**：
   - 使用 TypeScript 嚴格模式
   - 完整的型別註解與 JSDoc 文件
   - 清晰的函式命名與邏輯分離
   - 符合 ESLint 和 Prettier 規範

2. **Test-Driven Development**：
   - 先撰寫測試（已在 Phase 3.2 完成）
   - 確保所有統計計算邏輯都有測試覆蓋
   - 測試分數計算公式的正確性

3. **User Experience Consistency**：
   - 提供一致的統計資料格式
   - 即時反映遊戲進度
   - 自動儲存整體統計避免資料丟失

4. **Performance Standards**：
   - 避免不必要的重新計算
   - 使用 useMemo 快取計算結果
   - 控制即時更新頻率（預設 1 秒）

## 工項 tasks

- [x] 建立 `src/hooks/useGameStatistics.ts` 檔案
- [x] 定義 Hook 介面與型別定義：
  - `UseGameStatisticsConfig` 介面（realTimeUpdates, updateInterval, calculatePerformance, trackHistory）
  - `UseGameStatisticsReturn` 介面（currentStats, overallStats, isCalculating, error, refreshStats, resetCurrentStats, updateStats, addCompletedGame）
- [x] 實作核心 Hook 邏輯：
  - 使用 `useState` 管理統計狀態
  - 實作 `updateStats` 函式（更新當前遊戲統計）
  - 實作 `addCompletedGame` 函式（將完成的遊戲加入整體統計）
  - 實作 `resetCurrentStats` 函式（重置當前遊戲統計）
  - 實作 `refreshStats` 函式（手動刷新統計資料）
- [x] 實作分數計算邏輯：
  - 基礎分數：每張牌到達 foundation 得 10 分
  - 時間獎勵：遊戲完成時間越短獎勵越高
  - 移動效率獎勵：移動次數越少獎勵越高
  - 撤銷懲罰：每次撤銷扣 5 分
  - 完成獎勵：遊戲勝利額外 500 分
- [x] 實作當前統計計算：
  - 從 GameState 提取移動次數（history.length）
  - 計算經過時間（當前時間 - startTime）
  - 計算 foundation 中的卡片數量
  - 應用分數計算公式
- [x] 實作整體統計管理：
  - 從 localStorage 載入整體統計
  - 更新遊戲數、勝場數、勝率
  - 追蹤最佳時間、平均時間
  - 計算平均移動數
  - 追蹤當前連勝、最長連勝
  - 儲存整體統計到 localStorage
- [x] 實作即時更新機制：
  - 使用 `useEffect` + `setInterval` 定期更新統計
  - 可配置更新頻率（預設 1000ms）
  - 在 unmount 時清除 interval
- [x] 實作狀態同步：
  - 監聽 gameState 變化自動更新統計
  - 使用 `useEffect` 觸發即時計算
- [x] 效能最佳化：
  - 使用 `useCallback` 包裝所有函式
  - 使用 `useMemo` 快取 return 物件
  - 避免不必要的 useEffect 執行
- [x] 錯誤處理：
  - 捕捉統計計算錯誤
  - 捕捉 localStorage 讀寫錯誤
  - 設定錯誤狀態供 UI 顯示
- [x] 撰寫完整的 JSDoc 文件註解
- [x] 匯出 Hook 和相關型別定義

## 測試方式

### 測試流程

本 Hook 的測試已在 Phase 3.2（任務 T049）中定義，測試檔案為 `tests/unit/test_hooks.test.ts`。測試應涵蓋以下情境：

1. **基本功能測試**：
   - 測試 Hook 初始化時正確計算統計
   - 測試 updateStats 正確更新當前統計
   - 測試 resetCurrentStats 正確重置統計
   - 測試 refreshStats 重新載入資料

2. **分數計算測試**：
   - 測試基礎分數計算（卡片數 × 10）
   - 測試時間獎勵計算
   - 測試移動效率獎勵計算
   - 測試撤銷懲罰計算
   - 測試完成獎勵（勝利時 +500）
   - 測試分數不會為負數

3. **整體統計測試**：
   - 測試新增完成遊戲更新整體統計
   - 測試勝率計算正確
   - 測試最佳時間更新（僅勝利遊戲）
   - 測試平均時間計算
   - 測試平均移動數計算
   - 測試連勝追蹤（當前連勝、最長連勝）

4. **即時更新測試**：
   - 測試即時更新開啟時定期更新統計
   - 測試即時更新關閉時不執行更新
   - 測試 updateInterval 配置生效
   - 測試 unmount 時清除 interval

5. **localStorage 整合測試**：
   - 測試初始化時載入整體統計
   - 測試新增遊戲後儲存整體統計
   - 測試 localStorage 不可用時的降級處理
   - 測試資料解析錯誤處理

6. **效能測試**：
   - 測試函式參考穩定性（useCallback）
   - 測試避免不必要的重新渲染
   - 測試大量更新時的效能

7. **錯誤處理測試**：
   - 測試統計計算錯誤處理
   - 測試 localStorage 錯誤處理
   - 測試錯誤狀態正確設定

### 執行測試語法指令

```bash
# 執行所有單元測試
npm test

# 執行 T039 useGameStatistics hook 特定測試
npm test -- tests/unit/test_hooks.test.ts --testNamePattern="T039"

# 執行測試並顯示覆蓋率
npm test -- --coverage

# 監視模式執行測試
npm test -- --watch

# 執行 TypeScript 類型檢查
npm run type-check

# 執行程式碼品質檢查
npm run lint
```

### 手動驗證

除了自動化測試，還可以透過以下方式手動驗證：

1. 在遊戲中執行移動，觀察統計數字即時更新
2. 完成一局遊戲，檢查 localStorage 中的整體統計
3. 在 React DevTools 中觀察 Hook 狀態變化
4. 測試多場遊戲後檢查勝率、平均值計算正確性
5. 測試連勝機制（連續勝利和失敗後的數值變化）

## AI 使用工具

本任務需要使用以下工具：

1. **str_replace_editor**：
   - 檢視現有檔案 `src/hooks/useGameStatistics.ts`（已存在）
   - 必要時編輯程式碼（目前實作已完整）

2. **bash**：
   - 執行測試指令驗證實作正確性
   - 執行 ESLint 和 Prettier 檢查程式碼品質
   - 執行 TypeScript 編譯檢查型別正確性

3. **相關檔案參考**：
   - `src/types/game-state.ts`：GameStatistics 和 OverallStatistics 型別定義
   - `src/hooks/useGameState.ts`：GameState hook 實作參考
   - `specs/001-game-rules-md/data-model.md`：資料模型定義
   - `tests/unit/test_hooks.test.ts`：Hook 測試檔案

## 實作細節參考

### Hook 介面設計

```typescript
// 配置介面
export interface UseGameStatisticsConfig {
  realTimeUpdates?: boolean;      // 是否即時更新（預設 true）
  updateInterval?: number;         // 更新間隔毫秒（預設 1000）
  calculatePerformance?: boolean;  // 是否計算效能指標（預設 true）
  trackHistory?: boolean;          // 是否追蹤歷史統計（預設 true）
}

// 回傳值介面
export interface UseGameStatisticsReturn {
  currentStats: GameStatistics;         // 當前遊戲統計
  overallStats: OverallStatistics | null; // 整體統計
  isCalculating: boolean;               // 是否正在計算
  error: string | null;                 // 錯誤訊息
  refreshStats: () => void;             // 刷新統計
  resetCurrentStats: () => void;        // 重置當前統計
  updateStats: (gameState: GameState) => void; // 更新統計
  addCompletedGame: (gameState: GameState) => void; // 新增完成遊戲
}

// Hook 函式簽章
export const useGameStatistics = (
  gameState: GameState | null,
  config?: UseGameStatisticsConfig
): UseGameStatisticsReturn
```

### 分數計算公式

```typescript
const calculateScore = (gameState: GameState): number => {
  // 基礎分數：每張牌 10 分
  let score = cardsInFoundation * 10;
  
  // 時間獎勵：越快完成獎勵越高（最多 1000 分）
  const timeInMinutes = elapsedTime / (1000 * 60);
  const timeBonus = Math.max(0, 1000 - timeInMinutes * 10);
  score += timeBonus;
  
  // 移動效率獎勵：移動越少獎勵越高（最多 200 分）
  const moveEfficiency = Math.max(0, 200 - moveCount);
  score += moveEfficiency;
  
  // 撤銷懲罰：每次撤銷扣 5 分
  score -= undoCount * 5;
  
  // 完成獎勵：勝利額外 500 分
  if (phase === 'won') {
    score += 500;
  }
  
  return Math.max(0, Math.round(score));
};
```

### 整體統計更新邏輯

```typescript
const updateOverallStats = (
  currentStats: OverallStatistics,
  completedGame: GameState
): OverallStatistics => {
  const isWon = completedGame.phase === 'won';
  
  // 更新基本統計
  const newStats = {
    gamesPlayed: currentStats.gamesPlayed + 1,
    gamesWon: currentStats.gamesWon + (isWon ? 1 : 0),
    totalMoves: currentStats.totalMoves + gameStats.moveCount,
    // 計算勝率
    winRate: (gamesWon / gamesPlayed) * 100,
    // 計算平均移動數
    averageMovesPerGame: totalMoves / gamesPlayed,
    // 更新連勝
    currentStreak: isWon ? currentStats.currentStreak + 1 : 0,
    longestStreak: Math.max(currentStreak, currentStats.longestStreak),
  };
  
  // 僅勝利遊戲更新時間統計
  if (isWon) {
    if (newStats.bestTime === 0 || gameStats.elapsedTime < newStats.bestTime) {
      newStats.bestTime = gameStats.elapsedTime;
    }
    newStats.averageTime = calculateAverageTime(wonGames);
  }
  
  return newStats;
};
```

### 即時更新機制

```typescript
useEffect(() => {
  if (!config.realTimeUpdates || !gameState) {
    return;
  }
  
  const interval = window.setInterval(() => {
    updateCurrentStats(gameState);
  }, config.updateInterval);
  
  return () => window.clearInterval(interval);
}, [gameState, config.realTimeUpdates, config.updateInterval]);
```

## 實作狀態

**✅ 已完成實作**

檔案 `src/hooks/useGameStatistics.ts` 已經完整實作，包含：

1. ✅ 完整的型別定義（UseGameStatisticsConfig, UseGameStatisticsReturn）
2. ✅ 分數計算邏輯（calculateScore 函式）
3. ✅ 當前統計計算（calculateCurrentStats 函式）
4. ✅ 整體統計管理（loadOverallStats, saveOverallStats, updateOverallStats）
5. ✅ 即時更新機制（useEffect + setInterval）
6. ✅ localStorage 整合
7. ✅ 完整的錯誤處理
8. ✅ 效能最佳化（useCallback, useMemo）
9. ✅ JSDoc 文件註解

## 完成流程

1. 驗證現有實作完整性：
   ```bash
   npm run lint
   npm run type-check
   ```

2. 執行測試確認功能正確：
   ```bash
   npm run test:unit
   npm test -- tests/unit/test_hooks.test.ts
   ```

3. 確認所有測試通過且無 lint 錯誤

4. 在 `tasks.md` 本項 task（T039）的 `[ ]` 打上 `[x]` 記號表示完成

5. 若有任何待處理事項，在 `tasks.md` 打上 `[?]` 記號並記錄說明

6. 確認 `src/hooks/index.ts` 已匯出此 Hook

7. 清除執行記憶，準備進行下一個任務
