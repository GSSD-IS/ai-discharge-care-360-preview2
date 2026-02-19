import { apiRequest } from '../api';
import type { MvpCaseSummary, MvpReplyType, MvpTask } from '../../types/mvp';

export const getCaseSummary = (caseId: string) => {
  return apiRequest<MvpCaseSummary>(`/mvp/cases/${caseId}/summary`);
};

export const getMyTasks = (profileId: string) => {
  return apiRequest<MvpTask[]>(`/mvp/tasks/my?profileId=${encodeURIComponent(profileId)}`);
};

export const replyTask = (taskId: string, payload: { replierProfileId: string; replyType: MvpReplyType; replyText?: string }) => {
  return apiRequest(`/mvp/tasks/${taskId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, replyChannel: 'web' }),
  });
};

export const updateCaseState = (
  caseId: string,
  payload: { currentState: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'E1'; nextAction?: string; dueAt?: string; careMessage?: string },
) => {
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
  return apiRequest('/mvp/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const runReminderJob = (payload?: { dryRun?: boolean }) => {
  return apiRequest('/mvp/jobs/reminder-run', {
    method: 'POST',
    body: JSON.stringify(payload ?? {}),
  });
};
