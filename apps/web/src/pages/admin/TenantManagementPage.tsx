import React, { useState, useEffect, useCallback } from 'react';
import {
    saasAdminService,
    TenantStatus,
    SubscriptionPlan
} from '../../services/api/saas_admin_mock';
import type { TenantConfig, TenantsResponse } from '../../services/api/saas_admin_mock';

// Note: Role must be set externally (e.g., by auth context or app initialization)
// The saasAdminService.setRole() should be called from auth flow, not here.

export const TenantManagementPage: React.FC = () => {
    const [tenants, setTenants] = useState<TenantConfig[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<TenantStatus | ''>('');
    const [planFilter, setPlanFilter] = useState<SubscriptionPlan | ''>('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchTenants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: { page: number; limit: number; status?: string; plan?: string } = { page, limit };
            if (statusFilter) params.status = statusFilter;
            if (planFilter) params.plan = planFilter;

            const res: TenantsResponse = await saasAdminService.getTenants(params);
            setTenants(res.data);
            setMeta(res.meta);
        } catch (e: any) {
            setError(e.message || 'Failed to load tenants');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, planFilter]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const handleSuspend = async (id: string) => {
        const reason = prompt('請輸入停權原因 (Reason):');
        if (!reason) return;
        try {
            await saasAdminService.suspendTenant(id, { reason });
            fetchTenants(); // Refresh list
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    const handleUpdatePlan = async (id: string, currentPlan: SubscriptionPlan) => {
        const newPlan = currentPlan === SubscriptionPlan.STANDARD ? SubscriptionPlan.PREMIUM : SubscriptionPlan.STANDARD;
        if (!confirm(`確定將此租戶方案從 ${currentPlan} 切換到 ${newPlan}?`)) return;
        try {
            await saasAdminService.updatePlan(id, { plan: newPlan });
            fetchTenants();
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">租戶管理 (Tenants)</h1>
                    <p className="text-slate-500">管理所有合作醫院與診所的存取權限。</p>
                </div>
                {/* Add Tenant button would call POST /tenants - omit for scope */}
            </header>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    Status:
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as TenantStatus | ''); setPage(1); }}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="">All</option>
                        <option value={TenantStatus.ACTIVE}>Active</option>
                        <option value={TenantStatus.SUSPENDED}>Suspended</option>
                        <option value={TenantStatus.ARCHIVED}>Archived</option>
                    </select>
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    Plan:
                    <select
                        value={planFilter}
                        onChange={(e) => { setPlanFilter(e.target.value as SubscriptionPlan | ''); setPage(1); }}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="">All</option>
                        <option value={SubscriptionPlan.STANDARD}>Standard</option>
                        <option value={SubscriptionPlan.PREMIUM}>Premium</option>
                    </select>
                </label>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">載入中...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">ID (UUID)</th>
                                <th className="px-6 py-4">名稱</th>
                                <th className="px-6 py-4">狀態</th>
                                <th className="px-6 py-4">方案</th>
                                <th className="px-6 py-4">MAX_USERS</th>
                                <th className="px-6 py-4">AI Enabled</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenants.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-xs truncate max-w-[150px]">{t.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === TenantStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : t.status === TenantStatus.SUSPENDED ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${t.plan === SubscriptionPlan.PREMIUM ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                            {t.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{t.features.MAX_USERS}</td>
                                    <td className="px-6 py-4">{t.features.ENABLE_AI_ANALYSIS ? '✅' : '❌'}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleUpdatePlan(t.id, t.plan)}
                                            className="text-indigo-600 hover:underline text-xs font-bold"
                                        >
                                            Toggle Plan
                                        </button>
                                        {t.status !== TenantStatus.SUSPENDED && (
                                            <button
                                                onClick={() => handleSuspend(t.id)}
                                                className="text-red-500 hover:underline text-xs font-bold"
                                            >
                                                Suspend
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tenants.length === 0 && (
                        <div className="p-12 text-center text-slate-400">未找到符合條件的租戶。</div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {meta && (
                <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
                    <span>Page {meta.page} / {Math.ceil(meta.total / meta.limit)} (Total: {meta.total})</span>
                    <div className="space-x-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page * limit >= meta.total}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
