import React, { useState } from 'react';
import { type Patient, type Message, DepartmentRole, type DischargePlacement } from '../../types/template';
import DischargePlacementForm from './DischargePlacementForm';

interface CaseDetailProps {
    patient: Patient;
    onBack: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ patient, onBack }) => {
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showEmr, setShowEmr] = useState(false);

    // Placement State
    const [placementData, setPlacementData] = useState<DischargePlacement | undefined>(patient.dischargePlacement);
    const [isEditingPlacement, setIsEditingPlacement] = useState(false);

    const handleSavePlacement = (data: DischargePlacement) => {
        setPlacementData(data);
        setIsEditingPlacement(false);
        // Mock persistence
        patient.dischargePlacement = data;
        console.log("Saved Placement:", data);
    };

    // ...
    const [messages, setMessages] = useState<Message[]>([
        // ... (keep messages default state)
        { id: '1', sender: '蔡社工', role: 'Social Worker', dept: DepartmentRole.SocialWorker, content: '患者家屬表示希望申請輔具，已聯繫長照中心。', timestamp: '2023-11-23 14:20' },
        { id: '2', sender: '你', role: 'Nurse', dept: DepartmentRole.Nurse, content: '收到。目前個案安全用藥教育已開始，重點放在減少跌倒風險。', timestamp: '2023-11-23 15:10' },
        { id: '3', sender: '王藥師', role: 'Pharmacist', dept: DepartmentRole.Pharmacist, content: '已核對三高藥物清單，提醒病患 Warfarin 需注意交互作用。', timestamp: '2023-11-23 16:45' },
        { id: '4', sender: '陳營養', role: 'Nutritionist', dept: DepartmentRole.Nutritionist, content: '已提供低鈉低脂飲食建議。', timestamp: '2023-11-24 09:15' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const currentRiskScore = patient.riskScore;

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

    // Only filtering logic if needed, currently showing all in one flow
    const filteredMessages = messages;

    const handlePublish = () => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("✅ 出院準備計畫已發布！\n\n- 家屬 App 通知: 已發送\n- 居家護理機構: 已同步\n- 健保申報系統: 待傳送 (Queue)");
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative font-sans">
            {/* EMR Modal Overlay (Keep existing logic) */}
            {showEmr && (
                <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-8">
                    {/* ... keep internal modal content same or simplified for brevity in this replace ... */}
                    <div className="bg-white w-full max-w-4xl h-full max-h-[80vh] rounded-2xl shadow-2xl flex flex-col p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">電子病歷調閱</h3>
                            <button onClick={() => setShowEmr(false)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-50 p-4 rounded-xl">
                            <p className="text-center text-slate-400 py-10">HIS 資料載入中...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Inpatient</span>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">個案準備進度詳情</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mt-1">
                            <span>患者：{patient.name} (ID: {patient.id})</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>病房：{patient.bed}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>預計出院日：{patient.expectedDischargeDate}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowEmr(true)}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition flex items-center gap-2"
                    >
                        <i className="fas fa-pen"></i> 編輯個案資料
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-share-nodes"></i>}
                        {loading ? '發送中...' : '發送轉介單'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-6 grid grid-cols-12 gap-6">
                {/* Left Column: Milestones & Risk Alert */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                    {/* Timeline Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <i className="fas fa-chart-gantt text-slate-400"></i> 轉介里程碑
                        </h3>
                        <div className="relative pl-2 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-0.5 before:bg-slate-100">
                            {[
                                { title: '社工評估完成', user: '林社工', date: '2023-10-20 14:00', status: 'DONE', color: 'green' },
                                { title: '長照申請', user: '陳個管師', date: '進行中 (預計 11/15)', status: 'PROCESS', color: 'amber' },
                                { title: '衛教指導', user: '張護理師', date: '待處理', status: 'QUEUE', color: 'slate' },
                                { title: '結案出院', user: '預計', date: patient.expectedDischargeDate, status: 'FUTURE', color: 'slate' }
                            ].map((item, i) => (
                                <div key={i} className="relative pl-10">
                                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${item.status === 'DONE' ? 'bg-teal-500 text-white' : item.status === 'PROCESS' ? 'bg-white border-teal-500 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <i className={`fas ${item.status === 'DONE' ? 'fa-check' : item.status === 'PROCESS' ? 'fa-hourglass-half' : item.status === 'FUTURE' ? 'fa-flag' : 'fa-clock'}`}></i>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{item.title}</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">負責人: {item.user}</p>
                                            <p className="text-[10px] text-slate-400">{item.date}</p>
                                        </div>
                                        {item.status !== 'FUTURE' && (
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${item.status === 'DONE' ? 'bg-teal-50 text-teal-600 border-teal-100' : item.status === 'PROCESS' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    // ... inside Left Column ...
                    {/* Discharge Placement Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <i className="fas fa-map-signs text-sky-500"></i> 安置方向評估
                            </h3>
                            <button onClick={() => setIsEditingPlacement(!isEditingPlacement)} className="text-xs text-slate-400 hover:text-sky-600">
                                <i className="fas fa-edit"></i> {isEditingPlacement ? '取消' : '編輯'}
                            </button>
                        </div>

                        {isEditingPlacement ? (
                            <DischargePlacementForm initialData={placementData} onSave={handleSavePlacement} />
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm">
                                        {{
                                            Home: '返家照護',
                                            RCW: '呼吸照護 (RCW)',
                                            HomeHospice: '居家安寧',
                                            Facility: '機構安置',
                                            Transfer: '轉院'
                                        }[placementData?.type || 'Home']}
                                    </span>
                                    {placementData?.type === 'Home' && (
                                        <div className="flex gap-1">
                                            {placementData.homeCare?.caregiver && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{
                                                { Family: '家人', PrivateNurse: '自費看護', ForeignCaregiver: '外籍看護', Other: '其他' }[placementData.homeCare.caregiver]
                                            }</span>}
                                            {placementData.homeCare?.transport && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{
                                                { Self: '自行', AccessibleCar: '無障礙', Ambulance: '救護車' }[placementData.homeCare.transport]
                                            }</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {placementData?.type === 'Home' ? (
                                        <ul className="space-y-1">
                                            <li>• 輔具: {placementData.homeCare?.medicalDevices.length ? placementData.homeCare.medicalDevices.join(', ') : '無'}</li>
                                            <li>• 管路: {placementData.homeCare?.tubeCare === 'HomeNursing' ? '轉介居護' : '門診更換'}</li>
                                        </ul>
                                    ) : placementData?.type === 'Facility' ? (
                                        <ul className="space-y-1">
                                            <li>• 類型: {placementData.facility?.type === 'NursingHome' ? '護理之家' : '養護中心'}</li>
                                            <li>• 狀態: {placementData.facility?.status}</li>
                                            <li>• 單位: {placementData.facility?.name || '尚未指定'}</li>
                                        </ul>
                                    ) : (
                                        <p>單位: {placementData?.rcwUnitName || placementData?.homeHospiceUnitName || placementData?.transfer?.name || '未指定'}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Risk Alert (Moved to bottom left) */}
                    <div className={`p-5 rounded-2xl border-l-4 shadow-sm ${currentRiskScore >= 70 ? 'bg-red-50 border-red-500' : 'bg-teal-50 border-teal-500'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${currentRiskScore >= 70 ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>
                                <i className="fas fa-triangle-exclamation text-xl"></i>
                            </div>
                            <div>
                                <h4 className={`font-black text-sm mb-1 ${currentRiskScore >= 70 ? 'text-red-800' : 'text-teal-800'}`}>
                                    AI 出院風險預警
                                </h4>
                                <p className={`text-lg font-black mb-1 ${currentRiskScore >= 70 ? 'text-red-600' : 'text-teal-600'}`}>
                                    {currentRiskScore >= 70 ? '高度再入院風險' : '中低度再入院風險'}
                                </p>
                                <p className={`text-xs leading-relaxed ${currentRiskScore >= 70 ? 'text-red-700' : 'text-teal-700'}`}>
                                    建議加強居家照護者與患者的防跌衛教指導。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Column: Team Communication */}
                <div className="col-span-12 lg:col-span-9 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                            <i className="fas fa-comments text-teal-600"></i> 跨團隊溝通區
                        </h3>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    <i className="fas fa-user"></i>
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">+4</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {filteredMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.sender === '你' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm overflow-hidden ${msg.sender === '你' ? 'bg-teal-600' : 'bg-indigo-500'}`}>
                                    {msg.sender === '你' ? <i className="fas fa-user-nurse"></i> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`} alt="avatar" />}
                                </div>
                                <div className={`max-w-[85%] ${msg.sender === '你' ? 'items-end' : ''}`}>
                                    <div className={`flex items-baseline gap-2 mb-1 ${msg.sender === '你' ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-sm font-bold text-slate-800">{msg.sender}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${msg.sender === '你' ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}>{msg.role}</span>
                                        <span className="text-[10px] text-slate-400">{msg.timestamp.split(' ')[1]}</span>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === '你' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="輸入小組溝通內容..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-24 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            />
                            <div className="absolute right-2 top-2 flex gap-1">
                                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                    <i className="fas fa-paperclip"></i>
                                </button>
                                <button onClick={sendMessage} className="w-8 h-8 flex items-center justify-center bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md">
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
