import { apiRequest } from '../api';
import type { MvpCaseSummary, MvpReplyType, MvpTask } from '../../types/mvp';
import {
  mockCreateTask,
  mockGetCaseSummary,
  mockGetMyTasks,
  mockReplyTask,
  mockRunReminderJob,
  mockUpdateCaseState,
} from './mock';

const useMock = import.meta.env.VITE_MVP_USE_MOCK === 'true';

export const getCaseSummary = (caseId: string) => {
  if (useMock) return mockGetCaseSummary();
  return apiRequest<MvpCaseSummary>(`/mvp/cases/${caseId}/summary`);
};

export const getMyTasks = (profileId: string) => {
  if (useMock) return mockGetMyTasks(profileId);
  return apiRequest<MvpTask[]>(`/mvp/tasks/my?profileId=${encodeURIComponent(profileId)}`);
};

export const replyTask = (taskId: string, payload: { replierProfileId: string; replyType: MvpReplyType; replyText?: string }) => {
  if (useMock) return mockReplyTask(taskId, payload);
  return apiRequest(`/mvp/tasks/${taskId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, replyChannel: 'web' }),
  });
};

export const updateCaseState = (
  caseId: string,
  payload: { currentState: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'E1'; nextAction?: string; dueAt?: string; careMessage?: string },
) => {
  if (useMock) return mockUpdateCaseState(payload);
  return apiRequest(`/mvp/cases/${caseId}/state`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const createTask = (payload: {
  caseId: string;
  assignedToProfileId: string;
  taskType: 'contact_confirm' | 'document_followup' | 'org_coordination' | 'care_reminder';
  taskTitle: string;
  taskDetail?: string;
  dueAt: string;
  createdBy: string;
}) => {
  if (useMock) return mockCreateTask(payload);
  return apiRequest('/mvp/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const runReminderJob = (payload?: { dryRun?: boolean }) => {
  if (useMock) return mockRunReminderJob();
  return apiRequest('/mvp/jobs/reminder-run', {
    method: 'POST',
    body: JSON.stringify(payload ?? {}),
  });
};
