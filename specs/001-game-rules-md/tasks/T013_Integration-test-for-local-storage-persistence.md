# T013. Integration test for local storage persistence

## 描述

建立本地儲存持久化的整合測試，驗證遊戲狀態能夠正確保存到 LocalStorage 並在重新載入時恢復。此測試確保遊戲進度不會因為瀏覽器重新整理或關閉而遺失，符合 Constitution 的 Test-Driven Development 原則。

測試範圍包含：

- 遊戲狀態自動保存到 LocalStorage
- 頁面重新載入後遊戲狀態恢復
- 多個遊戲狀態的管理（新遊戲、進行中遊戲）
- LocalStorage 容量限制處理
- 無效或損壞資料的處理

根據 plan.md 的技術規格，此測試使用 Jest 和 React Testing Library 進行測試，並模擬 LocalStorage API 行為。

## 工項 tasks

- [x] 建立 `tests/integration/` 目錄結構
- [x] 建立 `tests/integration/test_persistence.test.ts` 測試檔案
- [x] 實作遊戲狀態保存測試案例
- [x] 實作遊戲狀態載入測試案例
- [x] 實作多遊戲狀態管理測試
- [x] 實作 LocalStorage 容量限制測試
- [x] 實作無效資料處理測試
- [x] 模擬 localStorage API 的 mock 設定
- [x] 驗證測試案例會失敗（TDD 紅燈階段）

## 測試方式

### 測試流程

1. 執行整合測試檢查所有測試案例是否按預期失敗
2. 驗證測試涵蓋以下場景：
   - 新遊戲建立並保存狀態
   - 頁面重新載入後恢復遊戲狀態
   - 進行卡牌移動後狀態更新
   - LocalStorage 滿載時的處理
   - 損壞資料的錯誤處理
3. 確認測試使用適當的 mock 和 spy 函數
4. 檢查測試符合 Constitution 的測試品質標準

### 執行測試語法指令

```bash
npm test tests/integration/test_persistence.test.tsx
```

測試檔案已建立在 `tests/integration/test_persistence.test.tsx`，包含以下測試案例：

- 遊戲狀態自動保存測試
- 頁面重新載入後狀態恢復測試
- 多遊戲狀態管理測試
- LocalStorage 容量限制處理測試
- 無效資料處理測試
- 效能需求驗證測試

執行指令：`npm test tests/integration/test_persistence.test.tsx`

## AI 使用工具

- **Write**: 建立測試檔案
- **LS**: 檢查目錄結構
- **Bash**: 執行測試指令驗證
- **Read**: 讀取相關合約和規格文件

需要使用的測試框架：

- Jest (單元測試框架)
- React Testing Library (React 組件測試)
- jsdom (DOM 環境模擬)

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
