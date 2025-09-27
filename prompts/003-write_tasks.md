請讀取 @.specify/memory/constitution.md @specs/001-game-rules-md/tasks/{TD}_{Description}.md, @specs/001-game-rules-md/tasks.md, @specs/001-game-rules-md/plan.md ，並根據 tasks.md 確認目前要進行的任務，參考 {TD}_{Description}.md 為任務模板在 tasks 資料夾建立一個 {TD}_{Description}.md
例如目前任務如果是 T001 Env configuration ，就產生一個 tasks/T001_Env-configuration.md，此為舉例，請自行用該任務說明作為檔案名稱
注意 {TD}_{Description}.md 裡面 {} 的部份都改用目前任務去產生對應的內容
撰寫過程都要參考 constitution.md、plan.md 和任何有引用到內容的說明文件

寫的過程有任何規劃、思考流程、執行指令、執行結果等，請用適當方式使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord：
- webhookUrl: https://discord.com/api/webhooks/1414176470326050857/{webhook_id}
- content: 前面所寫的執行過程
- 格式：請用 🔄 做為開頭，可有 Markdown，指令請用 `...` 包起來
- username: "Claude Code Bot"

寫好後回覆我新增的檔名，我要檢查內容

最後，請使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord：
- webhookUrl: https://discord.com/api/webhooks/1414176470326050857/{webhook_id}
- content: 前面建立的檔案內容
- 格式：請創建一個 Discord embed 來呈現，注意：填入 embeds 時確保所有 JSON 欄位都是有效的資料型態（字串、數字、布林值、物件、陣列）
- username: "Claude Code Bot"