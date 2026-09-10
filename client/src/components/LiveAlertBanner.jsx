import React from 'react';
import { AlertCircle, ArrowRight, X, Shield, Send } from 'lucide-react';

export default function LiveAlertBanner({ alert, onDismiss, onInspect }) {
  if (!alert) return null;

  return (
    <div className="live-alert-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem', color: '#93c5fd' }}>
              REAL-TIME DETECTION INGESTION
            </span>
            <span className={`badge badge-priority-${alert.priority?.toLowerCase() || 'medium'}`}>
              {alert.priority} PRIORITY
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>
            New <strong>{alert.type}</strong> recorded ({((alert.confidence || 0.85) * 100).toFixed(0)}% conf) at{' '}
            <em>{alert.locationName || 'Transit Route'}</em> →{' '}
            <strong style={{ color: '#38bdf8' }}>Auto-Routed to {alert.authority}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#3b82f6' }}
          onClick={() => onInspect && onInspect(alert)}
        >
          <span>Inspect Incident</span>
          <ArrowRight size={13} />
        </button>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
