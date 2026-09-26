import React, { useState, useEffect } from 'react';
import AuthorityCard from '../components/AuthorityCard';
import DetectionTable from '../components/DetectionTable';
import IncidentModal from '../components/IncidentModal';
import { fetchAuthorities, fetchIncidents } from '../services/api';
import { subscribeToDetections, subscribeToIncidentUpdates } from '../services/socket';
import { Shield, GitFork, ArrowDown, Send, CheckCircle2, Milestone, Layers, Building2 } from 'lucide-react';

export default function Authorities() {
  const [authorities, setAuthorities] = useState([]);
  const [selectedDept, setSelectedDept] = useState('National Highways (NH) - NHAI');
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
      if (authRes.success) {
        setAuthorities(authRes.authorities);
        if (!selectedDept && authRes.authorities.length > 0) {
          setSelectedDept(authRes.authorities[0].name);
        }
      }
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
          ICCC Multi-Agency Road Authority Dispatch Engine
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Integrated Command and Control Centre (ICCC) automated classification & routing across all 9 designated road departments
        </p>
      </div>

      {/* Conceptual Routing Workflow Banner */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitFork size={18} color="#38bdf8" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Hierarchical Road Infrastructure Routing Architecture
          </h4>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '1100px', lineHeight: 1.6 }}>
          As transit fleet cameras navigate across corridors, on-vehicle AI detects potholes, cracks, and road defects in real-time. Detections are instantly cross-referenced with corridor telemetry and automatically dispatched to the responsible jurisdiction:
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.65rem',
            marginTop: '0.5rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #2563eb'
            }}
          >
            <strong style={{ color: '#60a5fa', fontSize: '0.8rem' }}>National Highways (NH)</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>NHAI</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #7c3aed'
            }}
          >
            <strong style={{ color: '#c084fc', fontSize: '0.8rem' }}>State Highways (SH)</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>State PWD</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #0284c7'
            }}
          >
            <strong style={{ color: '#38bdf8', fontSize: '0.8rem' }}>Major District Roads (MDR)</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>District PWD</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #0d9488'
            }}
          >
            <strong style={{ color: '#2dd4bf', fontSize: '0.8rem' }}>Other District Roads (ODR)</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>Zilla Parishad</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #16a34a'
            }}
          >
            <strong style={{ color: '#4ade80', fontSize: '0.8rem' }}>Village / Rural Roads</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>PMGSY</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #ea580c'
            }}
          >
            <strong style={{ color: '#fb923c', fontSize: '0.8rem' }}>City / Municipal Roads</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>Municipal Corp</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #dc2626'
            }}
          >
            <strong style={{ color: '#f87171', fontSize: '0.8rem' }}>Expressways</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>Expressway Authority</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #d97706'
            }}
          >
            <strong style={{ color: '#fbbf24', fontSize: '0.8rem' }}>Ring Roads / Bypasses</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>Urban Dev Authority</strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              borderLeft: '4px solid #4f46e5'
            }}
          >
            <strong style={{ color: '#818cf8', fontSize: '0.8rem' }}>Service Roads along NH</strong>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
              → Dispatched to: <strong>NHAI Service Wing</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
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
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
          overflowX: 'auto'
        }}
      >
        {authorities.map((auth) => (
          <button
            key={auth.name}
            className={`filter-btn ${selectedDept === auth.name ? 'active' : ''}`}
            onClick={() => setSelectedDept(auth.name)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap'
            }}
          >
            {auth.shortName || auth.name} ({auth.stats?.assigned || 0})
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
