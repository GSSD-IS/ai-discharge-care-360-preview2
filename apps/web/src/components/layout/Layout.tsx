import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const view = location.pathname;

    const isActive = (path: string) => {
        if (path === '/' && view === '/') return true;
        if (path !== '/' && view.startsWith(path)) return true;
        return false;
    };

    const getLinkClass = (path: string) => `
        w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all 
        ${isActive(path)
            ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }
    `;

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800">
            {/* Sidebar */}
            <nav className="w-20 lg:w-64 bg-slate-900 flex flex-col py-6 border-r border-slate-800 shrink-0">
                <div className="px-6 mb-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                        <i className="fas fa-heart-pulse text-xl"></i>
                    </div>
                    <h1 className="hidden lg:block font-black text-xl text-white tracking-tight">AI Care 360</h1>
                </div>

                <div className="flex-1 space-y-1 px-3">
                    <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                        <i className="fas fa-columns w-5 text-center"></i>
                        <span className="hidden lg:block font-medium">醫護儀表板</span>
                    </Link>
                    <Link to="/workflow/new" className={getLinkClass('/workflow')}>
                        <i className="fas fa-file-medical-alt w-5 text-center"></i>
                        <span className="hidden lg:block font-medium">建立流程</span>
                    </Link>
                    <Link to="/forms" className={getLinkClass('/forms')}>
                        <i className="fas fa-clipboard-list w-5 text-center"></i>
                        <span className="hidden lg:block font-medium">表單管理</span>
                    </Link>
                    <Link to="/patient-portal" className={getLinkClass('/patient-portal')}>
                        <i className="fas fa-user-graduate w-5 text-center"></i>
                        <span className="hidden lg:block font-medium">病患衛教門戶</span>
                    </Link>
                    <Link to="/analytics" className={getLinkClass('/analytics')}>
                        <i className="fas fa-chart-line w-5 text-center"></i>
                        <span className="hidden lg:block font-medium">數據分析中心</span>
                    </Link>
                </div>

                <div className="px-6 pt-6 border-t border-slate-800 mt-auto">
                    <div className="flex items-center gap-3">
                        <img src="https://picsum.photos/40/40?seed=nurse" className="w-10 h-10 rounded-full ring-2 ring-slate-800" alt="Nurse avatar" />
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">李護理師</p>
                            <p className="text-[10px] text-slate-500 truncate">出院準備專員</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden md:block">
                            <input
                                type="text"
                                placeholder="搜尋個案計畫..."
                                className="w-full bg-slate-50 border-none rounded-xl px-10 py-2 text-sm focus:ring-2 focus:ring-sky-500 transition-all"
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-sky-600 transition flex items-center justify-center">
                            <i className="fas fa-bell"></i>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-100 hidden sm:block"></div>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            系統正常
                        </span>
                    </div>
                </header>
                <div className="flex-1 overflow-auto bg-slate-50 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
