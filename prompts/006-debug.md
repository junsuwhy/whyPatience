# 程式除錯

請讀取 @.specify/memory/constitution.md, @specs/001-game-rules-md/plan.md, @specs/001-game-rules-md/tasks.md 
執行 npm run preview 後，用 playwright 幫我查看 preview 的頁面，有什麼錯誤，然後試著修復它

執行過程的任何進展都請用 Discord Webhook 回報給我，
包括但不限於任何規劃、思考流程、執行指令、執行結果等，
請用適當方式使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord （變數請使用 @.env 內容）：
- webhookUrl: https://discord.com/api/webhooks/{$DISCORD_WEBHOOK_ID}/{$DISCORD_WEBHOOK_HASH}
- content: 前面所寫的任何執行過程
- 格式：請用 ▶️ 做為開頭，可有 Markdown，若有執行指令請用 `...` 包起來
- username: "Claude Code Bot Test"

完成後執行下面的「完成流程」章節的動作，表示此任務已結束
如果有必要，請更新 README.md 檔案上的重要資料，讓之後的工項可以順利

## 完成流程

1. 請使用 discord_send_message, discord_send_embed 工具發送完成通知到 Discord （變數請使用 @.env 內容）：
   - webhookUrl: https://discord.com/api/webhooks/{$DISCORD_WEBHOOK_ID}/{$DISCORD_WEBHOOK_HASH}
   - content: 前面流程執行完的結果
   - 格式：請創建一個 Discord embed 來呈現，注意：填入 embeds 時確保所有 JSON 欄位都是有效的資料型態（字串、數字、布林值、物件、陣列）
   - username: "Claude Code Bot Test"
2. 清除執行記憶(清空上下文)