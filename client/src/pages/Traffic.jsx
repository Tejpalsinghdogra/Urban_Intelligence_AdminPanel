import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DetectionMap from '../components/DetectionMap';
import IncidentModal from '../components/IncidentModal';
import { fetchDetections, fetchAdminOverview } from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
import { Car, AlertCircle, TrendingUp, Navigation, Shield, Eye } from 'lucide-react';

export default function Traffic() {
  const [trafficDetections, setTrafficDetections] = useState([]);
  const [busRoute, setBusRoute] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTraffic = async () => {
    try {
      setLoading(true);
      const [detRes, ovRes] = await Promise.all([
        fetchDetections({ type: 'vehicle' }),
        fetchAdminOverview()
      ]);
      if (detRes.success) setTrafficDetections(detRes.detections);
      if (ovRes.success) setBusRoute(ovRes.fleetBusRoute || []);
    } catch (err) {
      console.error('Error fetching traffic:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraffic();

    const unsub = subscribeToDetections((det) => {
      if (det.type === 'vehicle' || det.type === 'congestion') {
        setTrafficDetections((prev) => [det, ...prev]);
      }
    });

    const unsubUpdate = subscribeToIncidentUpdates((upd) => {
      if (upd.type === 'vehicle' || upd.type === 'congestion') {
        setTrafficDetections((prev) =>
          prev.map((t) => (t._id === upd._id ? upd : t))
        );
      }
    });

    return () => {
      unsub();
      unsubUpdate();
    };
  }, []);

  // Compute total vehicle count
  const totalVehiclesCount = trafficDetections.reduce(
    (sum, d) => sum + (d.vehicleCount || 1),
    0
  );

  const highCongestion = trafficDetections.filter(
    (d) => d.congestionLevel === 'HIGH' || (d.vehicleCount || 0) >= 7
  );

  const mediumCongestion = trafficDetections.filter(
    (d) => d.congestionLevel === 'MEDIUM' || ((d.vehicleCount || 0) >= 4 && (d.vehicleCount || 0) < 7)
  );

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-traffic">Traffic Police</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Urban Mobility & Traffic Enforcement Division</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
          Traffic Density & Congestion Intelligence
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Automated vehicle counting from bus forward-facing dashcams, bottleneck alerts, and signal adjustment dispatch
        </p>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid">
        <StatCard
          title="Total Vehicles Logged"
          value={totalVehiclesCount}
          subtext="Mobile transit AI count"
          trend="+12% peak hours"
          icon={Car}
          color="#2563eb"
        />
        <StatCard
          title="High Congestion Zones (7+ veh)"
          value={highCongestion.length}
          subtext="Critical corridor jams"
          trend="Immediate signal priority"
          icon={AlertCircle}
          color="#dc2626"
        />
        <StatCard
          title="Moderate Flow (4-6 veh)"
          value={mediumCongestion.length}
          subtext="Transit lane slowdowns"
          icon={TrendingUp}
          color="#d97706"
        />
        <StatCard
          title="Active Police Dispatches"
          value={trafficDetections.filter((d) => d.routingStatus !== 'resolved').length}
          subtext="Routed to Traffic Police"
          icon={Shield}
          color="#0f172a"
        />
      </div>

      {/* Traffic Map */}
      <DetectionMap
        detections={trafficDetections}
        busRoute={busRoute}
        selectedCategory="vehicle"
        showHeatmapToggle={false}
        onSelectIncident={(item) => setSelectedIncident(item)}
      />

      {/* Highest Congestion Corridors */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
              Corridor Congestion Logs ({trafficDetections.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Real-time vehicle cluster classifications along Route 7
            </span>
          </div>
        </div>

        <div className="cards-grid">
          {trafficDetections.map((item) => {
            const cong = item.congestionLevel || (item.vehicleCount >= 7 ? 'HIGH' : item.vehicleCount >= 4 ? 'MEDIUM' : 'LOW');
            const congColor = cong === 'HIGH' ? '#dc2626' : cong === 'MEDIUM' ? '#d97706' : '#2563eb';

            return (
              <div key={item._id} className="incident-card">
                <div style={{ position: 'relative' }}>
                  <img
                    src={item.imageUrl || 'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978179/urban_intelligence/road_defects/muwuafar65b4s65hkkhc.jpg'}
                    alt="Traffic detection"
                    className="incident-card-img"
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: congColor,
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {cong} CONGESTION
                  </span>
                </div>

                <div className="incident-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                        {item.locationName || 'Transit Segment'}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Vehicle Count: <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{item.vehicleCount || 1} vehicles</strong>
                      </span>
                    </div>
                    <span className={`badge badge-${item.routingStatus?.toLowerCase() || 'routed'}`}>
                      {item.routingStatus?.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    <div>Coordinates: {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}</div>
                    <div>Recorded: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div style={{ color: '#1e3a8a', fontWeight: 500, marginTop: '2px' }}>
                      Concerned Agency: <strong>Traffic Police</strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedIncident(item)}
                    style={{ marginTop: 'auto', width: '100%', fontSize: '0.8rem' }}
                  >
                    <Eye size={14} />
                    <span>View Camera Capture & Dispatch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={(updated) => {
            setTrafficDetections((prev) =>
              prev.map((t) => (t._id === updated._id ? updated : t))
            );
            setSelectedIncident(updated);
          }}
        />
      )}
    </div>
  );
}
