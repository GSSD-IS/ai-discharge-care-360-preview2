
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

  // Role-Based Access Control
  const [userRole, setUserRole] = useState<'Doctor' | 'Nurse'>('Doctor');

  const currentUser = userRole === 'Doctor' ? {
    name: '林醫師',
    title: '主治醫師',
    dept: '心臟內科',
    avatarColor: 'from-emerald-400 to-teal-500',
    initials: 'DR'
  } : {
    name: '陳護理長',
    title: '護理長',
    dept: '7A 病房',
    avatarColor: 'from-sky-400 to-indigo-500',
    initials: 'RN'
  };

  const navItems = [
    { id: 'dashboard', label: '總覽儀表板', icon: 'fa-chart-pie', roles: ['Doctor', 'Nurse'] },
    { id: 'workspace', label: '醫師決策 (Workspace)', icon: 'fa-user-md', roles: ['Doctor'] },
    { id: 'detail', label: '個案進度詳情', icon: 'fa-file-medical-alt', roles: ['Doctor', 'Nurse'] },
    { id: 'team', label: '病房協作平台', icon: 'fa-user-nurse', roles: ['Doctor', 'Nurse'] },
    { id: 'planning', label: '出院計畫擬定', icon: 'fa-clipboard-list', roles: ['Doctor', 'Nurse'] },
    { id: 'followup', label: '追蹤與再入院', icon: 'fa-phone', roles: ['Doctor', 'Nurse'] },
    { id: 'analytics', label: '數據決策中心', icon: 'fa-chart-line', roles: ['Doctor', 'Nurse'] },
    { id: 'claims', label: '申報作業 (Claims)', icon: 'fa-file-invoice', roles: ['Doctor'] },
    { id: 'monitor', label: '臨床監測 (Monitor)', icon: 'fa-heartbeat', roles: ['Doctor', 'Nurse'] },
    { id: 'portal', label: '家屬端預覽', icon: 'fa-mobile', roles: ['Doctor', 'Nurse'] }
  ];

  // When patient is selected from dashboard, we might want to go to Detail or Planning
  const handleSelectPatient = (p: Patient) => {
    setCurrentPatient(p);
    setActiveTab('detail');
  };

  const handleCreateCase = (newPatient: Patient) => {
    setPatients([...patients, newPatient]);
    setShowNewCaseModal(false);
  };

  const toggleRole = () => {
    const newRole = userRole === 'Doctor' ? 'Nurse' : 'Doctor';
    setUserRole(newRole);
    // Reset to dashboard if current tab is restricted
    const currentItem = navItems.find(i => i.id === activeTab);
    if (currentItem && !currentItem.roles.includes(newRole)) {
      setActiveTab('dashboard');
    }
  };

  const renderContent = () => {
    // Basic Permission Check
    const currentItem = navItems.find(i => i.id === activeTab);
    if (currentItem && !currentItem.roles.includes(userRole)) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-slate-400">
          <i className="fas fa-lock text-4xl mb-4"></i>
          <p className="text-lg font-bold">權限不足</p>
          <p className="text-sm">您的角色 ({currentUser.title}) 無法存取此頁面。</p>
          <button onClick={() => setActiveTab('dashboard')} className="mt-4 text-sky-600 hover:underline">返回儀表板</button>
        </div>
      );
    }

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
      <aside className={`bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
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
          {navItems.filter(item => item.roles.includes(userRole)).map(item => (
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
          <div className="flex flex-col gap-2">
            {!isCollapsed && (
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Current Role</span>
                <button onClick={toggleRole} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-sky-400 px-2 py-0.5 rounded border border-slate-700 transition">
                  Switch to {userRole === 'Doctor' ? 'Nurse' : 'Doctor'}
                </button>
              </div>
            )}
            <div onClick={toggleRole} className={`bg-slate-800 rounded-xl p-3 flex items-center cursor-pointer hover:bg-slate-700 transition ${isCollapsed ? 'justify-center' : 'gap-3'}`} title="Click to switch role">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} p-0.5 flex-shrink-0`}>
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {currentUser.initials}
                </div>
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.dept} | {currentUser.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 p-6 overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Top Bar for Role Indication (Optional, helps users know who they are) */}
          <div className="flex justify-end mb-4">
            <div className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-bold text-slate-600">Logged in as: {currentUser.name} ({userRole})</span>
            </div>
          </div>
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
