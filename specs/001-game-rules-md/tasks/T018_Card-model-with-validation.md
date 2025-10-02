# T018. Card model with validation

## 描述

建立撲克牌模型類別，包含完整的資料驗證機制和業務邏輯。此模型將作為整個 Solitaire 遊戲卡牌操作的核心，需要實現卡牌的建立、驗證、比較和狀態管理功能。

根據 Constitution 原則 I (Code Quality Excellence) 和 II (Test-Driven Development)，此模型必須有完整的驗證邏輯、清楚的錯誤處理，並且在實作前必須先有對應的測試。

此任務依賴 T014-T017 (類型定義) 的完成，並為後續的 T019-T023 (其他模型) 和 T024-T026 (服務層) 奠定基礎。

## 工項 tasks

- [x] 建立 `src/models/` 目錄結構
- [x] 實作 `Card` 類別包含 constructor 和基本屬性
- [x] 加入卡牌驗證方法 `validate()` 檢查卡牌合法性
- [x] 實作 `isRed()` 和 `isBlack()` 顏色判斷方法
- [x] 實作 `canPlaceOn(targetCard)` 方法判斷是否可放置在目標卡牌上
- [x] 實作 `getNextRank()` 和 `getPreviousRank()` 方法處理點數序列
- [x] 加入 `flip()` 方法切換卡牌可見狀態
- [x] 實作 `equals(otherCard)` 方法比較兩張卡牌
- [x] 加入 `clone()` 方法建立卡牌副本
- [x] 實作 `toJSON()` 和靜態 `fromJSON()` 方法支援序列化
- [x] 加入完整的 JSDoc 註解和錯誤處理
- [x] 導出 Card 類別和相關工具函數

## 測試方式

### 測試流程

驗證 `src/models/card.ts` 檔案已建立且包含：

1. Card 類別正確實作所有必要方法和屬性
2. 卡牌驗證邏輯正確運作，能檢測非法卡牌
3. 顏色判斷和放置規則符合 Solitaire 遊戲邏輯
4. 序列化和反序列化功能正常運作
5. 所有方法都有適當的錯誤處理和邊界情況處理
6. 通過對應的契約測試 (T004) 和單元測試 (T047)
7. 符合 TypeScript strict mode、ESLint 和 Prettier 規範

### 執行測試語法指令

```bash
# 執行契約測試 (應該從失敗轉為通過)
npm test tests/contract/test_game_engine.test.ts

# 執行專用單元測試 (TDD 測試)
npm test tests/unit/test_models.test.ts

# 執行 TypeScript 編譯檢查
npm run typecheck

# 執行 ESLint 檢查
npm run lint

# 驗證模型邏輯正確性
node -e "
const { Card } = require('./src/models/card.ts');
const card = new Card('Hearts', 'Ace');
console.log('Card validation:', card.validate());
console.log('Card color:', card.isRed());
"
```

## AI 使用工具

需要使用以下工具：

- **Write**: 建立 `src/models/card.ts` 檔案
- **Read**: 讀取類型定義檔案 (`src/types/card.ts`, `src/types/game-state.ts`)
- **Bash**: 執行測試、TypeScript 編譯檢查和 linting
- **LS**: 驗證目錄結構
- **Grep**: 檢查相關的測試檔案和契約

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
