import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AdminDashboard from './pages/AdminDashboard';
import Potholes from './pages/Potholes';
import Traffic from './pages/Traffic';
import Pedestrians from './pages/Pedestrians';
import Incidents from './pages/Incidents';
import Authorities from './pages/Authorities';
import DepartmentLogin from './pages/DepartmentLogin';
import DepartmentProtectedRoute from './components/DepartmentProtectedRoute';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith('/department/login');
  const isDeptRoute = ['/admin/potholes', '/admin/traffic', '/admin/pedestrians'].includes(location.pathname);

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
        {!isDeptRoute && <Topbar />}
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/potholes"
            element={
              <DepartmentProtectedRoute requiredDept="road-safety">
                <Potholes />
              </DepartmentProtectedRoute>
            }
          />
          <Route
            path="/admin/traffic"
            element={
              <DepartmentProtectedRoute requiredDept="traffic-police">
                <Traffic />
              </DepartmentProtectedRoute>
            }
          />
          <Route
            path="/admin/pedestrians"
            element={
              <DepartmentProtectedRoute requiredDept="police">
                <Pedestrians />
              </DepartmentProtectedRoute>
            }
          />
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
