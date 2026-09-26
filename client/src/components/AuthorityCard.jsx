import React from 'react';
import {
  Milestone,
  Compass,
  Truck,
  Layers,
  Trees,
  Building2,
  Zap,
  RotateCw,
  Split,
  Shield
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

export default function AuthorityCard({ authority }) {
  const {
    id,
    name,
    code,
    description,
    stats = {},
    color = '#2563eb',
    categories = [],
    icon
  } = authority;

  const Icon = ICON_MAP[icon] || Shield;

  return (
    <div
      className="authority-card"
      style={{
        borderLeft: `4px solid ${color}`,
        position: 'relative'
      }}
    >
      {/* Header: Icon, Name, Category tags and Code badge */}
      <div className="authority-card-header">
        <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Icon size={18} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
            <h4
              className="authority-name"
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                lineHeight: 1.35,
                color: '#0f172a'
              }}
            >
              {name}
            </h4>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#64748b',
              display: 'block',
              paddingLeft: '1.6rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {categories.slice(0, 2).join(' • ')}
          </span>
        </div>
        <span
          className="authority-code"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            borderColor: `${color}35`,
            flexShrink: 0,
            alignSelf: 'flex-start'
          }}
        >
          {code || 'DEPT'}
        </span>
      </div>

      {/* Description with aligned minHeight */}
      <div
        style={{
          fontSize: '0.78rem',
          color: '#475569',
          marginBottom: '0.75rem',
          minHeight: '2.5rem',
          lineHeight: 1.45
        }}
      >
        {description}
      </div>

      {/* 4-Column Incident Pipeline Metrics */}
      <div className="authority-stats-row">
        <div className="auth-stat-box">
          <div className="num" style={{ color: '#0f172a' }}>{stats.assigned || 0}</div>
          <div className="lbl">Total</div>
        </div>
        <div className="auth-stat-box">
          <div className="num" style={{ color: '#b45309' }}>{stats.pending || 0}</div>
          <div className="lbl">Active</div>
        </div>
        <div className="auth-stat-box">
          <div className="num" style={{ color: '#2563eb' }}>{stats.acknowledged || 0}</div>
          <div className="lbl">Progress</div>
        </div>
        <div className="auth-stat-box">
          <div className="num" style={{ color: '#15803d' }}>{stats.resolved || 0}</div>
          <div className="lbl">Resolved</div>
        </div>
      </div>

      {/* Footer: Jurisdiction & Auto-Routing Live Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          marginTop: 'auto',
          fontSize: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.74rem' }}>
          <span>Jurisdiction:</span>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {categories[0] || 'Corridor'}
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.68rem',
            fontWeight: 600,
            color: '#15803d',
            backgroundColor: '#f0fdf4',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            border: '1px solid #dcfce7',
            flexShrink: 0
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block'
            }}
          />
          <span>Auto-Routed</span>
        </div>
      </div>
    </div>
  );
}
