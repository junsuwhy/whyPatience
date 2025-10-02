# T028. TableauColumn component in src/components/TableauColumn/TableauColumn.tsx

## 描述

建立 TableauColumn 組件，用於顯示和管理一列紙牌。TableauColumn 是紙牌遊戲中的主要遊戲區域之一，玩家可以在此排列紙牌並進行移動。此組件需要支援拖放功能、紙牌疊放顯示，以及符合遊戲規則的互動邏輯。

根據 constitution.md 的要求，此組件必須遵循 Test-Driven Development 原則，在實作前先撰寫測試，並確保程式碼品質符合標準。

## 工項 tasks

- [ ] 建立 `src/components/TableauColumn/` 目錄
- [ ] 建立 `TableauColumn.tsx` 主組件檔案
- [ ] 建立 `TableauColumn.styled.ts` 樣式檔案（使用 styled-components）
- [ ] 建立 `index.ts` 匯出檔案
- [ ] 實作 TableauColumn 組件的基本結構和 props 介面
- [ ] 實作紙牌疊放顯示邏輯（cascade effect）
- [ ] 整合 React DnD 拖放功能
- [ ] 實作符合紙牌遊戲規則的拖放驗證
- [ ] 加入 ARIA 標籤和鍵盤導航支援（WCAG 2.1 AA）
- [ ] 實作動畫效果（60fps 目標）
- [ ] 加入 TypeScript 型別定義
- [ ] 撰寫單元測試

## 測試方式

### 測試流程

1. 驗證組件能正確渲染空的 tableau column
2. 驗證組件能正確顯示多張紙牌的疊放效果
3. 測試拖放功能是否正確運作
4. 驗證只有符合規則的紙牌移動會被允許
5. 測試鍵盤導航功能
6. 驗證 ARIA 屬性是否正確設定
7. 測試動畫效果和效能
8. 檢查 TypeScript 型別檢查是否通過

### 執行測試語法指令

```bash
npm test -- tests/T028_TableauColumn-component.test.ts
npm run lint
npm run typecheck
```

## AI 使用工具

- Write: 建立組件檔案
- Edit: 修改現有檔案
- Read: 讀取現有型別定義和相關檔案
- Bash: 執行測試和 lint 檢查
- TodoWrite: 追蹤任務進度

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
