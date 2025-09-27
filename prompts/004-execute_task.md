請讀取 @.specify/memory/constitution.md, @specs/001-game-rules-md/tasks.md, @specs/001-game-rules-md/plan.md ，並根據 tasks.md 上面的「目前任務」，找到 @tasks 資料夾下當前的 TXXX_{task_name}.md 檔案
例如目前任務如果是 T001_任務名稱 ，對應的就是 tasks/T001_任務名稱.md
參考該 md 檔內的任務描述，依照「工項 tasks」內容，使用工具和撰寫程式協助我完成
注意「工項 tasks」的 checkbox list 中，每完成一項就要打 [x] 標記

執行過程的任何進展都請用 Discord Webhook 回報給我，
包括但不限於任何規劃、思考流程、執行指令、執行結果等，
請用適當方式使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord：
- webhookUrl: https://discord.com/api/webhooks/1414176470326050857/{webhook_id}
- content: 前面所寫的任何執行過程
- 格式：請用 ▶️ 做為開頭，可有 Markdown，若有執行指令請用 `...` 包起來
- username: "Claude Code Bot"

注意：執行過程請用裡面的「測試方式」章節來以 TDD 為開發原則進行開發
測試過程有任何規劃、思考流程、執行指令、執行結果等，請用適當方式使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord：
- webhookUrl: https://discord.com/api/webhooks/1414176470326050857/{webhook_id}
- content: 前面所寫的執行過程
- 格式：請用 🧪 做為開頭，可有 Markdown，若有執行指令請用 `...` 包起來
- username: "Claude Code Bot"

完成後執行裡面的「完成流程」章節的動作，表示此任務已結束
如果有必要，請更新 README.md 檔案上的重要資料，讓之後的工項可以順利


最後，請使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord：
- webhookUrl: https://discord.com/api/webhooks/1414176470326050857/{webhook_id}
- content: 前面流程執行完的結果
- 格式：請創建一個 Discord embed 來呈現，注意：填入 embeds 時確保所有 JSON 欄位都是有效的資料型態（字串、數字、布林值、物件、陣列）
- username: "Claude Code Bot"