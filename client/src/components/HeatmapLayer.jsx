import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points = [], options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: options.radius || 28,
      blur: options.blur || 20,
      maxZoom: options.maxZoom || 16,
      max: options.max || 1.0,
      gradient: options.gradient || {
        0.2: '#2563eb',
        0.4: '#38bdf8',
        0.6: '#eab308',
        0.8: '#f97316',
        1.0: '#dc2626'
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
}
