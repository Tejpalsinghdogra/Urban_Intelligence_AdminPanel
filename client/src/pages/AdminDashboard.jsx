import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DetectionMap from '../components/DetectionMap';
import PotholeHeatmapSection from '../components/PotholeHeatmapSection';
import AuthorityCard from '../components/AuthorityCard';
import DetectionTable from '../components/DetectionTable';
import IncidentModal from '../components/IncidentModal';
import LiveAlertBanner from '../components/LiveAlertBanner';
import {
  fetchAdminOverview,
  fetchDetections,
  fetchAuthorities
} from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
import {
  AlertTriangle,
  Car,
  Users,
  ShieldCheck,
  Activity,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [liveAlert, setLiveAlert] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [ovData, detData, authData] = await Promise.all([
        fetchAdminOverview(),
        fetchDetections({ type: selectedCategory, timeRange: selectedTimeRange }),
        fetchAuthorities()
      ]);

      if (ovData.success) setOverview(ovData);
      if (detData.success) setDetections(detData.detections);
      if (authData.success) setAuthorities(authData.authorities);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedTimeRange]);

  // Subscribe to real-time socket events
  useEffect(() => {
    const unsubDetection = subscribeToDetections((newDet) => {
      // Prepend detection to list
      setDetections((prev) => [newDet, ...prev]);

      // Trigger live alert banner
      setLiveAlert(newDet);

      // Refresh overview stats smoothly
      fetchAdminOverview().then((ov) => {
        if (ov?.success) setOverview(ov);
      });
      fetchAuthorities().then((auth) => {
        if (auth?.success) setAuthorities(auth.authorities);
      });
    });

    const unsubUpdate = subscribeToIncidentUpdates((updated) => {
      setDetections((prev) =>
        prev.map((d) => (d._id === updated._id ? updated : d))
      );
      if (selectedIncident && selectedIncident._id === updated._id) {
        setSelectedIncident(updated);
      }
      fetchAdminOverview().then((ov) => {
        if (ov?.success) setOverview(ov);
      });
    });

    return () => {
      unsubDetection();
      unsubUpdate();
    };
  }, [selectedIncident]);

  const potholesList = detections.filter((d) => d.type === 'pothole');

  return (
    <div className="page-body">
      {/* Live Socket Banner */}
      <LiveAlertBanner
        alert={liveAlert}
        onDismiss={() => setLiveAlert(null)}
        onInspect={(item) => setSelectedIncident(item)}
      />

      {/* KPI Stat Cards Grid */}
      <div className="stat-grid">
        <StatCard
          title="Total Potholes"
          value={overview?.stats?.totalPotholes ?? 24}
          subtext="Road defects logged"
          trend="+8.4% this week"
          icon={AlertTriangle}
          color="#dc2626"
        />

        <StatCard
          title="Vehicles Detected"
          value={overview?.stats?.totalVehicles ?? 187}
          subtext="Transit lane traffic"
          trend="Real-time sensor count"
          icon={Car}
          color="#2563eb"
        />

        <StatCard
          title="Pedestrians Count"
          value={overview?.stats?.totalPedestrians ?? 542}
          subtext="Crowd volume monitored"
          trend="Shelter concentration"
          icon={Users}
          color="#16a34a"
        />

        <StatCard
          title="Total Incidents"
          value={overview?.stats?.totalDetections ?? 58}
          subtext="All fleet AI detections"
          trend="Active transit stream"
          icon={Activity}
          color="#8b5cf6"
        />

        <StatCard
          title="High Priority"
          value={overview?.stats?.highPriorityCount ?? 14}
          subtext="Urgent dispatch needed"
          trend="Escalated"
          icon={AlertOctagon}
          color="#ea580c"
        />

        <StatCard
          title="Concerned Authorities"
          value="3"
          subtext="Multi-agency dispatch"
          trend="Auto-routed"
          icon={ShieldCheck}
          color="#0f172a"
        />
      </div>

      {/* Primary Leaflet Geospatial Intelligence Map */}
      <DetectionMap
        detections={detections}
        busRoute={overview?.fleetBusRoute || []}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        onSelectIncident={(item) => setSelectedIncident(item)}
      />

      {/* Dedicated Pothole Heatmap Section */}
      <PotholeHeatmapSection
        potholes={potholesList}
        busRoute={overview?.fleetBusRoute || []}
      />

      {/* Multi-Agency Authority Dispatch Cards */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
              Multi-Agency Authority Dispatch Pipelines
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              AI system continuously redirects detections to respective municipal response departments
            </p>
          </div>
        </div>

        <div className="authority-grid">
          {authorities.map((auth) => (
            <AuthorityCard key={auth.name} authority={auth} />
          ))}
        </div>
      </div>

      {/* Recent Incidents Log */}
      <DetectionTable
        incidents={detections}
        onSelectIncident={(item) => setSelectedIncident(item)}
        title="Live Incident Stream & Dispatch Status"
        limit={15}
      />

      {/* Incident Detail / Status Update Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={(updated) => {
            setDetections((prev) =>
              prev.map((d) => (d._id === updated._id ? updated : d))
            );
            setSelectedIncident(updated);
          }}
        />
      )}
    </div>
  );
}
