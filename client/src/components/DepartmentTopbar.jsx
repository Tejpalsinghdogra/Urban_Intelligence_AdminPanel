import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, ArrowLeft, Radio, Building2 } from 'lucide-react';

export default function DepartmentTopbar({ department }) {
  const { logoutDepartment, activeDepartment } = useAuth();
  const navigate = useNavigate();

  const currentDept = department || activeDepartment;

  const handleLogout = () => {
    logoutDepartment();
    navigate('/admin');
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  if (!currentDept) return null;

  return (
    <header
      className="topbar"
      style={{
        borderBottom: `2px solid ${currentDept.color || '#2563eb'}`,
        backgroundColor: '#ffffff'
      }}
    >
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={handleBackToAdmin}
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.75rem',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          title="Return to Central Admin Command"
        >
          <ArrowLeft size={14} />
          <span>Central Admin</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: `${currentDept.color}15`,
              border: `1.5px solid ${currentDept.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentDept.color,
              fontWeight: 700
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  backgroundColor: currentDept.color,
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}
              >
                {currentDept.code}
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {currentDept.name} Portal
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {currentDept.division}
            </span>
          </div>
        </div>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Officer in Charge Profile */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            paddingRight: '0.75rem',
            borderRight: '1px solid #e2e8f0'
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
            {currentDept.officer}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {currentDept.designation}
          </span>
        </div>

        {/* Live Authority Link Indicator */}
        <div className="live-badge" style={{ backgroundColor: `${currentDept.color}15`, color: currentDept.color, borderColor: `${currentDept.color}40` }}>
          <span className="live-dot" style={{ backgroundColor: currentDept.color }}></span>
          <span style={{ fontWeight: 600 }}>SESSION ACTIVE</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn"
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fca5a5',
            padding: '0.4rem 0.8rem',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
          title="Sign out of department portal and return to Central Admin"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
