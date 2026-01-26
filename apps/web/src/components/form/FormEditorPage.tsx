import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { FormFieldType, type FormField } from '../../types/form.types';

// Pre-defined field types for the builder
const FIELD_TYPES = [
    { type: FormFieldType.TEXT, label: '單行文字' },
    { type: FormFieldType.TEXTAREA, label: '多行文字' },
    { type: FormFieldType.NUMBER, label: '數字' },
    { type: FormFieldType.DATE, label: '日期' },
    { type: FormFieldType.SELECT, label: '下拉選單' },
    { type: FormFieldType.RADIO, label: '單選按鈕' },
    { type: FormFieldType.CHECKBOX, label: '核取方塊' },
];

export function FormEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(isEditMode);

    // UI state for field editing
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode) {
            loadForm(id!);
        }
    }, [id, isEditMode]);

    const loadForm = async (formId: string) => {
        try {
            const data = await apiRequest<{ name: string; description?: string; definition: any }>(`/forms/${formId}`);
            setName(data.name);
            setDescription(data.description || '');
            setFields(data.definition.fields || []);
        } catch (error) {
            alert('載入表單失敗');
            navigate('/forms');
        } finally {
            setLoading(false);
        }
    };

    const handleAddField = (type: any) => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type,
            label: `新欄位 ${fields.length + 1}`,
            required: false,
        };
        setFields([...fields, newField]);
        setEditingFieldId(newField.id);
    };

    const handleUpdateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleDeleteField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (editingFieldId === id) setEditingFieldId(null);
    };

    const handleMoveField = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === fields.length - 1)
        ) return;

        const newFields = [...fields];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
        setFields(newFields);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('請輸入表單名稱');
            return;
        }
        if (fields.length === 0) {
            alert('請至少新增一個欄位');
            return;
        }

        const payload = {
            name,
            description,
            definition: { fields },
        };

        try {
            const url = isEditMode ? `/forms/${id}` : '/forms';
            const method = isEditMode ? 'PUT' : 'POST';
            await apiRequest(url, { method, body: JSON.stringify(payload) });
            alert('儲存成功');
            navigate('/forms');
        } catch (error) {
            alert(`儲存失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
        }
    };

    if (loading) return <div>載入中...</div>;

    const editingField = fields.find(f => f.id === editingFieldId);

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Left: Component Palette & Form Settings */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-slate-800 mb-4">表單設定</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">表單名稱</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded mt-1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">描述</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded mt-1"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            className="w-full py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
                        >
                            儲存表單
                        </button>
                    </div>
                </div>

                <div className="p-4 flex-1">
                    <h2 className="font-bold text-slate-800 mb-3">新增欄位</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {FIELD_TYPES.map((ft) => (
                            <button
                                key={ft.type}
                                onClick={() => handleAddField(ft.type)}
                                className="p-2 border rounded hover:bg-slate-50 text-sm text-left"
                            >
                                + {ft.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Center: Preview Canvas */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl min-h-[600px] p-8">
                    <h1 className="text-2xl font-bold mb-2">{name || '未命名表單'}</h1>
                    <p className="text-gray-500 mb-8">{description}</p>

                    {fields.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-lg">
                            點擊左側按鈕新增欄位
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    onClick={() => setEditingFieldId(field.id)}
                                    className={`relative group p-4 border rounded-lg cursor-pointer transition-all
                                        ${editingFieldId === field.id ? 'border-sky-500 ring-2 ring-sky-100' : 'border-transparent hover:border-slate-300'}`}
                                >
                                    {/* Action Buttons */}
                                    <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); handleMoveField(index, 'up'); }} className="p-1 hover:bg-slate-100 rounded">⬆️</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleMoveField(index, 'down'); }} className="p-1 hover:bg-slate-100 rounded">⬇️</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }} className="p-1 hover:bg-red-100 rounded text-red-500">🗑️</button>
                                    </div>

                                    {/* Component Preview (using FormRenderer components logic but static) */}
                                    <div className="pointer-events-none">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="p-2 bg-slate-50 border rounded text-slate-400 text-sm">
                                            {field.placeholder || `[${field.type}] 輸入框預覽`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Field Properties */}
            {editingField && (
                <div className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto">
                    <h2 className="font-bold text-slate-800 mb-4">編輯欄位: {editingField.label}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-600">標題</label>
                            <input
                                type="text"
                                className="w-full px-2 py-1 border rounded"
                                value={editingField.label}
                                onChange={(e) => handleUpdateField(editingField.id, { label: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600">佔位符 (Placeholder)</label>
                            <input
                                type="text"
                                className="w-full px-2 py-1 border rounded"
                                value={editingField.placeholder || ''}
                                onChange={(e) => handleUpdateField(editingField.id, { placeholder: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600">說明文字</label>
                            <input
                                type="text"
                                className="w-full px-2 py-1 border rounded"
                                value={editingField.helpText || ''}
                                onChange={(e) => handleUpdateField(editingField.id, { helpText: e.target.value })}
                            />
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={editingField.required}
                                onChange={(e) => handleUpdateField(editingField.id, { required: e.target.checked })}
                            />
                            必填
                        </label>

                        {(editingField.type === FormFieldType.SELECT || editingField.type === FormFieldType.RADIO || editingField.type === FormFieldType.CHECKBOX) && (
                            <div className="pt-4 border-t">
                                <label className="block text-sm font-bold text-slate-700 mb-2">選項設定 (逗號分隔)</label>
                                <textarea
                                    className="w-full px-2 py-1 border rounded h-24 text-sm"
                                    placeholder="選項1,選項2,選項3"
                                    value={editingField.options?.map(o => o.label).join(',') || ''}
                                    onChange={(e) => {
                                        const opts = e.target.value.split(',').map(s => ({ value: s.trim(), label: s.trim() })).filter(o => o.value);
                                        handleUpdateField(editingField.id, { options: opts });
                                    }}
                                />
                                <p className="text-xs text-slate-400 mt-1">輸入選項標籤，自動產生值</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
