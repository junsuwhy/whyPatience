# T042. 卡片動畫系統（styled-components）

## 描述

為了符合《Constitution》之「User Experience Consistency」與「Performance Standards」，本任務旨在為接龍遊戲建立一致、效能良好、可被偏好設定控制的卡片動畫系統。動畫必須：
- 強化視覺回饋（翻牌、移動、放置、勝利閃爍）而不影響操作流暢度（目標：每次互動佔用 < 16ms 主執行緒）
- 可由使用者在「偏好設定」中關閉或降低（減少動態 / 無障礙考量）
- 使用 GPU-friendly 屬性（transform / opacity），避免 layout thrash / reflow
- 採用集中定義（單一 animation tokens），避免 magic numbers、確保後續可調校
- 不破壞既有拖曳（React DnD）事件邏輯

## 工項 tasks

- [ ] 建立 `src/styles/animation.ts` 動畫設計 token：DURATIONS、EASING、Z-INDEX、LAYER_NAMES
- [ ] 建立 `src/styles/keyframes.ts`：flip、lift, slideToPosition、pulseHighlight、autoSequence keyframes
- [ ] 在 `Card` 元件加入：
      - 翻面動畫（判斷 faceUp 狀態）
      - 拖曳預視提升 (lift) 動畫（加 data-dragging 標記）
      - 進出場（初次發牌 / 自動移到 Foundation）過渡
- [ ] 在 `TableauColumn` / `FoundationPile` 加入放置時 drop highlight（pulseHighlight class）
- [ ] 建立抽象 Hook：`useCardAnimation()` 控制 data-animation-* 屬性與 prefersReducedMotion 條件判斷
- [ ] 建立偏好設定欄位：`animationMode: 'full' | 'reduced' | 'off'`（更新 `src/types/preferences.ts` 與 localStorage 流程）
- [ ] 調整 `usePreferences` / `useGameState`（若存在）以傳遞動畫模式到 Card / Board
- [ ] 實作自動移牌（foundation auto-play）時的序列化排程（以 requestAnimationFrame + setTimeout 控制節奏）
- [ ] 增加測試（單元）：token 匯出、Card 狀態改變時 class / data-* 切換
- [ ] 增加測試（整合）：一次移動多張（翻牌 → 移動）仍維持正確 DOM 屬性
- [ ] 增加測試（偏好設定）：animationMode='off' 時不掛載 transition class
- [ ] 性能檢查：模擬 20 次連續 move（以測試或腳本量測平均 frame 間隔 < 16ms）
- [ ] 文件：在 `quickstart.md` 或專案 README 補充如何調整動畫參數（若規範允許）

## 測試方式

### 測試流程
1. 單元測試：
   - Card 由 faceDown → faceUp：期待出現 data-animation="flip" 或對應 class
   - 拖曳開始：加上 data-dragging 與提升樣式
   - 偏好設定 animationMode='off'：不應出現任何 animation class / keyframes 樣式（可檢查 style 標籤 or className）
2. 整合測試：
   - 透過模擬發新局流程（已有現成 integration 測試可擴充），斷言第一輪發牌給 tableau 的卡片具備 data-animation
   - 進行自動移到 foundation（若規則允許），斷言序列移動順序及 data-animation=sequence-start / sequence-mid / sequence-end
3. 性能測試（輕量）：
   - 以 jsdom / mock rAF 量測 20 次 move 動畫排程次數不大於 20 + 容許 buffer
   - （可選）於瀏覽器手動執行 Performance Profiler，確認主執行緒無長 > 50ms block
4. 可及性：
   - 模擬 prefers-reduced-motion media query（測試中以 matchMedia mock）→ flip 動畫應退化為淡入 / 無動畫

### 執行測試語法指令

`npm test`

（若需僅跑單檔：`npx jest Card` 或 `npm test -- Card`）

針對此任務的特定測試：
- 單元測試：`npm test tests/unit/T042_Add-card-animation-system-with-styled-components.test.tsx`
- 整合測試：`npm test tests/integration/T042_card-animation-integration.test.tsx`
- 所有動畫相關測試：`npm test -- --testNamePattern="T042|animation"`

## AI 使用工具

- Node.js / TypeScript 編譯環境
- Jest + React Testing Library（單元與行為測試）
- 可選：Playwright（若後續要做視覺 / E2E 動畫驗證）
- Performance API（`performance.now()`）
- Styled-components（keyframes、css helper）

## 完成流程
1. 所有列出的子工項完成並通過測試
2. 新增 / 更新的測試最初為紅燈 → 綠燈（符合 TDD 精神）
3. 手動檢視桌面瀏覽器：翻牌、拖曳、放置、序列移動動畫順暢
4. 將 `tasks.md` 內 T042 由 `[ ]` 改為 `[x]`（若仍有後續細節待優化可改為 `[?]` 並附註）
5. 清除執行記憶（依照流程工具要求）
