import React, { useState, useMemo } from 'react';
import { type Patient, CaseStatus } from '../../types/template';


interface DashboardProps {
    patients: Patient[];
    onSelectPatient: (p: Patient) => void;
    onOpenNewCase: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, onOpenNewCase }) => {
    const [selectedWard, setSelectedWard] = useState<string>('All');

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

    return (
        <div className="grid grid-cols-12 gap-6 p-6">
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
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">既存資源:</p>
                                        {p.preAdmissionResources && p.preAdmissionResources.length > 0 ? (
                                            renderPreResources(p)
                                        ) : (
                                            <p className="text-[9px] text-slate-300 italic mt-1">無既存資源紀錄</p>
                                        )}
                                    </div>

                                    {getPrepSummary(p)}
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

                {/* Meeting Schedule */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                        <span><i className="fas fa-calendar-alt text-sky-500 mr-2"></i>跨領域會議與任務看板</span>
                        <span className="text-xs text-slate-400 font-normal">今日共 2 場會議</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-3 px-2">時間</th>
                                    <th className="pb-3 px-2">個案內容</th>
                                    <th className="pb-3 px-2">參與團隊</th>
                                    <th className="pb-3 px-2">狀態</th>
                                    <th className="pb-3 px-2 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <tr className="text-sm hover:bg-slate-50/50 transition">
                                    <td className="py-4 px-2 font-mono font-bold text-slate-500">10:30</td>
                                    <td className="py-4 px-2">
                                        <p className="font-bold text-slate-700">張曉明</p>
                                        <p className="text-xs text-slate-400">出院準備評估會議</p>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="護理">N</div>
                                            <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="社工">SW</div>
                                            <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="營養">NU</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2"><span className="px-2 py-0.5 rounded bg-sky-50 text-sky-600 text-[10px] font-black uppercase">進行中</span></td>
                                    <td className="py-4 px-2 text-right">
                                        <button className="text-sky-600 hover:text-sky-800 font-black text-[10px] uppercase tracking-widest">
                                            進入會議 <i className="fas fa-arrow-right ml-1"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="text-sm hover:bg-slate-50/50 transition">
                                    <td className="py-4 px-2 font-mono font-bold text-slate-500">14:00</td>
                                    <td className="py-4 px-2">
                                        <p className="font-bold text-slate-700">王美利</p>
                                        <p className="text-xs text-slate-400">家屬需求協商</p>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">N</div>
                                            <div className="w-7 h-7 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">D</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-black uppercase">待辦</span></td>
                                    <td className="py-4 px-2 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest">詳情</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Side Panel: AI Suggestions */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-sky-500/20 rounded-xl">
                                <i className="fas fa-sparkles text-sky-400"></i>
                            </div>
                            <h3 className="text-lg font-bold tracking-tight">AI 資源媒合決策中心</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer border-l-4 border-l-sky-500">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest">自動介接 HIS</p>
                                    <span className="text-[9px] bg-white/10 px-1 rounded text-slate-400">NOW</span>
                                </div>
                                <h4 className="font-bold text-sm mb-1">張曉明 案: 長照 2.0 補助評估</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">偵測到住院前已有居家護理資源。AI 建議轉介長照專員 A 進行「出院即銜接」服務。</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">後續電訪提醒</p>
                                <h4 className="font-bold text-sm mb-1">林大同 案: 出院追蹤</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">社會局收案中。建議聯繫社會局社工 B 確認社區關懷訪視頻率。</p>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black rounded-xl transition shadow-xl shadow-sky-600/30 uppercase tracking-widest">
                            查看全部 AI 資源建議
                        </button>
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
