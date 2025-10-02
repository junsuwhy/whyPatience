# T033. SettingsModal 元件實作

## 描述

實作設定模態對話框元件，提供使用者介面來配置遊戲設定，包括遊戲模式（1卡/3卡抽牌）、主題設定、音效開關等。此元件需要遵循 WCAG 2.1 AA 無障礙標準，支援鍵盤導航，並使用 styled-components 進行樣式設計。

## 工項 tasks

- [ ] 建立 `src/components/SettingsModal/` 目錄結構
- [ ] 建立 `src/components/SettingsModal/SettingsModal.tsx` 主元件檔案
- [ ] 實作模態對話框基本結構與開關邏輯
- [ ] 實作遊戲模式設定（1卡/3卡抽牌模式切換）
- [ ] 實作主題設定選項（若有主題系統）
- [ ] 實作音效開關設定
- [ ] 加入無障礙支援（ARIA labels、鍵盤導航、焦點管理）
- [ ] 使用 styled-components 實作響應式樣式
- [ ] 實作設定資料的儲存與載入邏輯
- [ ] 加入表單驗證與錯誤處理
- [ ] 建立 `src/components/SettingsModal/index.ts` 匯出檔案

## 測試方式

### 測試流程

1. 驗證元件能正確渲染模態對話框
2. 測試開啟/關閉模態對話框功能
3. 驗證各項設定控制項能正確操作
4. 測試設定資料的儲存與載入
5. 驗證鍵盤導航功能（Tab、Enter、Escape）
6. 測試無障礙功能（螢幕閱讀器相容性）
7. 驗證響應式設計在不同螢幕尺寸下的表現

### 執行測試語法指令

```bash
# Run specific test for T033 SettingsModal component
npm test -- --testPathPattern=T033_SettingsModal-component_test.ts
# Alternative: run all SettingsModal related tests
npm test -- --testPathPattern=SettingsModal
# Run linting checks
npm run lint
# Run TypeScript type checking
npm run typecheck
```

## AI 使用工具

- **Edit**: 編輯檔案內容
- **Write**: 建立新檔案
- **Read**: 讀取現有檔案以了解專案結構和依賴
- **Bash**: 執行測試指令和編譯檢查
- **Glob**: 搜尋相關檔案和元件參考

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
