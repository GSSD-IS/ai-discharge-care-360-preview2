import React from 'react';
import { type Tenant } from '../../types/saas';

interface TenantListProps {
    tenants: Tenant[];
    onSelectTenant: (tenant: Tenant) => void;
}

export const TenantList: React.FC<TenantListProps> = ({ tenants, onSelectTenant }) => {
    // Basic sorting state could be added here

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">租戶名稱 (Tenant Name)</th>
                            <th className="px-6 py-4">子網域 (Subdomain)</th>
                            <th className="px-6 py-4">訂閱方案 (Plan)</th>
                            <th className="px-6 py-4">狀態 (Status)</th>
                            <th className="px-6 py-4 text-right">用戶數 (Users)</th>
                            <th className="px-6 py-4 text-right">續約日 (Renewal)</th>
                            <th className="px-6 py-4 text-right">操作 (Actions)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectTenant(tenant)}>
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: tenant.themeColor }}>
                                        {tenant.name.substring(0, 1)}
                                    </div>
                                    {tenant.name}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{tenant.subdomain}.care360.com</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${tenant.plan === 'Enterprise' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            tenant.plan === 'Pro' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                        {tenant.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${tenant.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                            tenant.status === 'Trial' ? 'bg-sky-50 text-sky-600' :
                                                'bg-red-50 text-red-600'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'Active' ? 'bg-emerald-500' :
                                                tenant.status === 'Trial' ? 'bg-sky-500' :
                                                    'bg-red-500'
                                            }`}></span>
                                        {tenant.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono">{tenant.userCount}</td>
                                <td className="px-6 py-4 text-right text-slate-400">{tenant.renewalDate}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-indigo-600 font-bold text-xs">
                                        管理
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tenants.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    未找到符合條件的租戶。
                </div>
            )}
        </div>
    );
};
