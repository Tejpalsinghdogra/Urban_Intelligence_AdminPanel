import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DepartmentLoginModal from './DepartmentLoginModal';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Radio,
  Eye,
  Lock,
  Building2,
  Milestone,
  Compass,
  Truck,
  Layers,
  Trees,
  Zap,
  RotateCw,
  Split,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const ICON_MAP = {
  Milestone,
  Compass,
  Truck,
  Layers,
  Trees,
  Building2,
  Zap,
  RotateCw,
  Split
};

export default function Sidebar() {
  const { isDepartmentAuthenticated, activeDepartment, logoutDepartment, departments } = useAuth();
  const deptList = Object.values(departments || {});

  // Fixed width state (318px)
  const [width, setWidth] = useState(() => {
    try {
      localStorage.setItem('urbansight_sidebar_width', '318');
      return 318;
    } catch {
      return 318;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('urbansight_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isResizing, setIsResizing] = useState(false);
  const [deptSectionExpanded, setDeptSectionExpanded] = useState(true);
  const [loginModalDept, setLoginModalDept] = useState(null);

  const sidebarRef = useRef(null);

  // Sync CSS custom property on root
  useEffect(() => {
    const effectiveWidth = isCollapsed ? 72 : width;
    document.documentElement.style.setProperty('--sidebar-width', `${effectiveWidth}px`);
  }, [width, isCollapsed]);

  // Drag-to-resize listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth < 140) {
        setIsCollapsed(true);
        document.documentElement.style.setProperty('--sidebar-width', '72px');
      } else if (newWidth >= 180 && newWidth <= 480) {
        setIsCollapsed(false);
        setWidth(newWidth);
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.querySelector('.app-container')?.classList.remove('resizing');
        try {
          localStorage.setItem('urbansight_sidebar_width', width.toString());
          localStorage.setItem('urbansight_sidebar_collapsed', isCollapsed.toString());
        } catch { }
      }
    };

    if (isResizing) {
      document.querySelector('.app-container')?.classList.add('resizing');
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.querySelector('.app-container')?.classList.remove('resizing');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, width, isCollapsed]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('urbansight_sidebar_collapsed', next.toString());
    } catch { }
  };

  const handleResetWidth = () => {
    setWidth(318);
    setIsCollapsed(false);
    try {
      localStorage.setItem('urbansight_sidebar_width', '318');
      localStorage.setItem('urbansight_sidebar_collapsed', 'false');
    } catch { }
  };


  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        width: isCollapsed ? 72 : `${width}px`
      }}
    >
      {/* Draggable Resize Handle on right edge */}
      <div
        className={`sidebar-resizer ${isResizing ? 'active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        onDoubleClick={handleResetWidth}
        title="Drag horizontally to adjust sidebar width, or double-click to reset (270px)"
      />

      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
            }}
          >
            <img
              src="/logo.jpg"
              alt="UrbanSight Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          {!isCollapsed && (
            <h1 className="sidebar-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              UrbanSight
            </h1>
          )}
        </div>

        {/* Toggle Collapse/Expand Button */}
        <button
          onClick={toggleCollapse}
          className="sidebar-toggle-btn"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">
        {!isCollapsed && <span className="sidebar-section-title">ICCC Command</span>}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          title="ICCC Central Command Dashboard"
        >
          <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>ICCC Dashboard</span>}
        </NavLink>

        {/* Road Departments Section Header */}
        {!isCollapsed ? (
          <div
            onClick={() => setDeptSectionExpanded(!deptSectionExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginTop: '0.5rem',
              padding: '0.4rem 0.5rem 0.2rem 0.5rem'
            }}
          >
            <span className="sidebar-section-title" style={{ padding: 0, margin: 0 }}>
              Road Departments ({deptList.length})
            </span>
            <div style={{ color: '#64748b' }}>
              {deptSectionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          </div>
        ) : (
          <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '0.5rem 0' }} />
        )}

        {/* 9 Road Department Links */}
        {(deptSectionExpanded || isCollapsed) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {deptList.map((dept) => {
              const Icon = ICON_MAP[dept.icon] || Shield;
              const isAuth = isDepartmentAuthenticated(dept.id);

              return (
                <NavLink
                  key={dept.id}
                  to={dept.path}
                  onClick={(e) => {
                    if (!isAuth) {
                      e.preventDefault();
                      setLoginModalDept(dept);
                    }
                  }}
                  className={({ isActive }) => `sidebar-link ${isActive && isAuth ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '0.6rem 0' : '0.45rem 0.75rem',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  title={isAuth ? `${dept.name} (Active Session)` : `${dept.name} (Locked - Click to Sign In)`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden' }}>
                    <Icon size={16} color={dept.color} style={{ flexShrink: 0 }} />
                    {!isCollapsed && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {dept.shortName}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && (
                    isAuth ? (
                      <span
                        style={{
                          fontSize: '0.6rem',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        ACTIVE
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.6rem',
                          color: '#94a3b8',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          flexShrink: 0
                        }}
                      >
                        <Lock size={9} color="#94a3b8" />
                        <span>LOCK</span>
                      </span>
                    )
                  )}

                  {isCollapsed && !isAuth && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '8px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#f59e0b'
                      }}
                      title="Locked - Click to sign in"
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        )}

        {!isCollapsed && <span className="sidebar-section-title">Dispatch & Governance</span>}
        {isCollapsed && <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '0.5rem 0' }} />}

        <NavLink
          to="/admin/incidents"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          title="All Dispatched Incidents"
        >
          <FileText size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>All Incidents</span>}
        </NavLink>

        <NavLink
          to="/admin/authorities"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          title="Multi-Agency Authority Dispatch Engine"
        >
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Authority Engine</span>}
        </NavLink>

      </nav>

      {/* Active Session & Footer Info */}
      <div className="sidebar-footer">
        {activeDepartment ? (
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: isCollapsed ? '0.4rem 0.2rem' : '0.5rem 0.65rem',
              borderRadius: '6px',
              border: `1px solid ${activeDepartment.color}40`,
              textAlign: isCollapsed ? 'center' : 'left'
            }}
          >
            {!isCollapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: activeDepartment.color, fontWeight: 700 }}>
                    {activeDepartment.code}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {activeDepartment.officer}
                  </div>
                </div>
                <button
                  onClick={logoutDepartment}
                  title="Sign out of department session"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeDepartment.color, margin: '0 auto' }} title={activeDepartment.name} />
            )}
          </div>
        ) : (
          !isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600, fontSize: '0.72rem' }}>
              <Radio size={13} /> ICCC Sensor Mesh Online
            </div>
          )
        )}

        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>
            <span>9 Road Corridors Active</span>
            <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={handleResetWidth} title="Reset Width">
              {width}px
            </span>
          </div>
        )}
      </div>

      {/* Login Modal for locked road departments */}
      <DepartmentLoginModal
        department={loginModalDept}
        isOpen={Boolean(loginModalDept)}
        onClose={() => setLoginModalDept(null)}
      />
    </aside>
  );
}
