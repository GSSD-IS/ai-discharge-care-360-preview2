import React from 'react';
import { type Tenant } from '../../types/saas';

interface TenantDetailProps {
    tenant: Tenant;
    onClose: () => void;
}

export const TenantDetail: React.FC<TenantDetailProps> = ({ tenant, onClose }) => {
    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl border-l border-slate-100 transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg" style={{ backgroundColor: tenant.themeColor }}>
                        {tenant.name.substring(0, 1)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{tenant.name}</h2>
                        <a href={`https://${tenant.subdomain}.care360.com`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                            {tenant.subdomain}.care360.com
                            <i className="fas fa-external-link-alt text-xs"></i>
                        </a>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <i className="fas fa-times text-xl"></i>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Status</div>
                        <div className={`font-bold text-lg flex items-center gap-2 ${tenant.status === 'Active' ? 'text-emerald-600' :
                                tenant.status === 'Trial' ? 'text-sky-600' : 'text-red-600'
                            }`}>
                            <i className={`fas fa-circle text-[8px]`}></i>
                            {tenant.status}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Plan</div>
                        <div className="font-bold text-lg text-slate-800">{tenant.plan}</div>
                    </div>
                </div>

                {/* Subscription Info */}
                <section>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider">Subscription Details</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Renewal Date</span>
                            <span className="text-sm font-bold text-slate-800">{tenant.renewalDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Active Users</span>
                            <span className="text-sm font-bold text-slate-800">{tenant.userCount} / {
                                tenant.plan === 'Basic' ? 50 :
                                    tenant.plan === 'Pro' ? 200 : 'Unlimited'
                            }</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min((tenant.userCount / (tenant.plan === 'Basic' ? 50 : tenant.plan === 'Pro' ? 200 : 1000)) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                </section>

                {/* Feature Flags */}
                {tenant.config?.features && (
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider">Feature Configuration</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(tenant.config.features).map(([key, enabled]) => (
                                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Danger Zone */}
                <section className="pt-8 mt-8 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-red-500 mb-4 uppercase tracking-wider">Danger Zone</h3>
                    <button className="w-full border border-red-200 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors">
                        Suspend Tenant
                    </button>
                </section>
            </div>
        </div>
    );
};
