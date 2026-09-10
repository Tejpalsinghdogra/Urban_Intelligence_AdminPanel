import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Car,
  Users,
  TrafficCone,
  ShieldCheck,
  FileText,
  Radio,
  Eye
} from 'lucide-react';

export default function Sidebar() {
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

        <span className="sidebar-section-title">Intelligence Modules</span>
        <NavLink
          to="/admin/potholes"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <AlertTriangle size={18} />
          <span>Potholes & Defects</span>
        </NavLink>

        <NavLink
          to="/admin/traffic"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Car size={18} />
          <span>Traffic & Congestion</span>
        </NavLink>

        <NavLink
          to="/admin/pedestrians"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Pedestrian Safety</span>
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
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}>
          <Radio size={14} /> Fleet Sensor Mesh Active
        </div>
        <div>Transit Bus Corridor: Route 7</div>
      </div>
    </aside>
  );
}
