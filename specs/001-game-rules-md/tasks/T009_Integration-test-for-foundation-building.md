# T009. Integration test for foundation building

## 描述

建立foundation building（基礎堆疊）的整合測試，驗證紙牌從tableau移動到foundation pile的完整流程。此測試確保遊戲引擎正確處理foundation pile的建立規則，包括從A開始按花色順序疊放到K的邏輯。

根據Constitution原則II（Test-Driven Development），此測試必須在任何實作代碼之前完成，並且必須先失敗（紅燈），然後透過實作讓測試通過（綠燈）。

## 工項 tasks

- [ ] 建立 `tests/integration/` 目錄結構（如不存在）
- [ ] 建立 `test_foundation.test.ts` 測試檔案
- [ ] 實作基礎Foundation pile初始化測試
- [ ] 實作A牌放置到空Foundation pile的測試
- [ ] 實作相同花色順序疊放測試（A→2→3...→K）
- [ ] 實作錯誤花色拒絕測試
- [ ] 實作錯誤順序拒絕測試（如在2上放4）
- [ ] 實作從tableau移動到foundation的完整流程測試
- [ ] 實作Foundation pile滿堆（13張牌）的測試
- [ ] 實作遊戲勝利條件檢查（四個foundation pile都滿）
- [ ] 配置Jest測試環境和TypeScript支援

## 測試方式

### 測試流程

1. 執行 `npm test test_foundation.test.ts` 驗證測試檔案可以正常執行
2. 確認所有測試案例都會失敗（紅燈狀態），因為尚未實作相關功能
3. 檢查測試覆蓋以下場景：
   - Foundation pile初始化為空
   - 只有A牌可以放到空foundation pile
   - 相同花色的牌可以按順序疊放（A→2→3...→K）
   - 不同花色的牌被拒絕
   - 錯誤順序的牌被拒絕
   - 從tableau到foundation的完整移動流程
   - Foundation pile達到13張牌時的處理
   - 四個foundation pile都滿時觸發勝利條件

### 執行測試語法指令

```bash
npm test tests/integration/test_foundation.test.ts
```

寫好測試檔後，可在 Bash 環境下使用以下指令執行測試：

```bash
npm test tests/integration/test_foundation.test.ts
```

## AI 使用工具

- **Write**: 建立測試檔案
- **Bash**: 執行npm test指令驗證測試
- **Read**: 讀取相關契約和模型定義
- **Edit**: 修改測試內容（如需要）

需要的MCP工具：

- Jest（測試框架）
- TypeScript編譯器
- React Testing Library（如測試UI組件）

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
