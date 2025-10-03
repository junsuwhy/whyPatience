# T037. useDragAndDrop Hook 拖放功能自訂 Hook

## 描述

建立一個自訂 React Hook `useDragAndDrop`，用於封裝 React DnD 的拖放邏輯，提供可重複使用的拖放功能給卡片組件（Card、TableauColumn、FoundationPile 等）。此 Hook 應該提供統一的拖放介面，處理拖曳開始、拖曳中、拖曳結束、放置目標驗證等邏輯，並符合 Constitution 的四大原則：程式品質卓越、測試驅動開發（TDD）、使用者體驗一致性、效能標準。

此 Hook 將與 React DnD 的 `useDrag` 和 `useDrop` hooks 整合，提供：
- 拖曳項目類型定義（CARD、CARD_STACK）
- 拖曳狀態管理（isDragging、canDrop、isOver）
- 拖放驗證邏輯整合
- 拖放事件回調處理
- 無障礙支援（keyboard drag-and-drop）
- 效能優化（使用 useMemo、useCallback）

根據 `contracts/ui-component-interfaces.ts` 中的 `DragItem` 和 `DropResult` 介面規範，以及 `Card.tsx` 中已實作的 React DnD 使用模式，建立統一的拖放邏輯封裝。

## 工項 tasks

- [ ] 建立 `src/hooks/useDragAndDrop.ts` 檔案，定義 Hook 介面和類型
- [ ] 實作 `useDraggableCard` Hook：封裝 `useDrag` 邏輯，處理單一卡片拖曳
- [ ] 實作 `useDraggableCardStack` Hook：封裝 `useDrag` 邏輯，處理多張卡片堆疊拖曳
- [ ] 實作 `useDropTarget` Hook：封裝 `useDrop` 邏輯，處理放置目標驗證和放置事件
- [ ] 實作拖放狀態管理：isDragging、canDrop、isOver、draggedItem
- [ ] 整合遊戲驗證邏輯：canPlaceOnTableau、canPlaceOnFoundation
- [ ] 實作無障礙鍵盤拖放支援：處理鍵盤事件（Space/Enter 選取，Arrow keys 移動）
- [ ] 實作效能優化：使用 useMemo 快取計算結果，使用 useCallback 快取回調函式
- [ ] 加入 TypeScript 嚴格模式類型定義，確保類型安全
- [ ] 撰寫 JSDoc 註解，說明 Hook 用法、參數、回傳值
- [ ] 在 `src/hooks/index.ts` 匯出 Hook（如檔案存在）

## 測試方式

### 測試流程

1. **單元測試**（tests/unit/test_hooks.test.ts）：
   - 測試 `useDraggableCard` 正確返回 drag ref 和 isDragging 狀態
   - 測試 `useDraggableCardStack` 正確處理多張卡片拖曳
   - 測試 `useDropTarget` 正確返回 drop ref 和 canDrop、isOver 狀態
   - 測試拖放驗證邏輯正確整合（使用 mock 驗證函式）
   - 測試鍵盤拖放事件正確觸發回調
   - 測試 Hook 在不同狀態下的行為（可拖曳/不可拖曳、有效/無效放置目標）

2. **整合測試**（tests/integration/test_card_movement.test.ts）：
   - 測試使用此 Hook 的組件能正確執行拖放操作
   - 測試拖曳卡片到有效目標，觸發正確的 onDrop 回調
   - 測試拖曳卡片到無效目標，不觸發 onDrop 回調
   - 測試拖放動畫效果和狀態更新

3. **型別檢查**：
   - 執行 `npm run typecheck` 確保 TypeScript 編譯無錯誤
   - 確認 Hook 介面與 `contracts/ui-component-interfaces.ts` 中的 DragItem、DropResult 定義一致

4. **手動測試**（使用瀏覽器開發工具）：
   - 在 Card 組件中使用此 Hook，測試拖放功能正常運作
   - 使用 React DevTools 檢查 Hook 狀態變化
   - 測試鍵盤拖放操作（Tab 聚焦、Space 選取、Arrow keys 移動、Enter 放置）

### 執行測試語法指令

```bash
# 執行單元測試
npm run test -- tests/unit/test_hooks.test.ts

# 執行整合測試
npm run test -- tests/integration/test_card_movement.test.ts

# 執行型別檢查
npm run typecheck

# 執行所有測試並產生覆蓋率報告
npm run test:coverage
```

## AI 使用工具

- **str_replace_editor**: 建立和編輯 `src/hooks/useDragAndDrop.ts` 檔案
- **bash**: 執行測試指令、型別檢查、lint 檢查
- **discord-webhook**: 發送執行過程和完成通知到 Discord

## 技術規格

### Hook 介面定義

```typescript
// useDraggableCard 返回類型
interface DraggableCardResult {
  dragRef: ConnectDragSource;
  dragPreviewRef: ConnectDragPreview;
  isDragging: boolean;
  canDrag: boolean;
}

// useDropTarget 返回類型
interface DropTargetResult {
  dropRef: ConnectDropTarget;
  canDrop: boolean;
  isOver: boolean;
  isOverCurrent: boolean;
}

// useDragAndDrop 主 Hook
interface UseDragAndDropOptions {
  item: DragItem;
  canDrag?: boolean;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem, dropResult: DropResult | null) => void;
  canDrop?: (item: DragItem) => boolean;
  onDrop?: (item: DragItem) => void;
  onHover?: (item: DragItem) => void;
}
```

### 實作重點

1. **React DnD 整合**：
   - 使用 `useDrag` 處理拖曳邏輯
   - 使用 `useDrop` 處理放置邏輯
   - 定義拖曳項目類型（CARD、CARD_STACK）

2. **效能優化**：
   - 使用 `useMemo` 快取 item、collect 函式
   - 使用 `useCallback` 快取所有回調函式
   - 避免不必要的重新渲染

3. **無障礙支援**：
   - 實作鍵盤導航（Tab、Arrow keys）
   - 實作鍵盤操作（Space/Enter 選取和放置）
   - 提供適當的 ARIA 屬性

4. **類型安全**：
   - 使用 TypeScript strict mode
   - 完整的類型定義和泛型支援
   - 與現有類型系統整合

## 參考資料

- Constitution: `.specify/memory/constitution.md` - 開發原則和品質標準
- Plan: `specs/001-game-rules-md/plan.md` - 技術架構（React 18+, TypeScript, React DnD）
- Contracts: `specs/001-game-rules-md/contracts/ui-component-interfaces.ts` - UI 介面規範
- Data Model: `specs/001-game-rules-md/data-model.md` - 資料模型定義
- Quickstart: `specs/001-game-rules-md/quickstart.md` - 拖放流程測試（Flow 2: Basic Card Movement）
- 現有實作: `src/components/Card/Card.tsx` - Card 組件中的 React DnD 使用範例
- 現有實作: `src/hooks/useGameState.ts` - Hook 撰寫風格參考

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
完成後清除執行記憶，準備進行下一個任務。
