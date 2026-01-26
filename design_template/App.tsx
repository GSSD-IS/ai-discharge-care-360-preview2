
import React, { useState } from 'react';
import { Patient, CaseStatus, DischargeType, DepartmentRole } from './types';
import Dashboard from './components/Dashboard';
import CaseDetail from './components/CaseDetail';
import PatientPortal from './components/PatientPortal';
import DischargePlanningHub from './components/DischargePlanningHub';
import DataAnalytics from './components/DataAnalytics';
import FollowUpTracking from './components/FollowUpTracking';
import NewCaseModal from './components/NewCaseModal';

const initialPatients: Patient[] = [
  {
    id: 'ID: 8821',
    name: '張曉明',
    age: 78,
    gender: 'Male',
    department: '胸腔內科',
    bed: '702-1',
    riskScore: 85,
    status: CaseStatus.Preparing,
    admissionDate: '2023-11-15',
    expectedDischargeDate: '2023-11-25',
    cci: 8,
    adl: 35,
    dischargeType: DischargeType.Home,
    preAdmissionResources: ['長照 2.0', '居家護理'],
    primaryCaregiver: '張太太',
    primaryContact: '張兒子',
    prepItems: [
      { label: '照顧人力', status: '聘請外籍看護中', isCompleted: false },
      { label: '輔具準備', status: '準備中', isCompleted: false },
      { label: '管路照護', status: '預轉介居家護理所', isCompleted: false },
      { label: '出院交通', status: '已預約救護車', isCompleted: true }
    ],
    assessments: [
      { role: DepartmentRole.Nurse, status: '已完成', lastNote: '衛教進度良好，傷口癒合佳。', updatedAt: '2023-11-23' },
      { role: DepartmentRole.SocialWorker, status: '評估中', lastNote: '家屬申請長照 2.0 補助中，文件補件。', updatedAt: '2023-11-24' },
      { role: DepartmentRole.Nutritionist, status: '已完成', lastNote: '術後高纖飲食指導完成。', updatedAt: '2023-11-22' },
      { role: DepartmentRole.Physiotherapist, status: '待評估', lastNote: '尚未進行床邊復健。', updatedAt: '2023-11-20' },
      { role: DepartmentRole.Pharmacist, status: '已完成', lastNote: '三高用藥交互作用核對完畢。', updatedAt: '2023-11-23' }
    ]
  },
  {
    id: 'ID: 8822',
    name: '林大同',
    age: 65,
    gender: 'Male',
    department: '心臟內科',
    bed: '705-2',
    riskScore: 45,
    status: CaseStatus.FollowUp,
    admissionDate: '2023-11-10',
    expectedDischargeDate: '2023-11-20',
    cci: 4,
    adl: 75,
    dischargeType: DischargeType.CareHome,
    preAdmissionResources: ['社會局社工收案'],
    primaryCaregiver: '配偶',
    primaryContact: '配偶',
    prepItems: [
      { label: '機構尋找', status: '尋找床位中', isCompleted: false },
      { label: '體檢項目', status: '待完成體檢', isCompleted: false }
    ],
    assessments: [
      { role: DepartmentRole.SocialWorker, status: '已完成', lastNote: '已協調安置於幸福養護之家。', updatedAt: '2023-11-19' }
    ]
  }
];

type ViewState = 'Dashboard' | 'CaseDetail' | 'PatientPortal' | 'PlanningHub' | 'DataAnalysis' | 'FollowUp';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('Dashboard');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setView('CaseDetail');
  };

  const handleAddNewCase = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
    setIsNewCaseModalOpen(false);
  };

  const renderContent = () => {
    switch (view) {
      case 'Dashboard':
        return <Dashboard 
          patients={patients} 
          onSelectPatient={handleSelectPatient} 
          onOpenNewCase={() => setIsNewCaseModalOpen(true)} 
        />;
      case 'CaseDetail':
        return selectedPatient ? (
          <CaseDetail patient={selectedPatient} onBack={() => setView('Dashboard')} />
        ) : <Dashboard patients={patients} onSelectPatient={handleSelectPatient} onOpenNewCase={() => setIsNewCaseModalOpen(true)} />;
      case 'PatientPortal':
        return <PatientPortal patient={patients[0]} />;
      case 'PlanningHub':
        return <DischargePlanningHub patients={patients} />;
      case 'DataAnalysis':
        return <DataAnalytics />;
      case 'FollowUp':
        return <FollowUpTracking patients={patients} />;
      default:
        return <Dashboard patients={patients} onSelectPatient={handleSelectPatient} onOpenNewCase={() => setIsNewCaseModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <nav className="w-20 lg:w-64 bg-slate-900 flex flex-col py-6 border-r border-slate-800 shrink-0">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <i className="fas fa-heart-pulse text-xl"></i>
          </div>
          <h1 className="hidden lg:block font-black text-xl text-white tracking-tight">AI Care 360</h1>
        </div>

        <div className="flex-1 space-y-1 px-3">
          <button 
            onClick={() => setView('Dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'Dashboard' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <i className="fas fa-columns w-5 text-center"></i>
            <span className="hidden lg:block font-medium">醫護儀表板</span>
          </button>
          <button 
            onClick={() => setView('PlanningHub')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'PlanningHub' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <i className="fas fa-file-medical-alt w-5 text-center"></i>
            <span className="hidden lg:block font-medium">建立出院準備計畫</span>
          </button>
          <button 
            onClick={() => setView('FollowUp')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'FollowUp' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <i className="fas fa-phone-volume w-5 text-center"></i>
            <span className="hidden lg:block font-medium">電訪追蹤追蹤</span>
          </button>
          <button 
            onClick={() => setView('PatientPortal')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'PatientPortal' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <i className="fas fa-user-graduate w-5 text-center"></i>
            <span className="hidden lg:block font-medium">病患衛教門戶</span>
          </button>
          <button 
            onClick={() => setView('DataAnalysis')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'DataAnalysis' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <i className="fas fa-chart-line w-5 text-center"></i>
            <span className="hidden lg:block font-medium">數據分析中心</span>
          </button>
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
        <div className="flex-1 overflow-auto bg-slate-50">
          {renderContent()}
        </div>
      </main>

      {isNewCaseModalOpen && (
        <NewCaseModal 
          onClose={() => setIsNewCaseModalOpen(false)} 
          onSubmit={handleAddNewCase} 
        />
      )}
    </div>
  );
};

export default App;
