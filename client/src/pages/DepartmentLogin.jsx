import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, DEPARTMENTS } from '../context/AuthContext';
import {
  Shield,
  AlertTriangle,
  Car,
  Users,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Zap
} from 'lucide-react';

export default function DepartmentLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginDepartment, instantDemoLogin, activeDepartment } = useAuth();

  const requestedDept = searchParams.get('dept') || 'road-safety';
  const redirectPath = searchParams.get('redirect');

  const [selectedDeptId, setSelectedDeptId] = useState(
    DEPARTMENTS[requestedDept] ? requestedDept : 'road-safety'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentDept = DEPARTMENTS[selectedDeptId] || DEPARTMENTS['road-safety'];

  // Update default username placeholder when department switches
  useEffect(() => {
    if (DEPARTMENTS[requestedDept]) {
      setSelectedDeptId(requestedDept);
    }
  }, [requestedDept]);

  useEffect(() => {
    setUsername(currentDept.credentials.username);
    setPassword('');
    setError(null);
  }, [selectedDeptId, currentDept]);

  const handleDepartmentSwitch = (id) => {
    setSelectedDeptId(id);
    setError(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginDepartment(selectedDeptId, username, password);
      setLoading(false);

      if (res.success) {
        const dest = redirectPath || currentDept.path;
        navigate(dest, { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 250);
  };

  const handleInstantDemoLogin = (deptId) => {
    const targetDept = deptId || selectedDeptId;
    const res = instantDemoLogin(targetDept);
    if (res.success) {
      const deptConfig = DEPARTMENTS[targetDept];
      const dest = redirectPath && targetDept === selectedDeptId ? redirectPath : deptConfig.path;
      navigate(dest, { replace: true });
    }
  };

  const getDeptIcon = (id) => {
    switch (id) {
      case 'road-safety':
        return AlertTriangle;
      case 'traffic-police':
        return Car;
      case 'police':
        return Users;
      default:
        return Building2;
    }
  };

  const IconComponent = getDeptIcon(currentDept.id);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        backgroundImage: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
        position: 'relative'
      }}
    >
      {/* Top Back Link */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <Link
          to="/admin"
          className="btn btn-secondary"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            fontSize: '0.8rem'
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Central Command Admin</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Department Banner Header */}
        <div
          style={{
            backgroundColor: currentDept.color,
            color: '#ffffff',
            padding: '1.75rem 2rem',
            position: 'relative',
            transition: 'background-color 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              {currentDept.code}
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              UrbanSight Authority Gateway
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: currentDept.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <IconComponent size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {currentDept.name}
              </h1>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '2px 0 0 0' }}>
                {currentDept.division}
              </p>
            </div>
          </div>
        </div>

        {/* Department Selector Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          {Object.values(DEPARTMENTS).map((d) => {
            const isSelected = selectedDeptId === d.id;
            const TabIcon = getDeptIcon(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleDepartmentSwitch(d.id)}
                style={{
                  flex: 1,
                  padding: '0.75rem 0.5rem',
                  border: 'none',
                  borderBottom: isSelected ? `3px solid ${d.color}` : '3px solid transparent',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? d.color : '#64748b',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <TabIcon size={16} />
                <span style={{ whiteSpace: 'nowrap' }}>{d.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Login Body */}
        <div style={{ padding: '1.75rem 2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              Departmental Official Authentication
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Designated Officer: <strong>{currentDept.officer}</strong>
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem'
                }}
              >
                Official Officer ID / Username
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`e.g. ${currentDept.credentials.username}`}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem'
                }}
              >
                Department Security Key / Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Default: ${currentDept.credentials.password}`}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: currentDept.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.2s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span>Verifying Department Credentials...</span>
              ) : (
                <>
                  <span>Access {currentDept.name} Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: 500 }}>
              DEMO EVALUATION CREDENTIALS
            </div>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.75rem',
                color: '#475569',
                marginBottom: '0.85rem'
              }}
            >
              User: <code style={{ color: '#0f172a', fontWeight: 600 }}>{currentDept.credentials.username}</code> &nbsp;|&nbsp;
              Pass: <code style={{ color: '#0f172a', fontWeight: 600 }}>{currentDept.credentials.password}</code>
            </div>

            <button
              type="button"
              onClick={() => handleInstantDemoLogin(selectedDeptId)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Zap size={14} color="#f59e0b" />
              <span>1-Click Instant Demo Login as {currentDept.name}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: '480px'
        }}
      >
        UrbanSight Multi-Agency Authority Dispatch Architecture &copy; 2026.
        All detections are classified via Transit AI Dashcams and routed to designated municipal authorities.
      </div>
    </div>
  );
}
