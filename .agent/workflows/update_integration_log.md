---
description: 強制工作流：在通知用戶前，必須先更新 Integration.md，且嚴禁省略內容。
---

# Update Integration Log Workflow

此工作流必須在每次 `notify_user` 之前執行，確保對話紀錄的完整性與原子性 (Atomic Update)。

1.  **讀取現有日誌**:
    使用 `view_file` 或 `read_file` 讀取 `d:\AI\AI Discharge Care 360 Autogen\Integration.md` 的最後部分 (Tail)，確認目前的紀錄狀態。

2.  **整理對話內容**:
    回顧自上次更新以來的所有重要交互：
    -   **User Request**: 用戶的原始指令。
    -   **Expert Discussion**: 各個 Agent (PM, Architect, Coder, Critic) 的關鍵發言與決策。
    -   **Action Taken**: 執行的指令、代碼變更與測試結果。
    -   **Error & Fix**: 遇到的錯誤與修復過程。

3.  **寫入日誌 (Append)**:
    使用 `replace_file_content` 將整理好的內容 **追加 (Append)** 到 `Integration.md` 末尾。
    -   **格式要求**: 使用 Markdown 格式，保留 `[Role]`: `Content` 的對話形式。
    -   **嚴禁事項**:
        -   禁止使用「(中間討論省略)」或「(詳見紀錄)」等字眼。
        -   禁止覆蓋或刪除舊的紀錄。

4.  **驗證**:
    確認寫入成功後，才可繼續執行 `notify_user`。
