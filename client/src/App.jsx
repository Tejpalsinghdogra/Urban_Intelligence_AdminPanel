import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AdminDashboard from './pages/AdminDashboard';
import Potholes from './pages/Potholes';
import Traffic from './pages/Traffic';
import Pedestrians from './pages/Pedestrians';
import Incidents from './pages/Incidents';
import Authorities from './pages/Authorities';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/potholes" element={<Potholes />} />
            <Route path="/admin/traffic" element={<Traffic />} />
            <Route path="/admin/pedestrians" element={<Pedestrians />} />
            <Route path="/admin/incidents" element={<Incidents />} />
            <Route path="/admin/authorities" element={<Authorities />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
