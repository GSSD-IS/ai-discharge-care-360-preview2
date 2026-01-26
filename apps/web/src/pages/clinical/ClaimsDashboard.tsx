import React, { useState } from 'react';

const ClaimsDashboard: React.FC = () => {
    const [claims] = useState([
        { id: 'CLM001', patient: '王大明', type: 'B碼 (照顧)', amount: 1200, status: 'Draft', date: '2026-01-25' },
        { id: 'CLM002', patient: '李小美', type: 'D碼 (交通)', amount: 500, status: 'Submitted', date: '2026-01-24' },
        { id: 'CLM003', patient: '陳阿公', type: 'G碼 (喘息)', amount: 3500, status: 'Approved', date: '2026-01-22' },
        { id: 'CLM004', patient: '林先生', type: 'B碼 (照顧)', amount: 1200, status: 'Draft', date: '2026-01-26' },
        { id: 'CLM005', patient: '張奶奶', type: 'D碼 (交通)', amount: 1500, status: 'Rejected', date: '2026-01-21' },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft': return 'bg-slate-100 text-slate-600';
            case 'Submitted': return 'bg-blue-100 text-blue-600';
            case 'Approved': return 'bg-emerald-100 text-emerald-600';
            case 'Rejected': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100';
        }
    };

    return (
        <div className="p-8">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">服務費用申報 (Claims)</h1>
                    <p className="text-slate-500 text-sm">管理長照 2.0/3.0 給付項目申報作業</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">
                        <i className="fas fa-file-export mr-2"></i>
                        匯出 CSV
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-700">
                        <i className="fas fa-plus mr-2"></i>
                        新增申報
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold uppercase">本月申報總額</div>
                    <div className="text-2xl font-black text-slate-800 font-mono mt-1">$7,900</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold uppercase">待送件 (Draft)</div>
                    <div className="text-2xl font-black text-slate-600 font-mono mt-1">2</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold uppercase">審核中 (Submitted)</div>
                    <div className="text-2xl font-black text-blue-600 font-mono mt-1">1</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold uppercase">已駁回 (Rejected)</div>
                    <div className="text-2xl font-black text-red-600 font-mono mt-1">1</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">申報單號</th>
                            <th className="px-6 py-4">個案姓名</th>
                            <th className="px-6 py-4">服務項目 (Type)</th>
                            <th className="px-6 py-4">日期</th>
                            <th className="px-6 py-4 text-right">金額</th>
                            <th className="px-6 py-4 text-center">狀態</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {claims.map(claim => (
                            <tr key={claim.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-mono font-medium text-slate-900">{claim.id}</td>
                                <td className="px-6 py-4 font-bold">{claim.patient}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{claim.type}</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{claim.date}</td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">${claim.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs">編輯</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClaimsDashboard;
