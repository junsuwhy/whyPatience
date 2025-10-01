# T014. Card types and enums

## 描述

建立撲克牌遊戲的基礎類型定義，包含花色(Suit)、點數(Rank)、卡牌顏色(Color)等核心列舉，以及 Card 介面的 TypeScript 類型定義。這是整個 Solitaire 遊戲的基礎類型系統，必須遵循 TypeScript strict mode 並支援所有遊戲邏輯所需的屬性和方法。

根據 Constitution 原則 I (Code Quality Excellence)，所有類型必須有清楚的命名慣例、完整的文件註解，並遵循 TypeScript 最佳實務。

## 工項 tasks

- [ ] 建立 `src/types/` 目錄結構
- [ ] 定義 `Suit` 列舉 (Spades, Hearts, Diamonds, Clubs)
- [ ] 定義 `Rank` 列舉 (Ace, 2-10, Jack, Queen, King)
- [ ] 定義 `Color` 列舉 (Red, Black)
- [ ] 建立 `Card` 介面包含 suit, rank, color, isVisible, id 等屬性
- [ ] 建立 `CardPosition` 類型用於拖拽系統
- [ ] 加入 JSDoc 註解說明每個類型的用途
- [ ] 導出所有類型供其他模組使用

## 測試方式

### 測試流程

驗證 `src/types/card.ts` 檔案已建立且包含：

1. 所有必要的列舉 (Suit, Rank, Color) 都已正確定義
2. Card 介面包含遊戲所需的所有屬性
3. 類型可以正確匯入到其他 TypeScript 檔案
4. 通過 TypeScript 編譯檢查無錯誤
5. 符合 ESLint 和 Prettier 規範

### 執行測試語法指令

```bash
# 執行專用測試檔案 (TDD 測試 - 期待失敗狀態)
node specs/001-game-rules-md/tests/T014_Card-types-and-enums_test.mjs

# 執行 TypeScript 編譯檢查
npm run typecheck

# 執行 ESLint 檢查
npm run lint
```

## AI 使用工具

需要使用以下工具：

- **Write**: 建立 `src/types/card.ts` 檔案
- **Bash**: 執行 TypeScript 編譯檢查和 linting
- **Read**: 確認檔案內容正確性
- **LS**: 驗證目錄結構

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
