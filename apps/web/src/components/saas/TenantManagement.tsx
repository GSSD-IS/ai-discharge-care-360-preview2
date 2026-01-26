import React from 'react';
import { mockTenants } from '../../data/mockData';

const TenantManagement: React.FC = () => {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">租戶管理 (Tenants)</h2>
                    <p className="text-slate-500 text-sm">管理訂閱醫院及其狀態</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition">
                    <i className="fas fa-plus mr-2"></i>New Tenant
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subdomain</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Theme Color</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {mockTenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{tenant.name}</div>
                                    <div className="text-xs text-slate-400">ID: {tenant.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{tenant.subdomain}.care360.com</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: tenant.themeColor }}></div>
                                        <span className="text-xs text-slate-500">{tenant.themeColor}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${tenant.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            tenant.status === 'Trial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {tenant.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-slate-400 hover:text-indigo-600 transition mr-3">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="text-slate-400 hover:text-red-500 transition">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TenantManagement;
