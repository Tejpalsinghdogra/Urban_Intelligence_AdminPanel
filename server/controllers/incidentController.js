import Detection from '../models/Detection.js';
import { routeDetection, normalizeType } from '../services/authorityRouter.js';
import { emitIncidentUpdated } from '../services/socketService.js';

export async function getIncidents(req, res) {
  try {
    const { authority, status, priority, type, search, limit = 100 } = req.query;

    const rawIncidents = await Detection.find().sort({ timestamp: -1, createdAt: -1 }).lean();
    let incidents = rawIncidents.map((d) => routeDetection(d));

    if (authority && authority !== 'all') {
      incidents = incidents.filter((i) => i.authority === authority);
    }

    if (status && status !== 'all') {
      incidents = incidents.filter((i) => i.routingStatus === status);
    }

    if (priority && priority !== 'all') {
      incidents = incidents.filter((i) => i.priority === priority);
    }

    if (type && type !== 'all') {
      const target = normalizeType(type);
      if (target === 'vehicle') {
        incidents = incidents.filter((i) => ['vehicle', 'congestion'].includes(i.type));
      } else {
        incidents = incidents.filter((i) => i.type === target);
      }
    }

    if (search) {
      const q = search.toLowerCase();
      incidents = incidents.filter(
        (i) =>
          (i.locationName || '').toLowerCase().includes(q) ||
          (i.notes || '').toLowerCase().includes(q) ||
          (i.type || '').toLowerCase().includes(q) ||
          (i.authority || '').toLowerCase().includes(q)
      );
    }

    const paginated = incidents.slice(0, parseInt(limit, 10));

    res.json({
      success: true,
      count: incidents.length,
      incidents: paginated
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch incidents', error: error.message });
  }
}

export async function updateIncidentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes, officer } = req.body;

    const validStatuses = ['pending', 'routed', 'acknowledged', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const incident = await Detection.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    incident.routingStatus = status;
    if (!incident.statusHistory) {
      incident.statusHistory = [];
    }

    incident.statusHistory.push({
      status,
      changedAt: new Date(),
      notes: notes || `Status marked as ${status}${officer ? ` by ${officer}` : ''}`
    });

    if (notes) {
      incident.notes = notes;
    }

    const updated = await incident.save();
    const formatted = routeDetection(updated);

    // Real-time broadcast
    emitIncidentUpdated(formatted);

    res.json({
      success: true,
      message: `Incident status updated to ${status}`,
      incident: formatted
    });
  } catch (error) {
    console.error('Error updating incident status:', error);
    res.status(500).json({ success: false, message: 'Status update failed', error: error.message });
  }
}

export default {
  getIncidents,
  updateIncidentStatus
};
