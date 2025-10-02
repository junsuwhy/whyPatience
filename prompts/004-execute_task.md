請讀取 @.specify/memory/constitution.md, @specs/001-game-rules-md/tasks.md, @specs/001-game-rules-md/plan.md ，並根據 tasks.md 上面的任務清單，找到 @tasks 資料夾下當前的 TXXX_{task_name}.md 檔案
例如目前任務如果是 T001_任務名稱 ，對應的就是 tasks/T001_任務名稱.md

參考該 md 檔內的任務描述，依照「工項 tasks」內容，使用工具和撰寫程式協助我完成
注意「工項 tasks」的 checkbox list 中，每完成一項就要打 [x] 標記

執行過程的任何進展都請用 Discord Webhook 回報給我，
包括但不限於任何規劃、思考流程、執行指令、執行結果等，
請用適當方式使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord （變數請使用 @.env 內容）：
- webhookUrl: https://discord.com/api/webhooks/{$DISCORD_WEBHOOK_ID}/{$DISCORD_WEBHOOK_HASH}
- content: 前面所寫的任何執行過程
- 格式：請用 ▶️ 做為開頭，可有 Markdown，若有執行指令請用 `...` 包起來
- username: "Claude Code Bot"

注意：執行程式撰寫開發完請用「執行測試語法指令」章節的語法進行測試，照理應該全數通過
測試結果，請用適當方式使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord （變數請使用 @.env 內容）：
- webhookUrl: https://discord.com/api/webhooks/{$DISCORD_WEBHOOK_ID}/{$DISCORD_WEBHOOK_HASH}
- content: 前面所寫的執行過程
- 格式：請用 🧪 做為開頭，可有 Markdown，若有執行指令請用 `...` 包起來
- username: "Claude Code Bot"

完成後執行下面的「完成流程」章節的動作，表示此任務已結束
如果有必要，請更新 README.md 檔案上的重要資料，讓之後的工項可以順利

## 完成流程

1. 請在 tasks.md 本項 task 的 [ ] 打上 [x] 記號表示完成，打上 [?] 記號表示尚有待處理、之後再檢查事項。
2. 請使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord （變數請使用 @.env 內容）：
   - webhookUrl: https://discord.com/api/webhooks/{$DISCORD_WEBHOOK_ID}/{$DISCORD_WEBHOOK_HASH}
   - content: 前面流程執行完的結果
   - 格式：請創建一個 Discord embed 來呈現，注意：填入 embeds 時確保所有 JSON 欄位都是有效的資料型態（字串、數字、布林值、物件、陣列）
   - username: "Claude Code Bot"
3. 清除執行記憶(清空上下文)