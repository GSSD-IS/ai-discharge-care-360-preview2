import React, { useState, useMemo } from 'react';
import { type Patient, CaseStatus } from '../../types/template';


interface DashboardProps {
    patients: Patient[];
    onSelectPatient: (p: Patient) => void;
    onOpenNewCase: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, onOpenNewCase }) => {
    const [selectedWard, setSelectedWard] = useState<string>('All');
    const [editingResource, setEditingResource] = useState<Patient | null>(null);

    // To-Do List State
    const [todoItems, setTodoItems] = useState<any[]>([
        { id: '1', title: '出院準備評估會議', date: '2023-11-30', time: '10:30', location: '7A討論室', target: '張曉明 (N, SW, NU)', priority: 'High', isCompleted: false },
        { id: '2', title: '家屬需求協商', date: '2023-11-30', time: '14:00', location: '社工會談室', target: '王美利 (N, D)', priority: 'Normal', isCompleted: false },
        { id: '3', title: '長照2.0 專員訪視', date: '2023-12-01', time: '09:00', location: '702-1病床', target: '林大同', priority: 'High', isCompleted: false },
    ]);
    const [editingTodo, setEditingTodo] = useState<any | null>(null);
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);

    const handleResourceEdit = (p: Patient) => {
        // Create a shallow copy to allow local editing without affecting list immediately if needed, 
        // but for this mock we edit the reference directly or copy it.
        // Let's copy to be safe and set it back on save? 
        // Actually for simplicity in this mock, editing the reference is easiest if we want global update.
        // But to make React happy with updates:
        setEditingResource({ ...p });
    };

    const updateLocalResource = (updatedResources: any) => {
        if (!editingResource) return;
        const updatedPatient = { ...editingResource, socialResources: updatedResources };
        setEditingResource(updatedPatient);

        // Find the patient in the main list and update it too (Mock persistence)
        const target = patients.find(p => p.id === updatedPatient.id);
        if (target) {
            target.socialResources = updatedResources;
        }
    };

    const handleCloseModal = () => {
        setEditingResource(null);
    };

    // To-Do Handlers
    const handleTodoToggle = (id: string) => {
        setTodoItems(prev => prev.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item));
    };

    const handleSaveTodo = (todo: any) => {
        if (editingTodo) {
            // Update existing
            setTodoItems(prev => prev.map(item => item.id === todo.id ? todo : item));
        } else {
            // Create new
            setTodoItems(prev => [...prev, { ...todo, id: Math.random().toString(36).substr(2, 9), isCompleted: false }]);
        }
        setIsTodoModalOpen(false);
        setEditingTodo(null);
    };

    const openTodoModal = (todo: any | null = null) => {
        setEditingTodo(todo || { date: new Date().toISOString().split('T')[0], time: '12:00', priority: 'Normal', title: '', location: '', target: '' });
        setIsTodoModalOpen(true);
    };

    // Mock current date for calculation consistency: 2023-11-30
    const referenceDate = new Date('2023-11-30');

    const getStayDays = (admissionDate: string) => {
        const start = new Date(admissionDate);
        const diffTime = Math.abs(referenceDate.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-red-600 bg-red-100';
        if (score >= 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    // Grouping logic: Extract Ward from Bed (e.g., "702-1" -> "7樓")
    const wardStats = useMemo(() => {
        const stats: Record<string, { total: number; highRisk: number; longStay: number }> = {};
        patients.forEach(p => {
            const ward = p.bed.substring(0, 1) + '樓';
            if (!stats[ward]) stats[ward] = { total: 0, highRisk: 0, longStay: 0 };
            stats[ward].total++;
            if (p.riskScore >= 70) stats[ward].highRisk++;
            if (getStayDays(p.admissionDate) > 14) stats[ward].longStay++;
        });
        return stats;
    }, [patients]);

    const filteredPatients = useMemo(() => {
        if (selectedWard === 'All') return patients;
        return patients.filter(p => (p.bed.substring(0, 1) + '樓') === selectedWard);
    }, [selectedWard, patients]);

    const longStayCount = patients.filter(p => getStayDays(p.admissionDate) > 14).length;

    const getPrepSummary = (p: Patient) => {
        if (!p.prepItems || p.prepItems.length === 0) return p.status;
        const completed = p.prepItems.filter(i => i.isCompleted).length;
        const pending = p.prepItems.find(i => !i.isCompleted);
        return (
            <div className="mt-3 space-y-0.5 border-t border-slate-50 pt-2">
                <p className="text-[10px] font-bold text-sky-600 flex items-center gap-1 uppercase tracking-wider">
                    <i className="fas fa-route"></i> 出院目標: {p.dischargeType} ({completed}/{p.prepItems.length})
                </p>
                <p className="text-xs text-slate-600 truncate italic">
                    {pending ? `▶ 待辦: ${pending.status}` : '✓ 所有準備已完成'}
                </p>
            </div>
        );
    };

    const renderPreResources = (p: Patient) => {
        if (!p.preAdmissionResources || p.preAdmissionResources.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-1 mt-2 mb-1">
                {p.preAdmissionResources.map((res, i) => (
                    <span key={i} className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <i className="fas fa-link text-[8px] opacity-50"></i> {res}
                    </span>
                ))}
            </div>
        );
    };

    const renderSocialResources = (p: Patient) => {
        if (!p.socialResources) return null;
        const { ltc, homeNursing, respiratory, facility } = p.socialResources;
        return (
            <div className="flex flex-wrap gap-1 mt-2 mb-1" onClick={(e) => { e.stopPropagation(); handleResourceEdit(p); }}>
                {ltc.active && (
                    <span className="text-[9px] font-black bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded border border-teal-100 flex items-center gap-1 cursor-pointer hover:bg-teal-100" title="點擊編輯長照狀態">
                        <i className="fas fa-wheelchair text-[8px]"></i> 長照 Lv.{ltc.level}
                    </span>
                )}
                {homeNursing.active && (
                    <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1 cursor-pointer hover:bg-blue-100" title={`收案單位: ${homeNursing.agency}`}>
                        <i className="fas fa-user-nurse text-[8px]"></i> 居護收案
                    </span>
                )}
                {respiratory.status !== 'None' && (
                    <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-1 cursor-pointer hover:bg-rose-100">
                        <i className="fas fa-lungs text-[8px]"></i> {respiratory.status}
                    </span>
                )}
                {facility.isResident && (
                    <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-1 cursor-pointer hover:bg-amber-100" title={`入住機構: ${facility.type}`}>
                        <i className="fas fa-hotel text-[8px]"></i> 機構住民
                    </span>
                )}
                <span className="text-[9px] text-slate-300 hover:text-slate-500 cursor-pointer flex items-center"><i className="fas fa-pen ml-1 text-[8px]"></i></span>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-12 gap-6 p-6 relative">
            {/* Edit Resource Modal */}
            {editingResource && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm pointer-events-auto" onClick={() => setEditingResource(null)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative z-10 animate-in zoom-in duration-200 pointer-events-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <i className="fas fa-pen-to-square text-sky-500"></i>
                                編輯社會資源 & 檢視病歷
                            </h3>
                            <button onClick={handleCloseModal} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Patient History (Read-Only from HIS) */}
                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <i className="fas fa-file-medical text-slate-400"></i>
                                    HIS 歷史病歷摘要
                                    <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">唯讀</span>
                                </h4>
                                {editingResource.history ? (
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold mb-1">診斷:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {editingResource.history.diagnosis.map((d, i) => (
                                                    <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">{d}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold mb-1">手術史:</p>
                                                <ul className="text-xs text-slate-600 list-disc list-inside">
                                                    {editingResource.history.pastSurgeries.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold mb-1">慢性病:</p>
                                                <ul className="text-xs text-slate-600 list-disc list-inside">
                                                    {editingResource.history.chronicConditions.map((c, i) => <li key={i}>{c}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">無相關歷史病歷資料</p>
                                )}
                            </div>

                            <hr className="border-slate-100" />

                            {/* LTC */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingResource.socialResources?.ltc.active || false}
                                        onChange={(e) => {
                                            if (!editingResource.socialResources) return;
                                            const newRes = { ...editingResource.socialResources, ltc: { ...editingResource.socialResources.ltc, active: e.target.checked } };
                                            updateLocalResource(newRes);
                                        }}
                                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                    />
                                    <span className="font-bold text-slate-700">長照 2.0 (CMS)</span>
                                </label>
                                {editingResource.socialResources?.ltc.active && (
                                    <div className="pl-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-slate-500 font-bold">失能等級:</span>
                                            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                                {[2, 3, 4, 5, 6, 7, 8].map(lvl => (
                                                    <button
                                                        key={lvl}
                                                        onClick={() => {
                                                            if (!editingResource.socialResources) return;
                                                            const newRes = { ...editingResource.socialResources, ltc: { ...editingResource.socialResources.ltc, level: lvl } };
                                                            updateLocalResource(newRes);
                                                        }}
                                                        className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition ${editingResource.socialResources?.ltc.level === lvl ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Home Nursing */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingResource.socialResources?.homeNursing.active || false}
                                        onChange={(e) => {
                                            if (!editingResource.socialResources) return;
                                            const newRes = { ...editingResource.socialResources, homeNursing: { ...editingResource.socialResources.homeNursing, active: e.target.checked } };
                                            updateLocalResource(newRes);
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="font-bold text-slate-700">居家護理收案</span>
                                </label>
                                {editingResource.socialResources?.homeNursing.active && (
                                    <div className="pl-6">
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                                            placeholder="輸入收案居護所名稱..."
                                            value={editingResource.socialResources?.homeNursing.agency || ''}
                                            onChange={(e) => {
                                                if (!editingResource.socialResources) return;
                                                const newRes = { ...editingResource.socialResources, homeNursing: { ...editingResource.socialResources.homeNursing, agency: e.target.value } };
                                                updateLocalResource(newRes);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button onClick={handleCloseModal} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">取消</button>
                                <button onClick={handleCloseModal} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition shadow-lg shadow-sky-600/20">儲存變更</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* To-Do Edit Modal */}
            {isTodoModalOpen && editingTodo && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm pointer-events-auto" onClick={() => setIsTodoModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-in zoom-in duration-200 pointer-events-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <i className="fas fa-calendar-check text-sky-500"></i>
                                {editingTodo.id ? '編輯待辦事項' : '新增待辦事項'}
                            </h3>
                            <button onClick={() => setIsTodoModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">事項內容 (Title)</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                                    value={editingTodo.title} onChange={e => setEditingTodo({ ...editingTodo, title: e.target.value })} placeholder="例如: 跨團隊會議..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">日期 (Date)</label>
                                    <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                                        value={editingTodo.date} onChange={e => setEditingTodo({ ...editingTodo, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">時間 (Time)</label>
                                    <input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                                        value={editingTodo.time} onChange={e => setEditingTodo({ ...editingTodo, time: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">地點 (Location)</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                                    value={editingTodo.location} onChange={e => setEditingTodo({ ...editingTodo, location: e.target.value })} placeholder="例如: 7A討論室" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">對象/參與者 (Target)</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                                    value={editingTodo.target} onChange={e => setEditingTodo({ ...editingTodo, target: e.target.value })} placeholder="例如: 家屬, 社工..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">優先級 (Priority)</label>
                                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                                    value={editingTodo.priority} onChange={e => setEditingTodo({ ...editingTodo, priority: e.target.value })}>
                                    <option value="Normal">普通</option>
                                    <option value="High">緊急/重要</option>
                                </select>
                            </div>
                            <button onClick={() => handleSaveTodo(editingTodo)} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition shadow-lg shadow-sky-600/20 mt-2">
                                儲存事項
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Section */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">收案個案總數</p>
                    <h3 className="text-3xl font-black text-slate-800">{patients.length}</h3>
                </div>
                <div className={`p-5 rounded-2xl shadow-sm border ${longStayCount > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">超長住院個案 ({'>'}14天)</p>
                    <div className="flex items-end gap-2">
                        <h3 className={`text-3xl font-black ${longStayCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{longStayCount}</h3>
                        {longStayCount > 0 && <span className="text-xs font-bold text-amber-600 mb-1 animate-pulse">需優先處理</span>}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">今日預計出院</p>
                    <h3 className="text-3xl font-black text-sky-600">2</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">高風險個案</p>
                    <h3 className="text-3xl font-black text-rose-600">3</h3>
                </div>
            </div>

            {/* Ward Overview & Selection Section */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">收案個案概覽</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">依病房區域點選概覽</p>
                    </div>
                    <button
                        onClick={onOpenNewCase}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition shadow-lg shadow-sky-600/20 text-sm font-bold"
                    >
                        <i className="fas fa-plus mr-2"></i>新增個案
                    </button>
                </div>

                {/* Ward Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <button
                        onClick={() => setSelectedWard('All')}
                        className={`p-4 rounded-2xl border transition-all text-left group ${selectedWard === 'All' ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-white border-slate-100 hover:border-sky-300 shadow-sm'}`}
                    >
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedWard === 'All' ? 'text-sky-400' : 'text-slate-400'}`}>全部病房</p>
                        <h4 className={`text-xl font-black ${selectedWard === 'All' ? 'text-white' : 'text-slate-800'}`}>{patients.length} <span className="text-xs font-normal">案</span></h4>
                    </button>
                    {Object.entries(wardStats).map(([ward, stat]) => (
                        <button
                            key={ward}
                            onClick={() => setSelectedWard(ward)}
                            className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${selectedWard === ward ? 'bg-sky-600 border-sky-600 shadow-xl' : 'bg-white border-slate-100 hover:border-sky-300 shadow-sm'}`}
                        >
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedWard === ward ? 'text-sky-100' : 'text-slate-400'}`}>{ward} 病房區</p>
                            <h4 className={`text-xl font-black ${selectedWard === ward ? 'text-white' : 'text-slate-800'}`}>{stat.total} <span className="text-xs font-normal">案</span></h4>
                            <div className="mt-2 flex gap-2">
                                {stat.highRisk > 0 && (
                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${selectedWard === ward ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>高風險 {stat.highRisk}</span>
                                )}
                                {stat.longStay > 0 && (
                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${selectedWard === ward ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>超長 {stat.longStay}</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Filtered Patient Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPatients.map(p => {
                        const stayDays = getStayDays(p.admissionDate);
                        const isExtendedStay = stayDays > 14;

                        return (
                            <div
                                key={p.id}
                                onClick={() => onSelectPatient(p)}
                                className={`group bg-white p-4 rounded-xl shadow-sm border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden relative ${isExtendedStay ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-100' : 'border-slate-100'}`}
                            >
                                {isExtendedStay && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-amber-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1">
                                            <i className="fas fa-clock-rotate-left animate-spin-slow"></i> 超長住院 {stayDays}d
                                        </div>
                                    </div>
                                )}

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-sky-600 transition-colors">{p.name}</h3>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                {isExtendedStay && <i className="fas fa-hourglass-start text-amber-500"></i>}
                                                {p.bed} <span className="text-slate-200">|</span> {p.id}
                                            </p>
                                        </div>
                                        {!isExtendedStay && (
                                            <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${getRiskColor(p.riskScore)}`}>
                                                風險 {p.riskScore}
                                            </span>
                                        )}
                                    </div>

                                    {/* Pre-admission Resources Section */}
                                    <div className="min-h-[40px]">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">社會資源與身分:</p>
                                        {(p.socialResources && (p.socialResources.ltc.active || p.socialResources.homeNursing.active || p.socialResources.respiratory.status !== 'None' || p.socialResources.facility.isResident)) ? (
                                            renderSocialResources(p)
                                        ) : (
                                            p.preAdmissionResources && p.preAdmissionResources.length > 0 ? (
                                                renderPreResources(p)
                                            ) : (
                                                <p className="text-[9px] text-slate-300 italic mt-1">無特殊身分註記</p>
                                            )
                                        )}
                                    </div>

                                    {getPrepSummary(p)}

                                    {p.dischargePlacement && (
                                        <div className="mb-3 pt-3 border-t border-slate-50">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white ${p.dischargePlacement.type === 'Home' ? 'bg-emerald-400' :
                                                        p.dischargePlacement.type === 'Facility' ? 'bg-amber-400' : 'bg-sky-400'
                                                        }`}>
                                                        <i className={`fas ${p.dischargePlacement.type === 'Home' ? 'fa-house' :
                                                            p.dischargePlacement.type === 'Facility' ? 'fa-building' : 'fa-ambulance'
                                                            }`}></i>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {{
                                                            Home: '返家照護',
                                                            RCW: '呼吸照護',
                                                            HomeHospice: '居家安寧',
                                                            Facility: '機構安置',
                                                            Transfer: '轉院治療'
                                                        }[p.dischargePlacement.type]}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 pl-6 truncate">
                                                {p.dischargePlacement.type === 'Home' && `照顧者: ${{ Family: '家人', PrivateNurse: '看護', ForeignCaregiver: '外籍', Other: '其他' }[p.dischargePlacement.homeCare?.caregiver || 'Other'] || '未定'}`}
                                                {p.dischargePlacement.type === 'Facility' && (p.dischargePlacement.facility?.name || '尋找中...')}
                                                {(p.dischargePlacement.type === 'Transfer' || p.dischargePlacement.type === 'RCW') && '待確認轉介單位'}
                                            </p>
                                        </div>
                                    )}

                                </div>

                                <div className="mt-4 relative z-10">
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><i className="fas fa-hospital text-slate-300"></i>{p.department}</span>
                                        <span className={isExtendedStay ? 'text-amber-600' : 'text-sky-500'}>{p.status}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ease-out ${isExtendedStay ? 'bg-amber-500' : 'bg-sky-500'}`}
                                            style={{ width: `${p.status === CaseStatus.Completed ? 100 : (p.prepItems ? (p.prepItems.filter(i => i.isCompleted).length / p.prepItems.length * 100) : 45)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredPatients.length === 0 && (
                        <div className="col-span-full h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                            <i className="fas fa-user-slash text-2xl mb-2 opacity-20"></i>
                            <p className="text-sm font-bold">目前無收案個案</p>
                        </div>
                    )}
                </div>


            </div>

            {/* Side Panel: To-Do List (Replaced AI Widget) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <i className="fas fa-clipboard-list text-sky-500"></i>
                            待辦事項總覽
                        </h3>
                        <button onClick={() => openTodoModal()} className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center transition">
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {todoItems.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(item => (
                            <div key={item.id} className={`p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer ${item.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-sky-300'}`}
                                onClick={() => openTodoModal(item)}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleTodoToggle(item.id); }}
                                            className={`w-5 h-5 rounded border flex items-center justify-center transition ${item.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 hover:border-sky-500'}`}
                                        >
                                            {item.isCompleted && <i className="fas fa-check text-xs"></i>}
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {item.time}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                                        </div>
                                        <h4 className={`font-bold text-sm mb-1 ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.title}</h4>
                                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><i className="fas fa-map-marker-alt text-slate-300"></i> {item.location}</span>
                                            <span className="flex items-center gap-1"><i className="fas fa-user-tag text-slate-300"></i> {item.target}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {todoItems.length === 0 && (
                            <div className="text-center py-10 text-slate-400">
                                <i className="fas fa-clipboard-check text-4xl mb-3 opacity-20"></i>
                                <p className="text-sm">太棒了！目前沒有待辦事項</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                        <span className="tracking-tight">個案收案與安置分佈</span>
                        <i className="fas fa-chart-pie text-slate-200"></i>
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center text-[11px] mb-2">
                                <span className="text-slate-500 font-bold uppercase tracking-wider">返家照護</span>
                                <span className="font-black text-slate-800">12 案 (45%)</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                <div className="bg-sky-500 h-full w-[45%] rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center text-[11px] mb-2">
                                <span className="text-slate-500 font-bold uppercase tracking-wider">機構轉銜</span>
                                <span className="font-black text-slate-800">8 案 (30%)</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full w-[30%] rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center text-[11px] mb-2">
                                <span className="text-slate-500 font-bold uppercase tracking-wider">轉院/PAC</span>
                                <span className="font-black text-slate-800">7 案 (25%)</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-[25%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-8 py-2.5 border border-slate-100 text-slate-400 text-[10px] font-black rounded-lg hover:bg-slate-50 hover:text-sky-600 transition uppercase tracking-widest">
                        進入數據分析中心
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
