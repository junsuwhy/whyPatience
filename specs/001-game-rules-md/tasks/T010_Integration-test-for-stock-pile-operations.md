# T010. Integration test for stock pile operations

## 描述

建立 stock pile（牌庫）操作的集成測試，驗證牌庫的翻牌、循環、以及與遊戲狀態的整合功能。根據 Constitution 中的 Test-Driven Development 原則，此測試必須在實作前完成且必須失敗，確保後續實作能正確滿足需求。

Stock pile 是 Solitaire 遊戲中的核心組件之一，負責管理未發放的卡牌，支援 1-card 和 3-card 抽取模式，以及牌庫用完後的循環重置功能。此測試將驗證這些關鍵操作的正確性和與遊戲引擎的整合。

## 工項 tasks

- [ ] 建立 `tests/integration/` 目錄（如不存在）
- [ ] 建立 `tests/integration/test_stock_pile.test.ts` 測試檔案
- [ ] 實作 stock pile 初始化測試
- [ ] 實作 1-card 抽取模式測試
- [ ] 實作 3-card 抽取模式測試
- [ ] 實作牌庫循環重置測試
- [ ] 實作空牌庫處理測試
- [ ] 實作與 tableau 和 foundation 的卡牌移動集成測試
- [ ] 實作 undo 操作對 stock pile 的影響測試
- [ ] 設定測試環境和 mock 數據
- [ ] 驗證測試初始狀態為失敗（TDD 要求）

## 測試方式

### 測試流程

1. **環境驗證**: 確認 Jest 和 React Testing Library 已正確配置
2. **測試執行**: 執行 `npm test -- test_stock_pile.test.ts` 確認測試失敗
3. **覆蓋率檢查**: 驗證測試涵蓋以下場景：
   - Stock pile 初始化（52張牌，前3張可見）
   - 1-card 模式抽取操作
   - 3-card 模式抽取操作
   - 牌庫用完後的循環重置
   - 空牌庫狀態處理
   - 卡牌移動到 tableau/foundation 的集成
   - Undo 操作對 stock pile 狀態的還原
4. **依賴檢查**: 確認測試不依賴實際實作，使用適當的 mock 和 stub
5. **錯誤處理**: 驗證異常情況的測試覆蓋

### 執行測試語法指令

```bash
npm test -- tests/integration/test_stock_pile.test.ts --verbose
```

執行指令已建立，測試檔案位於 `tests/integration/test_stock_pile.test.ts`

## AI 使用工具

- **Write**: 建立測試檔案和目錄結構
- **Read**: 讀取相關的介面定義和數據模型
- **Bash**: 執行測試指令和驗證環境
- **Jest**: JavaScript 測試框架，用於撰寫和執行單元測試
- **React Testing Library**: React 組件測試工具
- **TypeScript**: 型別檢查和程式碼品質保證

需要參考的檔案：

- `specs/001-game-rules-md/contracts/game-engine-interface.ts`
- `specs/001-game-rules-md/contracts/storage-interface.ts`
- `specs/001-game-rules-md/data-model.md`
- `.specify/memory/constitution.md`（TDD 原則）

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
