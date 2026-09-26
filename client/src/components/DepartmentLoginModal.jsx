import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Unlock,
  Shield,
  User,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Milestone,
  Compass,
  Truck,
  Layers,
  Trees,
  Building2,
  Zap,
  RotateCw,
  Split,
  ArrowRight,
  Sparkles
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

export default function DepartmentLoginModal({ department, isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { loginDepartment, instantDemoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department?.credentials) {
      setUsername(department.credentials.username || '');
      setPassword(department.credentials.password || '');
      setError(null);
    }
  }, [department, isOpen]);

  if (!isOpen || !department) return null;

  const IconComponent = ICON_MAP[department.icon] || Shield;
  const deptColor = department.color || '#2563eb';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginDepartment(department.id, username, password);
      setLoading(false);

      if (res.success) {
        if (onSuccess) {
          onSuccess(department);
        } else {
          onClose();
          navigate(department.path || `/admin/department/${department.id}`);
        }
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 200);
  };

  const handleInstantUnlock = () => {
    const res = instantDemoLogin(department.id);
    if (res.success) {
      if (onSuccess) {
        onSuccess(department);
      } else {
        onClose();
        navigate(department.path || `/admin/department/${department.id}`);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: deptColor,
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              {department.code}
            </span>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: deptColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              <IconComponent size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                {department.name}
              </h3>
              <p style={{ fontSize: '0.76rem', opacity: 0.9, margin: '2px 0 0 0', color: '#ffffff' }}>
                {department.agency}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.35rem 1.5rem' }}>
          {/* Officer Verification Pill */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.15rem'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: `${deptColor}15`,
                color: deptColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <User size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                {department.officer}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {department.designation} • {department.division}
              </div>
            </div>
          </div>

          {/* Locked Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              color: '#475569',
              marginBottom: '1rem',
              backgroundColor: '#fffbeb',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #fef3c7'
            }}
          >
            <Lock size={14} color="#d97706" style={{ flexShrink: 0 }} />
            <span>This department portal is <strong>locked</strong>. Please sign in to access live road incident telemetry and dispatch logs.</span>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#b91c1c',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '0.85rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem'
                }}
              >
                Officer Username
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. nhai"
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.1rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem'
                }}
              >
                Access Password
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.1rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.3rem', marginBottom: 0 }}>
                Credentials pre-filled for rapid inspection. You can also click Quick Demo Unlock below.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  backgroundColor: deptColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: `0 4px 12px ${deptColor}35`,
                  transition: 'opacity 0.15s ease'
                }}
              >
                <Unlock size={15} />
                <span>{loading ? 'Authenticating...' : `Sign In & Unlock ${department.code}`}</span>
              </button>

              <button
                type="button"
                onClick={handleInstantUnlock}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Sparkles size={14} color="#f59e0b" />
                <span>Quick Demo Unlock (1-Click)</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
