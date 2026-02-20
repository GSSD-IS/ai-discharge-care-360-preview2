# MVP UAT Scenarios (v0.1)

## 1. 病患/家屬查看進度摘要
- 前置：seed 已建立 demo case；`VITE_MVP_USE_MOCK=true` 或 API 可用
- 操作：開 `/mvp` → summary → 載入摘要
- 驗收：顯示目前進度、下一步、截止時間、聯絡窗口、關懷句

## 2. 家屬查看任務並回覆 done
- 操作：/mvp → inbox → 角色選「家屬」→ 載入任務 → 選任務回覆 `done`
- 驗收：狀態更新為 done，顯示回覆成功訊息

## 3. 外部機構回覆 need_help
- 操作：角色選「外部機構」→ 載入任務 → 回覆 `need_help`
- 驗收：狀態改為 replied，回覆文字可儲存

## 4. 個管師更新流程狀態
- 操作：/mvp → manager → 更新 currentState/nextAction/dueAt → 送出
- 驗收：摘要顯示最新狀態與下一步

## 5. 個管師建立新任務派給家屬
- 操作：manager → 建立任務（assign 家屬，taskType 任一，dueAt 設定）
- 驗收：家屬 inbox 可看到新任務

## 6. Reminder Job（dry-run）
- 操作：manager → 排程提醒 → Dry Run
- 驗收：返回 scanned/preDue/overdue 計數，無實際發送

## 7. Reminder Job（正式）
- 前置：至少 1 筆 pending 任務 due < 24h
- 操作：manager → 排程提醒 → 正式執行
- 驗收：發送紀錄寫入 `line_messages`（或 mock 成功回應）

## 8. LINE 回覆（稍後實測）
- 前置：LINE webhook/ channel token/secret 設好；profile 綁 line_user_id
- 操作：在 LINE 對官方帳號輸入 `task:<任務ID> done 已完成`
- 驗收：`task_replies` 寫入、任務狀態更新、line_messages 記錄

## 9. 權限越權測試（資料庫層）
- 操作：使用非參與者的 profile_id 直接呼叫 API
- 驗收：RLS 拒絕（403/401），無資料洩漏

## 10. seed 與 mock 兼容測試
- 操作：`VITE_MVP_USE_MOCK=true` 模式全流程；再改成 API 模式全流程
- 驗收：兩種模式畫面不報錯，行為一致（資料來源不同）

## 紀錄格式
- 每條情境請記錄：時間、環境（mock/API）、角色、步驟、結果、截圖連結（如有）、缺陷編號（如有）。
