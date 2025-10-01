# T019. TableauColumn model in src/models/tableau-column.ts

## 描述

實作 TableauColumn 模型類別，用於管理 Solitaire 遊戲中的 tableau 牌堆（工作區的七個下降序列牌堆）。此模型需要處理牌的放置、移除、驗證移動規則，以及牌的可見性狀態管理。

TableauColumn 是遊戲的核心組件之一，必須支援：
- 交替顏色的下降序列（紅黑交替，數值遞減）
- 翻牌機制（當頂部隱藏牌暴露時自動翻面）
- 移動驗證（確保只有合法的牌可以放置）
- 多張牌的群組移動（拖拽已翻開的序列）
- 空牌堆的 King 牌放置規則

## 工項 tasks

- [ ] 建立 `src/models/tableau-column.ts` 檔案
- [ ] 定義 TableauColumn 類別的基本結構與屬性
- [ ] 實作 addCard() 方法 - 新增牌到牌堆頂部
- [ ] 實作 removeCard() 方法 - 移除指定牌及其上方所有牌
- [ ] 實作 canPlaceCard() 方法 - 驗證牌是否可以放置
- [ ] 實作 getVisibleCards() 方法 - 取得已翻面的牌
- [ ] 實作 getTopCard() 方法 - 取得頂部牌
- [ ] 實作 flipTopCard() 方法 - 翻面頂部隱藏牌
- [ ] 實作 isEmpty() 方法 - 檢查牌堆是否為空
- [ ] 實作 canRemoveSequence() 方法 - 驗證序列是否可以移動
- [ ] 新增型別定義和介面
- [ ] 新增輸入驗證和錯誤處理
- [ ] 新增 JSDoc 文件註解

## 測試方式

### 測試流程

1. 建立 TableauColumn 實例並驗證初始狀態
2. 測試新增牌的功能和規則驗證
3. 測試移除牌和序列移動
4. 測試翻牌機制
5. 測試邊界條件（空牌堆、無效移動等）
6. 驗證與 Card 模型的整合

### 執行測試語法指令

```bash
npm test tests/unit/T019_TableauColumn-model.test.ts
```

測試檔案位於 `tests/unit/T019_TableauColumn-model.test.ts`，包含 TableauColumn 的完整測試案例。

## AI 使用工具

- **Write**: 建立新的 TypeScript 檔案
- **Edit**: 修改現有檔案內容
- **Read**: 讀取相關檔案（Card 模型、型別定義）
- **Bash**: 執行測試指令驗證實作
- **Glob**: 搜尋相關檔案和依賴

本任務需要參考：
- `src/types/card.ts` - Card 型別定義
- `src/types/game-state.ts` - GameState 型別
- `src/models/card.ts` - Card 模型實作
- 遊戲規則和 Solitaire 標準規則

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶