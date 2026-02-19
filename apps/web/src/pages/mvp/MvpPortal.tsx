import React, { useMemo, useState } from 'react';
import type { MvpReplyType } from '../../types/mvp';
import {
  createTask,
  getCaseSummary,
  getMyTasks,
  replyTask,
  runReminderJob,
  updateCaseState,
} from '../../services/mvp/api';

const DEMO = {
  caseId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  caseManagerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  patientId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  familyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
  externalOrgId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
};

const tabs = ['summary', 'inbox', 'manager'] as const;
type TabKey = (typeof tabs)[number];

const MvpPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(DEMO.familyId);
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [tasksResult, setTasksResult] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [replyType, setReplyType] = useState<MvpReplyType>('done');
  const [replyText, setReplyText] = useState<string>('');

  const [stateForm, setStateForm] = useState({
    currentState: 'S2' as 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'E1',
    nextAction: '請家屬確認聯繫方式',
    dueAt: '',
    careMessage: '我們會持續陪伴您完成每一步，請安心。',
  });

  const [taskForm, setTaskForm] = useState({
    assignedToProfileId: DEMO.familyId,
    taskType: 'contact_confirm' as 'contact_confirm' | 'document_followup' | 'org_coordination' | 'care_reminder',
    taskTitle: '請確認主要聯絡方式',
    taskDetail: '請回覆主要聯絡人姓名與可聯絡時段。',
    dueAt: '',
  });

  const profileOptions = useMemo(
    () => [
      { id: DEMO.patientId, label: '病患' },
      { id: DEMO.familyId, label: '家屬' },
      { id: DEMO.externalOrgId, label: '外部機構' },
      { id: DEMO.caseManagerId, label: '個管師' },
    ],
    [],
  );

  const loadSummary = async () => {
    try {
      const res = await getCaseSummary(DEMO.caseId);
      setSummaryResult(res);
      setStatusMessage('已更新 Case Summary');
    } catch (err) {
      setStatusMessage(`Summary 載入失敗: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const loadTasks = async () => {
    try {
      const res = await getMyTasks(selectedProfileId);
      setTasksResult(res);
      setStatusMessage(`已載入任務 (${res.length})`);
    } catch (err) {
      setStatusMessage(`Task 載入失敗: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const submitReply = async (taskId: string) => {
    try {
      await replyTask(taskId, {
        replierProfileId: selectedProfileId,
        replyType,
        replyText,
      });
      setReplyText('');
      setStatusMessage(`任務 ${taskId.slice(0, 8)} 回覆成功`);
      await loadTasks();
    } catch (err) {
      setStatusMessage(`回覆失敗: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const submitState = async () => {
    try {
      await updateCaseState(DEMO.caseId, {
        ...stateForm,
        dueAt: stateForm.dueAt || undefined,
      });
      setStatusMessage('Case 狀態更新成功');
      await loadSummary();
    } catch (err) {
      setStatusMessage(`狀態更新失敗: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const submitTask = async () => {
    try {
      await createTask({
        caseId: DEMO.caseId,
        assignedToProfileId: taskForm.assignedToProfileId,
        taskType: taskForm.taskType,
        taskTitle: taskForm.taskTitle,
        taskDetail: taskForm.taskDetail,
        dueAt: taskForm.dueAt,
        createdBy: DEMO.caseManagerId,
      });
      setStatusMessage('任務建立成功');
    } catch (err) {
      setStatusMessage(`任務建立失敗: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const triggerReminder = async (dryRun: boolean) => {
    try {
      const res = await runReminderJob({ dryRun });
      setStatusMessage(`Reminder job 完成: scanned=${(res as any).scanned}, preDue=${(res as any).preDueSent}, overdue=${(res as any).overdueEscalated}`);
    } catch (err) {
      setStatusMessage(`Reminder job 失敗: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <h1 className="text-xl font-black text-slate-800">MVP 協作操作台</h1>
          <p className="text-sm text-slate-500">Case Summary / Task Inbox / Manager Panel</p>
          <p className="mt-2 text-xs text-slate-500 font-mono">Case ID: {DEMO.caseId}</p>
        </header>

        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {statusMessage && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
            {statusMessage}
          </div>
        )}

        {activeTab === 'summary' && (
          <section className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Case Summary</h2>
              <button onClick={loadSummary} className="px-3 py-2 rounded bg-sky-600 text-white text-sm font-bold">載入摘要</button>
            </div>
            <pre className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs overflow-auto">{JSON.stringify(summaryResult, null, 2)}</pre>
          </section>
        )}

        {activeTab === 'inbox' && (
          <section className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-bold">目前角色</label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              >
                {profileOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <button onClick={loadTasks} className="px-3 py-2 rounded bg-sky-600 text-white text-sm font-bold">載入任務</button>
            </div>

            <div className="grid gap-4">
              {tasksResult.map((task: any) => (
                <div key={task.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-bold text-slate-800">{task.task_title}</p>
                  <p className="text-sm text-slate-600">{task.task_detail || '無詳細內容'}</p>
                  <p className="text-xs text-slate-500 mt-1">Status: {task.status} | Due: {new Date(task.due_at).toLocaleString('zh-TW')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <select value={replyType} onChange={(e) => setReplyType(e.target.value as MvpReplyType)} className="rounded border border-slate-300 px-2 py-1 text-sm">
                      <option value="done">done</option>
                      <option value="need_help">need_help</option>
                      <option value="contacted">contacted</option>
                      <option value="cannot_do">cannot_do</option>
                    </select>
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="回覆補充文字"
                      className="rounded border border-slate-300 px-2 py-1 text-sm w-64"
                    />
                    <button onClick={() => submitReply(task.id)} className="px-3 py-1 rounded bg-slate-900 text-white text-sm font-bold">送出回覆</button>
                  </div>
                </div>
              ))}
              {tasksResult.length === 0 && <p className="text-sm text-slate-400">尚無任務資料</p>}
            </div>
          </section>
        )}

        {activeTab === 'manager' && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold">更新流程狀態</h2>
              <select
                value={stateForm.currentState}
                onChange={(e) => setStateForm((p) => ({ ...p, currentState: e.target.value as any }))}
                className="w-full rounded border border-slate-300 px-2 py-2"
              >
                {['S0', 'S1', 'S2', 'S3', 'S4', 'E1'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input value={stateForm.nextAction} onChange={(e) => setStateForm((p) => ({ ...p, nextAction: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2" placeholder="下一步" />
              <input value={stateForm.dueAt} onChange={(e) => setStateForm((p) => ({ ...p, dueAt: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2" placeholder="dueAt (ISO)" />
              <textarea value={stateForm.careMessage} onChange={(e) => setStateForm((p) => ({ ...p, careMessage: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2" rows={3} />
              <button onClick={submitState} className="px-3 py-2 rounded bg-sky-600 text-white text-sm font-bold">更新狀態</button>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold">建立任務</h2>
              <select value={taskForm.assignedToProfileId} onChange={(e) => setTaskForm((p) => ({ ...p, assignedToProfileId: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2">
                {profileOptions.filter((p) => p.id !== DEMO.caseManagerId).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <select value={taskForm.taskType} onChange={(e) => setTaskForm((p) => ({ ...p, taskType: e.target.value as any }))} className="w-full rounded border border-slate-300 px-2 py-2">
                <option value="contact_confirm">contact_confirm</option>
                <option value="document_followup">document_followup</option>
                <option value="org_coordination">org_coordination</option>
                <option value="care_reminder">care_reminder</option>
              </select>
              <input value={taskForm.taskTitle} onChange={(e) => setTaskForm((p) => ({ ...p, taskTitle: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2" placeholder="任務標題" />
              <input value={taskForm.taskDetail} onChange={(e) => setTaskForm((p) => ({ ...p, taskDetail: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2" placeholder="任務內容" />
              <input value={taskForm.dueAt} onChange={(e) => setTaskForm((p) => ({ ...p, dueAt: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2" placeholder="dueAt (ISO)" />
              <button onClick={submitTask} className="px-3 py-2 rounded bg-slate-900 text-white text-sm font-bold">建立任務</button>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3 lg:col-span-2">
              <h2 className="text-lg font-bold">排程提醒</h2>
              <div className="flex gap-2">
                <button onClick={() => triggerReminder(true)} className="px-3 py-2 rounded border border-slate-300 text-slate-700 text-sm font-bold">Dry Run</button>
                <button onClick={() => triggerReminder(false)} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm font-bold">正式執行</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MvpPortal;
