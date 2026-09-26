import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Building2,
  Milestone,
  Compass,
  Truck,
  Layers,
  Trees,
  Zap,
  RotateCw,
  Split
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

export default function DepartmentTopbar({ department }) {
  const { logoutDepartment, activeDepartment, isDepartmentAuthenticated } = useAuth();

  const currentDept = department || activeDepartment;

  const handleLogout = () => {
    logoutDepartment();
  };

  if (!currentDept) return null;

  const IconComponent = ICON_MAP[currentDept.icon] || Building2;
  const isAuth = isDepartmentAuthenticated(currentDept.id);

  // Generate 2 initials from officer name
  const initials = (currentDept.officer || 'Officer')
    .split(' ')
    .filter((w) => !w.toLowerCase().startsWith('er') && !w.toLowerCase().startsWith('acp'))
    .slice(0, 2)
    .map((w) => w[0])
    .join('') || 'OF';

  return (
    <header
      className="topbar"
      style={{
        borderBottom: `2px solid ${currentDept.color || '#2563eb'}`,
        backgroundColor: '#ffffff',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        height: '62px'
      }}
    >
      {/* Left: Department Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: `${currentDept.color}15`,
            color: currentDept.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <IconComponent size={18} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {currentDept.shortName || currentDept.name}
          </h2>

          <span
            style={{
              backgroundColor: `${currentDept.color}15`,
              color: currentDept.color,
              border: `1px solid ${currentDept.color}35`,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              letterSpacing: '0.3px',
              flexShrink: 0
            }}
          >
            {currentDept.code}
          </span>
        </div>
      </div>

      {/* Right: Telemetry Status & Officer Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
        {/* Real-time Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            color: '#475569'
          }}
          title="On-transit sensor mesh stream active"
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
            }}
          />
          <span style={{ fontWeight: 500 }}>Live Feed</span>
        </div>

        <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0' }} />

        {/* Officer Profile Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: isAuth ? `${currentDept.color}10` : '#f8fafc',
            border: `1px solid ${isAuth ? `${currentDept.color}30` : '#e2e8f0'}`
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: currentDept.color,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
              {currentDept.officer}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              {isAuth ? 'Verified Session' : currentDept.designation || 'Designated Officer'}
            </span>
          </div>
        </div>

        {/* Sign Out Button (only visible when user has an active session) */}
        {isAuth && (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '0.35rem 0.65rem',
              fontSize: '0.72rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
            title="End department session"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
