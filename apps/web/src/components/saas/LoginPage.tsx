import React, { useState } from 'react';
import { mockTenants, mockUsers } from '../../data/mockData';
import { UserRole } from '../../types/saas';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            // Mock Login Success
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = user.role === UserRole.SuperAdmin ? '/admin' : '/';
        } else {
            setError('Invalid credentials (Try: nurse@ntuh.com or admin@care360.com)');
        }
    };

    // Auto-detect tenant logo based on simplistic "subdomain" simulation or select box in real app
    // For mock, we just show generic

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Brand Section */}
            <div className="hidden lg:flex flex-1 bg-slate-900 justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center"></div>
                <div className="relative z-10 text-center px-10">
                    <h1 className="text-5xl font-bold text-white mb-6">AI Discharge Care 360</h1>
                    <p className="text-xl text-slate-300">智慧出院，無縫接軌</p>
                    <p className="text-sm text-slate-400 mt-4">賦能醫療團隊，降低再入院風險</p>
                </div>
            </div>

            {/* Login Form */}
            <div className="flex-1 flex justify-center items-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">請輸入您的醫療人員帳號</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                                placeholder="name@hospital.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <i className="fas fa-exclamation-circle"></i>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-xs text-center text-slate-400 mb-4">Mock Credentials:</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                            <button onClick={() => { setEmail('nurse@ntuh.com'); setPassword('123'); }} className="px-3 py-1 bg-slate-100 rounded text-xs text-slate-600">Nurse (Clinical)</button>
                            <button onClick={() => { setEmail('admin@care360.com'); setPassword('123'); }} className="px-3 py-1 bg-slate-100 rounded text-xs text-slate-600">Admin (SaaS)</button>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-400 mb-2">Available Tenants:</p>
                            <div className="flex gap-2 justify-center">
                                {mockTenants.slice(0, 3).map(t => (
                                    <span key={t.id} className="text-xs px-2 py-1 bg-slate-50 border rounded text-slate-500">{t.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
