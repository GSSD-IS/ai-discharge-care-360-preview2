import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <i className="fas fa-shield-alt text-indigo-500"></i>
                        SaaS 管理後台
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => navigate('/admin')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive('/admin') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <i className="fas fa-chart-line w-5 text-center"></i>
                        營運總覽 (Dashboard)
                    </button>
                    <button
                        onClick={() => navigate('/admin/tenants')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive('/admin/tenants') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <i className="fas fa-hospital-alt w-5 text-center"></i>
                        租戶管理 (Tenants)
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition font-medium">
                        <i className="fas fa-users-cog w-5 text-center"></i>
                        平台用戶 (Users)
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition font-medium">
                        <i className="fas fa-file-invoice-dollar w-5 text-center"></i>
                        訂閱與帳單 (Billing)
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => window.location.href = '/login'} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white transition text-sm">
                        <i className="fas fa-sign-out-alt"></i>
                        登出 (Sign Out)
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
