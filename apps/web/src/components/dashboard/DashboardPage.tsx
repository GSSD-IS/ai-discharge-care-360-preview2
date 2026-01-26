import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api'; // Import from central API service
import { KanbanBoard } from './KanbanBoard';

interface WorkflowOption {
    id: string;
    name: string;
}

export function DashboardPage() {
    const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const data = await apiRequest<WorkflowOption[]>('/workflows');
            setWorkflows(data);
            if (data.length > 0) {
                // Default to the first workflow
                setSelectedWorkflowId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to load workflows', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">載入中...</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm border-b flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">臨床儀表板</h1>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-600">檢視流程：</label>
                    <select
                        value={selectedWorkflowId}
                        onChange={(e) => setSelectedWorkflowId(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                        {workflows.map((wf) => (
                            <option key={wf.id} value={wf.id}>
                                {wf.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {selectedWorkflowId ? (
                    <KanbanBoard workflowId={selectedWorkflowId} />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        請選擇或建立一個流程以檢視看板
                    </div>
                )}
            </div>
        </div>
    );
}
