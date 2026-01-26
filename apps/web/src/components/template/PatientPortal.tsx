import React, { useState } from 'react';
import { type Patient, type EducationModule, ResourceCategory } from '../../types/template';

interface PatientPortalProps {
    patient: Patient;
}

const PatientPortal: React.FC<PatientPortalProps> = ({ patient }) => {
    const [surveySubmitted, setSurveySubmitted] = useState(false);
    const [ratings, setRatings] = useState<Record<string, number>>({
        service: 0,
        education: 0,
        matching: 0,
        overall: 0
    });
    const [feedback, setFeedback] = useState('');

    const educationModules: EducationModule[] = [
        { id: '1', title: '術後傷口護理', description: '包含換藥頻率、觀察發炎徵兆及防水保護機制等完整指引。', progress: 100, type: 'Video' },
        { id: '2', title: '藥物服用衛教', description: '抗凝血藥物使用注意事項與交互作用說明。', progress: 0, type: 'Document' },
        { id: '3', title: '高纖飲食建議', description: '營養師針對術後康復規劃的客製化菜單與營養補充建議。', progress: 0, type: 'Document' }
    ];

    const matchedResources = patient.matchedResources || [
        { id: 'm1', category: ResourceCategory.LongTermCare, name: '新北市長照中心 (永和分區)', contactPerson: '李照專', phone: '02-22XX-XXXX', status: '媒合成功', note: '已申請居家服務，預計下週一到家評估。' },
        { id: 'm2', category: ResourceCategory.HomeNursing, name: '康健居家護理所', contactPerson: '陳護理師', phone: '09XX-XXX-XXX', status: '已聯繫', note: '個案需每兩週更換尿管，護理師已收到轉介單。' }
    ];

    const handleRating = (category: string, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const submitSurvey = () => {
        setSurveySubmitted(true);
        // In a real app, send data to backend here
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 pb-24">
            {/* Patient Header Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-sky-100 flex items-center justify-center bg-slate-50 overflow-hidden shadow-inner">
                        <img src={`https://picsum.photos/100/100?seed=${patient.id}`} alt="Patient" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white text-[10px] shadow-md">
                        <i className="fas fa-check"></i>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h2 className="text-2xl font-black text-slate-800">{patient.name}</h2>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">ID: {patient.id} | 照護團隊: 護理、社工</span>
                    </div>
                    <p className="text-slate-500 mb-3 font-medium">歡迎回來，{patient.name}的家屬！目前個案康復進度良好。</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">狀態: 穩定</span>
                        <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">計畫: 已發布</span>
                    </div>
                </div>

                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-3xl font-black text-sky-600">75%</div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">出院準備度</p>
                    <div className="w-32 bg-white h-2 rounded-full overflow-hidden shadow-inner border border-slate-100">
                        <div className="bg-sky-500 h-full w-[75%] rounded-full transition-all duration-1000 ease-out"></div>
                    </div>
                </div>
            </div>

            {/* Matched Resources Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-handshake-angle text-sky-500"></i> 已媒合資源與聯絡窗口
                    </h3>
                    <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-1 rounded tracking-widest uppercase">家屬重點聯繫清單</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedResources.map(res => (
                        <div key={res.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-sky-200 transition-all group shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{res.category}</p>
                                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-green-100">
                                    <i className="fas fa-check-circle"></i> {res.status}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-700 mb-3 group-hover:text-sky-700 transition-colors">{res.name}</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-user-tie text-slate-300 text-xs"></i>
                                        <span className="text-xs font-bold text-slate-600">{res.contactPerson}</span>
                                    </div>
                                    <button className="text-sky-600 hover:text-sky-800 transition transform active:scale-90">
                                        <i className="fas fa-phone-alt"></i>
                                    </button>
                                </div>
                                <p className="text-xs font-mono font-black text-sky-600 pl-1 tracking-wider">{res.phone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Education Plan */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-book-medical text-sky-500"></i> 出院衛教計畫
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">更新於 2 小時前</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {educationModules.map(module => (
                        <div key={module.id} className="p-4 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer group flex flex-col justify-between h-full shadow-sm">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-700 group-hover:text-sky-700 transition-colors">{module.title}</h4>
                                    {module.progress === 100 ? (
                                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-tighter">已完成</span>
                                    ) : (
                                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-tighter">待學習</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{module.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{module.type}</span>
                                <button className="text-sky-600 text-xs font-black flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">
                                    開始學習 <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Smart Match (Moved Above Survey) */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 p-8 opacity-10 rotate-12">
                    <i className="fas fa-sparkles text-[120px]"></i>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-sky-500/20 rounded-xl">
                            <i className="fas fa-wand-magic-sparkles text-sky-400"></i>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">AI 智慧資源推薦</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 max-w-lg leading-relaxed font-medium">根據目前的康復進度與出院需求，AI 為您挑選了最適合的居家照護資源：</p>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-sky-400 text-lg group-hover:text-white transition-colors">康健輔具中心 - 防跌氣墊床</h4>
                            <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded font-black tracking-widest uppercase shadow-lg shadow-sky-500/20">匹配度 98%</span>
                        </div>
                        <p className="text-xs text-slate-300 mb-6 leading-relaxed">針對長時間臥床風險需求，此款氣墊床可申請縣市政府長照補助 50%，減輕經濟負擔。</p>
                        <div className="flex gap-3">
                            <button className="px-6 py-2.5 bg-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-500 transition shadow-lg shadow-sky-600/30">查看補助試算</button>
                            <button className="px-6 py-2.5 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition">聯絡專業諮詢</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Satisfaction Survey Section (Placed at the very bottom) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-amber-50 rounded-2xl shadow-sm">
                        <i className="fas fa-star text-amber-500 text-lg"></i>
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg tracking-tight">滿意度問卷調查</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">您的寶貴意見是我們服務進步的動力</p>
                    </div>
                </div>

                {!surveySubmitted ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { key: 'service', label: '1. 出院準備服務整體滿意度' },
                                { key: 'education', label: '2. 衛教內容之清晰度與幫助' },
                                { key: 'matching', label: '3. 資源媒合效率與聯絡速度' },
                                { key: 'overall', label: '4. 對醫護團隊的整體信任感' }
                            ].map(item => (
                                <div key={item.key} className="space-y-4">
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-400">{item.key === 'service' ? '1' : item.key === 'education' ? '2' : item.key === 'matching' ? '3' : '4'}</span>
                                        {item.label}
                                    </p>
                                    <div className="flex gap-2.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => handleRating(item.key, star)}
                                                className={`w-11 h-11 rounded-2xl transition-all flex items-center justify-center text-lg ${ratings[item.key] >= star ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105' : 'bg-slate-50 text-slate-200 hover:bg-slate-100 hover:text-slate-300'}`}
                                            >
                                                <i className={`fas fa-star ${ratings[item.key] >= star ? 'animate-pulse' : ''}`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-400">5</span>
                                其他具體建議或想對團隊說的話
                            </p>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="請輸入您的寶貴建議，幫助我們做得更好..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none h-32 resize-none transition-all placeholder:text-slate-300 shadow-inner"
                            ></textarea>
                        </div>

                        <div className="flex justify-center pt-6">
                            <button
                                onClick={submitSurvey}
                                className="px-16 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-2xl shadow-slate-900/20 active:scale-95 duration-200"
                            >
                                提交滿意度問卷
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-green-100 animate-bounce-short">
                            <i className="fas fa-heart"></i>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">感謝您的寶貴回饋！</h4>
                            <p className="text-sm text-slate-500 max-w-sm mt-2 font-medium leading-relaxed">
                                我們已收到您的評價。醫療團隊會持續改進，致力於為您提供最專業、溫暖的出院照護體驗。
                            </p>
                        </div>
                        <button
                            onClick={() => setSurveySubmitted(false)}
                            className="text-sky-600 text-[10px] font-black uppercase tracking-widest mt-4 border-b-2 border-sky-100 hover:border-sky-600 transition-all"
                        >
                            重新填寫問卷
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientPortal;
