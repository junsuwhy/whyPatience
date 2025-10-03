# T038. useLocalStorage 自訂 Hook 實作

## 描述

實作 `useLocalStorage` 自訂 React Hook，提供簡化的 localStorage 操作介面，用於管理本地儲存資料的讀取、寫入與同步。此 Hook 將封裝 `StorageService` 的功能，提供 React 友善的 API，並自動處理狀態同步、序列化、錯誤處理等細節。

此 Hook 遵循 React Hooks 最佳實踐，支援泛型型別、自動序列化/反序列化、錯誤邊界處理，並與 React 生命週期完美整合。

### 主要功能

1. **泛型資料儲存**：支援任意 JSON 可序列化的資料型別
2. **自動同步**：當 localStorage 資料變更時，自動更新 React 狀態
3. **錯誤處理**：優雅處理 localStorage 不可用、配額超限等錯誤情況
4. **預設值支援**：提供預設值機制，確保資料始終可用
5. **SSR 相容**：支援伺服器端渲染環境（雖然本專案為純前端）
6. **效能最佳化**：使用 useCallback 和 useMemo 避免不必要的重新渲染

### 技術規格

- **檔案位置**：`src/hooks/useLocalStorage.ts`
- **相依性**：`src/services/storage.ts`, React hooks (useState, useEffect, useCallback, useMemo)
- **型別定義**：完整的 TypeScript 泛型支援
- **錯誤處理**：捕捉並處理所有可能的 localStorage 錯誤
- **測試覆蓋率**：需配合單元測試確保功能正確性

### 設計原則

遵循 Constitution 四大原則：

1. **Code Quality Excellence**：
   - 使用 TypeScript 嚴格模式
   - 完整的型別註解與文件註解
   - 清晰的函式命名與介面設計
   - 符合 ESLint 和 Prettier 規範

2. **Test-Driven Development**：
   - 先撰寫測試（已在 Phase 3.2 完成）
   - 確保所有邊界情況都有測試覆蓋
   - 測試 localStorage 不可用、配額超限等錯誤情境

3. **User Experience Consistency**：
   - 提供一致的 API 介面
   - 優雅的錯誤處理，不影響使用者體驗
   - 自動同步確保資料即時性

4. **Performance Standards**：
   - 避免不必要的重新渲染
   - 使用 useCallback 和 useMemo 最佳化
   - 最小化 localStorage 讀寫操作

## 工項 tasks

- [ ] 建立 `src/hooks/useLocalStorage.ts` 檔案
- [ ] 定義 Hook 介面與型別定義：
  - `UseLocalStorageOptions<T>` 介面（包含 defaultValue, serializer, deserializer）
  - `UseLocalStorageReturn<T>` 介面（包含 value, setValue, remove, error, isLoading）
- [ ] 實作核心 Hook 邏輯：
  - 使用 `useState` 管理本地狀態
  - 實作 `setValue` 函式（同時更新 state 和 localStorage）
  - 實作 `remove` 函式（移除 localStorage 資料並重設為預設值）
  - 實作錯誤處理機制（捕捉 QuotaExceededError 等錯誤）
- [ ] 實作初始化邏輯：
  - 使用 `useEffect` 在元件掛載時讀取 localStorage
  - 處理 localStorage 不可用的情況
  - 處理資料解析失敗的情況
- [ ] 實作跨視窗同步：
  - 監聽 `storage` 事件
  - 自動更新 React 狀態當其他視窗/標籤頁修改相同的 key
- [ ] 效能最佳化：
  - 使用 `useCallback` 包裝 setValue 和 remove 函式
  - 使用 `useMemo` 快取序列化/反序列化函式
  - 避免不必要的 useEffect 執行
- [ ] 整合 StorageService：
  - 使用 StorageService 的命名空間機制
  - 複用 StorageService 的錯誤處理
- [ ] 撰寫完整的 JSDoc 文件註解
- [ ] 匯出 Hook 和相關型別定義

## 測試方式

### 測試流程

本 Hook 的測試已在 Phase 3.2（任務 T049）中定義，測試檔案為 `tests/unit/test_hooks.test.ts`。測試應涵蓋以下情境：

1. **基本功能測試**：
   - 測試 Hook 初始化時讀取 localStorage
   - 測試 setValue 正確更新狀態和 localStorage
   - 測試 remove 正確清除資料並回復預設值

2. **錯誤處理測試**：
   - 測試 localStorage 不可用時的降級處理
   - 測試 QuotaExceededError 錯誤處理
   - 測試 JSON 解析失敗的處理

3. **跨視窗同步測試**：
   - 測試 storage event 觸發時狀態更新
   - 測試多個 Hook 實例的資料同步

4. **效能測試**：
   - 測試避免不必要的重新渲染
   - 測試 setValue 函式的穩定性（不變的參考）

5. **型別測試**：
   - 測試泛型型別正確推斷
   - 測試自訂序列化/反序列化函式

### 執行測試語法指令

```bash
# 執行所有單元測試
npm run test:unit

# 執行 T038 useLocalStorage hook 特定測試檔案
npm test -- tests/unit/test_useLocalStorage.test.ts

# 執行測試並顯示覆蓋率
npm run test:coverage

# 監視模式執行測試
npm run test:watch
```

### 手動驗證

除了自動化測試，還可以透過以下方式手動驗證：

1. 在 React DevTools 中觀察 Hook 狀態變化
2. 在瀏覽器 DevTools > Application > Local Storage 中檢查資料儲存
3. 開啟多個瀏覽器視窗/標籤頁測試跨視窗同步
4. 手動填滿 localStorage 測試配額超限處理

## AI 使用工具

本任務需要使用以下工具：

1. **str_replace_editor**：
   - 建立新檔案 `src/hooks/useLocalStorage.ts`
   - 編輯程式碼實作

2. **bash**：
   - 執行測試指令驗證實作正確性
   - 執行 ESLint 和 Prettier 檢查程式碼品質
   - 執行 TypeScript 編譯檢查型別正確性

3. **相關檔案參考**：
   - `src/services/storage.ts`：StorageService 實作參考
   - `src/hooks/useGameState.ts`：其他 Hook 實作範例
   - `specs/001-game-rules-md/contracts/storage-interface.ts`：Storage 介面契約
   - `src/types/game-state.ts`：型別定義參考

## 實作細節參考

### Hook 介面設計

```typescript
// 選項介面
interface UseLocalStorageOptions<T> {
  defaultValue: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

// 回傳值介面
interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  remove: () => void;
  error: Error | null;
  isLoading: boolean;
}

// Hook 函式簽章
function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
): UseLocalStorageReturn<T>
```

### 核心功能要點

1. **初始化**：
   ```typescript
   useEffect(() => {
     // 讀取 localStorage
     // 處理錯誤情況
     // 設定初始狀態
   }, [key]);
   ```

2. **狀態更新**：
   ```typescript
   const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
     try {
       // 計算新值
       // 更新 React 狀態
       // 寫入 localStorage
     } catch (error) {
       // 錯誤處理
     }
   }, [key]);
   ```

3. **跨視窗同步**：
   ```typescript
   useEffect(() => {
     const handleStorageChange = (e: StorageEvent) => {
       if (e.key === fullKey && e.newValue !== null) {
         // 更新狀態
       }
     };
     window.addEventListener('storage', handleStorageChange);
     return () => window.removeEventListener('storage', handleStorageChange);
   }, [key]);
   ```

### 與 StorageService 整合

此 Hook 應與現有的 StorageService 整合，使用其命名空間機制：

```typescript
import { storageService } from '../services/storage';

// 在 Hook 內部
const fullKey = `${storageService.config.namespace}:${key}`;
```

## 完成流程

1. 實作完成後，執行以下指令驗證：
   ```bash
   npm run lint
   npm run type-check
   npm run test:unit
   ```

2. 確認所有測試通過且無 lint 錯誤

3. 在 `tasks.md` 本項 task（T038）的 `[ ]` 打上 `[x]` 記號表示完成

4. 若有任何待處理事項或技術債務，在 `tasks.md` 打上 `[?]` 記號並記錄在 task 描述中

5. 更新 `src/hooks/index.ts` 匯出新的 Hook（如果該檔案存在）

6. 清除執行記憶，準備進行下一個任務
