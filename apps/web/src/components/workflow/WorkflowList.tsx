import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';

interface WorkflowItem {
    id: string;
    name: string;
    description?: string;
    isPublished: boolean;
    version: number;
    updatedAt: string;
}

/**
 * 流程列表頁面
 */
export function WorkflowList() {
    const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const data = await apiRequest<WorkflowItem[]>('/workflows');
            setWorkflows(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '載入失敗');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await apiRequest(`/workflows/${id}/publish`, { method: 'POST' });
            alert('流程已發布');
            loadWorkflows();
        } catch (err) {
            alert(`發布失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">載入中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                錯誤: {error}
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">流程管理</h1>
                    <Link
                        to="/workflow/new"
                        className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        + 建立新流程
                    </Link>
                </div>

                {workflows.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
                        尚無流程定義，請建立第一個流程
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workflows.map((wf) => (
                            <div
                                key={wf.id}
                                className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800">{wf.name}</h3>
                                        {wf.isPublished ? (
                                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                                已發布
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                                                草稿
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400">v{wf.version}</span>
                                    </div>
                                    {wf.description && (
                                        <p className="text-sm text-slate-500 mt-1">{wf.description}</p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-1">
                                        更新於 {new Date(wf.updatedAt).toLocaleString('zh-TW')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/workflow/${wf.id}`}
                                        className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                                    >
                                        編輯
                                    </Link>
                                    {!wf.isPublished && (
                                        <button
                                            onClick={() => handlePublish(wf.id)}
                                            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            發布
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
