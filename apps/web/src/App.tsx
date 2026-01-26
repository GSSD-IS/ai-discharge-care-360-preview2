import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClinicalApp from './ClinicalApp';
import LoginPage from './components/saas/LoginPage';
import AdminLayout from './components/saas/AdminLayout';
import AdminDashboard from './components/saas/AdminDashboard';
import { TenantManagementPage } from './pages/admin/TenantManagementPage';
import { UserRole } from './types/saas';

// Mock Auth Guard
const RequireAuth: React.FC<{ children: React.ReactNode, allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role if unauthorized for this route
        return <Navigate to={user.role === UserRole.SuperAdmin ? '/admin' : '/clinical'} replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Root Redirect Logic */}
                <Route path="/" element={<RequireAuth allowedRoles={[]}><div /></RequireAuth>} />
                {/* The above is a trick. Better logic: */}
                <Route path="/" element={
                    localStorage.getItem('currentUser')
                        ? (JSON.parse(localStorage.getItem('currentUser')!).role === UserRole.SuperAdmin ? <Navigate to="/admin" /> : <Navigate to="/clinical" />)
                        : <Navigate to="/login" />
                } />

                {/* Clinical Portal (Nurses, Doctors) */}
                <Route path="/clinical/*" element={
                    <RequireAuth allowedRoles={[UserRole.Nurse, UserRole.Doctor, UserRole.SocialWorker, UserRole.TenantAdmin]}>
                        <ClinicalApp />
                    </RequireAuth>
                } />

                {/* SaaS Admin Portal (SuperAdmin) */}
                <Route path="/admin" element={
                    <RequireAuth allowedRoles={[UserRole.SuperAdmin]}>
                        <AdminLayout />
                    </RequireAuth>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="tenants" element={<TenantManagementPage />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default App;
