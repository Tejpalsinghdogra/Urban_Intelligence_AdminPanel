import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Car, Users, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthorityCard({ authority }) {
  const { isDepartmentAuthenticated } = useAuth();
  const { name, code, description, stats = {}, color = '#2563eb', categories = [] } = authority;

  let classNameSuffix = 'road-safety';
  let Icon = AlertTriangle;
  let deptSlug = 'road-safety';

  if (name.toLowerCase().includes('traffic')) {
    classNameSuffix = 'traffic-police';
    Icon = Car;
    deptSlug = 'traffic-police';
  } else if (name.toLowerCase().includes('police')) {
    classNameSuffix = 'police';
    Icon = Users;
    deptSlug = 'police';
  }

  // Determine link target
  let targetLink = '/admin/incidents?authority=' + encodeURIComponent(name);
  if (name.includes('Road Safety')) targetLink = '/admin/potholes';
  else if (name.includes('Traffic Police')) targetLink = '/admin/traffic';
  else if (name.includes('Police')) targetLink = '/admin/pedestrians';

  const isAuth = isDepartmentAuthenticated(deptSlug);

  return (
    <div className={`authority-card ${classNameSuffix}`}>
      <div className="authority-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Icon size={16} color={color} />
            <h4 className="authority-name">{name}</h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {categories.join(', ')}
          </span>
        </div>
        <span className="authority-code">{code || 'DEPT'}</span>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', minHeight: '36px' }}>
        {description}
      </div>

      {/* Incident Status Breakdown */}
      <div className="authority-stats-row">
        <div className="auth-stat-box">
          <div className="num" style={{ color: '#b45309' }}>{stats.pending || 0}</div>
          <div className="lbl">Active / Routed</div>
        </div>
        <div className="auth-stat-box">
          <div className="num" style={{ color: '#6d28d9' }}>{stats.acknowledged || 0}</div>
          <div className="lbl">Acknowledged</div>
        </div>
        <div className="auth-stat-box">
          <div className="num" style={{ color: '#15803d' }}>{stats.resolved || 0}</div>
          <div className="lbl">Resolved</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
          Total Routed: <strong>{stats.assigned || 0}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {!isAuth && (
            <Link
              to={`/department/login?dept=${deptSlug}&redirect=${encodeURIComponent(targetLink)}`}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              title={`Login as ${name}`}
            >
              <Lock size={12} />
              <span>Login</span>
            </Link>
          )}

          <Link
            to={targetLink}
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              backgroundColor: color,
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{isAuth ? 'Open Portal' : 'Access Portal'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
