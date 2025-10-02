# T030. StockPile Component Implementation

## 描述

實作 StockPile 組件，這是 Desktop Solitaire 遊戲中的庫存牌堆組件。根據 constitution.md 的 Test-Driven Development 原則，此任務需要實作一個管理剩餘卡牌、支援翻牌操作、並提供 1 張/3 張抽牌模式的 React 組件。

此組件需要：

- 顯示庫存牌堆和廢牌堆 (stock pile 和 waste pile)
- 支援點擊翻牌操作 (1張或3張模式)
- 當庫存牌堆空時支援重新循環廢牌堆
- 提供拖放來源功能 (React DnD)
- 顯示剩餘卡牌數量
- 符合 WCAG 2.1 AA 無障礙標準
- 使用 styled-components 進行樣式設計
- 支援鍵盤導航 (Space/Enter 鍵翻牌)

## 工項 tasks

- [x] 建立 `src/components/StockPile/` 目錄結構
- [x] 實作 `src/components/StockPile/StockPile.tsx` 主要組件
- [x] 建立 `src/components/StockPile/StockPile.styles.ts` 樣式檔案
- [x] 實作翻牌功能 (點擊事件處理)
- [x] 實作拖放來源功能 (React DnD useDrag hook)
- [x] 整合 StockPile model 進行遊戲邏輯管理
- [x] 實作 1張/3張抽牌模式切換
- [x] 實作廢牌堆重新循環功能
- [x] 實作無障礙功能 (ARIA labels, 鍵盤導航)
- [x] 加入動畫效果 (翻牌動畫、hover 狀態)
- [x] 建立 TypeScript 介面定義
- [x] 實作錯誤處理和使用者回饋

## 測試方式

### 測試流程

1. 確認組件能正確渲染庫存牌堆和廢牌堆
2. 驗證翻牌功能在 1張和3張模式下正常運作
3. 測試當庫存牌堆空時能正確重新循環
4. 確認拖放來源功能能提供可拖拽的卡牌
5. 測試鍵盤導航功能 (Space/Enter 鍵)
6. 驗證 ARIA 標籤和無障礙功能
7. 檢查動畫效果和使用者體驗
8. 確認組件與 game engine 的整合正常運作

### 執行測試語法指令

```bash
# Run the specific test file
npm test -- --testPathPatterns=T030_StockPile-component

# Run linting to ensure code quality
npm run lint

# Run TypeScript type checking
npm run typecheck
```

## AI 使用工具

- **Read**: 讀取現有的類型定義和 model 檔案
- **Write**: 建立新的組件檔案
- **Edit**: 修改現有檔案 (如需要)
- **Bash**: 執行測試指令和 linting
- **Glob**: 搜尋相關檔案和模式
- **Grep**: 搜尋程式碼中的特定模式

需要的檔案參考：

- `src/types/index.ts` - 類型定義
- `src/models/stock-pile.ts` - StockPile model
- `src/components/Card/Card.tsx` - Card 組件參考
- `tests/contract/test_ui_components.test.tsx` - 組件契約測試
- `tests/integration/test_stock_pile.test.ts` - StockPile 整合測試

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
