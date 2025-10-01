# T002. 安裝專案相依套件

## 描述

為 Desktop Solitaire Web Application 安裝所有必要的相依套件，包括 React 18+、React DnD、styled-components、TypeScript、Jest 和 Playwright。這是 Phase 3.1 Setup 階段的關鍵任務，需要確保所有套件版本相容並符合專案的技術需求。

根據 plan.md 的技術規格：

- React 18+ 作為主要 UI 框架
- React DnD 實現拖拉功能
- styled-components 做為 CSS-in-JS 解決方案
- TypeScript 提供型別安全
- Jest + React Testing Library 進行單元測試
- Playwright 進行端對端測試

## 工項 tasks

- [x] 安裝 React 18+ 和相關核心套件 (`react`, `react-dom`)
- [x] 安裝 React DnD 套件 (`react-dnd`, `react-dnd-html5-backend`)
- [x] 安裝 styled-components 套件 (`styled-components`)
- [x] 安裝 TypeScript 相關套件 (`typescript`, `@types/react`, `@types/react-dom`)
- [x] 安裝測試相關套件 (`jest`, `@testing-library/react`, `@testing-library/jest-dom`)
- [x] 安裝 Playwright 進行 E2E 測試 (`@playwright/test`)
- [x] 安裝開發工具套件 (`@types/styled-components`, `@vitejs/plugin-react`)
- [x] 驗證 `package.json` 更新正確
- [x] 執行 `npm install` 確保所有套件安裝成功

## 測試方式

1. 檢查 `package.json` 檔案是否包含所有必要的 dependencies 和 devDependencies
2. 執行 `npm list` 命令驗證套件樹結構無衝突
3. 嘗試 import React 和 TypeScript 確認安裝成功
4. 檢查 `node_modules` 資料夾存在且包含預期的套件
5. 執行基本的 TypeScript 編譯測試

### 執行測試語法指令

```bash
# 使用 Node.js 執行測試
node specs/001-game-rules-md/tests/T002_Install-dependencies_test.mjs
```

## AI 使用工具

- Bash: 執行 npm install 命令
- Read: 讀取 package.json 檔案內容
- Edit: 修改 package.json 檔案新增相依套件
- LS: 確認 node_modules 目錄結構

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
