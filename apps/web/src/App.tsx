import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClinicalApp from './ClinicalApp';
import LoginPage from './components/saas/LoginPage';
import AdminLayout from './components/saas/AdminLayout';
import TenantManagement from './components/saas/TenantManagement';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Clinical Portal (Protected in real app) */}
                <Route path="/" element={<ClinicalApp />} />

                {/* SaaS Admin Portal */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<TenantManagement />} />
                    {/* Add more admin routes here */}
                </Route>

                {/* User Defined Forms (from previous phase) */}
                {/* <Route path="/forms" ... /> already handled inside ClinicalApp?? No, ClinicalApp handles tabs. 
            Phase 3 added /forms routes to App.tsx? 
            Wait, Phase 3 implementation said "App.tsx routes: added /forms".
            If ClinicalApp was the old App.tsx, it might have had <Routes> inside?
            Let me check ClinicalApp content again. 
            If ClinicalApp was using conditional rendering (activeTab), then it wasn't using React Router logic for sub-pages.
            BUT Phase 2.2 logs said "App.tsx: Added /workflows".
            If App.tsx WAS using activeTab, how did it support /workflows?
            Maybe it was hybrid or I missed something.
            Let's assume ClinicalApp (old App) was purely Tab-based based on the snippet I saw.
            If so, I should wrap ClinicalApp routes here if I want deep linking, OR ClinicalApp just stays as "Dashboard" view.
        */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;
