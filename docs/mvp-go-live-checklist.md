# MVP Go-Live Checklist (v0.1)

## 環境變數（Vercel）
- `VITE_MVP_USE_MOCK` (preview 可設 true；production 建議 false)
- `VITE_API_URL` (production 指向 API 網域，例如 https://api.example.com/api)
- API 環境：`DATABASE_URL`, `JWT_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`

## 部署設定
- Web root: `apps/web`
- Build: `npm run build`
- Output: `dist`
- API：若改為 Serverless，確認入口/handler 與路由前綴 `/api`

## 資料庫
- 執行 migrations 順序：
  1) `20260220_000001_mvp_core.sql`
  2) `20260220_000002_mvp_rls_audit.sql`
  3) `20260220_000003_mvp_audit_function_fix.sql`
- 執行 seed：`supabase/seeds/mvp_seed.sql`
- 驗證 RLS：非參與者不可讀/寫 case/tasks

## LINE 整合
- 設定 webhook URL 指向 `/api/mvp/line/webhook`
- 設定 channel secret/token
- 驗簽開關：`LINE_SIGNATURE_STRICT=true`（建議上線打開）
- 測試 push 通知與 inbound 回覆

## 功能驗收（精簡）
- summary 載入成功
- inbox 任務可回覆且狀態更新
- manager 可更新 state、建任務、跑 reminder job
- line_messages 有紀錄

## 監控/告警
- 部署失敗告警（Vercel）
- API 5xx/latency（若有後端監控）
- LINE push failure rate

## Rollback
- 網頁：Vercel 回滾到上一個成功 deployment
- DB：migrations 可回退 or 重新跑 seed（確保無破壞性變更）

## 安全
- 確認所有 env 不輸出到前端（只留 VITE_*）
- 瀏覽器不顯示敏感資料（僅摘要）
- RLS 仍為 deny-by-default
