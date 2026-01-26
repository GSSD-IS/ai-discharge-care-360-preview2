# 任務清單：AI Discharge Care 360 (SaaS 平台)

## Phase 1: SaaS 核心基建
- [x] **1.1 Monorepo 設定** <!-- id: 0 -->
    - [x] 初始化 `turbo` 工作區
    - [x] 建立 `apps/web` (前端：React+Vite)
    - [x] 建立 `apps/api` (後端：NestJS)
    - [x] 設定 `packages/ui` (共用 UI 元件)
    - [x] 配置 `eslint`、`prettier` 與 `tsconfig`

- [x] **1.2 Design System Integration** <!-- id: 1.4 -->
    - [x] Migrate `ai-discharge-care-360.zip` styles to `packages/ui`.
    - [x] Implement ThemeProvider for White-labeling (dynamic primary color).
    - [x] Create basic Layout (Sidebar, Header) components.

- [x] **1.3 資料庫 & Prisma 設定** <!-- id: 1 -->
    - [x] 在 `apps/api` 初始化 Prisma
    - [x] 設計多租戶 Schema (`tenantId` 欄位)
    - [x] 定義 User、Role、Tenant 資料表
    - [x] 設定 Supabase 本機開發環境

- [x] **1.4 認證 & RBAC** <!-- id: 2 -->
    - [x] 實作 JWT 認證 (Passport)
    - [x] 建立 Guards：`SuperAdmin`、`TenantAdmin`、`Staff`、`Patient`
    - [x] 建立使用者管理 API

- [x] **1.4 租戶守衛 & 中介軟體** <!-- id: 3 -->
    - [x] 實作 TenantGuard (驗證 X-Tenant-ID)
    - [x] 實作 RolesGuard (RBAC 角色驗證)
    - [x] 建立 @CurrentUser、@CurrentTenant 裝飾器

## Phase 2: 用戶定義流程引擎 (WaaSM)
- [x] **2.1 後端：狀態機引擎** <!-- id: 4 -->
    - [x] 定義 `WorkflowDefinition` JSON Schema
    - [x] 實作 `WorkflowService` 處理狀態轉換
    - [x] 實作 `MandatoryNode` 必經節點驗證

- [x] **2.2 前端：流程設計器** <!-- id: 5 -->
    - [x] 修正前端建置錯誤 (React Router, Type Imports, Enum)
    - [x] 完善 WorkflowEditor 拖曳與屬性編輯
    - [x] 整合後端 Workflow API (儲存/讀取)
    - [x] 實作拖曳座標轉換與儲存邏輯
    - [x] 建立流程列表頁面 (WorkflowList.tsx)

- [x] **2.3 驗證邏輯** <!-- id: 6 -->
    - [x] 實作 Mandatory Step 檢查 (前端驗證)
    - [x] 實作狀態回退 (Rollback) 機制 (後端 checkMandatoryNodesCompleted)

## Phase 3: 動態表單與儀表板
- [x] **3.1 表單建構器** <!-- id: 7 -->
    - [x] 定義表單 JSON Schema
    - [x] 建立表單渲染元件
    - [x] 建立表單管理介面 (List/Editor)
    - [x] 將表單綁定至流程節點

- [x] **3.2 動態儀表板** <!-- id: 8 -->
    - [x] 實作狀態聚合 API
    - [x] 建立動態看板 (Kanban) 元件
    - [x] 實作病患卡片「必經項目警示」

- [x] **3.3 臨床表單** <!-- id: 9 -->
    - [x] ADL 評估表
    - [x] 營養篩檢表 (MNA)
    - [x] 社工評估表

## Phase 4: AI 與分析模組
- [ ] **4.1 AI 整合** <!-- id: 10 -->
    - [ ] 建立 `RiskService` (先 Mock，後接 API)
    - [ ] 實作「入院自動篩檢」觸發

- [ ] **4.2 追蹤與分析** <!-- id: 11 -->
    - [ ] 建立追蹤排程器
    - [ ] 建立分析儀表板 (再入院率圖表)

## Phase 5: 病患入口 & 部署
- [ ] **5.1 病患 Web Portal** <!-- id: 12 -->
    - [ ] 建立手機版響應式介面
    - [ ] 實作「我的計畫」與「衛教」頁面

- [ ] **5.2 最終打磨 & 部署** <!-- id: 13 -->
    - [ ] 部署至 Vercel (Web)
    - [ ] 設定 Supabase 正式環境
    - [ ] 最終端對端測試
