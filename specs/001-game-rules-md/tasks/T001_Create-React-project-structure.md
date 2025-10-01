# T001. Create React project structure with Vite and TypeScript configuration

## 描述

建立 Desktop Solitaire Web Application 的 React 專案架構，使用 Vite 作為建置工具和 TypeScript 作為主要開發語言。此任務需要建立完整的專案結構，包含所有必要的目錄和配置檔案，為後續的開發工作奠定基礎。

根據 constitution.md 的 Code Quality Excellence 原則，此專案結構必須遵循：

- 清晰的命名慣例
- 可維護的架構模式
- 適當的目錄組織
- TypeScript strict mode 配置

專案將採用純前端架構（Pure frontend React application），包含以下核心目錄：

- `src/`: 主要原始碼
- `tests/`: 測試檔案（contract, integration, unit, e2e）
- 配置檔案：TypeScript, Vite, ESLint 等

## 工項 tasks

- [ ] 使用 Vite 建立 React TypeScript 專案基礎架構
- [ ] 建立 `src/` 目錄結構：
  - [ ] `src/components/` - React 元件目錄
  - [ ] `src/models/` - 資料模型目錄
  - [ ] `src/services/` - 服務層目錄
  - [ ] `src/hooks/` - 自定義 React hooks
  - [ ] `src/types/` - TypeScript 型別定義
- [ ] 建立 `tests/` 目錄結構：
  - [ ] `tests/contract/` - 合約測試
  - [ ] `tests/integration/` - 整合測試
  - [ ] `tests/unit/` - 單元測試
  - [ ] `tests/e2e/` - E2E 測試
- [ ] 配置 TypeScript strict mode（tsconfig.json）
- [ ] 設定 Vite 配置檔案（vite.config.ts）
- [ ] 建立基本的 `src/App.tsx` 檔案
- [ ] 建立 `src/main.tsx` 進入點檔案
- [ ] 建立 `index.html` 模板檔案
- [ ] 建立 `package.json` 包含必要的 scripts

## 測試方式

AI 可透過以下方式驗證任務完成：

1. 執行 `npm run dev` 命令能成功啟動開發伺服器
2. 確認所有目錄結構已建立且符合規範
3. 確認 TypeScript 配置正確（strict mode 啟用）
4. 確認 Vite 能正常編譯 TypeScript 檔案
5. 瀏覽器能正常顯示基本的 React 應用程式
6. 確認 `npm run build` 能成功產生生產版本

## AI 使用工具

執行此任務需要以下工具：

- `Bash`: 執行 npm/yarn 命令建立專案
- `Write`: 建立配置檔案和基本程式碼檔案
- `Read`: 讀取和驗證已建立的檔案內容
- `LS`: 列出目錄結構確認架構正確
- 不需要 MCP 特殊工具（如 Test, Playwright）

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
