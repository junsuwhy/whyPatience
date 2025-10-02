# T031. GameControls component

## 描述

實作 GameControls 元件，這是遊戲中的控制面板，負責提供玩家進行遊戲操作的介面。元件需要包含新遊戲、重新開始、復原、重做、暫停/繼續等核心功能按鈕，以及遊戲設定和統計資料的快速存取入口。

根據 Constitution 要求，此任務遵循 TDD 原則，需要先確保相關測試存在且失敗後再開始實作。元件需要符合設計系統一致性、效能標準（60fps 動畫）以及無障礙性要求（WCAG 2.1 AA）。使用 styled-components 處理樣式和 React hooks 管理狀態。

## 工項 tasks

- [ ] 建立 `src/components/GameControls/` 目錄結構
- [ ] 建立 `src/components/GameControls/GameControls.tsx` 主要元件檔案
- [ ] 建立 `src/components/GameControls/GameControls.styles.ts` 樣式檔案（使用 styled-components）
- [ ] 建立 `src/components/GameControls/GameControls.types.ts` 類型定義檔案
- [ ] 建立 `src/components/GameControls/index.ts` 匯出檔案
- [ ] 實作新遊戲按鈕功能
- [ ] 實作重新開始遊戲按鈕功能
- [ ] 實作復原（Undo）按鈕功能
- [ ] 實作重做（Redo）按鈕功能
- [ ] 實作暫停/繼續遊戲切換功能
- [ ] 實作設定功能按鈕（開啟 SettingsModal）
- [ ] 實作統計資料按鈕（開啟 GameStatistics）
- [ ] 加入按鈕狀態管理（啟用/停用狀態）
- [ ] 實作鍵盤快速鍵支援
- [ ] 加入無障礙性支援（ARIA labels、focus management）
- [ ] 實作按鈕動畫效果和視覺回饋
- [ ] 加入 TypeScript 嚴格類型檢查
- [ ] 確保 React.memo 最佳化以達到 60fps 效能目標

## 測試方式

### 測試流程

1. 確認相關的 contract test 和 integration test 存在且失敗
2. 驗證所有按鈕能正確渲染並響應點擊事件
3. 測試新遊戲功能是否正確重置遊戲狀態
4. 測試復原/重做功能是否正確操作遊戲歷史
5. 測試暫停/繼續功能是否正確控制遊戲流程
6. 驗證按鈕狀態管理（啟用/停用條件）
7. 測試鍵盤快速鍵是否正常運作
8. 測試無障礙性功能（鍵盤導航、螢幕閱讀器、focus order）
9. 驗證動畫效果和效能表現
10. 確認 TypeScript 類型檢查無錯誤

### 執行測試語法指令

```bash
npm test -- --testPathPattern=GameControls
npm run lint
npm run typecheck
npx jest tests/T031_GameControls-component.test.ts
```

**手動執行測試指令：**

```bash
npx jest tests/T031_GameControls-component.test.ts --verbose
```

## AI 使用工具

- Edit/MultiEdit: 建立和修改元件檔案
- Read: 讀取相關類型定義、遊戲狀態管理和測試檔案
- Bash: 執行測試和檢查指令
- Glob/Grep: 搜尋相關程式碼參考和遊戲引擎介面
- TodoWrite: 追蹤任務進度

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
