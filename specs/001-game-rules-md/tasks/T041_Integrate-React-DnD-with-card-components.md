# T041. 整合 React DnD 與卡牌元件

## 描述

本任務旨在整合 React DnD（Drag and Drop）功能到所有相關的卡牌元件中，確保拖放互動功能在整個紙牌遊戲中正常運作。雖然 `Card.tsx` 和 `useDragAndDrop.ts` 已經實作了基本的 React DnD 功能，但需要進一步整合和完善，確保所有元件（TableauColumn、FoundationPile、StockPile）都能正確地與 DnD 系統互動。

此任務需要：

1. **驗證 DndProvider 設定**：確認 `DndProvider` 和 `HTML5Backend` 在 App.tsx 和 GameBoard.tsx 中正確配置
2. **完善 Card 元件的拖放功能**：確保 Card 元件的 `useDrag` 和 `useDrop` hooks 正確連接到遊戲邏輯
3. **整合 TableauColumn 的放置區**：完善 TableauColumn 的 `useDrop` 功能，確保可以接收拖放的卡牌並驗證移動規則
4. **整合 FoundationPile 的放置區**：實作 FoundationPile 的 `useDrop` 功能，確保按照撲克牌規則（同花色、遞增順序）接收卡牌
5. **整合 StockPile 的拖放功能**：確保廢牌堆（Waste）中的卡牌可以被拖放到 Tableau 或 Foundation
6. **實作拖放視覺回饋**：添加拖放時的視覺提示（高亮、游標變化、半透明預覽）
7. **連接遊戲驗證邏輯**：確保所有拖放操作都會透過 `game-validation.ts` 進行規則驗證
8. **效能優化**：使用 React.memo、useMemo、useCallback 避免不必要的重新渲染（符合 Constitution 的 Performance Standards）
9. **無障礙支援**：確保拖放功能支援鍵盤操作（Space/Enter 選取、方向鍵導航、Escape 取消）

## 工項 tasks

- [ ] 驗證 `src/App.tsx` 中的 `DndProvider` 配置，確保 `HTML5Backend` 正確掛載
- [ ] 檢查 `src/components/GameBoard/GameBoard.tsx` 是否有重複的 `DndProvider`（避免衝突）
- [ ] 完善 `src/components/Card/Card.tsx` 的拖放邏輯：
  - [ ] 確認 `useDrag` hook 正確傳遞 card 和 position 資訊
  - [ ] 確認 `useDrop` hook 能接收其他卡牌的拖放
  - [ ] 添加拖放中的視覺狀態（isDragging, isOver, canDrop）
  - [ ] 實作拖放預覽（drag preview）樣式
- [ ] 整合 `src/components/TableauColumn/TableauColumn.tsx` 的放置邏輯：
  - [ ] 確認 `useDrop` hook 正確設定，接受 'card' 類型
  - [ ] 連接 `canPlaceCard` 驗證函數到 `canDrop` callback
  - [ ] 實作拖放成功後的狀態更新邏輯
  - [ ] 添加拖放區的視覺回饋（DropZoneIndicator）
- [ ] 整合 `src/components/FoundationPile/FoundationPile.tsx` 的放置邏輯：
  - [ ] 實作 `useDrop` hook，接受 'card' 類型
  - [ ] 實作 Foundation 規則驗證（同花色、遞增順序、A 開始）
  - [ ] 添加成功/失敗的視覺回饋
  - [ ] 處理拖放成功後的卡牌移動
- [ ] 整合 `src/components/StockPile/StockPile.tsx` 的拖放功能：
  - [ ] 確保 Waste pile 中的卡牌可拖動
  - [ ] 實作從 Stock 到 Waste 的翻牌邏輯（點擊而非拖放）
  - [ ] 處理 Stock 耗盡時重置 Waste 回 Stock
- [ ] 實作跨元件的拖放狀態管理：
  - [ ] 在 `useDragAndDrop.ts` 或 `useGameState.ts` 中追蹤當前拖放狀態
  - [ ] 確保拖放時其他可放置區域顯示適當的視覺提示
  - [ ] 實作拖放失敗時的動畫回彈效果
- [ ] 連接遊戲驗證服務：
  - [ ] 在拖放前呼叫 `src/services/game-validation.ts` 驗證移動合法性
  - [ ] 在拖放成功後呼叫 `src/services/game-engine.ts` 更新遊戲狀態
  - [ ] 處理驗證失敗時的錯誤提示
- [ ] 實作鍵盤拖放支援（無障礙功能）：
  - [ ] 使用 `useKeyboardDrag` hook（已在 useDragAndDrop.ts 中實作）
  - [ ] Space/Enter 鍵選取卡牌
  - [ ] 方向鍵在可放置位置間導航
  - [ ] Enter 確認放置，Escape 取消
  - [ ] 添加適當的 ARIA 標籤和螢幕閱讀器提示
- [ ] 效能優化：
  - [ ] 使用 React.memo 包裝 Card、TableauColumn、FoundationPile 元件
  - [ ] 使用 useMemo 快取拖放驗證結果
  - [ ] 使用 useCallback 穩定拖放事件處理函數
  - [ ] 確保拖放操作維持 60fps（使用 CSS transform 而非 top/left）
- [ ] 測試拖放整合：
  - [ ] 手動測試所有拖放場景（Tableau to Tableau, Tableau to Foundation, Waste to Tableau, Waste to Foundation）
  - [ ] 測試非法移動的阻止和提示
  - [ ] 測試鍵盤操作的拖放流程
  - [ ] 使用 Chrome DevTools Performance 驗證 60fps 效能

## 測試方式

### 測試流程

#### 1. DndProvider 配置測試

```bash
# 檢查 App.tsx 是否正確設定 DndProvider
grep -A 5 "DndProvider" src/App.tsx

# 檢查 GameBoard.tsx 是否有重複的 DndProvider（應該移除）
grep -A 5 "DndProvider" src/components/GameBoard/GameBoard.tsx
```

#### 2. 拖放功能測試

**手動測試場景：**

1. **Tableau to Tableau**：
   - 拖動 Tableau 中的卡牌到另一個 Tableau column
   - 驗證：只允許降序、交替顏色的移動
   - 驗證：空 column 只允許 King

2. **Tableau to Foundation**：
   - 拖動 Tableau 中的 Ace 到空的 Foundation pile
   - 拖動相同花色的下一張牌（2）到該 Foundation
   - 驗證：必須同花色、遞增順序

3. **Waste to Tableau**：
   - 點擊 Stock pile 翻牌到 Waste
   - 拖動 Waste 的頂牌到 Tableau
   - 驗證：遵守 Tableau 規則

4. **Waste to Foundation**：
   - 拖動 Waste 的頂牌到 Foundation
   - 驗證：遵守 Foundation 規則

5. **非法移動**：
   - 嘗試將紅牌放在紅牌上（應失敗）
   - 嘗試將較大的牌放在較小的牌上（應失敗）
   - 嘗試將非 Ace 放在空的 Foundation（應失敗）

6. **鍵盤操作**：
   - 使用 Tab 導航到卡牌
   - 按 Space 或 Enter 選取卡牌
   - 使用方向鍵導航到目標位置
   - 按 Enter 確認放置
   - 按 Escape 取消選取

#### 3. 視覺回饋測試

- 拖動時卡牌應變半透明
- 有效的放置區應顯示高亮邊框或背景
- 無效的放置區應顯示禁止游標
- 放置成功後應有流暢的動畫過渡

#### 4. 效能測試

```bash
# 開啟開發伺服器
npm run dev

# 使用 Chrome DevTools:
# 1. 開啟 Performance tab
# 2. 開始錄製
# 3. 執行多次拖放操作
# 4. 停止錄製
# 5. 檢查 FPS 圖表，確保維持在 60fps
# 6. 檢查 Main thread 活動，確保沒有長時間阻塞
```

### 執行測試語法指令

```bash
# 執行所有相關的整合測試
npm test -- tests/integration/test_card_movement.test.ts
npm test -- tests/integration/test_foundation.test.ts

# 執行元件測試
npm test -- src/components/Card/Card.test.tsx
npm test -- src/components/TableauColumn/TableauColumn.test.tsx
npm test -- src/components/FoundationPile/FoundationPile.test.tsx

# 執行 E2E 測試（如果已實作）
npm run test:e2e

# 執行 linter 檢查程式碼品質
npm run lint

# 執行 TypeScript 型別檢查
npm run type-check

# 啟動開發伺服器進行手動測試
npm run dev

# 執行本任務的專用整合測試
npm test -- tests/integration/T041_Integrate-React-DnD-with-card-components.test.tsx
```

## AI 使用工具

本任務執行時會使用以下工具：

1. **str_replace_editor**: 查看和編輯原始碼檔案
2. **bash**: 執行測試指令、linter、TypeScript 檢查
3. **playwright-browser**: 執行瀏覽器自動化測試（如需要）
4. **discord-webhook**: 發送執行進度和結果通知

請在執行本任務時預先同意這些工具的使用。

## 完成流程

1. 完成所有工項後，執行完整的測試流程確保功能正常
2. 確認所有測試通過（單元測試、整合測試）
3. 執行手動測試驗證拖放互動體驗
4. 執行效能測試確保符合 60fps 標準
5. 在 `specs/001-game-rules-md/tasks.md` 本項 task 的 `[ ]` 打上 `[x]` 記號表示完成
6. 如有待處理或後續追蹤事項，打上 `[?]` 記號並在 task 下方註記說明
7. 清除執行記憶，準備下一個任務
