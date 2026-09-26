import Detection from '../models/Detection.js';
import { routeDetection } from '../services/authorityRouter.js';

export const AUTHORITIES_META = [
  {
    id: 'national-highways',
    name: 'National Highways (NH) - NHAI',
    shortName: 'National Highways (NH)',
    agency: 'National Highways Authority of India (NHAI)',
    code: 'NHAI-NH',
    roadType: 'National Highways (NH)',
    description: 'Maintenance, pavement resurfacing, and high-speed defect resolution across National Highway corridors.',
    icon: 'Milestone',
    color: '#2563eb',
    categories: ['National Highway Defect', 'Crater / Pothole', 'Freight Corridor Rutting'],
    officerInCharge: 'Er. A. K. Verma (Project Director, NHAI)',
    contact: 'nhai-corridor@punjab.gov.in / 0172-2701101'
  },
  {
    id: 'state-highways',
    name: 'State Highways (SH) - State PWD',
    shortName: 'State Highways (SH)',
    agency: 'Public Works Department (State PWD)',
    code: 'PWD-SH',
    roadType: 'State Highways (SH)',
    description: 'Pavement rehabilitation, shoulder repair, and asphalt maintenance on inter-district State Highway links.',
    icon: 'Compass',
    color: '#7c3aed',
    categories: ['State Highway Pavement', 'Edge Erosion', 'Asphalt Cracks'],
    officerInCharge: 'Er. S. P. Chawla (Superintending Engineer, PWD)',
    contact: 'statehighways@punjab.gov.in / 0161-240112'
  },
  {
    id: 'major-district-roads',
    name: 'Major District Roads (MDR) - District PWD',
    shortName: 'Major District Roads (MDR)',
    agency: 'District PWD & Infrastructure Board',
    code: 'PWD-MDR',
    roadType: 'Major District Roads (MDR)',
    description: 'Arterial district connectors linking agricultural market mandis, towns, and district headquarters.',
    icon: 'Truck',
    color: '#0284c7',
    categories: ['MDR Pavement Defects', 'Market Corridor Potholes', 'Structural Cracking'],
    officerInCharge: 'Er. Manjit Singh (Executive Engineer, District PWD)',
    contact: 'pwd-mdr@punjab.gov.in / 0181-222334'
  },
  {
    id: 'other-district-roads',
    name: 'Other District Roads (ODR) - Zilla Parishad',
    shortName: 'Other District Roads (ODR)',
    agency: 'Zilla Parishad & Rural Infrastructure Development',
    code: 'ZP-ODR',
    roadType: 'Other District Roads (ODR)',
    description: 'Secondary rural-urban connectors facilitating sub-district transport and commercial feeder networks.',
    icon: 'Layers',
    color: '#0d9488',
    categories: ['Secondary District Road Defect', 'Sub-division Potholes', 'Surface Erosion'],
    officerInCharge: 'Er. Neha Gupta (Assistant Executive Engineer, Zilla Parishad)',
    contact: 'zp-odr@punjab.gov.in / 0181-245112'
  },
  {
    id: 'village-rural-roads',
    name: 'Village / Rural Roads - PMGSY',
    shortName: 'Village / Rural Roads',
    agency: 'Panchayati Raj & PMGSY (Pradhan Mantri Gram Sadak Yojana)',
    code: 'PMGSY-VR',
    roadType: 'Village / Rural Roads',
    description: 'All-weather agricultural connectivity, village panchayat transit paths, and rural culvert maintenance.',
    icon: 'Trees',
    color: '#16a34a',
    categories: ['Rural Pavement Failure', 'All-weather Road Defects', 'Panchayat Corridor Potholes'],
    officerInCharge: 'Er. Rajesh Dogra (Nodal Technical Officer, PMGSY)',
    contact: 'pmgsy-punjab@gov.in / 0172-254009'
  },
  {
    id: 'city-municipal-roads',
    name: 'City / Municipal Roads - Municipal Corp',
    shortName: 'City / Municipal Roads',
    agency: 'Municipal Corporation (MC / Urban Local Bodies)',
    code: 'MC-CMR',
    roadType: 'City / Municipal Roads',
    description: 'City avenues, municipal sector roads, commercial market lanes, and urban stormwater road repair.',
    icon: 'Building2',
    color: '#ea580c',
    categories: ['Urban Potholes', 'Drainage Subsidence', 'Crosswalk & Intersection Defects'],
    officerInCharge: 'Er. R. Sharma (Chief Municipal Engineer, Roads & B&R)',
    contact: 'municipal-roads@punjab.gov.in / 0161-240223'
  },
  {
    id: 'expressways',
    name: 'Expressways - Expressway Authority',
    shortName: 'Expressways',
    agency: 'Expressway Development Authority / NHAI (NEAD)',
    code: 'EDA-EXP',
    roadType: 'Expressways',
    description: 'High-speed grade-separated express corridors, micro-surfacing, and rapid emergency pavement response.',
    icon: 'Zap',
    color: '#dc2626',
    categories: ['High-Speed Lane Hazards', 'Expressway Pavement Fissures', 'Rapid Emergency Repairs'],
    officerInCharge: 'Er. Vikram Malhotra (General Manager - Technical, Expressway Division)',
    contact: 'expressways@nhai.gov.in / 011-25074100'
  },
  {
    id: 'ring-roads-bypasses',
    name: 'Ring roads / bypasses - Urban Dev Authority',
    shortName: 'Ring roads / bypasses',
    agency: 'Urban Development Authority (UDA / Ring Road Wing)',
    code: 'UDA-RRB',
    roadType: 'Ring roads / bypasses',
    description: 'Circumferential ring routes and peripheral bypass bypasses diverting interstate freight around congested urban cores.',
    icon: 'RotateCw',
    color: '#d97706',
    categories: ['Bypass Pavement Subsidence', 'Circumferential Highway Defects', 'Heavy Vehicle Rutting'],
    officerInCharge: 'Er. Hardeep Sandhu (Divisional Engineer, Ring Road Project)',
    contact: 'ringroads@punjab.gov.in / 0181-224455'
  },
  {
    id: 'service-roads-nh',
    name: 'Service roads along NH - NHAI Service Wing',
    shortName: 'Service roads along NH',
    agency: 'NHAI Service Corridor & Concessionaire Division',
    code: 'NHAI-SR',
    roadType: 'Service roads along NH',
    description: 'Lateral local service lanes, slip roads, and toll plaza ingress/egress alongside National Highways.',
    icon: 'Split',
    color: '#4f46e5',
    categories: ['Lateral Service Lane Potholes', 'Toll Plaza Approach Defects', 'Slip Road Erosion'],
    officerInCharge: 'Er. Priya Nair (Resident Engineer, Concessionaire Operations)',
    contact: 'nhai-serviceroads@nhai.org / 0172-2708899'
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
