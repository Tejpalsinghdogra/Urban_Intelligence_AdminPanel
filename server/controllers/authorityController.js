import Detection from '../models/Detection.js';
import { routeDetection } from '../services/authorityRouter.js';

export const AUTHORITIES_META = [
  {
    id: 'road-safety',
    name: 'Road Safety Department',
    code: 'RSD-01',
    description: 'Responsible for road pavement inspection, pothole repair work-orders, and municipal infrastructure safety.',
    icon: 'Hammer',
    color: '#dc2626',
    categories: ['Potholes', 'Road Defect', 'Cracks'],
    officerInCharge: 'Er. R. Sharma (Executive Engineer)',
    contact: 'roadsafety@punjab.gov.in / 0161-240112'
  },
  {
    id: 'traffic-police',
    name: 'Traffic Police',
    code: 'TPC-02',
    description: 'Monitors urban vehicle flow, automated congestion hotspots, lane bottlenecks, and signal coordination.',
    icon: 'Car',
    color: '#2563eb',
    categories: ['Vehicles', 'Congestion', 'Traffic Light Status'],
    officerInCharge: 'ACP Harpreet Singh (Traffic)',
    contact: 'trafficpolice@punjab.gov.in / 0161-240223'
  },
  {
    id: 'police',
    name: 'Police',
    code: 'PCC-03',
    description: 'City surveillance, crowd safety monitoring, high pedestrian concentration alerts, and transit hub patrol dispatch.',
    icon: 'Shield',
    color: '#16a34a',
    categories: ['Pedestrian Density', 'Public Safety'],
    officerInCharge: 'Inspector Gurpreet Kaur',
    contact: 'citypolice@punjab.gov.in / 0161-240334'
  }
];

export async function getAuthorities(req, res) {
  try {
    const rawDetections = await Detection.find().lean();
    const detections = rawDetections.map((d) => routeDetection(d));

    const authorityStats = AUTHORITIES_META.map((auth) => {
      const assigned = detections.filter((d) => d.authority === auth.name);
      const total = assigned.length;
      const pending = assigned.filter((d) => ['pending', 'routed'].includes(d.routingStatus)).length;
      const routedOnly = assigned.filter((d) => d.routingStatus === 'routed').length;
      const acknowledged = assigned.filter((d) => d.routingStatus === 'acknowledged').length;
      const resolved = assigned.filter((d) => d.routingStatus === 'resolved').length;
      const highPriority = assigned.filter((d) => d.priority === 'HIGH').length;

      return {
        ...auth,
        stats: {
          assigned: total,
          pending,
          routedOnly,
          acknowledged,
          resolved,
          highPriority
        }
      };
    });

    res.json({
      success: true,
      authorities: authorityStats
    });
  } catch (error) {
    console.error('Error in getAuthorities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch authorities', error: error.message });
  }
}

export async function getAuthorityIncidents(req, res) {
  try {
    const { authorityName } = req.params;
    const { status, limit = 50 } = req.query;

    const rawDetections = await Detection.find().sort({ timestamp: -1 }).lean();
    let incidents = rawDetections
      .map((d) => routeDetection(d))
      .filter((d) => d.authority === authorityName);

    if (status && status !== 'all') {
      incidents = incidents.filter((d) => d.routingStatus === status);
    }

    res.json({
      success: true,
      authority: authorityName,
      count: incidents.length,
      incidents: incidents.slice(0, parseInt(limit, 10))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch authority incidents', error: error.message });
  }
}

export default {
  getAuthorities,
  getAuthorityIncidents,
  AUTHORITIES_META
};
