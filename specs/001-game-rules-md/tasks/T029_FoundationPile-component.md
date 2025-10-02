# T029. FoundationPile Component Implementation

## 描述

實作 FoundationPile 組件，這是 Desktop Solitaire 遊戲中的基礎牌堆組件。根據 constitution.md 的 Test-Driven Development 原則，此任務需要實作一個可接受卡牌拖放、顯示牌堆狀態、並遵循遊戲規則的 React 組件。

此組件需要：

- 接受卡牌的拖放操作 (React DnD)
- 顯示當前牌堆的頂牌
- 根據遊戲規則驗證卡牌放置的合法性 (同花色、遞增順序)
- 提供視覺回饋給使用者
- 符合 WCAG 2.1 AA 無障礙標準
- 使用 styled-components 進行樣式設計
- 支援鍵盤導航

## 工項 tasks

- [ ] 建立 `src/components/FoundationPile/` 目錄結構
- [ ] 實作 `src/components/FoundationPile/FoundationPile.tsx` 主要組件
- [ ] 建立 `src/components/FoundationPile/FoundationPile.styles.ts` 樣式檔案
- [ ] 實作拖放目標功能 (React DnD useDrop hook)
- [ ] 整合 FoundationPile model 進行遊戲邏輯驗證
- [ ] 實作無障礙功能 (ARIA labels, 鍵盤導航)
- [ ] 加入動畫效果 (卡牌放置、hover 狀態)
- [ ] 建立 TypeScript 介面定義
- [ ] 實作錯誤處理和使用者回饋

## 測試方式

### 測試流程

1. 確認組件能正確渲染空的基礎牌堆
2. 驗證拖放功能能接受合法的卡牌 (A開始，同花色遞增)
3. 確認非法卡牌會被拒絕並提供視覺回饋
4. 測試鍵盤導航功能
5. 驗證 ARIA 標籤和無障礙功能
6. 檢查動畫效果和使用者體驗
7. 確認組件與 game engine 的整合正常運作

### 執行測試語法指令

```bash
npm test -- --testPathPattern=T029_FoundationPile-component_test
npm run lint
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
- `src/models/foundation-pile.ts` - FoundationPile model
- `src/components/Card/Card.tsx` - Card 組件參考
- `tests/contract/test_ui_components.test.tsx` - 組件契約測試

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
