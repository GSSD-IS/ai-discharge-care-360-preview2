
import React, { useState, useEffect } from 'react';
import { Patient, Message, DepartmentRole } from '../types';
import { generateDischargeSummary } from '../services/geminiService';
import RiskRadar from './RiskRadar';

interface CaseDetailProps {
  patient: Patient;
  onBack: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ patient, onBack }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | DepartmentRole>(DepartmentRole.Nurse);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: '蔡社工', role: 'Social Worker', dept: DepartmentRole.SocialWorker, content: '患者家屬表示希望申請輔具，已聯繫長照中心。', timestamp: '2023-11-23 14:20' },
    { id: '2', sender: '你', role: 'Nurse', dept: DepartmentRole.Nurse, content: '收到。目前個案安全用藥教育已開始，重點放在減少跌倒風險。', timestamp: '2023-11-23 15:10' },
    { id: '3', sender: '王藥師', role: 'Pharmacist', dept: DepartmentRole.Pharmacist, content: '已核對三高藥物清單，提醒病患 Warfarin 需注意交互作用。', timestamp: '2023-11-23 16:45' },
    { id: '4', sender: '陳營養', role: 'Nutritionist', dept: DepartmentRole.Nutritionist, content: '已提供低鈉低脂飲食建議。', timestamp: '2023-11-24 09:15' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const riskData = [
    { subject: '高齡', A: patient.age > 75 ? 90 : 40, fullMark: 100 },
    { subject: '失能', A: patient.adl < 50 ? 80 : 20, fullMark: 100 },
    { subject: '共病', A: patient.cci * 10, fullMark: 100 },
    { subject: '社會支持', A: 50, fullMark: 100 },
    { subject: '認知功能', A: 30, fullMark: 100 },
  ];

  const handleGenerateSummary = async () => {
    setLoading(true);
    const summary = await generateDischargeSummary(patient);
    setAiSummary(summary);
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

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
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
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition uppercase tracking-wider">
            <i className="fas fa-file-medical mr-2 text-slate-300"></i>病歷調閱
          </button>
          <button className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition shadow-lg shadow-sky-600/20 uppercase tracking-wider">
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
            <div className={`p-3 rounded-xl flex items-center gap-3 mb-6 border ${patient.riskScore >= 70 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
              <i className={`fas ${patient.riskScore >= 70 ? 'fa-exclamation-triangle' : 'fa-shield-check'}`}></i>
              <span className="text-xs font-black uppercase">風險評分: {patient.riskScore}分</span>
            </div>
            <RiskRadar data={riskData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
