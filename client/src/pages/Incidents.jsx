import React, { useState, useEffect } from 'react';
import DetectionTable from '../components/DetectionTable';
import IncidentModal from '../components/IncidentModal';
import StatCard from '../components/StatCard';
import { fetchIncidents } from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
import { useSearchParams } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertOctagon, Send } from 'lucide-react';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const initialAuthority = searchParams.get('authority') || 'all';

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetchIncidents({
        authority: initialAuthority !== 'all' ? initialAuthority : undefined
      });
      if (res.success) setIncidents(res.incidents);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();

    const unsubNew = subscribeToDetections((det) => {
      setIncidents((prev) => [det, ...prev]);
    });

    const unsubUpd = subscribeToIncidentUpdates((upd) => {
      setIncidents((prev) =>
        prev.map((item) => (item._id === upd._id ? upd : item))
      );
      if (selectedIncident && selectedIncident._id === upd._id) {
        setSelectedIncident(upd);
      }
    });

    return () => {
      unsubNew();
      unsubUpd();
    };
  }, [initialAuthority, selectedIncident]);

  const highPriorityCount = incidents.filter((i) => i.priority === 'HIGH').length;
  const routedCount = incidents.filter((i) => ['routed', 'pending'].includes(i.routingStatus)).length;
  const ackCount = incidents.filter((i) => i.routingStatus === 'acknowledged').length;
  const resolvedCount = incidents.filter((i) => i.routingStatus === 'resolved').length;

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Urban Incidents & Multi-Agency Dispatch Registry
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Consolidated repository of all automated detections with status tracking and lifecycle management
        </p>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid">
        <StatCard
          title="Total Recorded Incidents"
          value={incidents.length}
          subtext="Sensor mesh detections"
          icon={FileText}
          color="#0f172a"
        />
        <StatCard
          title="Active / Routed"
          value={routedCount}
          subtext="Dispatched to department"
          icon={Send}
          color="#2563eb"
        />
        <StatCard
          title="Acknowledged"
          value={ackCount}
          subtext="Under official review"
          icon={Clock}
          color="#6d28d9"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtext="Action concluded"
          icon={CheckCircle}
          color="#16a34a"
        />
      </div>

      {/* Full Incident Table */}
      <DetectionTable
        incidents={incidents}
        onSelectIncident={(item) => setSelectedIncident(item)}
        title="Comprehensive Multi-Agency Incidents Log"
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
