import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';

interface FormDefinitionItem {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
    nodeBindings: string[];
}

export function FormListPage() {
    const [forms, setForms] = useState<FormDefinitionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            setLoading(true);
            const data = await apiRequest<FormDefinitionItem[]>('/forms');
            setForms(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '載入失效');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此表單嗎？')) return;

        try {
            await apiRequest(`/forms/${id}`, { method: 'DELETE' });
            loadForms();
        } catch (err) {
            alert(`刪除失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">載入中...</div>;
    if (error) return <div className="p-8 text-center text-red-500">錯誤: {error}</div>;

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">表單管理</h1>
                    <Link
                        to="/form/new"
                        className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        + 建立新表單
                    </Link>
                </div>

                {forms.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center text-slate-500">
                        尚無表單，請建立第一個表單。
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {forms.map((form) => (
                            <div key={form.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{form.name}</h3>
                                    {form.description && <p className="text-sm text-slate-500">{form.description}</p>}
                                    <div className="mt-2 text-xs text-slate-400">
                                        綁定節點: {form.nodeBindings.length > 0 ? form.nodeBindings.join(', ') : '無'}
                                        <span className="mx-2">|</span>
                                        更新於: {new Date(form.updatedAt).toLocaleString('zh-TW')}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/form/${form.id}`}
                                        className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                                    >
                                        編輯
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(form.id)}
                                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
