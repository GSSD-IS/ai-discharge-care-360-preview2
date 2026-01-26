import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// Note: In mock mode, we assume user is already logged in as Admin
const AdminLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <i className="fas fa-shield-alt text-indigo-500"></i>
                        SaaS Admin
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/20 text-indigo-400 font-medium">
                        <i className="fas fa-hospital-alt w-5 text-center"></i>
                        Tenants
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition font-medium">
                        <i className="fas fa-users-cog w-5 text-center"></i>
                        Platform Users
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition font-medium">
                        <i className="fas fa-file-invoice-dollar w-5 text-center"></i>
                        Subscriptions
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => window.location.href = '/login'} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white transition text-sm">
                        <i className="fas fa-sign-out-alt"></i>
                        Sign Out
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
