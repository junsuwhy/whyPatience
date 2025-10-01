# T005. Contract test for StorageContract

## 描述

為 StorageContract 介面建立合約測試，確保存儲服務介面的正確性。此測試必須在實作之前建立（遵循 TDD 原則），並且必須在沒有實作的情況下失敗。

StorageContract 負責處理遊戲狀態的本地存儲持久化，包括儲存、載入、清除遊戲狀態等操作。合約測試將驗證介面的正確性，確保未來的實作符合預期的行為。

根據 Constitution 第 II 條 (Test-Driven Development)，此測試必須：

- 在實作之前撰寫
- 初始狀態必須失敗（red）
- 提供清晰的實作指導
- 維持高覆蓋率標準

## 工項 tasks

- [ ] 建立 `tests/contract/` 目錄結構
- [ ] 建立 `tests/contract/test_storage.test.ts` 測試檔案
- [ ] 定義 StorageContract 介面測試規格
- [ ] 實作儲存遊戲狀態的合約測試 (saveGameState)
- [ ] 實作載入遊戲狀態的合約測試 (loadGameState)
- [ ] 實作清除遊戲狀態的合約測試 (clearGameState)
- [ ] 實作檢查存儲可用性的合約測試 (isStorageAvailable)
- [ ] 實作獲取存儲大小的合約測試 (getStorageSize)
- [ ] 加入錯誤處理的測試案例
- [ ] 確保測試在沒有實作時會失敗
- [ ] 配置 TypeScript 類型檢查與 ESLint 合規性

## 測試方式

### 測試流程

AI 驗證本任務已成功的驗證方式：

1. 檢查 `tests/contract/test_storage.test.ts` 檔案存在
2. 執行測試確認失敗（因為沒有實作）
3. 驗證測試覆蓋 StorageContract 的所有方法
4. 確認測試使用 Jest 和 TypeScript
5. 檢查代碼品質（ESLint、Prettier）符合 Constitution 要求
6. 驗證測試案例包含正常流程與錯誤處理

### 執行測試語法指令

```bash
npm test tests/contract/test_storage.test.ts
```

**執行測試結果**: ✅ 測試已建立並正確失敗（13 failed, 14 passed），符合 TDD 原則

## AI 使用工具

在執行本項工作時需要使用以下工具：

- **Write**: 建立測試檔案
- **Read**: 讀取相關合約定義與範例
- **Bash**: 執行測試指令驗證
- **Edit**: 修正測試代碼
- **LS**: 檢查目錄結構

需要存取的檔案：

- `specs/001-game-rules-md/contracts/storage-interface.ts` (StorageContract 定義)
- `tests/contract/test_game_engine.test.ts` (參考已完成的測試)
- `package.json` (確認測試設定)

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
