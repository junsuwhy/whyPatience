# 撰寫測試流程

## 
請讀取 @.specify/memory/constitution.md, @specs/001-game-rules-md/tasks.md, @specs/001-game-rules-md/plan.md ，並根據 tasks.md 上面的任務清單，找到 @tasks 資料夾下當前的 TXXX_{task_name}.md 檔案
例如目前任務如果是 T001_任務名稱 ，對應的就是 tasks/T001_任務名稱.md
參考該 md 檔內的任務描述，依照「測試方式」內容，幫我寫一個測試執行檔（看是用 Bash、nodejs 還是 Playwright 執行語法）
並幫我建立一個在 specs/*/tests 下建立一個對應的測試檔案 TXXX_{task_name}_test.xxx （副檔名依照測試類型決定）
（例如：如果是 nodejs 就是 .js 或 .ts，如果是 Playwright 就是 .spec.js 或 .spec.ts）
撰寫過程都要參考 constitution.md、plan.md 和任何有引用到內容的說明文件

寫完後請更新 tasks/T001_任務名稱.md 文件，把執行的語法寫進「執行測試語法指令」區塊的最後
取代掉「寫好測試檔後，請將測試指令取代這行」這串文字
讓我知道如果我要手動執行測試，在 Bash 環境下可下什麼指令進行檢查

寫完後請執行一次該測試檔案，確保它能正確執行，且因為該工項還沒開始執行
本次執行應該是紅燈（失敗）的狀態，這是正常的，不需要刻意讓它通過
測試結果，請用適當方式使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord （變數請使用 @.env 內容）：
- webhookUrl: https://discord.com/api/webhooks/{$DISCORD_WEBHOOK_ID}/{$DISCORD_WEBHOOK_HASH}
- content: 前面所寫的執行過程
- 格式：請用 🧪 做為開頭，可有 Markdown，若有執行指令請用 `...` 包起來
- username: "Claude Code Bot"

最後，請使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord （變數請使用 @.env 內容）：
- webhookUrl: https://discord.com/api/webhooks/{$DISCORD_WEBHOOK_ID}/{$DISCORD_WEBHOOK_HASH}
- content: 前面流程執行完的結果
- 格式：請創建一個 Discord embed 來呈現，注意：填入 embeds 時確保所有 JSON 欄位都是有效的資料型態（字串、數字、布林值、物件、陣列）
- username: "Claude Code Bot"