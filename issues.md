# MVP v0.1 GitHub Issues

## 1) [MVP][DB] Migration v1: Core tables + seed
- Labels: `mvp`, `backend`, `database`, `day1`
- Estimate: `1d`
- Body:
  - 建立資料表：`profiles`, `cases`, `case_participants`, `tasks`, `task_replies`, `line_messages`, `audit_logs`
  - 建立 FK / NOT NULL / 基本索引
  - 建立 seed：1 case + 4 roles
  - 產出 ERD 文件
- Checklist:
  - [ ] migration 可在 Supabase 執行
  - [ ] seed 成功
  - [ ] ERD 更新

## 2) [MVP][DB] Constraints for state/task/reply/status
- Labels: `mvp`, `backend`, `database`, `day1`
- Estimate: `0.5d`
- Body:
  - 加入檢核限制：
  - `current_state`: `S0/S1/S2/S3/S4/E1`
  - `task_type`: `contact_confirm/document_followup/org_coordination/care_reminder`
  - `reply_type`: `done/need_help/contacted/cannot_do`
  - `task status`: `pending/replied/done/overdue`
- Checklist:
  - [ ] 非法值寫入被 DB 拒絕
  - [ ] 測試 SQL 完整

## 3) [MVP][Security] Enable RLS baseline (deny-by-default)
- Labels: `mvp`, `backend`, `security`, `day2`
- Estimate: `0.5d`
- Body:
  - 全業務表啟用 RLS
  - 預設不允許任何匿名/未授權讀寫
- Checklist:
  - [ ] 所有表已啟用 RLS
  - [ ] 無 policy 時查詢皆被拒絕

## 4) [MVP][Security] Implement role-based RLS policies
- Labels: `mvp`, `backend`, `security`, `day2`
- Estimate: `1d`
- Body:
  - 實作四角色 policy：`case_manager`, `patient`, `family`, `external_org`
  - 僅允許最小必要資料可見
- Checklist:
  - [ ] 權限矩陣測試通過
  - [ ] `external_org` 無法讀 case 敏感欄位

## 5) [MVP][Audit] Add audit log triggers for core writes
- Labels: `mvp`, `backend`, `security`, `day2`
- Estimate: `0.5d`
- Body:
  - 對 `cases/tasks/task_replies` 建 trigger
  - 寫入 `audit_logs`（actor, action, target, diff, time）
- Checklist:
  - [ ] insert/update/reply 均有 log
  - [ ] `diff` 欄位可追蹤變更

## 6) [MVP][API] Cases endpoints v0.1
- Labels: `mvp`, `backend`, `api`, `day3`
- Estimate: `1d`
- Body:
  - `POST /api/cases`
  - `POST /api/cases/:caseId/participants`
  - `PATCH /api/cases/:caseId/state`
  - `GET /api/cases/:caseId/summary`
- Checklist:
  - [ ] DTO 驗證完成
  - [ ] summary 只回傳摘要欄位
  - [ ] OpenAPI 更新

## 7) [MVP][API] Tasks endpoints v0.1
- Labels: `mvp`, `backend`, `api`, `day3`
- Estimate: `1d`
- Body:
  - `POST /api/tasks`
  - `GET /api/tasks/my`
  - `POST /api/tasks/:taskId/replies`
- Checklist:
  - [ ] 任務建立可觸發通知流程
  - [ ] 回覆可更新任務狀態
  - [ ] RLS 下角色可正確存取

## 8) [MVP][LINE] Webhook inbound + signature validation
- Labels: `mvp`, `backend`, `integrations`, `day4`
- Estimate: `1d`
- Body:
  - 實作 `POST /api/line/webhook`
  - 驗簽 LINE request
  - 將回覆映射到 `task_replies`
- Checklist:
  - [ ] 驗簽失敗請求被拒絕
  - [ ] 回覆可正確落庫

## 9) [MVP][LINE] Outbound notifications + templates
- Labels: `mvp`, `backend`, `integrations`, `day4`
- Estimate: `1d`
- Body:
  - 進度/任務/提醒/關懷模板
  - 發送後寫 `line_messages`
- Checklist:
  - [ ] 模板欄位完整（進度、下一步、截止、窗口、關懷）
  - [ ] 發送狀態可追蹤

## 10) [MVP][Job] Reminder runner (24h pre-due + 12h overdue escalation)
- Labels: `mvp`, `backend`, `scheduler`, `day5`
- Estimate: `1d`
- Body:
  - 實作 `POST /api/jobs/reminder-run`
  - 到期前 24h 提醒
  - 逾時每 12h 升級給個管師
  - 去重機制
- Checklist:
  - [ ] 不重複發送
  - [ ] 升級規則正確

## 11) [MVP][Web] Case Summary page
- Labels: `mvp`, `frontend`, `day6`
- Estimate: `0.5d`
- Body:
  - 顯示：目前進度、下一步、截止、窗口、關懷
  - 病患/家屬/機構共用摘要視圖
- Checklist:
  - [ ] 無敏感病歷內容
  - [ ] 手機版可讀

## 12) [MVP][Web] Task Inbox page + quick replies
- Labels: `mvp`, `frontend`, `day6`
- Estimate: `1d`
- Body:
  - 我的任務列表
  - 快速回覆：`done/need_help/contacted/cannot_do`
- Checklist:
  - [ ] 回覆成功後狀態即時刷新
  - [ ] 錯誤提示可讀

## 13) [MVP][Web] Case Manager panel
- Labels: `mvp`, `frontend`, `day6`
- Estimate: `1d`
- Body:
  - 更新 case state
  - 建立任務
  - 查看回覆與提醒狀態
- Checklist:
  - [ ] 一頁可完成核心操作
  - [ ] 權限判斷正確

## 14) [MVP][QA] UAT scenario pack (10 cases)
- Labels: `mvp`, `qa`, `day7`
- Estimate: `1d`
- Body:
  - 建立 10 條 E2E 測試情境（含越權測試）
- Checklist:
  - [ ] UAT report 產出
  - [ ] 缺陷有分級與重現步驟

## 15) [MVP][Release] Go-live checklist + rollback plan
- Labels: `mvp`, `devops`, `day7`
- Estimate: `0.5d`
- Body:
  - 上線前檢查：env、webhook、監控、告警
  - 回滾方案
- Checklist:
  - [ ] checklist 完整
  - [ ] rollback 演練可行
