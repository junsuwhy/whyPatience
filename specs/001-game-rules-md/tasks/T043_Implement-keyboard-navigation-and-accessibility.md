# T043. 鍵盤導覽與無障礙實作

## 描述

本任務聚焦於為接龍（Solitaire）遊戲加入完整的鍵盤操作與無障礙（Accessibility, A11y）支援，使僅使用鍵盤或輔助科技（螢幕閱讀器）的使用者也能順暢進行遊戲互動。符合專案 Constitution 原則：
- Test-Driven Development：先撰寫可失敗的可及性與鍵盤互動測試。
- User Experience Consistency：鍵盤與滑鼠/拖放行為語意一致。
- Performance Standards：避免低效的 focus / re-render 導致掉幀，維持 60fps。
- Code Quality Excellence：建立可重用的 hooks 與語意化結構，減少重複。

範圍包含：焦點管理策略（Roving Tabindex / 受控 focus ring）、卡牌與牌堆語意角色設定 (ARIA roles & properties)、鍵盤操作映射（選取 / 移動 / 取消 / 自動移動）、動作可用性提示（aria-disabled / aria-live）、無障礙錯誤回饋與狀態宣告（例如非法移動、完成一個牌堆、勝利提示）。

## 工項 tasks

- [ ] 焦點策略設計：決定使用『整體容器 Tab 進入 → 方向鍵 / 快捷鍵在子元素之間導航』的 roving tabindex 模式
- [ ] 建立焦點狀態儲存：於 `useGameState` 或新增 `useFocusNavigation` 管理目前選取卡牌 / 來源 / 目標
- [ ] 定義鍵盤操作對映：
  - [ ] Enter / Space：選取或放下卡牌
  - [ ] Esc：取消當前選取
  - [ ] ← →：在同層（Tableau columns / Foundation piles / Stock/Waste 群組）平移
  - [ ] ↑ ↓：在牌堆內（同 column）切換可互動卡（最上層 / 露出堆疊）
  - [ ] A：嘗試自動移牌到 Foundation（若合法）
  - [ ] H：顯示/朗讀可行動提示（高亮或 aria-live）
- [ ] 卡牌元素語意化：`role="gridcell"` 或以 `button` + `aria-label`（含數值/花色/位置資訊）
- [ ] 牌堆語意：Tableau / Foundation / Stock / Waste 容器使用 `role="grid" | "list"` + `aria-describedby`
- [ ] 為空 Tableau column 提供可焦點區（允許 King 移入）並加上 `aria-label="空的桌面列，可放 King"`
- [ ] 為 Foundation 空位加上 `aria-label="空的基底牌堆，需要 Ace 起始"`
- [ ] 建立 aria-live 區域：宣告移動成功 / 失敗 / 勝利 / 無合法移動
- [ ] 合法性驗證整合：鍵盤移動前調用 `game-validation.ts`（與拖放共用）
- [ ] 成功移動後調用 `game-engine.ts` 更新狀態並宣告訊息
- [ ] 非法移動：焦點保持來源，宣告錯誤（例如「此移動不符合交錯顏色規則」）
- [ ] 鍵盤選取高亮：透過 `data-focus` 樣式 + styled-components 提供可視化邊框
- [ ] 視覺狀態：選取中卡牌套用 `aria-pressed="true"`，可放置目標加上 `data-drop-target` 樣式
- [ ] 可行動提示（H）：計算所有合法移動並以 outline / aria-live 列出
- [ ] 自動移動（A）：對當前選取卡或可明確安全送入 Foundation 的卡執行 move（多筆時逐步宣告）
- [ ] 跨來源一致：鍵盤操作結果與拖放保持同一套邏輯（共用 move handler）
- [ ] 效能優化：
  - [ ] 用 `useCallback` 穩定鍵盤事件處理器
  - [ ] 用 `useMemo` 預先計算可合法目標集合
  - [ ] 降低整個 GameBoard re-render（將焦點/選取狀態下放或用 context selector）
- [ ] 加入測試檔 `tests/integration/test_keyboard_accessibility.test.ts`（初始失敗）
- [ ] 加入單元測試 `tests/unit/test_accessibility_roles.test.ts` 驗證 ARIA 屬性（初始失敗）
- [ ] 加入焦點循環與快捷鍵行為測試（模擬 keydown 序列）
- [ ] 加入自動移動（A）與提示（H）測試場景
- [ ] 編寫 README 片段或 quickstart 補充「鍵盤操作說明」
- [ ] 手動測試與 Chrome Lighthouse 無障礙掃描（> 95 分）
- [ ] 整合至 tasks.md：完成後將本任務打勾並記錄若有後續追蹤

## 測試方式

### 測試流程
1. 進入遊戲頁面後，按 Tab：焦點應落在整體遊戲容器或第一個可互動卡牌/Stock。
2. 使用方向鍵在各 Tableau column 間移動，焦點樣式明顯可辨。
3. Space 選取一張可移動卡牌：
   - 卡牌 `aria-pressed` 變為 true。
   - aria-live 宣告「已選取 紅心 7，來源：桌面列 3 位置 2」。
4. 方向鍵移到合法目標，目標外框高亮。Enter 放下：
   - aria-live 宣告「已移動 紅心 7 到 桌面列 4」。
5. 嘗試非法移動（同色、順序錯誤）應：
   - aria-live 宣告錯誤文字。
   - 焦點與選取狀態維持原卡牌。
6. 按 Esc：選取狀態清除，aria-live 宣告「已取消選取」。
7. 在可自動送 Foundation 的情境按 A：
   - 若合法執行：連續宣告所有自動移動。
   - 若無：宣告「沒有可自動移動的卡」。
8. 按 H：
   - 所有合法目標短暫加高亮。
   - aria-live 彙整「可能移動：紅心 2 → 基底 1，黑桃 K → 空桌面列」。
9. 空 Tableau column 聚焦時，按 Enter 嘗試放非 King：宣告失敗。
10. 使用螢幕閱讀器（ChromeVox / NVDA）巡覽，確認卡牌標籤語意完整。
11. Lighthouse accessibility 分數 >= 95。
12. 所有 Jest / RTL 測試通過；鍵盤模擬序列覆蓋主要流程。

### 執行測試語法指令
```bash
# 僅執行無障礙與鍵盤相關測試
npm test -- tests/integration/test_keyboard_accessibility.test.ts
npm test -- tests/unit/test_accessibility_roles.test.ts

# 全部測試（確保回歸安全）
npm test

# Lighthouse（若有腳本，可另建）
# 以 Playwright 跑可及性掃描（若已設）：
# npx playwright test --grep @a11y

# Lint / 型別檢查保持品質
npm run lint
npm run type-check
```

**實際執行指令（T043 測試檔案已建立）：**
```bash
# 執行 T043 鍵盤導覽與無障礙測試
npm test -- tests/integration/test_keyboard_accessibility.test.ts tests/unit/test_accessibility_roles.test.ts

# 或分別執行
npm test -- --testPathPattern="test_keyboard_accessibility|test_accessibility_roles"
```

## AI 使用工具
- str_replace_editor：建立 / 編輯程式與測試檔案
- bash：執行測試、Lighthouse / 型別 / Lint
- playwright-browser：模擬鍵盤互動（如需 E2E）
- discord-webhook：回報進度與完成結果

## 完成流程
1. 所有測試（新測試先紅後綠）與無障礙檢測達標。
2. 手動與螢幕閱讀器巡覽驗證互動與語意。
3. 性能：鍵盤快速操作無明顯掉幀（DevTools Performance 無長任務 > 50ms）。
4. 更新 `specs/001-game-rules-md/tasks.md` 將 T043 勾選為完成；如仍有延伸（例如國際化朗讀文字）以 ` [?]` 標註並於檔末附註。
5. 發送 Discord 完成通知（內含重點成果與測試結果）。
6. 清除暫存記憶並進入下一任務（T044）。
