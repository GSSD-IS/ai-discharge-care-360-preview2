
import React, { useState } from 'react';
import { Patient, CaseStatus, DischargeType, DepartmentRole } from '../types';

interface NewCaseModalProps {
  onClose: () => void;
  onSubmit: (patient: Patient) => void;
}

const RESOURCE_OPTIONS = [
  '長照 2.0', '居家護理', '居家醫療', '物理治療', '輔具中心紀錄', '社會局補助紀錄', 'PAC 計畫', '呼吸 4 階'
];

const NewCaseModal: React.FC<NewCaseModalProps> = ({ onClose, onSubmit }) => {
  const [loadingHIS, setLoadingHIS] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    id: '',
    age: 0,
    gender: 'Male',
    department: '一般內科',
    bed: '',
    admissionDate: new Date().toISOString().split('T')[0],
    expectedDischargeDate: '',
    cci: 0,
    adl: 100,
    riskScore: 30,
    status: CaseStatus.Screening,
    dischargeType: DischargeType.Home,
    preAdmissionResources: [],
    prepItems: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleResource = (res: string) => {
    setFormData(prev => {
      const current = prev.preAdmissionResources || [];
      const next = current.includes(res) 
        ? current.filter(r => r !== res) 
        : [...current, res];
      return { ...prev, preAdmissionResources: next };
    });
  };

  const fetchFromHIS = () => {
    if (!formData.id) {
      alert("請輸入病歷號以查詢 HIS 系統");
      return;
    }
    setLoadingHIS(true);
    // Simulate API delay
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: '王小芬',
        age: 72,
        gender: 'Female',
        department: '神經內科',
        bed: '503-B',
        admissionDate: '2023-11-20',
        cci: 6,
        adl: 45,
        riskScore: 68,
        preAdmissionResources: ['長照 2.0', '居家醫療']
      }));
      setLoadingHIS(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.bed) {
      alert("請填寫所有必填欄位 (姓名、病歷號、床號)");
      return;
    }

    const fullPatient: Patient = {
      ...formData,
      id: `ID: ${formData.id}`,
      prepItems: [
        { label: '初步評估', status: '待處理', isCompleted: false },
        { label: '資源媒合', status: '自動規劃中', isCompleted: false }
      ],
      assessments: [
        { role: DepartmentRole.Nurse, status: '待評估', lastNote: '待收案', updatedAt: '-' }
      ]
    } as Patient;

    onSubmit(fullPatient);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
              <i className="fas fa-user-plus text-sky-400"></i> 新增個案收案
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Manual Entry & HIS Sync</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto space-y-8">
          {/* HIS Integration Section */}
          <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <i className="fas fa-network-wired text-6xl"></i>
            </div>
            <h3 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-4">介接醫院 HIS 系統</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                name="id"
                placeholder="輸入病歷號 (例如: 20455)"
                className="flex-1 bg-white border border-sky-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                value={formData.id}
                onChange={handleInputChange}
              />
              <button 
                type="button"
                onClick={fetchFromHIS}
                disabled={loadingHIS}
                className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition flex items-center gap-2"
              >
                {loadingHIS ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-sync"></i>}
                {loadingHIS ? '查詢中' : '同步資料'}
              </button>
            </div>
            <p className="text-[10px] text-sky-400 mt-2 font-medium italic">* 自動帶入基本資料、病史診斷、近期住院紀錄與已申請資源</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">基本資料與診斷</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">病患姓名</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">性別</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="Male">男性</option>
                    <option value="Female">女性</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">年齡</label>
                  <input 
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">床號</label>
                  <input 
                    name="bed"
                    placeholder="例如: 702-1"
                    value={formData.bed}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">主要診斷科別</label>
                <input 
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Discharge Planning */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">出院與資源規劃</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">入院日期</label>
                  <input 
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">預計出院</label>
                  <input 
                    type="date"
                    name="expectedDischargeDate"
                    value={formData.expectedDischargeDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">出院安置方向</label>
                <select 
                  name="dischargeType"
                  value={formData.dischargeType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-sky-600 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value={DischargeType.Home}>🏠 返家照護 (含居家服務)</option>
                  <option value={DischargeType.CareHome}>照護機構 (養護/長照)</option>
                  <option value={DischargeType.Transfer}>轉院/PAC (轉銜照護)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">ADL 分數</label>
                  <input 
                    type="number"
                    name="adl"
                    value={formData.adl}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">CCI 分數</label>
                  <input 
                    type="number"
                    name="cci"
                    value={formData.cci}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pre-admission Resources Checkboxes */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">住院前已使用/核定資源</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RESOURCE_OPTIONS.map(res => (
                <button
                  key={res}
                  type="button"
                  onClick={() => toggleResource(res)}
                  className={`px-3 py-2.5 rounded-xl text-[10px] font-black text-center transition-all border ${formData.preAdmissionResources?.includes(res) ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-sky-200'}`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition"
            >
              取消返回
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-xl shadow-slate-900/20"
            >
              確認並啟動出院準備流程
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCaseModal;
