import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DetectionMap from '../components/DetectionMap';
import IncidentModal from '../components/IncidentModal';
import { fetchDetections, fetchAdminOverview } from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
import { AlertTriangle, CheckCircle, Clock, MapPin, Eye, ExternalLink } from 'lucide-react';

export default function Potholes() {
  const [potholes, setPotholes] = useState([]);
  const [busRoute, setBusRoute] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPotholes = async () => {
    try {
      setLoading(true);
      const [detRes, ovRes] = await Promise.all([
        fetchDetections({ type: 'pothole' }),
        fetchAdminOverview()
      ]);
      if (detRes.success) setPotholes(detRes.detections);
      if (ovRes.success) setBusRoute(ovRes.fleetBusRoute || []);
    } catch (err) {
      console.error('Error fetching potholes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPotholes();

    const unsub = subscribeToDetections((det) => {
      if (det.type === 'pothole') {
        setPotholes((prev) => [det, ...prev]);
      }
    });

    const unsubUpdate = subscribeToIncidentUpdates((upd) => {
      if (upd.type === 'pothole') {
        setPotholes((prev) => prev.map((p) => (p._id === upd._id ? upd : p)));
      }
    });

    return () => {
      unsub();
      unsubUpdate();
    };
  }, []);

  const highConf = potholes.filter((p) => (p.confidence || 0) >= 0.90);
  const pending = potholes.filter((p) => ['pending', 'routed'].includes(p.routingStatus));
  const resolved = potholes.filter((p) => p.routingStatus === 'resolved');

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-pothole">Road Safety Department</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Municipal Infrastructure Division</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
          Pothole & Pavement Defect Intelligence
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Real-time asphalt crater detection, confidence estimation, and automated municipal work-order routing
        </p>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid">
        <StatCard
          title="Total Road Defects"
          value={potholes.length}
          subtext="Detected along fleet route"
          icon={AlertTriangle}
          color="#dc2626"
        />
        <StatCard
          title="High Confidence (≥90%)"
          value={highConf.length}
          subtext="Verified crater signatures"
          icon={AlertTriangle}
          color="#ea580c"
        />
        <StatCard
          title="Active Work Orders"
          value={pending.length}
          subtext="Awaiting road maintenance"
          icon={Clock}
          color="#b45309"
        />
        <StatCard
          title="Repairs Resolved"
          value={resolved.length}
          subtext="Completed asphalt patch"
          icon={CheckCircle}
          color="#16a34a"
        />
      </div>

      {/* Pothole Geospatial Intelligence Map */}
      <DetectionMap
        detections={potholes}
        showHeatmapToggle={true}
        showTypeFilter={false}
        onSelectIncident={(item) => setSelectedIncident(item)}
      />

      {/* Grid of Pothole Incident Cards */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
              Pothole Defect Registry ({potholes.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Cloudinary inspection captures with automated municipal dispatch
            </span>
          </div>
        </div>

        <div className="cards-grid">
          {potholes.map((pothole) => (
            <div key={pothole._id} className="incident-card">
              <div style={{ position: 'relative' }}>
                <img
                  src={pothole.imageUrl || 'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978174/urban_intelligence/road_defects/qkwqisy6pgoylcuxuhjx.png'}
                  alt="Pothole detection"
                  className="incident-card-img"
                />
                <span
                  className={`badge badge-priority-${pothole.priority?.toLowerCase() || 'medium'}`}
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                  {pothole.priority} PRIORITY
                </span>
              </div>

              <div className="incident-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                      Pothole #{pothole._id?.slice(-5).toUpperCase()}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Confidence: <strong>{((pothole.confidence || 0.85) * 100).toFixed(0)}%</strong>
                    </span>
                  </div>
                  <span className={`badge badge-${pothole.routingStatus?.toLowerCase() || 'routed'}`}>
                    {pothole.routingStatus?.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#2563eb" />
                    <span>{pothole.locationName || 'Transit Route Segment'}</span>
                  </div>
                  <div style={{ color: '#94a3b8' }}>
                    Coords: {pothole.lat?.toFixed(4)}, {pothole.lng?.toFixed(4)}
                  </div>
                  <div style={{ color: '#1e3a8a', fontWeight: 500, marginTop: '2px' }}>
                    Authority: <strong>Road Safety Department</strong>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedIncident(pothole)}
                  style={{ marginTop: 'auto', width: '100%', fontSize: '0.8rem' }}
                >
                  <Eye size={14} />
                  <span>Inspect & Dispatch Action</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={(updated) => {
            setPotholes((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            setSelectedIncident(updated);
          }}
        />
      )}
    </div>
  );
}
