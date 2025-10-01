# 任務清單：桌面接龍網頁應用程式

**輸入來源**: 設計文件來自 `/specs/001-game-rules-md/`
**先決條件**: plan.md (必要), research.md, data-model.md, contracts/

## 執行流程 (主程序)

```
1. 從功能目錄載入 plan.md
   → 提取: React 18+, TypeScript, React DnD, styled-components
2. 載入設計文件:
   → data-model.md: 7 個實體 → 模型任務
   → contracts/: 3 個檔案 → 合約測試任務
   → quickstart.md: 10 個流程 → 整合測試
3. 按類別生成任務:
   → 設置: Vite 專案、依賴項、TypeScript 配置
   → 測試: 合約測試、整合測試
   → 核心: 類型、模型、遊戲引擎、組件
   → 整合: 儲存、拖放、動畫
   → 完善: 單元測試、無障礙、效能
4. 應用任務規則:
   → 不同檔案 = 標記 [P] 並行執行
   → 相同檔案 = 順序執行 (無 [P])
   → 測試優先於實作 (TDD)
5. 回傳: 成功 (任務準備執行)
```

## 格式: `[編號] [P?] 描述`

- **[P]**: 可並行執行 (不同檔案，無依賴)
- 描述中包含確切的檔案路徑

## 階段 3.1: 設置

- [ ] T001 建立 React 專案結構，使用 Vite 和 TypeScript 配置
- [ ] T002 安裝依賴項: React 18+, React DnD, styled-components, TypeScript, Jest, Playwright
- [ ] T003 [P] 配置 ESLint, Prettier, 和 TypeScript 嚴格模式 (憲章: 程式碼品質卓越)

## 階段 3.2: 測試優先 (TDD) ⚠️ 必須在 3.3 前完成

**重要: 根據憲章原則 II (TDD)，這些測試必須撰寫並必須失敗，然後才能進行任何實作**

- [ ] T004 [P] GameEngineContract 合約測試 tests/contract/test_game_engine.test.ts
- [ ] T005 [P] StorageContract 合約測試 tests/contract/test_storage.test.ts
- [ ] T006 [P] UI 組件介面合約測試 tests/contract/test_ui_components.test.tsx
- [ ] T007 [P] 新遊戲設置流程整合測試 tests/integration/test_new_game.test.ts
- [ ] T008 [P] 基本卡片移動整合測試 tests/integration/test_card_movement.test.ts
- [ ] T009 [P] 基礎牌建立整合測試 tests/integration/test_foundation.test.ts
- [ ] T010 [P] 庫存牌堆操作整合測試 tests/integration/test_stock_pile.test.ts
- [ ] T011 [P] 遊戲勝利流程整合測試 tests/integration/test_victory.test.ts
- [ ] T012 [P] 撤銷功能整合測試 tests/integration/test_undo.test.ts
- [ ] T013 [P] 本地儲存持久化整合測試 tests/integration/test_persistence.test.ts

## 階段 3.3: 核心實作 (僅在測試失敗後)

### 類型定義

- [ ] T014 [P] 卡片類型和枚舉 src/types/card.ts
- [ ] T015 [P] 遊戲狀態類型 src/types/game-state.ts
- [ ] T016 [P] 位置和移動類型 src/types/position.ts
- [ ] T017 [P] 使用者偏好類型 src/types/preferences.ts

### 遊戲引擎和模型

- [ ] T018 [P] 卡片模型與驗證 src/models/card.ts
- [ ] T019 [P] 牌陣欄位模型 src/models/tableau-column.ts
- [ ] T020 [P] 基礎牌堆模型 src/models/foundation-pile.ts
- [ ] T021 [P] 庫存牌堆模型 src/models/stock-pile.ts
- [ ] T022 [P] 遊戲狀態模型 src/models/game-state.ts
- [ ] T023 [P] 移動模型和歷史 src/models/move.ts
- [ ] T024 遊戲引擎核心邏輯 src/services/game-engine.ts
- [ ] T025 遊戲驗證規則 src/services/game-validation.ts
- [ ] T026 儲存服務實作 src/services/storage.ts

### React 組件

- [ ] T027 [P] 卡片組件與拖放功能 src/components/Card/Card.tsx
- [ ] T028 [P] 牌陣欄位組件 src/components/TableauColumn/TableauColumn.tsx
- [ ] T029 [P] 基礎牌堆組件 src/components/FoundationPile/FoundationPile.tsx
- [ ] T030 [P] 庫存牌堆組件 src/components/StockPile/StockPile.tsx
- [ ] T031 [P] 遊戲控制組件 src/components/GameControls/GameControls.tsx
- [ ] T032 [P] 遊戲統計組件 src/components/GameStatistics/GameStatistics.tsx
- [ ] T033 [P] 設定對話框組件 src/components/SettingsModal/SettingsModal.tsx
- [ ] T034 遊戲面板主組件 src/components/GameBoard/GameBoard.tsx
- [ ] T035 App 根組件與提供者 src/App.tsx

### 自定義 Hook 和服務

- [ ] T036 [P] useGameState hook src/hooks/useGameState.ts
- [ ] T037 [P] useDragAndDrop hook src/hooks/useDragAndDrop.ts
- [ ] T038 [P] useLocalStorage hook src/hooks/useLocalStorage.ts
- [ ] T039 [P] useGameStatistics hook src/hooks/useGameStatistics.ts

## 階段 3.4: 整合

- [ ] T040 連接 GameBoard 到遊戲引擎服務
- [ ] T041 整合 React DnD 與卡片組件
- [ ] T042 使用 styled-components 新增卡片動畫系統
- [ ] T043 實作鍵盤導航和無障礙功能
- [ ] T044 連接儲存服務到組件
- [ ] T045 新增遊戲狀態持久化和還原

## 階段 3.5: 品質與效能 (憲章合規)

- [ ] T046 [P] 遊戲驗證規則單元測試 tests/unit/test_validation.test.ts
- [ ] T047 [P] 卡片模型單元測試 tests/unit/test_models.test.ts
- [ ] T048 [P] 儲存服務單元測試 tests/unit/test_storage.test.ts
- [ ] T049 [P] 自定義 Hook 單元測試 tests/unit/test_hooks.test.ts
- [ ] T050 [P] Playwright E2E 測試 tests/e2e/solitaire.spec.ts
- [ ] T051 效能最佳化: React.memo, useMemo, useCallback
- [ ] T052 無障礙審計和 ARIA 標籤實作
- [ ] T053 跨瀏覽器測試和相容性修復
- [ ] T054 打包大小最佳化和程式碼分割
- [ ] T055 執行所有 quickstart.md 場景並驗證效能 (<2s 載入, 60fps)

## 依賴關係

- 設置 (T001-T003) 在所有其他階段之前
- 測試 (T004-T013) 在實作 (T014-T039) 之前
- 類型 (T014-T017) 在模型和組件之前
- 模型 (T018-T023) 在服務 (T024-T026) 之前
- 組件依賴於類型和模型
- 整合 (T040-T045) 在核心實作之後
- 效能/測試 (T046-T055) 在整合之後

## 並行執行範例

```
# 同時啟動類型定義:
Task: "卡片類型和枚舉 src/types/card.ts"
Task: "遊戲狀態類型 src/types/game-state.ts"
Task: "位置和移動類型 src/types/position.ts"
Task: "使用者偏好類型 src/types/preferences.ts"

# 同時啟動模型建立:
Task: "卡片模型與驗證 src/models/card.ts"
Task: "牌陣欄位模型 src/models/tableau-column.ts"
Task: "基礎牌堆模型 src/models/foundation-pile.ts"
Task: "庫存牌堆模型 src/models/stock-pile.ts"
```

## 注意事項

- [P] 任務 = 不同檔案，無依賴
- 實作前驗證測試失敗
- 遵循 React 最佳實務，使用 Hook 和函式組件
- 全程使用 TypeScript 嚴格模式
- 維持 60fps 效能目標
- 確保 WCAG 2.1 AA 無障礙合規

## 任務生成規則

_在 main() 執行期間應用_

1. **來自合約**:
   - game-engine-interface.ts → T004 合約測試 [P]
   - storage-interface.ts → T005 合約測試 [P]
   - ui-component-interfaces.ts → T006 合約測試 [P]
2. **來自資料模型**:
   - Card → T018 模型建立任務 [P]
   - TableauColumn → T019 模型建立任務 [P]
   - FoundationPile → T020 模型建立任務 [P]
   - StockPile → T021 模型建立任務 [P]
   - GameState → T022 模型建立任務 [P]
   - Move → T023 模型建立任務 [P]
3. **來自使用者故事 (quickstart.md)**:
   - 流程 1: 新遊戲設置 → T007 整合測試 [P]
   - 流程 2: 基本卡片移動 → T008 整合測試 [P]
   - 流程 3: 基礎牌建立 → T009 整合測試 [P]
   - 流程 4: 庫存牌堆操作 → T010 整合測試 [P]
   - 流程 5: 遊戲勝利 → T011 整合測試 [P]
   - 流程 6: 撤銷功能 → T012 整合測試 [P]
   - 流程 7: 本地儲存持久化 → T013 整合測試 [P]

4. **排序**:
   - 設置 → 測試 → 類型 → 模型 → 服務 → 組件 → 整合 → 品質
   - TDD: 所有測試在實作之前
   - 依賴關係阻止檔案共享時的並行執行

## 驗證檢查清單

_在 main() 回傳前檢查的關卡_

- [x] 所有合約都有對應的測試 (T004-T006)
- [x] 所有實體都有模型任務 (T018-T023)
- [x] 所有測試都在實作之前 (T004-T013 → T014+)
- [x] 並行任務真正獨立 (不同檔案標記 [P])
- [x] 每個任務都指定確切的檔案路徑
- [x] 沒有任務修改與其他 [P] 任務相同的檔案
- [x] 遊戲引擎和 UI 組件已涵蓋
- [x] 儲存和持久化已處理
- [x] 效能和無障礙要求已包含
