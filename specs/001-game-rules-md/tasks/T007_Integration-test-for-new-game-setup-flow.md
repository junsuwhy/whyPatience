# T007. Integration test for new game setup flow

## 描述

建立新遊戲設定流程的整合測試，此測試將驗證從開始新遊戲到遊戲初始化完成的整個流程。測試將確保遊戲狀態正確初始化、卡牌正確分配到各個位置（七個tableau欄位、四個foundation堆疊、stock pile），並且UI正確顯示初始遊戲狀態。

根據Constitution Principle II (TDD)，此測試必須在實作之前撰寫並且必須失敗，以確保測試驅動開發的原則。

測試檔案位置：`tests/integration/test_new_game.test.ts`

## 工項 tasks

- [ ] 建立 `tests/integration/` 目錄結構
- [ ] 撰寫新遊戲設定流程的整合測試
- [ ] 測試遊戲狀態初始化 (52張卡牌正確分配)
- [ ] 測試tableau欄位初始化 (7欄，每欄正確數量的卡牌)
- [ ] 測試foundation pile初始化 (4個空堆疊)
- [ ] 測試stock pile初始化 (剩餘卡牌)
- [ ] 測試UI元件正確渲染初始狀態
- [ ] 測試drag-and-drop初始化設定
- [ ] 確保測試在沒有實作的情況下會失敗

## 測試方式

### 測試流程

1. 驗證測試檔案存在於 `tests/integration/test_new_game.test.ts`
2. 執行測試指令確認測試會失敗（因為尚未實作）
3. 檢查測試涵蓋以下場景：
   - 新遊戲初始化
   - 卡牌分配正確性
   - UI狀態正確性
   - 遊戲規則初始狀態
4. 確認測試符合React Testing Library和Jest的最佳實務

### 執行測試語法指令

```bash
npm test tests/integration/test_new_game.test.ts
```

## AI 使用工具

- **Write**: 建立測試檔案
- **Read**: 讀取相關規格和合約
- **Bash**: 執行測試指令驗證
- **LS**: 確認目錄結構
- **Jest**: JavaScript測試框架
- **React Testing Library**: React元件測試
- **TodoWrite**: 追蹤任務進度

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
