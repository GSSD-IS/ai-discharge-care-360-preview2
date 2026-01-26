import React, { useState, useMemo } from 'react';
import { mockTenants } from '../../data/mockData';
import { TenantList } from '../../components/admin/TenantList';
import { TenantDetail } from '../../components/admin/TenantDetail';
import { type Tenant } from '../../types/saas';

export const TenantManagementPage: React.FC = () => {
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Trial' | 'Suspended'>('All');
    const [search, setSearch] = useState('');

    const filteredTenants = useMemo(() => {
        return mockTenants.filter(t => {
            const matchesFilter = filter === 'All' || t.status === filter;
            const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                t.subdomain.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [filter, search]);

    return (
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Tenants</h1>
                    <p className="text-slate-500">Manage all admitted hospitals and clinics.</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2">
                    <i className="fas fa-plus"></i>
                    Onboard New Tenant
                </button>
            </header>

            {/* Filters */}
            <div className="flex items-center justify-between gap-4 mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-1">
                    {['All', 'Active', 'Trial', 'Suspended'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f
                                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Search hospitals..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 w-64"
                    />
                </div>
            </div>

            {/* List */}
            <TenantList tenants={filteredTenants} onSelectTenant={setSelectedTenant} />

            {/* Detail Panel Overlay */}
            {selectedTenant && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setSelectedTenant(null)}
                    ></div>
                    <TenantDetail tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />
                </>
            )}
        </div>
    );
};
