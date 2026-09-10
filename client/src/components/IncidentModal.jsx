import React, { useState } from 'react';
import { X, ExternalLink, MapPin, Calendar, Clock, AlertCircle, Shield, Check, Send } from 'lucide-react';
import { updateIncidentStatus } from '../services/api';

export default function IncidentModal({ incident, onClose, onStatusUpdated }) {
  if (!incident) return null;

  const [currentStatus, setCurrentStatus] = useState(incident.routingStatus || 'routed');
  const [officerNotes, setOfficerNotes] = useState(incident.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const res = await updateIncidentStatus(incident._id, currentStatus, officerNotes, 'Authority Command');
      if (res.success) {
        setUpdateMessage('Status successfully updated in MongoDB and synchronized live!');
        if (onStatusUpdated) {
          onStatusUpdated(res.incident);
        }
        setTimeout(() => setUpdateMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update incident:', err);
      setUpdateMessage('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = incident.timestamp
    ? new Date(incident.timestamp).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  const formattedTime = incident.timestamp
    ? new Date(incident.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : 'N/A';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={`badge badge-${incident.type}`}>{incident.type}</span>
            <h3 className="modal-title">Incident #{incident._id?.slice(-6).toUpperCase()}</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Cloudinary Image Display */}
          {incident.imageUrl ? (
            <div style={{ position: 'relative' }}>
              <img
                src={incident.imageUrl}
                alt={incident.type}
                style={{
                  width: '100%',
                  maxHeight: '280px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}
              />
              <a
                href={incident.imageUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                <span>Full Cloudinary Image</span>
                <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <div
              style={{
                height: '140px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              No Image Stored for this Detection Record
            </div>
          )}

          {/* Key Intelligence Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem',
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>CONFIDENCE LEVEL</span>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                {((incident.confidence || 0.85) * 100).toFixed(1)}%
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>INCIDENT PRIORITY</span>
              <span className={`badge badge-priority-${incident.priority?.toLowerCase() || 'medium'}`} style={{ marginTop: '4px' }}>
                {incident.priority || 'MEDIUM'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>ASSIGNED AUTHORITY</span>
              <strong style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={14} /> {incident.authority}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>ROUTING STATUS</span>
              <span className={`badge badge-${currentStatus.toLowerCase()}`} style={{ marginTop: '4px' }}>
                {currentStatus.toUpperCase()}
              </span>
            </div>

            {incident.vehicleCount > 0 && (
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>VEHICLE COUNT / CONGESTION</span>
                <strong>{incident.vehicleCount} Vehicles ({incident.congestionLevel || 'LOW'})</strong>
              </div>
            )}

            {incident.pedestrianCount > 0 && (
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>PEDESTRIAN VOLUME</span>
                <strong>{incident.pedestrianCount} Persons Detected</strong>
              </div>
            )}
          </div>

          {/* Location & Time Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
              <MapPin size={16} color="#2563eb" />
              <span><strong>Location:</strong> {incident.locationName || 'Urban Transit Corridor'} ({incident.lat?.toFixed(5)}, {incident.lng?.toFixed(5)})</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              <Clock size={16} />
              <span><strong>Timestamp:</strong> {formattedDate} at {formattedTime}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              <Send size={16} />
              <span><strong>Fleet Transit Unit:</strong> {incident.busId || 'PB-08-BT-4021'} ({incident.routeId || 'Route 7'})</span>
            </div>
          </div>

          {/* Status Update Control */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
              Dispatch Action & Status Workflow:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.85rem',
                  flex: 1,
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="pending">Pending Dispatch</option>
                <option value="routed">Routed to Authority</option>
                <option value="acknowledged">Acknowledged by Dept</option>
                <option value="resolved">Resolved / Action Complete</option>
              </select>

              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isUpdating}
                style={{ minWidth: '130px' }}
              >
                {isUpdating ? 'Updating...' : 'Save Status'}
              </button>
            </div>

            {updateMessage && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#16a34a', fontWeight: 500 }}>
                ✓ {updateMessage}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
