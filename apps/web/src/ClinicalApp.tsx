
import React, { useState } from 'react';
import Dashboard from './components/template/Dashboard';
import CaseDetail from './components/template/CaseDetail';
import DischargePlanningHub from './components/template/DischargePlanningHub';
import FollowUpTracking from './components/template/FollowUpTracking';
import WardTeamHub from './components/template/WardTeamHub';
import DataAnalytics from './components/template/DataAnalytics';
import PatientPortal from './components/template/PatientPortal';
import ClaimsDashboard from './pages/clinical/ClaimsDashboard';
import ClinicalMonitor from './pages/clinical/ClinicalMonitor';
import PhysicianDashboard from './pages/clinical/PhysicianDashboard';
import NewCaseModal from './components/template/NewCaseModal';
import { initialPatients } from './data/mockData';
import { type Patient } from './types/template';

const ClinicalApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  // When patient is selected from dashboard, we might want to go to Detail or Planning
  const handleSelectPatient = (p: Patient) => {
    setCurrentPatient(p);
    setActiveTab('detail');
  };

  const handleCreateCase = (newPatient: Patient) => {
    setPatients([...patients, newPatient]);
    setShowNewCaseModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard patients={patients} onSelectPatient={handleSelectPatient} onOpenNewCase={() => setShowNewCaseModal(true)} />;
      case 'detail':
        return currentPatient ?
          <CaseDetail patient={currentPatient} onBack={() => setActiveTab('dashboard')} /> :
          <Dashboard patients={patients} onSelectPatient={handleSelectPatient} onOpenNewCase={() => setShowNewCaseModal(true)} />;
      case 'planning':
        return <DischargePlanningHub patients={patients} />;
      case 'team':
        return <WardTeamHub patients={patients} />;
      case 'followup':
        return <FollowUpTracking patients={patients} />;
      case 'analytics':
        return <DataAnalytics />;
      case 'portal':
        return currentPatient ?
          <PatientPortal patient={currentPatient} /> :
          <div className="flex h-full items-center justify-center text-slate-400">請先選擇一位個案以預覽家屬端畫面</div>;
      case 'claims':
        return <ClaimsDashboard />;
      case 'monitor':
        return <ClinicalMonitor />;
      case 'workspace':
        return <PhysicianDashboard />;
      default:
        return <Dashboard patients={patients} onSelectPatient={handleSelectPatient} onOpenNewCase={() => setShowNewCaseModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className={`bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${activeTab === 'portal' ? 'w-0 overflow-hidden' : (isCollapsed ? 'w-20' : 'w-64')}`}>
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                <span className="text-xl text-sky-500"><i className="fas fa-hospital-user"></i></span>
                <span className="truncate">Care 360</span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold truncate">Smart Care Transition</p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <span className="text-2xl text-sky-500"><i className="fas fa-hospital-user"></i></span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-slate-400 hover:text-white transition ${isCollapsed ? 'absolute -right-3 top-6 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center border border-slate-600 shadow-lg' : ''}`}
          >
            <i className={`fas ${isCollapsed ? 'fa-chevron-right text-xs' : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: '總覽儀表板', icon: 'fa-chart-pie' },
            { id: 'workspace', label: '醫師決策 (Workspace)', icon: 'fa-user-md' },
            { id: 'detail', label: '個案進度詳情', icon: 'fa-file-medical-alt' },
            { id: 'team', label: '病房協作平台', icon: 'fa-user-nurse' },
            { id: 'planning', label: '出院計畫擬定', icon: 'fa-clipboard-list' },
            { id: 'followup', label: '追蹤與再入院', icon: 'fa-phone' },
            { id: 'analytics', label: '數據決策中心', icon: 'fa-chart-line' },
            { id: 'claims', label: '申報作業 (Claims)', icon: 'fa-file-invoice' },
            { id: 'monitor', label: '臨床監測 (Monitor)', icon: 'fa-heartbeat' },
            { id: 'portal', label: '家屬端預覽', icon: 'fa-mobile' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${activeTab === item.id ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${isCollapsed ? 'justify-center' : 'gap-3'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                <i className={`fas ${item.icon} text-sm`}></i>
              </div>
              {!isCollapsed && <span className="text-xs font-bold tracking-wide truncate">{item.label}</span>}
              {activeTab === item.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-sky-400"></div>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`bg-slate-800 rounded-xl p-3 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                RN
              </div>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">陳護理長</p>
                <p className="text-[10px] text-slate-400 truncate">7A 病房</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 p-6 overflow-x-hidden transition-all duration-300 ${activeTab === 'portal' ? 'ml-0' : (isCollapsed ? 'ml-20' : 'ml-64')}`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      {showNewCaseModal && (
        <NewCaseModal onClose={() => setShowNewCaseModal(false)} onSubmit={handleCreateCase} />
      )}
    </div>
  );
};

export default ClinicalApp;
