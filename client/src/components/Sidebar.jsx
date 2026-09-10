import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  Car,
  Users,
  ShieldCheck,
  FileText,
  Radio,
  Eye,
  Lock,
  CheckCircle2,
  Building2
} from 'lucide-react';

export default function Sidebar() {
  const { isDepartmentAuthenticated, activeDepartment } = useAuth();

  const isRoadSafetyAuth = isDepartmentAuthenticated('road-safety');
  const isTrafficAuth = isDepartmentAuthenticated('traffic-police');
  const isPoliceAuth = isDepartmentAuthenticated('police');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}
        >
          <Eye size={20} />
        </div>
        <div>
          <h1 className="sidebar-title">UrbanSight</h1>
          <p className="sidebar-subtitle">Authority Dispatch Admin</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-title">Core Command</span>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <span className="sidebar-section-title">Department Portals</span>

        {/* Road Safety: Potholes & Defects */}
        <NavLink
          to="/admin/potholes"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span>Potholes & Defects</span>
          </div>
          {isRoadSafetyAuth ? (
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}
            >
              ACTIVE
            </span>
          ) : (
            <span title="Department Login Required" style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              <Lock size={13} />
            </span>
          )}
        </NavLink>

        {/* Traffic Police: Traffic & Congestion */}
        <NavLink
          to="/admin/traffic"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Car size={18} color="#2563eb" />
            <span>Traffic & Congestion</span>
          </div>
          {isTrafficAuth ? (
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}
            >
              ACTIVE
            </span>
          ) : (
            <span title="Department Login Required" style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              <Lock size={13} />
            </span>
          )}
        </NavLink>

        {/* Police: Pedestrian Safety */}
        <NavLink
          to="/admin/pedestrians"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Users size={18} color="#16a34a" />
            <span>Pedestrian Safety</span>
          </div>
          {isPoliceAuth ? (
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}
            >
              ACTIVE
            </span>
          ) : (
            <span title="Department Login Required" style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              <Lock size={13} />
            </span>
          )}
        </NavLink>

        <span className="sidebar-section-title">Dispatch & Governance</span>
        <NavLink
          to="/admin/incidents"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>All Incidents</span>
        </NavLink>

        <NavLink
          to="/admin/authorities"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <ShieldCheck size={18} />
          <span>Authority Routing</span>
        </NavLink>

        {/* Quick Portal Switcher Link */}
        <NavLink
          to="/department/login"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ marginTop: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '6px' }}
        >
          <Building2 size={16} color="#475569" />
          <span style={{ fontSize: '0.78rem' }}>Official Gateway Login</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {activeDepartment ? (
          <div style={{ fontSize: '0.75rem', color: activeDepartment.color, fontWeight: 600 }}>
            Session: {activeDepartment.code} ({activeDepartment.name.split(' ')[0]})
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}>
            <Radio size={14} /> Fleet Sensor Mesh Active
          </div>
        )}
        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Transit Bus Corridor: Route 7</div>
      </div>
    </aside>
  );
}
