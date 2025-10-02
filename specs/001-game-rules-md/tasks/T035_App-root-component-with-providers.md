# T035. App 根元件與 Providers 整合

## 描述

實作並完成 `src/App.tsx` 作為整個 Solitaire 應用的根元件，負責：
- 掛載全域層級 Providers（例如未來的 GameState 相關 Context、統計資料 hook、React DnD 提供者）。
- 建立基礎版面（Header / Main / Footer 結構與 ARIA landmark）。
- 整合 `GameBoard`（T034 已完成）並預留未來 hooks（T036 useGameState、T037 useDragAndDrop、T038 useLocalStorage、T039 useGameStatistics）。
- 導入無障礙支援（語意標籤、焦點順序、鍵盤導覽起點、Skip to Content 連結）。
- 確保符合《Constitution》四大原則：
  - Code Quality：清晰分層、元件職責單一、型別明確。
  - TDD：對根元件行為撰寫測試（掛載成功、提供者包覆、主視覺出現）。
  - UX Consistency：一致的頁面框架與語意結構，支援桌面使用體驗。
  - Performance：初始渲染乾淨、避免不必要 re-render（使用 memo / lazy 載入非必要區塊預留註解）。

## 工項 tasks

- [x] 審查目前 `src/App.tsx` 現有簡易占位內容，規劃新版結構
- [x] 新增 `src/providers/`（若僅預留則可暫不建立實作，保留註解標記 TODO）
- [x] 在 `App.tsx` 中整合（或暫時占位）DndProvider（React DnD）結構（若套件已存在）
- [x] 預留 GameStateProvider（對應 T036 將實作的 hook/context）註解占位
- [x] 預留 StatisticsProvider（或以 useGameStatistics 啟動點註解）
- [x] 建立無障礙 Skip Link：`<a href="#main" className="skip-link">跳到主要內容</a>`
- [x] 追加 `<header>` `<main id="main">` `<footer>` 語意結構與 ARIA 屬性
- [x] 將標題 H1 維持："Desktop Solitaire" 並加入 aria-label 強化描述
- [x] 將 GameBoard 元件導入並置於 `<main>` 中；若尚無互動狀態來源，以註解標記 TODO: connect game state (T040 之後)
- [x] 加入基本 styled-components 容器（若尚未建立主題，僅內聯或占位）
- [x] 加入錯誤邊界（ErrorBoundary 占位：以註解 或 簡易 try/catch 包裹）
- [x] 實作初步焦點管理（App 載入後將焦點送往主標題或主內容）
- [x] 在檔案頂部加入任務編號與目的註解（利於追蹤）
- [x] 撰寫對應測試檔 `tests/integration/T035_App-root-component-with-providers.test.tsx`
- [?] 測試：渲染後應出現：Skip link / H1 / GameBoard 容器占位 / landmark roles
- [?] 測試：模擬 Tab 流程，第一個可聚焦元素為 Skip link
- [?] 若 DnD Provider 無法即時導入（依賴尚未完成）→ 測試中以條件跳過或 mock
- [x] 更新 `specs/001-game-rules-md/tasks.md` 將 T035 勾選（人工或後續流程）

## 測試方式

### 測試流程
1. 渲染 `App`：確認不拋出例外。
2. 找到並驗證：
   - `.skip-link` 存在且 href 指向 `#main`。
   - `<main id="main">` 存在且含 GameBoard 文字或元件。
   - Header 含 H1: Desktop Solitaire。
3. 驗證語意/無障礙：header / main / footer 元素存在；主標題僅一個。
4. Tab 鍵聚焦順序：第一焦點為 Skip link。
5. （若已導入 DnD）確認 DnD context 內渲染不報錯。
6. （預留）未來加上 GameStateProvider 後測試可接收 context。
7. 效能：初始渲染快（測試中可記錄 console.time 占位，不列為失敗條件）。

### 執行測試語法指令

```bash
# 執行單一測試檔
npm test -- --testPathPatterns=T035_App-root-component-with-providers.test.tsx

# 或執行所有 integration 類型測試  
npm test -- --testPathPatterns=integration

# Lint 程式碼品質檢查
npm run lint

# TypeScript 型別檢查
npm run typecheck || tsc --noEmit
```

## AI 使用工具
- Read: 讀取既有 `src/App.tsx`、`GameBoard`、型別檔案（game-state 等）
- Edit / Write: 建立或修改 `App.tsx` 與測試檔
- Bash: 執行測試、lint、型別檢查
- （未來）若需可使用 Playwright（現階段僅 Jest/RTL）

## 完成流程
- 在 `specs/001-game-rules-md/tasks.md` 將本任務打勾 `[x]`（若部分待辦保留則用 `[?]` ）
- 提交變更並確保測試綠燈
- 清除執行記憶（釋放暫存上下文）
