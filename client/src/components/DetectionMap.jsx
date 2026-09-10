import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import HeatmapLayer from './HeatmapLayer';
import { Layers, Flame, MapPin, Eye, Filter, Calendar } from 'lucide-react';

// Auto-recenter helper
function MapAutoRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

// Custom SVG Icons for distinct categories
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 11px;
        font-family: 'Poppins', sans-serif;
      ">
        ${label}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
};

const ICONS = {
  pothole: createCustomIcon('#dc2626', 'P'),
  vehicle: createCustomIcon('#2563eb', 'V'),
  congestion: createCustomIcon('#2563eb', 'C'),
  pedestrian: createCustomIcon('#16a34a', 'U'),
  traffic_light: createCustomIcon('#d97706', 'S')
};

export default function DetectionMap({
  detections = [],
  busRoute = [],
  onSelectIncident,
  selectedCategory,
  onCategoryChange,
  selectedTimeRange,
  onTimeRangeChange,
  showHeatmapToggle = true
}) {
  const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'

  // Dynamically calculate center from real detections
  const mapCenter = useMemo(() => {
    const valid = detections.filter((d) => d.lat && d.lng);
    if (valid.length > 0) {
      const avgLat = valid.reduce((s, d) => s + Number(d.lat), 0) / valid.length;
      const avgLng = valid.reduce((s, d) => s + Number(d.lng), 0) / valid.length;
      return [Number(avgLat.toFixed(6)), Number(avgLng.toFixed(6))];
    }
    return [31.530089, 75.892554];
  }, [detections]);

  // Dynamic route polyline connecting actual GPS points
  const activeRoute = useMemo(() => {
    if (busRoute && busRoute.length > 0) return busRoute;
    const valid = detections.filter((d) => d.lat && d.lng).map((d) => [Number(d.lat), Number(d.lng)]);
    if (valid.length > 1) return valid;
    if (valid.length === 1) {
      const [lat, lng] = valid[0];
      return [
        [lat - 0.002, lng - 0.002],
        [lat, lng],
        [lat + 0.002, lng + 0.002]
      ];
    }
    return [
      [31.528, 75.890],
      [31.530089, 75.892554],
      [31.532, 75.895]
    ];
  }, [busRoute, detections]);

  // Prepare heatmap points: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    return detections
      .filter((d) => d.lat && d.lng && (viewMode === 'heatmap' ? d.type === 'pothole' : true))
      .map((d) => {
        let weight = d.confidence || 0.8;
        if (d.priority === 'HIGH') weight = 1.0;
        else if (d.priority === 'MEDIUM') weight = 0.7;
        else weight = 0.4;
        return [Number(d.lat), Number(d.lng), weight];
      });
  }, [detections, viewMode]);

  return (
    <div className="dashboard-section" style={{ marginBottom: '1.75rem' }}>
      <div className="section-header">
        <div className="section-title-group">
          <MapPin size={18} color="#2563eb" />
          <div>
            <h3 className="section-title">Geospatial Intelligence & Transit Fleet Tracking</h3>
            <span className="section-desc">
              Real-time monitoring of actual mobile transit detections along GT Road Corridor
            </span>
          </div>
        </div>

        {/* View Toggle (Marker vs Heatmap) */}
        {showHeatmapToggle && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                className={`filter-btn ${viewMode === 'markers' ? 'active' : ''}`}
                onClick={() => setViewMode('markers')}
                style={{ borderRadius: 0, border: 'none' }}
              >
                <Layers size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Marker View
              </button>
              <button
                className={`filter-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
                onClick={() => setViewMode('heatmap')}
                style={{ borderRadius: 0, border: 'none' }}
              >
                <Flame size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Pothole Heatmap View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls Row */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        {/* Category Filters */}
        <div className="filter-bar">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> TYPE:
          </span>
          {['all', 'pothole', 'vehicle', 'pedestrian', 'traffic_light'].map((cat) => {
            const labels = {
              all: 'All Intelligence',
              pothole: 'Potholes (Red)',
              vehicle: 'Traffic & Vehicles (Blue)',
              pedestrian: 'Pedestrians (Green)',
              traffic_light: 'Traffic Lights (Amber)'
            };
            return (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* Time Range Filters */}
        {onTimeRangeChange && (
          <div className="filter-bar">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> PERIOD:
            </span>
            {[
              { id: 'all', label: 'All Records' },
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' }
            ].map((period) => (
              <button
                key={period.id}
                className={`filter-btn ${selectedTimeRange === period.id ? 'active' : ''}`}
                onClick={() => onTimeRangeChange(period.id)}
              >
                {period.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="map-container-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={true}
          className="leaflet-map-root"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapAutoRecenter center={mapCenter} />

          {/* Bus Fleet Route Polyline */}
          {activeRoute && activeRoute.length > 0 && (
            <Polyline
              positions={activeRoute}
              pathOptions={{
                color: '#4f46e5',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.85
              }}
            />
          )}

          {/* Heatmap Layer View */}
          {viewMode === 'heatmap' && heatmapPoints.length > 0 && (
            <HeatmapLayer points={heatmapPoints} />
          )}

          {/* Markers View */}
          {viewMode === 'markers' &&
            detections.map((d) => {
              if (!d.lat || !d.lng) return null;
              const icon = ICONS[d.type] || ICONS.pothole;

              return (
                <Marker key={d._id || `${d.lat}-${d.lng}`} position={[Number(d.lat), Number(d.lng)]} icon={icon}>
                  <Popup>
                    <div style={{ fontFamily: 'Poppins, sans-serif', width: '220px' }}>
                      {d.imageUrl && (
                        <img
                          src={d.imageUrl}
                          alt={d.type}
                          style={{
                            width: '100%',
                            height: '110px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginBottom: '6px'
                          }}
                        />
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{d.type}</strong>
                        <span className={`badge badge-priority-${d.priority?.toLowerCase() || 'medium'}`}>
                          {d.priority}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        <div>Confidence: <strong>{((d.confidence || 0.8) * 100).toFixed(0)}%</strong></div>
                        {(d.vehicleCount > 0 || d.count > 0) && d.type === 'vehicle' && (
                          <div>Vehicles: <strong>{d.vehicleCount || d.count}</strong> ({d.congestionLevel})</div>
                        )}
                        {(d.pedestrianCount > 0 || d.count > 0) && d.type === 'pedestrian' && (
                          <div>Pedestrians: <strong>{d.pedestrianCount || d.count}</strong></div>
                        )}
                        <div>Authority: <strong style={{ color: '#0f172a' }}>{d.authority}</strong></div>
                        <div>Status: <strong>{d.routingStatus}</strong></div>
                        <div style={{ marginTop: '2px', fontSize: '0.7rem' }}>
                          {Number(d.lat)?.toFixed(4)}, {Number(d.lng)?.toFixed(4)}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectIncident && onSelectIncident(d)}
                        style={{
                          marginTop: '8px',
                          width: '100%',
                          padding: '4px 8px',
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect Details →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* Map Footer Legend */}
      <div className="map-legend">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot pothole"></span>
            <span>Pothole (Road Safety)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot traffic"></span>
            <span>Vehicle / Congestion (Traffic Police)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot pedestrian"></span>
            <span>Pedestrian (Police)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot signal"></span>
            <span>Traffic Light</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot route"></span>
            <span>Fleet Transit Bus Route</span>
          </div>
        </div>
        <div>
          Showing <strong>{detections.length}</strong> real geolocated incidents
        </div>
      </div>
    </div>
  );
}
