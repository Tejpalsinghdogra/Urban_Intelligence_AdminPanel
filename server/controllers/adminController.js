import Detection from '../models/Detection.js';
import { routeDetection } from '../services/authorityRouter.js';

export async function getOverview(req, res) {
  try {
    const rawDetections = await Detection.find().sort({ timestamp: -1, createdAt: -1 }).lean();

    // Map all raw detections through authority router dynamically
    const detections = rawDetections.map((d) => routeDetection(d));

    const totalDetections = detections.length;
    const totalPotholes = detections.filter((d) => d.type === 'pothole').length;

    // Aggregate vehicles
    const totalVehicles = detections
      .filter((d) => d.type === 'vehicle' || d.type === 'congestion')
      .reduce((sum, d) => sum + (d.vehicleCount || d.count || 1), 0);

    // Aggregate pedestrians
    const totalPedestrians = detections
      .filter((d) => d.type === 'pedestrian')
      .reduce((sum, d) => sum + (d.pedestrianCount || d.count || 1), 0);

    // High priority count
    const highPriorityCount = detections.filter((d) => d.priority === 'HIGH').length;

    // Status counts
    const pendingCount = detections.filter((d) => d.routingStatus === 'pending').length;
    const routedCount = detections.filter((d) => d.routingStatus === 'routed').length;
    const acknowledgedCount = detections.filter((d) => d.routingStatus === 'acknowledged').length;
    const resolvedCount = detections.filter((d) => d.routingStatus === 'resolved').length;

    // Authority breakdowns
    const authorities = ['Road Safety Department', 'Traffic Police', 'Police'];
    const authorityBreakdown = authorities.map((authName) => {
      const assignedDets = detections.filter((d) => d.authority === authName);
      const total = assignedDets.length;
      const pending = assignedDets.filter((d) => ['pending', 'routed'].includes(d.routingStatus)).length;
      const acknowledged = assignedDets.filter((d) => d.routingStatus === 'acknowledged').length;
      const resolved = assignedDets.filter((d) => d.routingStatus === 'resolved').length;
      const highPriority = assignedDets.filter((d) => d.priority === 'HIGH').length;

      return {
        name: authName,
        total,
        pending,
        acknowledged,
        resolved,
        highPriority
      };
    });

    // Compute dynamic bus route line from actual detection coordinates
    let fleetBusRoute = [];
    const validCoords = detections
      .filter((d) => d.lat && d.lng)
      .map((d) => [Number(d.lat), Number(d.lng)]);

    if (validCoords.length > 0) {
      // Connect actual GPS points with a smooth path
      fleetBusRoute = validCoords;
      if (fleetBusRoute.length === 1) {
        // Add slightly offset points to visualize corridor if only 1 location exists
        const [cLat, cLng] = fleetBusRoute[0];
        fleetBusRoute = [
          [cLat - 0.003, cLng - 0.003],
          [cLat, cLng],
          [cLat + 0.003, cLng + 0.003]
        ];
      }
    } else {
      fleetBusRoute = [
        [31.528, 75.890],
        [31.530089, 75.892554],
        [31.532, 75.895]
      ];
    }

    // Recent 10 incidents from actual database
    const recentIncidents = detections.slice(0, 10);

    res.json({
      success: true,
      stats: {
        totalDetections,
        totalPotholes,
        totalVehicles,
        totalPedestrians,
        totalAuthorities: authorities.length,
        highPriorityCount,
        statuses: {
          pending: pendingCount,
          routed: routedCount,
          acknowledged: acknowledgedCount,
          resolved: resolvedCount
        }
      },
      authorityBreakdown,
      fleetBusRoute,
      recentIncidents
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ success: false, message: 'Server error fetching overview', error: error.message });
  }
}

export default {
  getOverview
};
