import React from 'react';

const MyPlan: React.FC = () => {
    const steps = [
        { date: '01/24', title: '入院檢查', status: 'completed', icon: 'fa-hospital-user' },
        { date: '01/25', title: '治療方案確認', status: 'completed', icon: 'fa-file-signature' },
        { date: '01/26', title: '病情穩定觀察', status: 'completed', icon: 'fa-heart-pulse' },
        { date: '01/28', title: '出院前評估', status: 'current', icon: 'fa-clipboard-check' },
        { date: '01/29', title: '輔具準備', status: 'pending', icon: 'fa-wheelchair' },
        { date: '01/30', title: '快樂出院', status: 'pending', icon: 'fa-house-chimney' },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">我的出院計畫</h2>

            <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative pl-6 group">
                        {/* Dot */}
                        <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 
                            ${step.status === 'completed' ? 'bg-green-500 border-green-500' :
                                step.status === 'current' ? 'bg-white border-sky-500 animate-pulse' :
                                    'bg-slate-100 border-slate-300'}`}>
                        </div>

                        {/* Content */}
                        <div className={`${step.status === 'pending' ? 'opacity-50' : ''}`}>
                            <span className="text-xs font-bold text-slate-400">{step.date}</span>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mt-2 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                                    ${step.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        step.status === 'current' ? 'bg-sky-100 text-sky-600' :
                                            'bg-slate-100 text-slate-400'}`}>
                                    <i className={`fas ${step.icon}`}></i>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">{step.title}</h3>
                                    <p className="text-xs text-slate-500">
                                        {step.status === 'completed' ? '已完成' :
                                            step.status === 'current' ? '進行中...' :
                                                '等待中'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyPlan;
