# T017. User preferences types in src/types/preferences.ts

## 描述

建立用戶偏好設定相關的 TypeScript 類型定義，為遊戲設定、主題選擇、操作偏好和本地儲存提供類型安全。此任務為核心實作階段的類型定義部分，將定義遊戲設定選項、視覺主題、操作偏好、音效設定等核心類型，確保遊戲中所有用戶設定相關操作都有明確的類型約束。

根據 Constitution 原則 I (Code Quality Excellence)，所有類型定義必須清晰、一致且可維護。根據原則 II (Test-Driven Development)，此類型將被後續的測試和實作使用，確保類型安全的開發流程。根據原則 III (User Experience Consistency)，用戶偏好設定將確保一致的使用者體驗。

## 工項 tasks

- [x] 建立 `src/types/preferences.ts` 檔案
- [x] 定義 `Theme` 聯合類型 - 'light' | 'dark' | 'auto'
- [x] 定義 `CardStyle` 聯合類型 - 'classic' | 'modern' | 'minimal'
- [x] 定義 `DrawMode` 聯合類型 - 'draw-one' | 'draw-three'
- [x] 定義 `AnimationSpeed` 聯合類型 - 'none' | 'slow' | 'normal' | 'fast'
- [x] 定義 `SoundPreferences` 介面 - 音效相關設定
- [x] 定義 `GameplayPreferences` 介面 - 遊戲玩法偏好
- [x] 定義 `DisplayPreferences` 介面 - 顯示相關偏好
- [x] 定義 `UserPreferences` 介面 - 整合所有偏好設定
- [x] 定義 `PreferencesState` 介面 - 偏好設定的狀態管理
- [x] 添加 JSDoc 文檔說明每個類型的用途
- [x] 匯出所有類型定義

## 測試方式

### 測試流程

驗證 preferences.ts 檔案中的所有類型定義都已正確建立，並且可以被 TypeScript 正確編譯。檢查類型定義是否符合遊戲需求，包括主題切換、卡牌樣式、抽卡模式、動畫速度、音效設定等功能。

### 執行測試語法指令

```bash
# TypeScript 編譯檢查
npx tsc --noEmit

# 檢查類型定義的匯出
npm run lint

# 執行 T017 用戶偏好類型測試
npm test tests/unit/T017_preferences_types.test.ts
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