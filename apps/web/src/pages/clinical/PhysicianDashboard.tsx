import React, { useState } from 'react';

const PhysicianDashboard: React.FC = () => {
    const [reviews] = useState([
        { id: 'RV-001', patient: '李小美', type: '出院計畫審核', status: 'Pending', critical: false, date: '2026-01-26' },
        { id: 'RV-002', patient: '張奶奶', type: 'E1 異常中斷', status: 'Review Required', critical: true, date: '2026-01-27' },
        { id: 'RV-003', patient: '陳阿公', type: '延長住院申請', status: 'Approved', critical: false, date: '2026-01-25' },
    ]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">醫師決策看板 (Physician Workspace)</h1>
            <p className="text-slate-500 text-sm mb-8">待審核案件與異常警示管理</p>

            <div className="space-y-4">
                {reviews.map(item => (
                    <div key={item.id} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm flex justify-between items-center ${item.critical ? 'border-red-500' : 'border-sky-500'
                        }`}>
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${item.critical ? 'bg-red-100 text-red-500' : 'bg-sky-100 text-sky-500'
                                }`}>
                                <i className={`fas ${item.critical ? 'fa-exclamation' : 'fa-clipboard-check'}`}></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{item.patient} - {item.type}</h3>
                                <p className="text-xs text-slate-400">ID: {item.id} • Date: {item.date}</p>
                            </div>
                            {item.critical && (
                                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                                    High Priority
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {item.status !== 'Approved' && (
                                <>
                                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50">
                                        駁回 (Override)
                                    </button>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                        批准 (Approve)
                                    </button>
                                </>
                            )}
                            {item.status === 'Approved' && (
                                <span className="text-green-500 font-bold flex items-center gap-2">
                                    <i className="fas fa-check-circle"></i> 已批准
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhysicianDashboard;
