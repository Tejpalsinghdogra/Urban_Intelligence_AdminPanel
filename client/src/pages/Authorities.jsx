import React, { useState, useEffect } from 'react';
import AuthorityCard from '../components/AuthorityCard';
import DetectionTable from '../components/DetectionTable';
import IncidentModal from '../components/IncidentModal';
import { fetchAuthorities, fetchIncidents } from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
import { Shield, GitFork, ArrowDown, Send, CheckCircle2 } from 'lucide-react';

export default function Authorities() {
  const [authorities, setAuthorities] = useState([]);
  const [selectedDept, setSelectedDept] = useState('Road Safety Department');
  const [deptIncidents, setDeptIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [authRes, incRes] = await Promise.all([
        fetchAuthorities(),
        fetchIncidents({ authority: selectedDept })
      ]);
      if (authRes.success) setAuthorities(authRes.authorities);
      if (incRes.success) setDeptIncidents(incRes.incidents);
    } catch (err) {
      console.error('Error loading authorities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubNew = subscribeToDetections((det) => {
      fetchAuthorities().then((res) => {
        if (res.success) setAuthorities(res.authorities);
      });
      if (det.authority === selectedDept) {
        setDeptIncidents((prev) => [det, ...prev]);
      }
    });

    const unsubUpd = subscribeToIncidentUpdates((upd) => {
      fetchAuthorities().then((res) => {
        if (res.success) setAuthorities(res.authorities);
      });
      if (upd.authority === selectedDept) {
        setDeptIncidents((prev) =>
          prev.map((i) => (i._id === upd._id ? upd : i))
        );
      }
    });

    return () => {
      unsubNew();
      unsubUpd();
    };
  }, [selectedDept]);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Multi-Agency Authority Dispatch Engine
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Automated classification & routing of AI sensor streams to respective government authorities
        </p>
      </div>

      {/* Conceptual Routing Workflow Banner */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitFork size={18} color="#38bdf8" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Autonomous Authority Redirection Architecture
          </h4>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '1000px', lineHeight: 1.6 }}>
          As transit buses navigate urban corridors, on-vehicle AI detects hazards in real-time. Detections are stored in MongoDB, images indexed in Cloudinary, and the <strong>Authority Routing Engine</strong> instantly evaluates priorities and directs actionable intelligence to the concerned department:
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.5rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #dc2626'
            }}
          >
            <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>Potholes & Road Defects</strong>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>Road Safety Department</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #2563eb'
            }}
          >
            <strong style={{ color: '#60a5fa', fontSize: '0.85rem' }}>Traffic Flow & Congestion</strong>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>Traffic Police</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #16a34a'
            }}
          >
            <strong style={{ color: '#4ade80', fontSize: '0.85rem' }}>Pedestrian Safety & Density</strong>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>Police</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Cards Grid */}
      <div className="authority-grid">
        {authorities.map((auth) => (
          <div
            key={auth.name}
            onClick={() => setSelectedDept(auth.name)}
            style={{ cursor: 'pointer' }}
          >
            <AuthorityCard authority={auth} />
          </div>
        ))}
      </div>

      {/* Department Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        {authorities.map((auth) => (
          <button
            key={auth.name}
            className={`filter-btn ${selectedDept === auth.name ? 'active' : ''}`}
            onClick={() => setSelectedDept(auth.name)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {auth.name} ({auth.stats?.assigned || 0})
          </button>
        ))}
      </div>

      {/* Filtered Department Incidents */}
      <DetectionTable
        incidents={deptIncidents}
        onSelectIncident={(item) => setSelectedIncident(item)}
        title={`${selectedDept} — Live Dispatched Incidents`}
        showFilters={true}
      />

      {/* Detail Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={(updated) => {
            setDeptIncidents((prev) =>
              prev.map((i) => (i._id === updated._id ? updated : i))
            );
            setSelectedIncident(updated);
          }}
        />
      )}
    </div>
  );
}
