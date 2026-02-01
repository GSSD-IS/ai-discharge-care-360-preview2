import React from 'react';
import { DepartmentRole, type Patient } from '../../types/template';

import CaseDetail from './CaseDetail';

interface WardTeamHubProps {
    selectedPatient?: Patient | null;
    onBack?: () => void;
}



const WardTeamHub: React.FC<WardTeamHubProps> = ({ selectedPatient, onBack }) => {
    if (selectedPatient && onBack) {
        return <CaseDetail patient={selectedPatient} onBack={onBack} />;
    }



    const deptColors: Record<string, string> = {
        [DepartmentRole.Nurse]: 'bg-blue-500',
        [DepartmentRole.SocialWorker]: 'bg-green-500',
        [DepartmentRole.Nutritionist]: 'bg-amber-500',
        [DepartmentRole.Physiotherapist]: 'bg-indigo-500',
        [DepartmentRole.Pharmacist]: 'bg-purple-500',
        [DepartmentRole.Doctor]: 'bg-rose-500',
    };



    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">病房團隊溝通平台</h2>
                    <p className="text-sm text-slate-500">跨領域協作任務看板與即時動態</p>
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
