import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AdminDashboard from './pages/AdminDashboard';
import DepartmentPortal from './pages/DepartmentPortal';
import Incidents from './pages/Incidents';
import Authorities from './pages/Authorities';
import DepartmentLogin from './pages/DepartmentLogin';

import DepartmentTopbar from './components/DepartmentTopbar';
import { DEPARTMENTS } from './context/AuthContext';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith('/department/login');

  // Match /department/:deptId or /admin/department/:deptId
  const deptMatch = location.pathname.match(/\/(?:admin\/)?department\/([^/?#]+)/);
  const currentDept = deptMatch ? DEPARTMENTS[deptMatch[1]] : null;

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/department/login" element={<DepartmentLogin />} />
        <Route path="*" element={<Navigate to="/department/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {currentDept ? <DepartmentTopbar department={currentDept} /> : <Topbar />}
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 9 Road Department Portals */}
          <Route path="/admin/department/:deptId" element={<DepartmentPortal />} />
          <Route path="/department/:deptId" element={<DepartmentPortal />} />

          {/* Legacy redirects */}
          <Route path="/admin/potholes" element={<Navigate to="/admin/department/national-highways" replace />} />
          <Route path="/admin/traffic" element={<Navigate to="/admin/department/expressways" replace />} />
          <Route path="/admin/pedestrians" element={<Navigate to="/admin/department/city-municipal-roads" replace />} />

          <Route path="/admin/incidents" element={<Incidents />} />
          <Route path="/admin/authorities" element={<Authorities />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
