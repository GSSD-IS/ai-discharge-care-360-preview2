export interface MvpCaseSummary {
  id: string;
  currentState: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'E1';
  nextAction: string | null;
  dueAt: string | null;
  careMessage: string | null;
  caseManagerName: string | null;
  caseManagerPhone: string | null;
}

export interface MvpTask {
  id: string;
  case_id: string;
  assigned_to_profile_id: string;
  task_type: 'contact_confirm' | 'document_followup' | 'org_coordination' | 'care_reminder';
  task_title: string;
  task_detail: string | null;
  status: 'pending' | 'replied' | 'done' | 'overdue';
  due_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type MvpReplyType = 'done' | 'need_help' | 'contacted' | 'cannot_do';
