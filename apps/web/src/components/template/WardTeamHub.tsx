import React, { useState } from 'react';
import { DepartmentRole, type CoordinationTask, type Patient } from '../../types/template';

interface WardTeamHubProps {
    patients: Patient[];
}

const mockTasks: CoordinationTask[] = [
    { id: 't1', patientId: 'ID: 8821', patientName: '張曉明', bed: '702-1', dept: DepartmentRole.Nutritionist, title: '術後高纖飲食評估', priority: 'Medium', deadline: '今天 17:00', status: 'Pending' },
    { id: 't2', patientId: 'ID: 8821', patientName: '張曉明', bed: '702-1', dept: DepartmentRole.Physiotherapist, title: '床邊復健需求評估', priority: 'High', deadline: '今天 12:00', status: 'Ongoing' },
    { id: 't3', patientId: 'ID: 8823', patientName: '王美利', bed: '601-A', dept: DepartmentRole.Pharmacist, title: '多重用藥雲端核對', priority: 'High', deadline: '明天 09:00', status: 'Pending' },
    { id: 't4', patientId: 'ID: 8822', patientName: '林大同', bed: '705-2', dept: DepartmentRole.SocialWorker, title: '安置機構床位確認', priority: 'Medium', deadline: '明天 15:00', status: 'Done' },
    { id: 't5', patientId: 'ID: 8821', patientName: '張曉明', bed: '702-1', dept: DepartmentRole.Pharmacist, title: '出院帶藥教育', priority: 'Low', deadline: '11/25', status: 'Pending' },
];

const WardTeamHub: React.FC<WardTeamHubProps> = ({ patients }) => {
    const [activeDept, setActiveDept] = useState<DepartmentRole | 'All'>('All');
    const referenceDate = new Date('2023-11-30');

    const deptColors: Record<string, string> = {
        [DepartmentRole.Nurse]: 'bg-blue-500',
        [DepartmentRole.SocialWorker]: 'bg-green-500',
        [DepartmentRole.Nutritionist]: 'bg-amber-500',
        [DepartmentRole.Physiotherapist]: 'bg-indigo-500',
        [DepartmentRole.Pharmacist]: 'bg-purple-500',
        [DepartmentRole.Doctor]: 'bg-rose-500',
    };

    const getStayDays = (admissionDate: string) => {
        const start = new Date(admissionDate);
        const diffTime = Math.abs(referenceDate.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-red-600 bg-red-50';
        if (score >= 40) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const filteredTasks = activeDept === 'All' ? mockTasks : mockTasks.filter(t => t.dept === activeDept);

    const renderPatientStatus = (patientId: string) => {
        const p = patients.find(p => p.id === patientId);
        if (!p) return null;

        const stayDays = getStayDays(p.admissionDate);
        const isExtendedStay = stayDays > 14;
        const completed = p.prepItems ? p.prepItems.filter(i => i.isCompleted).length : 0;
        const total = p.prepItems ? p.prepItems.length : 1;
        const progress = Math.round((completed / total) * 100);

        return (
            <div className="mt-4 pt-3 border-t border-slate-50 space-y-2.5">
                <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap ${getRiskColor(p.riskScore)}`}>
                        風險 {p.riskScore}
                    </span>
                    {isExtendedStay && (
                        <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                            <i className="fas fa-exclamation-circle"></i> 超長住院
                        </span>
                    )}
                    <span className="text-[9px] font-bold text-sky-600 flex items-center gap-1 truncate">
                        <i className="fas fa-route"></i> {p.dischargeType}
                    </span>
                </div>

                {/* Stay Info Label */}
                {isExtendedStay && (
                    <p className="text-[9px] font-black text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-100">
                        住院天數：<span className="text-base leading-none">{stayDays}</span> 天 (已達超長住院門檻)
                    </p>
                )}

                {/* Existing Resources Tags */}
                {p.preAdmissionResources && p.preAdmissionResources.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {p.preAdmissionResources.map((res, i) => (
                            <span key={i} className="text-[8px] font-black bg-slate-100 text-slate-500 px-1 py-0.5 rounded">
                                <i className="fas fa-link mr-0.5 opacity-50"></i>{res}
                            </span>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        <span>出院準備進度</span>
                        <span className="text-sky-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-sky-400 h-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">病房團隊溝通平台</h2>
                    <p className="text-sm text-slate-500">跨領域協作任務看板與即時動態</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                    <button
                        onClick={() => setActiveDept('All')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeDept === 'All' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        全部
                    </button>
                    {Object.values(DepartmentRole).map(role => (
                        <button
                            key={role}
                            onClick={() => setActiveDept(role)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeDept === role ? `${deptColors[role]} text-white shadow-md` : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTasks.map(task => (
                    <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition group flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-wider ${deptColors[task.dept]}`}>
                                {task.dept}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                                {task.priority === 'High' ? '緊急' : '一般'}
                            </span>
                        </div>

                        <h3 className="font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition leading-tight">{task.title}</h3>
                        <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                            <i className="fas fa-user-injured text-slate-300"></i>
                            {task.patientName} <span className="text-slate-300">|</span> {task.bed}
                        </p>

                        {/* Injected Patient Status Info */}
                        {renderPatientStatus(task.patientId)}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                <i className="fas fa-clock"></i>
                                {task.deadline}
                            </div>
                            <span className={`text-[10px] font-black uppercase ${task.status === 'Done' ? 'text-green-500' : task.status === 'Ongoing' ? 'text-amber-500' : 'text-slate-300'}`}>
                                {task.status === 'Done' ? '已完成' : task.status === 'Ongoing' ? '執行中' : '待處理'}
                            </span>
                        </div>
                    </div>
                ))}

                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-300 hover:border-sky-300 hover:text-sky-400 cursor-pointer transition">
                    <i className="fas fa-plus-circle text-3xl mb-2"></i>
                    <p className="text-xs font-bold">發布跨團隊任務</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ward Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">跨領域協作動態</h3>
                        <button className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">標記為已讀</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="p-4 hover:bg-slate-50/50 transition flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                                    <i className={`fas ${i % 2 === 0 ? 'fa-person-walking-with-cane' : 'fa-apple-whole'}`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700">
                                        <span className="font-bold">{i % 2 === 0 ? '林物理治療師' : '陳營養師'}</span> 在
                                        <span className="text-sky-600 font-bold mx-1">張曉明</span> 案中更新了評估。
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 italic">"患者家屬已確認購買助行器，明天可開始步行練習。"</p>
                                    <p className="text-[10px] text-slate-300 mt-2">15 分鐘前</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Contacts */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 mb-6">今日值班小組</h3>
                    <div className="space-y-6">
                        {Object.values(DepartmentRole).map(role => (
                            <div key={role} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs ${deptColors[role]}`}>
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{role}</p>
                                        <p className="text-[10px] text-slate-400">分機: 231{Math.floor(Math.random() * 10)}</p>
                                    </div>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-sky-600 flex items-center justify-center transition">
                                    <i className="fas fa-phone-alt text-[10px]"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WardTeamHub;
