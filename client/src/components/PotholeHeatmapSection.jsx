import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import { Flame, AlertCircle } from 'lucide-react';

function MapAutoRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function PotholeHeatmapSection({ potholes = [], busRoute = [] }) {
  const mapCenter = useMemo(() => {
    const valid = potholes.filter((p) => p.lat && p.lng);
    if (valid.length > 0) {
      const avgLat = valid.reduce((s, p) => s + Number(p.lat), 0) / valid.length;
      const avgLng = valid.reduce((s, p) => s + Number(p.lng), 0) / valid.length;
      return [Number(avgLat.toFixed(6)), Number(avgLng.toFixed(6))];
    }
    return [31.530089, 75.892554];
  }, [potholes]);

  const heatPoints = useMemo(() => {
    return potholes
      .filter((p) => p.lat && p.lng)
      .map((p) => {
        let weight = p.confidence || 0.85;
        if (p.priority === 'HIGH') weight = 1.0;
        else if (p.priority === 'MEDIUM') weight = 0.7;
        else weight = 0.4;
        return [Number(p.lat), Number(p.lng), weight];
      });
  }, [potholes]);

  return (
    <div className="dashboard-section" style={{ marginBottom: '1.75rem' }}>
      <div className="section-header">
        <div className="section-title-group">
          <Flame size={18} color="#dc2626" />
          <div>
            <h3 className="section-title">Pothole Hotspots & High-Risk Road Segments</h3>
            <span className="section-desc">
              Geospatial defect density algorithm identifying critical asphalt degradation zones
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-priority-high">
            <AlertCircle size={12} /> {potholes.filter((p) => p.priority === 'HIGH').length} High Priority Cracks
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {potholes.length} defect records
          </span>
        </div>
      </div>

      <div className="map-container-wrapper" style={{ height: '360px' }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={false}
          className="leaflet-map-root"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapAutoRecenter center={mapCenter} />

          {busRoute && busRoute.length > 0 && (
            <Polyline
              positions={busRoute}
              pathOptions={{
                color: '#4f46e5',
                weight: 3,
                dashArray: '6, 6',
                opacity: 0.7
              }}
            />
          )}

          {heatPoints.length > 0 && (
            <HeatmapLayer
              points={heatPoints}
              options={{
                radius: 32,
                blur: 22,
                max: 1.0,
                gradient: {
                  0.3: '#fde047',
                  0.6: '#fb923c',
                  0.8: '#ea580c',
                  1.0: '#dc2626'
                }
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="legend-items">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Hotspot Density Gradient:</span>
            <div
              style={{
                width: '120px',
                height: '10px',
                borderRadius: '4px',
                background: 'linear-gradient(to right, #fde047, #fb923c, #ea580c, #dc2626)'
              }}
            ></div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Low (Yellow) → Critical Cluster (Deep Red)</span>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Directly dispatched to <strong>Road Safety Department</strong>
        </div>
      </div>
    </div>
  );
}
