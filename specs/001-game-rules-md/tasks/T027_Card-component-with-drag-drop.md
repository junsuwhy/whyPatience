# T027. Card component with drag/drop

## 描述

實作 Card 元件，這是遊戲中最基礎的視覺元素，負責顯示撲克牌並提供拖拽功能。元件需要支援正面/背面顯示、拖拽互動、點擊事件，以及符合 WCAG 2.1 AA 標準的無障礙功能。元件將使用 React DnD 實現拖放功能，styled-components 處理樣式和動畫效果。

根據 Constitution 要求，此任務遵循 TDD 原則，需要先確保相關測試存在且失敗後再開始實作。元件需要符合設計系統一致性、效能標準（60fps 動畫）以及無障礙性要求。

## 工項 tasks

- [ ] 建立 `src/components/Card/` 目錄結構
- [ ] 建立 `src/components/Card/Card.tsx` 主要元件檔案
- [ ] 建立 `src/components/Card/Card.styles.ts` 樣式檔案（使用 styled-components）
- [ ] 建立 `src/components/Card/Card.types.ts` 類型定義檔案
- [ ] 建立 `src/components/Card/index.ts` 匯出檔案
- [ ] 實作卡牌正面顯示（花色、數字、顏色）
- [ ] 實作卡牌背面顯示
- [ ] 整合 React DnD 拖拽功能
- [ ] 實作點擊事件處理
- [ ] 加入無障礙性支援（ARIA labels、keyboard navigation）
- [ ] 實作動畫效果（hover、拖拽狀態）
- [ ] 加入 TypeScript 嚴格類型檢查
- [ ] 確保 React.memo 最佳化以達到 60fps 效能目標

## 測試方式

### 測試流程

1. 確認相關的 contract test 和 integration test 存在且失敗
2. 驗證元件能正確渲染不同的卡牌（A、2-10、J、Q、K 各花色）
3. 測試拖拽功能是否正常運作
4. 驗證點擊事件是否正確觸發
5. 測試無障礙性功能（鍵盤導航、螢幕閱讀器）
6. 驗證動畫效果和效能表現
7. 確認 TypeScript 類型檢查無錯誤

### 執行測試語法指令

```bash
npm test -- --testPathPattern=Card
npm run lint
npm run typecheck
npx jest specs/001-game-rules-md/tests/T027_Card-component-with-drag-drop_test.ts
```

## AI 使用工具

- Edit/MultiEdit: 建立和修改元件檔案
- Read: 讀取相關類型定義和測試檔案
- Bash: 執行測試和檢查指令
- Glob/Grep: 搜尋相關程式碼參考
- TodoWrite: 追蹤任務進度

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
