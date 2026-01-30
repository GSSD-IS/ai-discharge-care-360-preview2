import React, { useState } from 'react';
import { type Patient, type Message, DepartmentRole } from '../../types/template';
import { generateDischargeSummary, assessRiskAI } from '../../services/geminiService';
import RiskRadar from './RiskRadar';

interface CaseDetailProps {
    patient: Patient;
    onBack: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ patient, onBack }) => {
    const [aiSummary, setAiSummary] = useState<string>('');
    const [riskResult, setRiskResult] = useState<{ riskLevel: string; score: number; reasoning: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'All' | DepartmentRole>(DepartmentRole.Nurse);
    // ...
    const [messages, setMessages] = useState<Message[]>([
        // ... (keep messages default state)
        { id: '1', sender: '蔡社工', role: 'Social Worker', dept: DepartmentRole.SocialWorker, content: '患者家屬表示希望申請輔具，已聯繫長照中心。', timestamp: '2023-11-23 14:20' },
        { id: '2', sender: '你', role: 'Nurse', dept: DepartmentRole.Nurse, content: '收到。目前個案安全用藥教育已開始，重點放在減少跌倒風險。', timestamp: '2023-11-23 15:10' },
        { id: '3', sender: '王藥師', role: 'Pharmacist', dept: DepartmentRole.Pharmacist, content: '已核對三高藥物清單，提醒病患 Warfarin 需注意交互作用。', timestamp: '2023-11-23 16:45' },
        { id: '4', sender: '陳營養', role: 'Nutritionist', dept: DepartmentRole.Nutritionist, content: '已提供低鈉低脂飲食建議。', timestamp: '2023-11-24 09:15' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const currentRiskScore = riskResult ? riskResult.score : patient.riskScore;

    const riskData = [
        { subject: '總體風險', A: currentRiskScore, fullMark: 100 },
        { subject: '高齡', A: patient.age > 75 ? 90 : 40, fullMark: 100 },
        { subject: '失能', A: patient.adl < 50 ? 80 : 20, fullMark: 100 },
        { subject: '共病', A: patient.cci * 10, fullMark: 100 },
        { subject: '認知', A: 30, fullMark: 100 },
    ];

    const handleGenerateSummary = async () => {
        setLoading(true);
        // Parallel execution
        const [summary, risk] = await Promise.all([
            generateDischargeSummary(patient),
            assessRiskAI(patient)
        ]);
        setAiSummary(summary);
        setRiskResult(risk);
        setLoading(false);
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const msg: Message = {
            id: Date.now().toString(),
            sender: '你',
            role: 'Nurse',
            dept: DepartmentRole.Nurse,
            content: newMessage,
            timestamp: new Date().toLocaleString()
        };
        setMessages([...messages, msg]);
        setNewMessage('');
    };

    const filteredMessages = activeTab === 'All' ? messages : messages.filter(m => m.dept === activeTab);

    const deptIcons: Record<string, string> = {
        [DepartmentRole.Nurse]: 'fa-user-nurse',
        [DepartmentRole.SocialWorker]: 'fa-hands-holding-child',
        [DepartmentRole.Nutritionist]: 'fa-apple-whole',
        [DepartmentRole.Physiotherapist]: 'fa-person-walking-with-cane',
        [DepartmentRole.Pharmacist]: 'fa-pills',
        [DepartmentRole.Doctor]: 'fa-user-doctor'
    };


    const [showEmr, setShowEmr] = useState(false);

    const handleViewEMR = () => {
        // In real world, this calls HIS API via FHIR
        setShowEmr(true);
    };

    const handlePublish = () => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("✅ 出院準備計畫已發布！\n\n- 家屬 App 通知: 已發送\n- 居家護理機構: 已同步\n- 健保申報系統: 待傳送 (Queue)");
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
            {/* EMR Modal Overlay */}
            {showEmr && (
                <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-white w-full max-w-4xl h-full max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <i className="fas fa-file-medical-alt text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">電子病歷調閱 (HIS Integration)</h3>
                                    <p className="text-xs text-slate-500 font-mono">Source: FHIR Gateway | Patient ID: {patient.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEmr(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 flex items-center justify-center transition">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-white font-mono text-sm">
                            <div className="grid grid-cols-2 gap-8">
                                <section>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Recent Diagnosis (ICD-10)</h4>
                                    <ul className="space-y-3">
                                        <li className="flex justify-between">
                                            <span className="font-bold text-slate-700">I10</span>
                                            <span className="text-slate-500">Essential (primary) hypertension</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="font-bold text-slate-700">E11.9</span>
                                            <span className="text-slate-500">Type 2 diabetes mellitus without complications</span>
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Lab Results (Last 24h)</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-red-50 p-2 rounded border border-red-100">
                                            <span className="font-bold text-red-700">HbA1c</span>
                                            <div className="text-right">
                                                <div className="font-bold text-red-700">8.5 %</div>
                                                <div className="text-[10px] text-red-400">Ref: 4.0-5.6</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center p-2">
                                            <span className="font-bold text-slate-700">Creatinine</span>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-700">1.1 mg/dL</div>
                                                <div className="text-[10px] text-slate-400">Ref: 0.7-1.2</div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="col-span-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Medication History</h4>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-xs text-slate-400">
                                                <th className="pb-2">Drug Name</th>
                                                <th className="pb-2">Dosage</th>
                                                <th className="pb-2">Frequency</th>
                                                <th className="pb-2">Start Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-600">
                                            <tr className="border-b border-slate-50">
                                                <td className="py-2 font-bold">Metformin</td>
                                                <td className="py-2">500mg</td>
                                                <td className="py-2">BID (AC)</td>
                                                <td className="py-2">2023-01-15</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 font-bold">Amlodipine</td>
                                                <td className="py-2">5mg</td>
                                                <td className="py-2">QD</td>
                                                <td className="py-2">2023-05-20</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </section>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-xs text-indigo-600 font-bold hover:underline">
                                View Full EMR via HIS Gateway <i className="fas fa-external-link-alt ml-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition flex items-center justify-center">
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">個案準備進度詳情</h2>
                        <p className="text-xs text-slate-400 font-medium">
                            {patient.name} ({patient.id}) | 房號: {patient.bed} | 入院日: {patient.admissionDate}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleViewEMR}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition uppercase tracking-wider flex items-center gap-2"
                    >
                        <i className="fas fa-file-medical text-slate-400"></i>
                        病歷調閱
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition shadow-lg shadow-sky-600/20 uppercase tracking-wider flex items-center gap-2"
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                        發布出院計畫
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-12 gap-6">
                {/* Left: Milestones & Team Status */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                            <span>出院準備環節</span>
                            <span className="text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-black">{patient.dischargeType}</span>
                        </h3>
                        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                            {patient.prepItems?.map((item, idx) => (
                                <div key={idx} className="relative pl-8 group">
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] shadow-sm ${item.isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <i className={`fas ${item.isCompleted ? 'fa-check' : 'fa-clock'}`}></i>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${item.isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</p>
                                        <p className={`text-xs ${item.isCompleted ? 'text-green-600' : 'text-slate-400 font-medium'}`}>{item.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">跨領域評估狀態</h3>
                        <div className="space-y-4">
                            {patient.assessments?.map((ast, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${ast.status === '已完成' ? 'bg-green-500' : ast.status === '評估中' ? 'bg-amber-500' : 'bg-slate-200 text-slate-400'}`}>
                                        <i className={`fas ${deptIcons[ast.role] || 'fa-user'}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-xs font-bold text-slate-700">{ast.role}</p>
                                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${ast.status === '已完成' ? 'bg-green-50 text-green-600' : ast.status === '評估中' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>{ast.status}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 truncate">{ast.lastNote}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Team Communication Interface */}
                <div className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col space-y-4">
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
                        {/* Dept Filter Tabs */}
                        <div className="px-4 pt-4 border-b border-slate-50">
                            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => setActiveTab('All' as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === ('All' as any) ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    全部訊息
                                </button>
                                {Object.values(DepartmentRole).map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setActiveTab(role)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === role ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <i className={`fas ${deptIcons[role]}`}></i>
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50/30">
                            {filteredMessages.length > 0 ? filteredMessages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender === '你' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm ${msg.sender === '你' ? 'bg-sky-600' : 'bg-white border border-slate-100 text-slate-500'}`}>
                                        <i className={`fas ${deptIcons[msg.dept || ''] || 'fa-user'}`}></i>
                                    </div>
                                    <div className={`max-w-[80%] ${msg.sender === '你' ? 'items-end' : ''}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-700">{msg.sender}</span>
                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{msg.role}</span>
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === '你' ? 'bg-sky-600 text-white rounded-tr-none shadow-md' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}`}>
                                            {msg.content}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{msg.timestamp}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <i className="fas fa-comment-slash text-4xl mb-3 opacity-20"></i>
                                    <p className="text-sm">該領域暫無專門訊息</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-50 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`以${DepartmentRole.Nurse}身分發布討論...`}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="w-12 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center hover:bg-slate-900 transition shadow-md"
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: AI & Summary */}
                <div className="col-span-12 xl:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-wand-magic-sparkles text-indigo-500"></i> AI 整合摘要
                            </h3>
                            <button onClick={handleGenerateSummary} disabled={loading} className="text-[10px] text-sky-600 font-black uppercase tracking-widest">
                                {loading ? '生成中...' : '重新生成'}
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-5 min-h-[300px] border border-slate-100 text-xs text-slate-600 leading-relaxed">
                            {aiSummary ? (
                                <div className="whitespace-pre-wrap">{aiSummary}</div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10 text-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <i className="fas fa-robot text-2xl text-slate-200"></i>
                                    </div>
                                    <p className="px-4">點擊生成將整合護理、營養、藥劑、復健與社工的所有評估意見。</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 text-center">30 天再入院風險</h3>
                        <div className={`p-3 rounded-xl flex items-center justify-between gap-3 mb-6 border ${currentRiskScore >= 70 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                            <div className="flex items-center gap-2">
                                <i className={`fas ${currentRiskScore >= 70 ? 'fa-exclamation-triangle' : 'fa-shield-check'}`}></i>
                                <span className="text-xs font-black uppercase">風險評分: {currentRiskScore}分</span>
                            </div>
                            {riskResult && <span className="text-[9px] bg-white/50 px-2 py-0.5 rounded font-black border border-white/20">AI Calculated</span>}
                        </div>
                        <RiskRadar data={riskData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
