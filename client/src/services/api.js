import axios from 'axios';

// Connect directly to the admin backend server on port 5050
const API_BASE = 'http://localhost:5050/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Admin overview stats
export const fetchAdminOverview = async () => {
  const res = await api.get('/admin/overview');
  return res.data;
};

// Detections with filters
export const fetchDetections = async (params = {}) => {
  const res = await api.get('/detections', { params });
  return res.data;
};

// Pothole Heatmap points [lat, lng, intensity]
export const fetchPotholeHeatmap = async () => {
  const res = await api.get('/detections/heatmap/potholes');
  return res.data;
};

// Incidents list
export const fetchIncidents = async (params = {}) => {
  const res = await api.get('/incidents', { params });
  return res.data;
};

// Update incident routing status
export const updateIncidentStatus = async (id, status, notes, officer) => {
  const res = await api.patch(`/incidents/${id}/status`, { status, notes, officer });
  return res.data;
};

// Authority stats & metadata
export const fetchAuthorities = async () => {
  const res = await api.get('/authorities');
  return res.data;
};

// Incidents specific to an authority
export const fetchAuthorityIncidents = async (authorityName, params = {}) => {
  const res = await api.get(`/authorities/${encodeURIComponent(authorityName)}/incidents`, { params });
  return res.data;
};

export default api;
