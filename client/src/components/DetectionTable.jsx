import React, { useState } from 'react';
import { Search, Filter, Eye, ChevronRight } from 'lucide-react';

export default function DetectionTable({
  incidents = [],
  onSelectIncident,
  showFilters = true,
  title = 'UrbanSight Incident Log',
  limit = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [authorityFilter, setAuthorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredIncidents = incidents.filter((item) => {
    if (typeFilter !== 'all') {
      if (typeFilter === 'traffic' || typeFilter === 'vehicle') {
        if (!['vehicle', 'congestion'].includes(item.type)) return false;
      } else if (item.type !== typeFilter) {
        return false;
      }
    }

    if (authorityFilter !== 'all' && item.authority !== authorityFilter) {
      return false;
    }

    if (statusFilter !== 'all' && item.routingStatus !== statusFilter) {
      return false;
    }

    if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
      return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchLoc = (item.locationName || '').toLowerCase().includes(q);
      const matchType = (item.type || '').toLowerCase().includes(q);
      const matchAuth = (item.authority || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      if (!matchLoc && !matchType && !matchAuth && !matchNotes) return false;
    }

    return true;
  });

  const displayList = limit ? filteredIncidents.slice(0, limit) : filteredIncidents;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <div>
          <h3 className="section-title">{title}</h3>
          <span className="section-desc">
            Showing {displayList.length} of {incidents.length} recorded fleet detections
          </span>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search location, road, note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem 0.4rem 2rem',
                  fontSize: '0.8rem',
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  width: '100%'
                }}
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.78rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}
            >
              <option value="all">All Types</option>
              <option value="pothole">Potholes</option>
              <option value="vehicle">Traffic / Vehicles</option>
              <option value="pedestrian">Pedestrians</option>
              <option value="traffic_light">Traffic Lights</option>
            </select>

            {/* Authority Filter */}
            <select
              value={authorityFilter}
              onChange={(e) => setAuthorityFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.78rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}
            >
              <option value="all">All Authorities</option>
              <option value="Road Safety Department">Road Safety Dept</option>
              <option value="Traffic Police">Traffic Police</option>
              <option value="Police">Police</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.78rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="routed">Routed</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.78rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Detection</th>
              <th>Confidence</th>
              <th>Location</th>
              <th>Concerned Authority</th>
              <th>Priority</th>
              <th>Routing Status</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayList.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No detections matching current filters.
                </td>
              </tr>
            ) : (
              displayList.map((item) => (
                <tr key={item._id} style={{ cursor: 'pointer' }} onClick={() => onSelectIncident && onSelectIncident(item)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.type} className="table-thumbnail" />
                      ) : (
                        <div
                          className="table-thumbnail"
                          style={{
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            color: '#94a3b8'
                          }}
                        >
                          N/A
                        </div>
                      )}
                      <div>
                        <span className={`badge badge-${item.type}`}>{item.type}</span>
                        {item.vehicleCount > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {item.vehicleCount} vehicles ({item.congestionLevel})
                          </div>
                        )}
                        {item.pedestrianCount > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {item.pedestrianCount} persons
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <strong style={{ fontSize: '0.85rem' }}>
                      {((item.confidence || 0.85) * 100).toFixed(0)}%
                    </strong>
                  </td>

                  <td>
                    <div style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.locationName || 'Transit Corridor'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}
                      </div>
                    </div>
                  </td>

                  <td>
                    <strong style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>
                      {item.authority}
                    </strong>
                  </td>

                  <td>
                    <span className={`badge badge-priority-${item.priority?.toLowerCase() || 'medium'}`}>
                      {item.priority || 'MEDIUM'}
                    </span>
                  </td>

                  <td>
                    <span className={`badge badge-${item.routingStatus?.toLowerCase() || 'routed'}`}>
                      {item.routingStatus?.toUpperCase() || 'ROUTED'}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Just now'}
                  </td>

                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident && onSelectIncident(item);
                      }}
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
