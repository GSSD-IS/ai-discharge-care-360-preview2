
import React, { useState, useEffect } from 'react';
import { Patient, FollowUpRecord } from '../types';
import { generateFollowUpQuestions, generateFollowUpNarrative } from '../services/geminiService';

interface FollowUpTrackingProps {
  patients: Patient[];
}

const FollowUpTracking: React.FC<FollowUpTrackingProps> = ({ patients }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [activePatient, setActivePatient] = useState<Patient | undefined>(patients[0]);
  const [loadingHIS, setLoadingHIS] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [record, setRecord] = useState<Partial<FollowUpRecord>>({
    callDate: new Date().toISOString().split('T')[0],
    responder: '',
    qa: [],
    summaryNote: ''
  });

  const [hisVisit, setHisVisit] = useState<FollowUpRecord['recentVisit'] | null>(null);

  useEffect(() => {
    const p = patients.find(p => p.id === selectedPatientId);
    setActivePatient(p);
    setRecord({
      patientId: selectedPatientId,
      callDate: new Date().toISOString().split('T')[0],
      responder: p?.primaryContact || '',
      qa: [],
      summaryNote: ''
    });
    setHisVisit(null);
  }, [selectedPatientId, patients]);

  const fetchRecentVisit = () => {
    setLoadingHIS(true);
    // Mocking HIS fetch
    setTimeout(() => {
      const mockVisits: FollowUpRecord['recentVisit'][] = [
        { type: 'ER', date: '2023-11-28', details: '因呼吸急促急診留觀，診斷為疑似肺炎，已給予抗生素治療。' },
        { type: 'OPD', date: '2023-11-26', details: '胸腔內科門診回診，藥物調整，醫囑續觀。' }
      ];
      setHisVisit(mockVisits[Math.floor(Math.random() * mockVisits.length)]);
      setLoadingHIS(false);
    }, 1200);
  };

  const generateQuestions = async () => {
    if (!activePatient) return;
    setLoadingAI(true);
    const questions = await generateFollowUpQuestions(activePatient);
    setRecord(prev => ({
      ...prev,
      qa: questions.map((q: string) => ({ question: q, answer: '是', details: '' }))
    }));
    setLoadingAI(false);
  };

  const updateQA = (index: number, field: 'answer' | 'details', value: string) => {
    const newQa = [...(record.qa || [])];
    newQa[index] = { ...newQa[index], [field]: value };
    setRecord({ ...record, qa: newQa });
  };

  const finalizeNote = async () => {
    setLoadingAI(true);
    const narrative = await generateFollowUpNarrative({
      patientName: activePatient?.name,
      callDate: record.callDate,
      responder: record.responder,
      recentVisit: hisVisit,
      qa: record.qa
    });
    setRecord(prev => ({ ...prev, summaryNote: narrative }));
    setLoadingAI(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">電訪追蹤追蹤紀錄系統</h2>
          <p className="text-sm text-slate-500 font-medium">個案出院後追蹤與再入院風險監控</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">選取個案:</label>
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-sky-600 outline-none focus:ring-2 focus:ring-sky-500"
          >
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Patient Base Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">個案追蹤基礎資料</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400">安置方向</span>
                <span className="text-xs font-black text-sky-600">{activePatient?.dischargeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400">主要照顧者</span>
                <input 
                  value={activePatient?.primaryCaregiver || ''}
                  className="text-xs font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-200 focus:border-sky-500 outline-none text-right"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400">主要聯絡人</span>
                <input 
                  value={record.responder || ''}
                  onChange={(e) => setRecord({...record, responder: e.target.value})}
                  className="text-xs font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-200 focus:border-sky-500 outline-none text-right"
                />
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-50">
              <button 
                onClick={fetchRecentVisit}
                disabled={loadingHIS}
                className="w-full py-3 bg-sky-50 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-100 transition flex items-center justify-center gap-2"
              >
                {loadingHIS ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-sync-alt"></i>}
                介接 HIS 最近醫療紀錄
              </button>
            </div>

            {hisVisit && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mt-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${hisVisit.type === 'ER' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'}`}>
                    {hisVisit.type === 'ER' ? '急診' : '門診'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">{hisVisit.date}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{hisVisit.details}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: QA & Narrative Note */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">電訪內容與 AI 建議問題</h3>
              <button 
                onClick={generateQuestions}
                disabled={loadingAI}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition"
              >
                {loadingAI ? <i className="fas fa-magic animate-pulse mr-2"></i> : <i className="fas fa-brain mr-2"></i>}
                依計畫生成問題
              </button>
            </div>

            <div className="space-y-4">
              {record.qa?.map((qa, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-700"><span className="text-sky-500 mr-2 font-black">Q{idx+1}</span>{qa.question}</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-2">
                      {['是', '否'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => updateQA(idx, 'answer', opt)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${qa.answer === opt ? 'bg-sky-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <input 
                      placeholder="詳述觀察情形..."
                      value={qa.details}
                      onChange={(e) => updateQA(idx, 'details', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
              ))}
              {(!record.qa || record.qa.length === 0) && (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl text-slate-300">
                   <i className="fas fa-phone-slash text-2xl mb-2 opacity-20"></i>
                   <p className="text-xs font-bold uppercase tracking-widest">尚未生成問題</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <i className="fas fa-pen-nib text-7xl"></i>
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <i className="fas fa-sparkles text-amber-400"></i> AI 敘述性追蹤紀錄
                </h3>
                <button 
                  onClick={finalizeNote}
                  disabled={loadingAI}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-sky-600/20"
                >
                  {loadingAI ? 'AI 彙整中...' : '自動生成紀錄'}
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl min-h-[150px] text-xs leading-relaxed text-slate-300 italic whitespace-pre-wrap">
                {record.summaryNote || "請完成問答後點擊自動生成紀錄..."}
              </div>

              {record.summaryNote && (
                <div className="mt-6 flex justify-end">
                   <button className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition">
                     確認並存檔
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpTracking;
