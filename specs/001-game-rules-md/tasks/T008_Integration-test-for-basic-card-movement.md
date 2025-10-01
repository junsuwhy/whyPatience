# T008. Integration test for basic card movement

## 描述

建立整合測試來驗證基本卡牌移動功能，包括從 tableau column 到 foundation pile、tableau column 間的移動、以及拖放操作的基本邏輯。此測試必須在實作前先撰寫並確保失敗，遵循 TDD 原則。

根據 Constitution 原則 II (Test-Driven Development)，此測試必須：

- 在任何實作前先撰寫
- 測試失敗後才能開始實作
- 涵蓋基本卡牌移動的核心功能
- 確保 red-green-refactor 循環

此測試將驗證：

- 卡牌從一個 tableau column 移動到另一個 tableau column
- 卡牌從 tableau column 移動到 foundation pile
- 拖放操作的基本驗證規則
- 移動後的遊戲狀態更新

## 工項 tasks

- [ ] 建立 `tests/integration/` 目錄結構（如不存在）
- [ ] 建立 `tests/integration/test_card_movement.test.ts` 整合測試檔
- [ ] 撰寫測試案例：tableau column 間的卡牌移動
- [ ] 撰寫測試案例：tableau column 到 foundation pile 的移動
- [ ] 撰寫測試案例：無效移動的拒絕邏輯
- [ ] 撰寫測試案例：移動後遊戲狀態的正確更新
- [ ] 撰寫測試案例：拖放操作的 React DnD 整合
- [ ] 設定測試環境和必要的 mock 物件
- [ ] 確認測試執行失敗（因為尚未實作）

## 測試方式

### 測試流程

1. 執行整合測試指令確認測試檔存在且可執行
2. 確認所有測試案例都失敗（因為尚未實作相關功能）
3. 驗證測試涵蓋以下功能：
   - 基本卡牌移動邏輯
   - 移動驗證規則
   - 遊戲狀態更新
   - React DnD 拖放整合
4. 確認測試符合 TypeScript 嚴格模式
5. 確認測試遵循 React Testing Library 最佳實務

### 執行測試語法指令

```bash
# Execute the integration test for basic card movement
npm test tests/integration/test_card_movement.test.ts

# Alternative: Run with coverage
npm test -- --coverage tests/integration/test_card_movement.test.ts

# Alternative: Run with watch mode for development
npm test -- --watch tests/integration/test_card_movement.test.ts
```

## AI 使用工具

- **Write**: 建立測試檔案
- **Read**: 讀取相關規格和合約檔案
- **Bash**: 執行測試指令驗證
- **LS**: 確認目錄結構
- **Glob**: 搜尋相關檔案模式

需要參考的檔案：

- `specs/001-game-rules-md/contracts/game-engine-interface.ts`
- `specs/001-game-rules-md/contracts/ui-component-interfaces.ts`
- `specs/001-game-rules-md/data-model.md`
- `specs/001-game-rules-md/quickstart.md`

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
