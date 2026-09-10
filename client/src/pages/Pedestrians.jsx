import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DetectionMap from '../components/DetectionMap';
import IncidentModal from '../components/IncidentModal';
import { fetchDetections, fetchAdminOverview } from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
import { Users, Shield, AlertCircle, TrendingUp, Eye, MapPin } from 'lucide-react';

export default function Pedestrians() {
  const [pedestrianDetections, setPedestrianDetections] = useState([]);
  const [busRoute, setBusRoute] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPedestrians = async () => {
    try {
      setLoading(true);
      const [detRes, ovRes] = await Promise.all([
        fetchDetections({ type: 'pedestrian' }),
        fetchAdminOverview()
      ]);
      if (detRes.success) setPedestrianDetections(detRes.detections);
      if (ovRes.success) setBusRoute(ovRes.fleetBusRoute || []);
    } catch (err) {
      console.error('Error fetching pedestrians:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedestrians();

    const unsub = subscribeToDetections((det) => {
      if (det.type === 'pedestrian') {
        setPedestrianDetections((prev) => [det, ...prev]);
      }
    });

    const unsubUpdate = subscribeToIncidentUpdates((upd) => {
      if (upd.type === 'pedestrian') {
        setPedestrianDetections((prev) =>
          prev.map((p) => (p._id === upd._id ? upd : p))
        );
      }
    });

    return () => {
      unsub();
      unsubUpdate();
    };
  }, []);

  const totalPedestriansCount = pedestrianDetections.reduce(
    (sum, d) => sum + (d.pedestrianCount || 1),
    0
  );

  const highDensityEvents = pedestrianDetections.filter(
    (d) => (d.pedestrianCount || 0) >= 30
  );

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-pedestrian">Police</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Public Safety & Crowd Surveillance Wing</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
          Pedestrian Safety & Crowd Density Intelligence
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Real-time pedestrian volume monitoring at bus stops, transit hubs, and crosswalks dispatched to Police
        </p>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid">
        <StatCard
          title="Total Pedestrians Detected"
          value={totalPedestriansCount}
          subtext="Transit corridor count"
          trend="+18% peak evening"
          icon={Users}
          color="#16a34a"
        />
        <StatCard
          title="Crowd Surges (≥30 People)"
          value={highDensityEvents.length}
          subtext="High concentration areas"
          trend="Safety patrol alert"
          icon={AlertCircle}
          color="#dc2626"
        />
        <StatCard
          title="Monitored Bus Bays"
          value={pedestrianDetections.length}
          subtext="Transit shelters covered"
          trend="Continuous AI scan"
          icon={TrendingUp}
          color="#2563eb"
        />
        <StatCard
          title="Routed to Police"
          value={pedestrianDetections.length}
          subtext="Multi-agency integration"
          trend="Auto-dispatched"
          icon={Shield}
          color="#0f172a"
        />
      </div>

      {/* Pedestrian Map */}
      <DetectionMap
        detections={pedestrianDetections}
        busRoute={busRoute}
        selectedCategory="pedestrian"
        showHeatmapToggle={false}
        onSelectIncident={(item) => setSelectedIncident(item)}
      />

      {/* High Crowd Density Locations */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
              Crowd Density Incidents ({pedestrianDetections.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Pedestrian surveillance logs routed to Police for transit perimeter safety
            </span>
          </div>
        </div>

        <div className="cards-grid">
          {pedestrianDetections.map((item) => (
            <div key={item._id} className="incident-card">
              <div style={{ position: 'relative' }}>
                <img
                  src={item.imageUrl || 'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978190/urban_intelligence/road_defects/lcei34iewy9poeeqqpxv.jpg'}
                  alt="Pedestrian crowd"
                  className="incident-card-img"
                />
                <span
                  className={`badge badge-priority-${item.priority?.toLowerCase() || 'medium'}`}
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                  {item.priority} PRIORITY
                </span>
              </div>

              <div className="incident-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                      {item.locationName || 'Transit Shelter'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Pedestrian Count: <strong style={{ color: '#15803d', fontSize: '0.9rem' }}>{item.pedestrianCount || 1} people</strong>
                    </span>
                  </div>
                  <span className={`badge badge-${item.routingStatus?.toLowerCase() || 'routed'}`}>
                    {item.routingStatus?.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <div>Coordinates: {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}</div>
                  <div>Logged: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div style={{ color: '#15803d', fontWeight: 500, marginTop: '2px' }}>
                    Authority: <strong>Police</strong>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedIncident(item)}
                  style={{ marginTop: 'auto', width: '100%', fontSize: '0.8rem' }}
                >
                  <Eye size={14} />
                  <span>Inspect Crowd Capture</span>
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
            setPedestrianDetections((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            );
            setSelectedIncident(updated);
          }}
        />
      )}
    </div>
  );
}
