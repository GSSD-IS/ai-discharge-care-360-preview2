import React from 'react';
import { mockTenants, mockUsers } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
    // Mock Stats
    const totalTenants = mockTenants.length;
    const activeTenants = mockTenants.filter(t => t.status === 'Active').length;
    const totalUsers = mockUsers.length;
    const estRevenue = activeTenants * 999; // Mock MRR

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">平台營運總覽 (Platform Overview)</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-medium mb-2">總租戶數 (Total Tenants)</div>
                    <div className="text-3xl font-bold text-slate-900">{totalTenants}</div>
                    <div className="text-green-500 text-xs mt-2 flex items-center">
                        <i className="fas fa-arrow-up mr-1"></i> 較上月成長 12%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-medium mb-2">活躍醫院 (Active)</div>
                    <div className="text-3xl font-bold text-slate-900">{activeTenants}</div>
                    <div className="text-blue-500 text-xs mt-2">
                        {((activeTenants / totalTenants) * 100).toFixed(0)}% 使用率
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-medium mb-2">總用戶數 (Total Users)</div>
                    <div className="text-3xl font-bold text-slate-900">{totalUsers}</div>
                    <div className="text-slate-400 text-xs mt-2">
                        跨所有租戶加總
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-medium mb-2">預估 MRR (營收)</div>
                    <div className="text-3xl font-bold text-slate-900">${estRevenue.toLocaleString()}</div>
                    <div className="text-green-500 text-xs mt-2 flex items-center">
                        <i className="fas fa-arrow-up mr-1"></i> 較上月成長 5%
                    </div>
                </div>
            </div>

            {/* Recent Activity (Audit Log Mock) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">近期審計日誌 (Recent Audit Logs)</h3>
                <div className="space-y-4">
                    {[
                        { action: '新租戶開通', target: '康寧醫院 (Kang Ning)', user: 'System', time: '2 小時前', icon: 'fa-hospital' },
                        { action: '登入失敗 (異常 IP)', target: 'admin@ntuh.com', user: 'IP: 192.168.1.1', time: '4 小時前', icon: 'fa-user-lock', color: 'text-red-500' },
                        { action: '訂閱方案升級', target: '長庚紀念醫院 (Pro Plan)', user: 'Platform Admin', time: '1 天前', icon: 'fa-file-invoice' },
                    ].map((log, index) => (
                        <div key={index} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                            <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center ${log.color || 'text-indigo-500'}`}>
                                <i className={`fas ${log.icon}`}></i>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-slate-800">{log.action}</div>
                                <div className="text-sm text-slate-500">{log.target}</div>
                            </div>
                            <div className="text-xs text-slate-400">{log.user} • {log.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
