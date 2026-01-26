import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const PatientLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans max-w-md mx-auto shadow-2xl border-x border-slate-200">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Care 360</h1>
                    <p className="text-xs text-slate-500">您的健康夥伴</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    王
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </div>

            {/* Bottom Nav */}
            <div className="bg-white border-t border-slate-200 fixed bottom-0 w-full max-w-md flex justify-around py-2 pb-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => navigate('/patient/home')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${isActive('/patient/home') ? 'text-sky-600' : 'text-slate-400'}`}
                >
                    <i className={`fas fa-home text-xl ${isActive('/patient/home') ? 'animate-bounce' : ''}`}></i>
                    <span className="text-[10px] font-bold">首頁</span>
                </button>
                <button
                    onClick={() => navigate('/patient/plan')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${isActive('/patient/plan') ? 'text-sky-600' : 'text-slate-400'}`}
                >
                    <i className="fas fa-clipboard-list text-xl"></i>
                    <span className="text-[10px] font-bold">我的計畫</span>
                </button>
                <button
                    onClick={() => navigate('/patient/education')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${isActive('/patient/education') ? 'text-sky-600' : 'text-slate-400'}`}
                >
                    <i className="fas fa-book-medical text-xl"></i>
                    <span className="text-[10px] font-bold">衛教</span>
                </button>
            </div>
        </div>
    );
};

export default PatientLayout;
