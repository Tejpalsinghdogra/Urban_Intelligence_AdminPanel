import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, DEPARTMENTS } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DetectionMap from '../components/DetectionMap';
import PotholeHeatmapSection from '../components/PotholeHeatmapSection';
import DetectionTable from '../components/DetectionTable';
import IncidentModal from '../components/IncidentModal';
import LiveAlertBanner from '../components/LiveAlertBanner';
import DepartmentLoginModal from '../components/DepartmentLoginModal';
import { fetchIncidents, updateIncidentStatus } from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
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
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  User,
  Phone,
  Mail,
  ExternalLink,
  Lock,
  LogOut,
  Sparkles,
  Flame,
  Radio,
  Download,
  CheckCheck
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

export default function DepartmentPortal() {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const { activeDepartment, logoutDepartment, isDepartmentAuthenticated } = useAuth();

  const deptConfig = DEPARTMENTS[deptId] || DEPARTMENTS['national-highways'];
  const isAuthenticated = isDepartmentAuthenticated(deptId);

  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [mapViewMode, setMapViewMode] = useState('markers'); // 'markers' | 'heatmap'
  const [liveAlert, setLiveAlert] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const IconComponent = ICON_MAP[deptConfig.icon] || Shield;

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetchIncidents({ authority: deptConfig.name });
      if (res.success) {
        setIncidents(res.incidents);
      }
    } catch (err) {
      console.error('Error fetching department incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();

    const unsubNew = subscribeToDetections((newDet) => {
      if (newDet.authority === deptConfig.name || newDet.roadType === deptConfig.roadType) {
        setIncidents((prev) => [newDet, ...prev]);
        setLiveAlert(newDet);
      }
    });

    const unsubUpd = subscribeToIncidentUpdates((upd) => {
      if (upd.authority === deptConfig.name || upd.roadType === deptConfig.roadType) {
        setIncidents((prev) => prev.map((i) => (i._id === upd._id ? upd : i)));
        if (selectedIncident && selectedIncident._id === upd._id) {
          setSelectedIncident(upd);
        }
      }
    });

    return () => {
      unsubNew();
      unsubUpd();
    };
  }, [deptId, deptConfig.name]);

  // Derived metrics
  const totalAssigned = incidents.length;
  const pendingCount = incidents.filter((i) => ['pending', 'routed'].includes(i.routingStatus)).length;
  const ackCount = incidents.filter((i) => i.routingStatus === 'acknowledged').length;
  const resolvedCount = incidents.filter((i) => i.routingStatus === 'resolved').length;
  const highPriorityCount = incidents.filter((i) => i.priority === 'HIGH').length;

  const filteredIncidents = useMemo(() => {
    if (filterStatus === 'all') return incidents;
    if (filterStatus === 'high-priority') return incidents.filter((i) => i.priority === 'HIGH');
    return incidents.filter((i) => i.routingStatus === filterStatus);
  }, [incidents, filterStatus]);

  // Bulk Acknowledge
  const handleAcknowledgeAll = async () => {
    try {
      const pendingItems = incidents.filter((i) => ['pending', 'routed'].includes(i.routingStatus));
      if (pendingItems.length === 0) {
        setActionSuccess('No pending incidents to acknowledge.');
        setTimeout(() => setActionSuccess(null), 3000);
        return;
      }

      for (const item of pendingItems) {
        await updateIncidentStatus(item._id, 'acknowledged', `Bulk acknowledged by ${deptConfig.officer}`);
      }

      setActionSuccess(`Successfully acknowledged ${pendingItems.length} work-orders!`);
      setTimeout(() => setActionSuccess(null), 3500);
      loadIncidents();
    } catch (err) {
      console.error('Failed bulk acknowledge:', err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (incidents.length === 0) return;
    const headers = ['ID', 'Type', 'Road Type', 'Authority', 'Location', 'Latitude', 'Longitude', 'Priority', 'Status', 'Timestamp'];
    const rows = incidents.map((i) => [
      i._id,
      i.type,
      i.roadType || deptConfig.roadType,
      i.authority,
      `"${(i.locationName || '').replace(/"/g, '""')}"`,
      i.lat,
      i.lng,
      i.priority,
      i.routingStatus,
      i.timestamp
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${deptConfig.code}_incident_manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [deptId, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div
        className="page-body"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '75vh',
          textAlign: 'center',
          padding: '2.5rem 1rem'
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: `${deptConfig.color}15`,
              color: deptConfig.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Lock size={32} />
          </div>

          <span
            style={{
              backgroundColor: `${deptConfig.color}15`,
              color: deptConfig.color,
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            {deptConfig.code} • ACCESS RESTRICTED
          </span>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0.85rem 0 0.5rem 0' }}>
            {deptConfig.name} is Locked
          </h2>

          <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55, marginBottom: '1.75rem' }}>
            Official road authority operations, live telemetry dispatch, and work-order resolution require officer authentication.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                backgroundColor: deptConfig.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: `0 4px 12px ${deptConfig.color}35`
              }}
            >
              <Lock size={15} />
              <span>Open Officer Login Panel</span>
            </button>

            <Link
              to="/admin"
              style={{
                width: '100%',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Back to ICCC Dashboard
            </Link>
          </div>
        </div>

        <DepartmentLoginModal
          department={deptConfig}
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Real-time Socket Live Alert Banner */}
      <LiveAlertBanner alert={liveAlert} onDismiss={() => setLiveAlert(null)} />

      {/* Action Notification Toast */}
      {actionSuccess && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Sleek Corridor Action Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: `${deptConfig.color}15`,
              color: deptConfig.color,
              fontWeight: 700,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <IconComponent size={14} />
            <span>{deptConfig.roadType}</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#475569' }}>
            {deptConfig.description}
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={handleAcknowledgeAll}
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1'
            }}
            title="Acknowledge all pending incidents on this corridor"
          >
            <CheckCheck size={14} color="#2563eb" />
            <span>Acknowledge All</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1'
            }}
            title="Export incident manifest to CSV"
          >
            <Download size={14} color="#64748b" />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          title="Total Assigned Incidents"
          value={totalAssigned}
          subtext={`Across ${deptConfig.shortName}`}
          icon={Layers}
          color={deptConfig.color}
        />
        <StatCard
          title="Pending / Dispatched"
          value={pendingCount}
          subtext="Awaiting field inspection"
          icon={Clock}
          color="#d97706"
        />
        <StatCard
          title="Work-Orders In Progress"
          value={ackCount}
          subtext="Department acknowledged"
          icon={CheckCircle2}
          color="#2563eb"
        />
        <StatCard
          title="Repaired & Resolved"
          value={resolvedCount}
          subtext="Pavement verified clear"
          icon={CheckCircle2}
          color="#16a34a"
        />
        <StatCard
          title="Critical / High Priority"
          value={highPriorityCount}
          subtext="Immediate hazard action required"
          icon={AlertTriangle}
          color="#dc2626"
        />
      </div>

      {/* Live Map & Heatmap Section with Mode Toggle */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
              {deptConfig.shortName} — Geospatial Intelligence & Defect Density
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Live telemetry stream captured from on-transit dashcams across this corridor
            </p>
          </div>

          {/* Toggle between Pin Map and Heatmap */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2e8f0', borderRadius: '6px', padding: '3px', gap: '2px' }}>
            <button
              onClick={() => setMapViewMode('markers')}
              style={{
                border: 'none',
                backgroundColor: mapViewMode === 'markers' ? '#ffffff' : 'transparent',
                color: mapViewMode === 'markers' ? '#0f172a' : '#64748b',
                fontWeight: mapViewMode === 'markers' ? 600 : 500,
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: mapViewMode === 'markers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <MapPin size={13} color="#2563eb" />
              <span>Live Pins ({filteredIncidents.length})</span>
            </button>
            <button
              onClick={() => setMapViewMode('heatmap')}
              style={{
                border: 'none',
                backgroundColor: mapViewMode === 'heatmap' ? '#ffffff' : 'transparent',
                color: mapViewMode === 'heatmap' ? '#0f172a' : '#64748b',
                fontWeight: mapViewMode === 'heatmap' ? 600 : 500,
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: mapViewMode === 'heatmap' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Flame size={13} color="#dc2626" />
              <span>Corridor Heatmap</span>
            </button>
          </div>
        </div>

        {mapViewMode === 'markers' ? (
          <DetectionMap
            detections={filteredIncidents}
            height="380px"
            onSelectDetection={(det) => setSelectedIncident(det)}
          />
        ) : (
          <PotholeHeatmapSection
            potholes={filteredIncidents}
          />
        )}
      </div>

      {/* Department Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Incidents ({totalAssigned})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending / Routed ({pendingCount})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'acknowledged' ? 'active' : ''}`}
            onClick={() => setFilterStatus('acknowledged')}
          >
            Acknowledged ({ackCount})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('resolved')}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'high-priority' ? 'active' : ''}`}
            onClick={() => setFilterStatus('high-priority')}
            style={{ color: filterStatus === 'high-priority' ? '#ffffff' : '#dc2626' }}
          >
            Critical High ({highPriorityCount})
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Corridor Authority: <strong>{deptConfig.roadType}</strong>
        </div>
      </div>

      {/* Filtered Incidents Table */}
      <DetectionTable
        incidents={filteredIncidents}
        onSelectIncident={(item) => setSelectedIncident(item)}
        title={`${deptConfig.shortName} Live Dispatched Incidents`}
        showFilters={true}
      />

      {/* Detail Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={(updated) => {
            setIncidents((prev) =>
              prev.map((i) => (i._id === updated._id ? updated : i))
            );
            setSelectedIncident(updated);
          }}
        />
      )}
    </div>
  );
}
