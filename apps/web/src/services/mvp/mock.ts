import type { MvpCaseSummary, MvpReplyType, MvpTask } from '../../types/mvp';

// In-memory demo data for Vercel preview without backend
const CASE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1';
const ASSIGNEE_FAMILY = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';
const ASSIGNEE_ORG = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4';

const state: { summary: MvpCaseSummary; tasks: MvpTask[] } = {
  summary: {
    id: CASE_ID,
    currentState: 'S2',
    nextAction: '請家屬確認主要聯繫方式',
    dueAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    careMessage: '我們會持續陪伴您完成每一步，請安心。',
    caseManagerName: '王個管師',
    caseManagerPhone: '0912-000-001',
  },
  tasks: [
    {
      id: 'mock-task-1',
      case_id: CASE_ID,
      assigned_to_profile_id: ASSIGNEE_FAMILY,
      task_type: 'contact_confirm',
      task_title: '請確認主要聯絡方式',
      task_detail: '請回覆主要聯絡人姓名與可聯絡時段。',
      status: 'pending',
      due_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'mock-task-2',
      case_id: CASE_ID,
      assigned_to_profile_id: ASSIGNEE_ORG,
      task_type: 'org_coordination',
      task_title: '外部機構回覆床位',
      task_detail: '請回覆是否有空床與預估入住日。',
      status: 'replied',
      due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

export const mockGetCaseSummary = async (): Promise<MvpCaseSummary> => ({ ...state.summary });

export const mockGetMyTasks = async (profileId: string): Promise<MvpTask[]> =>
  state.tasks.filter((t) => t.assigned_to_profile_id === profileId).map((t) => ({ ...t }));

export const mockReplyTask = async (taskId: string, payload: { replierProfileId: string; replyType: MvpReplyType; replyText?: string }) => {
  const t = state.tasks.find((x) => x.id === taskId);
  if (!t) return;
  t.status = payload.replyType === 'done' ? 'done' : 'replied';
  t.updated_at = new Date().toISOString();
};

export const mockUpdateCaseState = async (payload: Partial<MvpCaseSummary>) => {
  state.summary = { ...state.summary, ...payload };
};

export const mockCreateTask = async (payload: {
  caseId: string;
  assignedToProfileId: string;
  taskType: MvpTask['task_type'];
  taskTitle: string;
  taskDetail?: string;
  dueAt: string;
  createdBy: string;
}) => {
  const now = new Date().toISOString();
  state.tasks.push({
    id: `mock-${Date.now()}`,
    case_id: payload.caseId,
    assigned_to_profile_id: payload.assignedToProfileId,
    task_type: payload.taskType,
    task_title: payload.taskTitle,
    task_detail: payload.taskDetail ?? null,
    status: 'pending',
    due_at: payload.dueAt,
    created_by: payload.createdBy,
    created_at: now,
    updated_at: now,
  });
};

export const mockRunReminderJob = async () => ({
  ok: true,
  scanned: state.tasks.length,
  preDueSent: 1,
  overdueEscalated: 0,
  skipped: 0,
});
