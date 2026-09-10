import Detection from '../models/Detection.js';
import { routeDetection, normalizeType } from '../services/authorityRouter.js';
import { emitNewDetection } from '../services/socketService.js';

export async function getDetections(req, res) {
  try {
    const { type, authority, status, priority, timeRange, startDate, endDate, search, limit = 100 } = req.query;

    const rawDetections = await Detection.find().sort({ timestamp: -1, createdAt: -1 }).lean();

    // Map through authority router dynamically
    let detections = rawDetections.map((d) => routeDetection(d));

    // Type filter
    if (type && type !== 'all') {
      const targetType = normalizeType(type);
      if (targetType === 'vehicle') {
        detections = detections.filter((d) => ['vehicle', 'congestion'].includes(d.type));
      } else {
        detections = detections.filter((d) => d.type === targetType);
      }
    }

    // Authority filter
    if (authority && authority !== 'all') {
      detections = detections.filter((d) => d.authority === authority);
    }

    // Status filter
    if (status && status !== 'all') {
      detections = detections.filter((d) => d.routingStatus === status);
    }

    // Priority filter
    if (priority && priority !== 'all') {
      detections = detections.filter((d) => d.priority === priority);
    }

    // Time range filter
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      detections = detections.filter((d) => new Date(d.timestamp) >= startOfDay);
    } else if (timeRange === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      detections = detections.filter((d) => new Date(d.timestamp) >= sevenDaysAgo);
    } else if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      detections = detections.filter((d) => new Date(d.timestamp) >= thirtyDaysAgo);
    } else if (startDate && endDate) {
      detections = detections.filter(
        (d) => new Date(d.timestamp) >= new Date(startDate) && new Date(d.timestamp) <= new Date(endDate)
      );
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      detections = detections.filter(
        (d) =>
          (d.locationName || '').toLowerCase().includes(q) ||
          (d.notes || '').toLowerCase().includes(q) ||
          (d.type || '').toLowerCase().includes(q) ||
          (d.authority || '').toLowerCase().includes(q)
      );
    }

    const totalCount = detections.length;
    const paginated = detections.slice(0, parseInt(limit, 10));

    res.json({
      success: true,
      count: totalCount,
      detections: paginated
    });
  } catch (error) {
    console.error('Error in getDetections:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch detections', error: error.message });
  }
}

export async function getDetectionById(req, res) {
  try {
    const raw = await Detection.findById(req.params.id).lean();
    if (!raw) {
      return res.status(404).json({ success: false, message: 'Detection not found' });
    }
    const detection = routeDetection(raw);
    res.json({ success: true, detection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving detection', error: error.message });
  }
}

export async function createDetection(req, res) {
  try {
    const rawData = req.body;

    if (!rawData.type || rawData.lat === undefined || rawData.lng === undefined) {
      return res.status(400).json({ success: false, message: 'type, lat, and lng are required' });
    }

    // Pass through authorityRouter
    const routedData = routeDetection(rawData);

    routedData.statusHistory = [
      {
        status: routedData.routingStatus || 'routed',
        changedAt: new Date(),
        notes: `AI Detection automatically dispatched to ${routedData.authority}`
      }
    ];

    const newDetection = new Detection(routedData);
    const saved = await newDetection.save();
    const formatted = routeDetection(saved);

    // Broadcast via Socket.IO
    emitNewDetection(formatted);

    res.status(201).json({
      success: true,
      message: `Detection recorded and routed to ${formatted.authority}`,
      detection: formatted
    });
  } catch (error) {
    console.error('Error creating detection:', error);
    res.status(500).json({ success: false, message: 'Failed to create detection', error: error.message });
  }
}

export async function getPotholesHeatmap(req, res) {
  try {
    const rawPotholes = await Detection.find({
      $or: [{ type: 'pothole' }, { type: /pothole/i }, { type: /crack/i }]
    }).lean();

    const potholes = rawPotholes.map((d) => routeDetection(d));

    // Format for Leaflet.heat: [lat, lng, intensity]
    const heatmapPoints = potholes
      .filter((p) => p.lat && p.lng)
      .map((p) => {
        let intensity = p.confidence || 0.8;
        if (p.priority === 'HIGH') intensity = 1.0;
        else if (p.priority === 'MEDIUM') intensity = 0.7;
        else intensity = 0.4;
        return [Number(p.lat), Number(p.lng), intensity];
      });

    res.json({
      success: true,
      count: heatmapPoints.length,
      points: heatmapPoints
    });
  } catch (error) {
    console.error('Error fetching heatmap points:', error);
    res.status(500).json({ success: false, message: 'Heatmap data failed', error: error.message });
  }
}

export default {
  getDetections,
  getDetectionById,
  createDetection,
  getPotholesHeatmap
};
