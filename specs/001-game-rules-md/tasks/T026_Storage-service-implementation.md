# T026. Storage service implementation

## 描述

實作儲存服務 (Storage Service)，負責管理遊戲狀態的本地持久化。此服務需要提供完整的遊戲狀態儲存、讀取、清除功能，並確保資料完整性和錯誤處理。服務需要支援 LocalStorage API，實現遊戲進度的自動保存和恢復，滿足離線遊戲的需求。

根據 constitution.md 要求，此實作必須遵循 TDD 原則，先確保對應的合約測試失敗，然後進行實作直到所有測試通過。

## 工項 tasks

- [ ] 建立 `src/services/storage.ts` 檔案
- [ ] 實作 `StorageService` 類別，包含以下方法：
  - [ ] `saveGameState(gameState: GameState): Promise<void>` - 儲存遊戲狀態
  - [ ] `loadGameState(): Promise<GameState | null>` - 載入遊戲狀態
  - [ ] `clearGameState(): Promise<void>` - 清除遊戲狀態
  - [ ] `hasStoredGame(): Promise<boolean>` - 檢查是否有儲存的遊戲
- [ ] 實作錯誤處理機制，包含 `StorageError` 類別
- [ ] 加入資料驗證，確保載入的遊戲狀態有效
- [ ] 實作序列化和反序列化邏輯，將 GameState 物件與 JSON 格式互轉
- [ ] 加入 LocalStorage 容量檢查和清理機制
- [ ] 確保與 `GameState` 型別和介面完全相容
- [ ] 更新 `src/types/index.ts` 導出 Storage 相關型別

## 測試方式

### 測試流程

1. 執行既有的合約測試，確認 `StorageContract` 測試失敗
2. 實作儲存服務後，重新執行合約測試確保通過
3. 驗證遊戲狀態可以正確儲存到 LocalStorage
4. 驗證遊戲狀態可以正確從 LocalStorage 讀取
5. 驗證無效資料的錯誤處理機制
6. 驗證儲存空間不足時的處理
7. 驗證清除功能正常運作

### 執行測試語法指令

```bash
npm test tests/contract/test_storage.test.ts
npm test tests/integration/test_persistence.test.ts
npx jest tests/T026_Storage-service-implementation.test.ts
npm run lint
```

## AI 使用工具

本任務需要使用以下工具：
- **Read**: 讀取既有的型別定義和合約檔案
- **Write**: 建立新的 storage.ts 檔案
- **Edit**: 修改既有檔案以加入新的型別導出
- **Bash**: 執行測試指令驗證實作正確性
- **Glob**: 搜尋相關的型別和介面檔案

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶