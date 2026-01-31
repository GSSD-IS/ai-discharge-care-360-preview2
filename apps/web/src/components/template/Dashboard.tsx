import React, { useState, useMemo } from 'react';
import { type Patient } from '../../types/template';


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





    const filteredPatients = useMemo(() => {
        if (selectedWard === 'All') return patients;
        return patients.filter(p => (p.bed.substring(0, 1) + '樓') === selectedWard);
    }, [selectedWard, patients]);





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
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-600">
            <div className="grid grid-cols-12 gap-6 max-w-[1920px] mx-auto">

                {/* Header */}
                <div className="col-span-12 flex justify-between items-end mb-2">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
                        <p className="text-slate-400 text-sm font-bold mt-1">智慧病房整合照護平台</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onOpenNewCase}
                            className="h-12 px-6 bg-sky-600 text-white rounded-2xl hover:bg-sky-700 transition shadow-lg shadow-sky-600/20 text-sm font-bold flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i> 新增個案
                        </button>
                    </div>
                </div>

                {/* KPI Section - Bento Grid Row 1 */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Patients */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-default relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    <i className="fas fa-users"></i>
                                </div>
                                <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">住院病患總數</p>
                                <h2 className="text-4xl font-black text-slate-800">{patients.length} <span className="text-sm font-medium text-slate-300">人</span></h2>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Discharging */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-default relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    <i className="fas fa-suitcase-rolling"></i>
                                </div>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">Today</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">本日待出院</p>
                                <h2 className="text-4xl font-black text-slate-800">2 <span className="text-sm font-medium text-slate-300">案</span></h2>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: LOS */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-default relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">-0.5d</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">平均住院天數</p>
                                <h2 className="text-4xl font-black text-slate-800">12.5 <span className="text-sm font-medium text-slate-300">天</span></h2>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Occupancy */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-default relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    <i className="fas fa-bed"></i>
                                </div>
                                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-full">High</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">病床佔有率</p>
                                <h2 className="text-4xl font-black text-slate-800">92 <span className="text-sm font-medium text-slate-300">%</span></h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Bento Grid Row 2 */}
                {/* Left: Patient List (Primary Workspace) */}
                <div className="col-span-12 xl:col-span-9">
                    <div className="bg-white rounded-3xl shadow-sm p-8 min-h-[600px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-lg"><i className="fas fa-user-injured"></i></div>
                                病房動態總覽
                            </h3>
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                {['All', 'A區', 'B區', 'VIP'].map(ward => (
                                    <button
                                        key={ward}
                                        onClick={() => setSelectedWard(ward)}
                                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${selectedWard === ward
                                            ? 'bg-white text-slate-800 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {ward === 'All' ? '全部' : ward}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Patient Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPatients.map(patient => {
                                const stayDays = getStayDays(patient.admissionDate);
                                return (
                                    <div key={patient.id}
                                        onClick={() => onSelectPatient(patient)}
                                        className="group relative bg-slate-50 border border-transparent rounded-2xl p-5 hover:bg-white hover:border-sky-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                                    >
                                        {stayDays > 14 && (
                                            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-bl-xl shadow-sm">
                                                    Long Stay
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${patient.gender === 'Male' ? 'bg-sky-100 text-sky-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {patient.bed}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-lg group-hover:text-sky-600 transition">{patient.name}</h4>
                                                    <p className="text-xs text-slate-400 font-bold">{patient.id} • {patient.age}歲</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-5">
                                            <div className="flex justify-between items-center text-xs border-b border-slate-200/50 pb-2">
                                                <span className="text-slate-400 font-bold">預計出院</span>
                                                <span className="font-mono font-black text-slate-600">{patient.expectedDischargeDate}</span>
                                            </div>
                                            {patient.dischargeType && (
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-bold">出院目標</span>
                                                    <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{patient.dischargeType}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Social Resource Tags */}
                                        <div className="min-h-[28px]">
                                            {renderSocialResources(patient) || renderPreResources(patient)}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-5">
                                            <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-wider font-bold">
                                                <span className="text-slate-400">進度</span>
                                                <span className="text-sky-600">{Math.round((patient.prepItems?.filter(i => i.isCompleted).length || 0) / (patient.prepItems?.length || 1) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-sky-500 h-full rounded-full transition-all duration-1000 group-hover:bg-sky-400 shadow-sm shadow-sky-500/50"
                                                    style={{ width: `${(patient.prepItems?.filter(i => i.isCompleted).length || 0) / (patient.prepItems?.length || 1) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Side Panel (To-Do & Analytics) */}
                <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
                    {/* To-Do List Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col flex-1 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 text-sm"><i className="fas fa-clipboard-list"></i></div>
                                待辦事項
                            </h3>
                            <button onClick={() => openTodoModal()} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-sky-500 hover:text-white flex items-center justify-center transition shadow-sm">
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {todoItems.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(item => (
                                <div key={item.id} className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${item.isCompleted ? 'bg-slate-50 border-transparent opacity-50' : 'bg-white border-slate-100 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100'}`}
                                    onClick={() => openTodoModal(item)}>
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleTodoToggle(item.id); }}
                                            className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all mt-0.5 ${item.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-200 group-hover:border-sky-400'}`}
                                        >
                                            {item.isCompleted && <i className="fas fa-check text-[10px]"></i>}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${item.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'}`}>
                                                    {item.time}
                                                </span>
                                            </div>
                                            <h4 className={`font-bold text-sm mb-1 truncate ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                                <span className="truncate max-w-[80px] bg-slate-50 px-1.5 py-0.5 rounded"><i className="fas fa-user mr-1"></i>{item.target}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Analytics Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 text-sm"><i className="fas fa-chart-pie"></i></div>
                            安置分佈
                        </h3>
                        <div className="space-y-6">
                            {[{ label: '返家照護', val: '45%', color: 'bg-sky-500', count: 12 },
                            { label: '機構轉銜', val: '30%', color: 'bg-indigo-500', count: 8 },
                            { label: '轉院/PAC', val: '25%', color: 'bg-amber-500', count: 7 }].map((stat, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center text-xs mb-2">
                                        <span className="text-slate-500 font-bold">{stat.label}</span>
                                        <span className="font-black text-slate-800">{stat.count} <span className="text-[10px] text-slate-400 font-medium">({stat.val})</span></span>
                                    </div>
                                    <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                                        <div className={`${stat.color} h-full rounded-full shadow-sm`} style={{ width: stat.val }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modals placed at root of return but conceptually overlays */}
                {/* Edit Resource Modal */}
                {editingResource && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingResource(null)}></div>
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative z-10 animate-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <i className="fas fa-pen-to-square text-sky-500"></i>
                                    編輯社會資源
                                </h3>
                                <button onClick={handleCloseModal} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            {/* Recreating inner content briefly or simplifying for this replace */}
                            {/* Since we are replacing the WHOLE return, I must include the inner content of modals again */}
                            <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                                {/* Patient History */}
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">HIS 歷史病歷摘要 <span className="text-[10px] bg-slate-200 text-slate-500 px-2 rounded-full">唯讀</span></h4>
                                    {editingResource.history ? (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-1">
                                                {editingResource.history.diagnosis.map((d, i) => <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-medium">{d}</span>)}
                                            </div>
                                        </div>
                                    ) : <p className="text-xs text-slate-400">無資料</p>}
                                </div>
                                <hr className="border-slate-100" />
                                {/* Resources Form Re-implementation */}
                                {/* Simplified for brevity but functional */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 text-teal-600 rounded-lg" checked={editingResource.socialResources?.ltc.active || false}
                                                onChange={(e) => editingResource.socialResources && updateLocalResource({ ...editingResource.socialResources, ltc: { ...editingResource.socialResources.ltc, active: e.target.checked } })} />
                                            <span className="font-bold text-slate-700">長照 2.0 (CMS)</span>
                                        </label>
                                        {editingResource.socialResources?.ltc.active && (
                                            <div className="pl-8 mt-3 flex gap-2">
                                                {[2, 3, 4, 5, 6, 7, 8].map(lvl => (
                                                    <button key={lvl} onClick={() => editingResource.socialResources && updateLocalResource({ ...editingResource.socialResources, ltc: { ...editingResource.socialResources.ltc, level: lvl } })}
                                                        className={`w-8 h-8 rounded-lg font-bold text-sm ${editingResource.socialResources?.ltc.level === lvl ? 'bg-teal-500 text-white' : 'bg-white text-slate-400 hover:bg-slate-200'}`}>{lvl}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded-lg" checked={editingResource.socialResources?.homeNursing.active || false}
                                                onChange={(e) => editingResource.socialResources && updateLocalResource({ ...editingResource.socialResources, homeNursing: { ...editingResource.socialResources.homeNursing, active: e.target.checked } })} />
                                            <span className="font-bold text-slate-700">居家護理收案</span>
                                        </label>
                                        {editingResource.socialResources?.homeNursing.active && (
                                            <input type="text" className="w-full mt-3 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="輸入居護所名稱..." value={editingResource.socialResources?.homeNursing.agency || ''}
                                                onChange={(e) => editingResource.socialResources && updateLocalResource({ ...editingResource.socialResources, homeNursing: { ...editingResource.socialResources.homeNursing, agency: e.target.value } })} />
                                        )}
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="w-full py-3.5 bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition">儲存變更</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* To-Do Modal */}
                {isTodoModalOpen && editingTodo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTodoModalOpen(false)}></div>
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative z-10 animate-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <i className="fas fa-calendar-check text-sky-500"></i>
                                    {editingTodo.id ? '編輯事項' : '新增事項'}
                                </h3>
                                <button onClick={() => setIsTodoModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">標題</label>
                                    <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500" value={editingTodo.title} onChange={e => setEditingTodo({ ...editingTodo, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">日期</label>
                                        <input type="date" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500" value={editingTodo.date} onChange={e => setEditingTodo({ ...editingTodo, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">時間</label>
                                        <input type="time" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500" value={editingTodo.time} onChange={e => setEditingTodo({ ...editingTodo, time: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">地點</label>
                                        <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500" value={editingTodo.location} onChange={e => setEditingTodo({ ...editingTodo, location: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">對象</label>
                                        <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500" value={editingTodo.target} onChange={e => setEditingTodo({ ...editingTodo, target: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">優先級</label>
                                    <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500" value={editingTodo.priority} onChange={e => setEditingTodo({ ...editingTodo, priority: e.target.value })}>
                                        <option value="Normal">普通</option>
                                        <option value="High">緊急/重要</option>
                                    </select>
                                </div>
                                <button onClick={() => handleSaveTodo(editingTodo)} className="w-full py-3.5 bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition mt-2">儲存事項</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
