import React from 'react';

const PatientHome: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-sky-500/30 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm font-medium opacity-90 mb-1">早安，王大明 伯伯</p>
                    <h2 className="text-2xl font-bold mb-4">距離出院還有 3 天</h2>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
                        <i className="fas fa-check-circle text-green-300"></i>
                        今日體溫: 36.5°C (正常)
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 right-10 w-20 h-20 bg-sky-400/20 rounded-full blur-xl"></div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-star text-amber-400"></i>
                    今日任務
                </h3>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-walking"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">下床活動 15 分鐘</h4>
                                <p className="text-xs text-slate-400">復健師建議: 早上 10:00</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 rounded-full border-2 border-slate-200 text-slate-200 hover:bg-green-500 hover:border-green-500 hover:text-white transition flex items-center justify-center">
                            <i className="fas fa-check"></i>
                        </button>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-pills"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">服用血壓藥</h4>
                                <p className="text-xs text-slate-400">飯後服用 (Metformin)</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 rounded-full border-2 border-slate-200 text-slate-200 hover:bg-green-500 hover:border-green-500 hover:text-white transition flex items-center justify-center">
                            <i className="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Care Team */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">您的照護團隊</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { name: "陳醫師", role: "主治醫師", img: "fa-user-doctor", bg: "bg-blue-100", text: "text-blue-600" },
                        { name: "林護理師", role: "專責護理", img: "fa-user-nurse", bg: "bg-rose-100", text: "text-rose-600" },
                        { name: "張個管", role: "個管師", img: "fa-clipboard-user", bg: "bg-purple-100", text: "text-purple-600" },
                    ].map((staff, i) => (
                        <div key={i} className="flex-shrink-0 w-32 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full ${staff.bg} ${staff.text} flex items-center justify-center text-xl mb-2`}>
                                <i className={`fas ${staff.img}`}></i>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">{staff.name}</h4>
                            <p className="text-xs text-slate-400">{staff.role}</p>
                            <button className="mt-2 text-[10px] bg-slate-50 px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100">傳訊息</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PatientHome;
