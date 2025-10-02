# T016. Position and movement types in src/types/position.ts

## 描述

建立位置和移動相關的 TypeScript 類型定義，為卡牌的拖放操作、位置計算和移動動畫提供類型安全。此任務為核心實作階段的類型定義部分，將定義座標、區域、移動方向、拖放狀態等核心類型，確保遊戲中所有位置相關操作都有明確的類型約束。

根據 Constitution 原則 I (Code Quality Excellence)，所有類型定義必須清晰、一致且可維護。根據原則 II (Test-Driven Development)，此類型將被後續的測試和實作使用，確保類型安全的開發流程。

## 工項 tasks

- [x] 建立 `src/types/position.ts` 檔案
- [x] 定義 `Position` 介面 - 包含 x, y 座標
- [x] 定義 `Dimensions` 介面 - 包含 width, height
- [x] 定義 `Rectangle` 介面 - 結合 Position 和 Dimensions
- [x] 定義 `DragState` 聯合類型 - 'idle' | 'dragging' | 'dropping'
- [x] 定義 `DropZone` 介面 - 包含區域ID、類型、接受規則
- [x] 定義 `MovementDirection` 聯合類型 - 'up' | 'down' | 'left' | 'right'
- [x] 定義 `AnimationState` 介面 - 動畫狀態和時間控制
- [x] 定義 `DropResult` 介面 - 拖放操作結果
- [x] 添加 JSDoc 文檔說明每個類型的用途
- [x] 匯出所有類型定義

## 測試方式

### 測試流程

驗證 position.ts 檔案中的所有類型定義都已正確建立，並且可以被 TypeScript 正確編譯。檢查類型定義是否符合遊戲需求，包括座標系統、拖放狀態、動畫控制等功能。

### 執行測試語法指令

```bash
# TypeScript 編譯檢查
npx tsc --noEmit

# 檢查類型定義的匯出
npm run lint

# 執行 T016 位置類型測試
npm test tests/unit/T016_position_types.test.ts
```

## AI 使用工具

此任務需要使用以下工具：

- **Write**: 建立新的 TypeScript 檔案
- **Edit**: 編輯和修改類型定義
- **Read**: 讀取相關檔案以確保類型一致性
- **Bash**: 執行 TypeScript 編譯檢查和 lint 命令

## 完成流程

請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
清除執行記憶
