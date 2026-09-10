import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = '#2563eb', trend = null }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{title}</span>
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {Icon && <Icon size={18} />}
        </div>
      </div>

      <div className="stat-card-bottom">
        <div className="stat-value">{value}</div>
        <div className="stat-subtext-container">
          {trend && (
            <span
              className="stat-trend-tag"
              style={{
                color: trend.startsWith('+') ? '#15803d' : '#475569',
                backgroundColor: trend.startsWith('+') ? '#f0fdf4' : '#f1f5f9'
              }}
            >
              {trend}
            </span>
          )}
          {subtext && <span className="stat-subtext-desc">{subtext}</span>}
        </div>
      </div>
    </div>
  );
}
