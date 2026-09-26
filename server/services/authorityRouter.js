/**
 * UrbanSight - Centralized Authority Routing Service
 *
 * Implements automatic redirection / routing of urban detections
 * to the concerned municipal authority:
 * - Road defects & Potholes       -> Road Safety Department
 * - Traffic flow & Congestion     -> Traffic Police
 * - Pedestrian density & safety   -> Police
 * - Traffic Light monitoring      -> Traffic Police
 */

export const AUTHORITIES = {
  NATIONAL_HIGHWAYS: 'National Highways (NH) - NHAI',
  STATE_HIGHWAYS: 'State Highways (SH) - State PWD',
  MAJOR_DISTRICT_ROADS: 'Major District Roads (MDR) - District PWD',
  OTHER_DISTRICT_ROADS: 'Other District Roads (ODR) - Zilla Parishad',
  VILLAGE_RURAL_ROADS: 'Village / Rural Roads - PMGSY',
  CITY_MUNICIPAL_ROADS: 'City / Municipal Roads - Municipal Corp',
  EXPRESSWAYS: 'Expressways - Expressway Authority',
  RING_ROADS_BYPASSES: 'Ring roads / bypasses - Urban Dev Authority',
  SERVICE_ROADS_NH: 'Service roads along NH - NHAI Service Wing'
};

export const ROAD_TYPES = [
  'National Highways (NH)',
  'State Highways (SH)',
  'Major District Roads (MDR)',
  'Other District Roads (ODR)',
  'Village / Rural Roads',
  'City / Municipal Roads',
  'Expressways',
  'Ring roads / bypasses',
  'Service roads along NH'
];

export const ROAD_CORRIDOR_TEMPLATES = {
  'National Highways (NH)': 'NH-44 Grand Trunk (GT) Road Corridor, KM 372.4',
  'State Highways (SH)': 'SH-24 Kapurthala-Jalandhar State Highway Corridor, Ch. 18+400',
  'Major District Roads (MDR)': 'MDR-68 Nakodar-Phagwara Connecting Arterial Corridor',
  'Other District Roads (ODR)': 'ODR-12 Kartarpur Feeder Corridor',
  'Village / Rural Roads': 'PMGSY Rural Package PB-04-12 Village Access Corridor',
  'City / Municipal Roads': 'Model Town Municipal Boulevard & Civil Lines Corridor',
  'Expressways': 'Northern Access-Controlled Expressway Freight Corridor, KM 48.2',
  'Ring roads / bypasses': 'Jalandhar Peripheral Ring Road Bypass Sector 4',
  'Service roads along NH': 'NH-44 Lateral Service Lane Eastbound, KM 371.8'
};

export const ROUTING_STATUSES = ['pending', 'routed', 'acknowledged', 'resolved'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const CONGESTION_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * Normalizes detection type to standard categories
 */
export function normalizeType(rawType = '') {
  const t = String(rawType).toLowerCase().trim();
  if (t.includes('pothole') || t.includes('crack') || t.includes('defect') || t.includes('road')) {
    return 'pothole';
  }
  if (t.includes('vehicle') || t.includes('car') || t.includes('truck') || t.includes('bus') || t.includes('traffic') || t.includes('congestion')) {
    return 'vehicle';
  }
  if (t.includes('pedestrian') || t.includes('person') || t.includes('crowd') || t.includes('people')) {
    return 'pedestrian';
  }
  if (t.includes('light') || t.includes('signal')) {
    return 'traffic_light';
  }
  return t || 'pothole';
}

/**
 * Calculates congestion level based on vehicle count
 */
export function estimateCongestion(vehicleCount = 0) {
  const count = Number(vehicleCount) || 0;
  if (count >= 7) return 'HIGH';
  if (count >= 4) return 'MEDIUM';
  return 'LOW';
}

/**
 * Calculates incident priority based on detection type and metrics
 */
export function calculatePriority(detection) {
  const normType = normalizeType(detection.type);
  const confidence = Number(detection.confidence) || 0.8;
  const count = Number(detection.count || detection.vehicleCount || detection.pedestrianCount) || 0;

  switch (normType) {
    case 'pothole':
      if (confidence >= 0.90) return 'HIGH';
      if (confidence >= 0.75) return 'MEDIUM';
      return 'LOW';

    case 'vehicle':
    case 'congestion':
      if (count >= 7) return 'HIGH';
      if (count >= 4) return 'MEDIUM';
      return 'LOW';

    case 'pedestrian':
      if (count >= 25) return 'HIGH';
      if (count >= 10) return 'MEDIUM';
      return 'LOW';

    case 'traffic_light':
      if (confidence >= 0.90) return 'MEDIUM';
      return 'LOW';

    default:
      return 'MEDIUM';
  }
}

/**
 * Maps a detection to one of the 9 road departments
 */
export function determineRoadTypeAndAuthority(detection = {}) {
  const rawAuth = detection.authority || '';
  const rawRoadType = detection.roadType || '';
  const rawLoc = String(detection.locationName || '');

  // 1. Direct match on existing 9 authority names
  for (const [key, authName] of Object.entries(AUTHORITIES)) {
    if (rawAuth === authName || rawAuth.includes(authName.split(' - ')[0])) {
      const roadType = authName.split(' - ')[0];
      return { roadType, authority: authName };
    }
  }

  // 2. Direct match on roadType field
  if (rawRoadType && ROAD_TYPES.includes(rawRoadType)) {
    const key = Object.keys(AUTHORITIES).find((k) => AUTHORITIES[k].startsWith(rawRoadType));
    if (key) {
      return { roadType: rawRoadType, authority: AUTHORITIES[key] };
    }
  }

  // 3. Match from location keywords (only if specific and not generic initial template)
  const locLower = rawLoc.toLowerCase();
  const isGenericTemplate = locLower.includes('gt road transit corridor') || locLower.includes('urban transport corridor');

  if (!isGenericTemplate) {
    if (locLower.includes('expressway')) {
      return { roadType: 'Expressways', authority: AUTHORITIES.EXPRESSWAYS };
    }
    if (locLower.includes('bypass') || locLower.includes('ring')) {
      return { roadType: 'Ring roads / bypasses', authority: AUTHORITIES.RING_ROADS_BYPASSES };
    }
    if (locLower.includes('service') || locLower.includes('slip road')) {
      return { roadType: 'Service roads along NH', authority: AUTHORITIES.SERVICE_ROADS_NH };
    }
    if (locLower.includes('state highway') || locLower.includes('sh-')) {
      return { roadType: 'State Highways (SH)', authority: AUTHORITIES.STATE_HIGHWAYS };
    }
    if (locLower.includes('major district') || locLower.includes('mdr')) {
      return { roadType: 'Major District Roads (MDR)', authority: AUTHORITIES.MAJOR_DISTRICT_ROADS };
    }
    if (locLower.includes('other district') || locLower.includes('odr')) {
      return { roadType: 'Other District Roads (ODR)', authority: AUTHORITIES.OTHER_DISTRICT_ROADS };
    }
    if (locLower.includes('village') || locLower.includes('rural') || locLower.includes('pmgsy') || locLower.includes('gram')) {
      return { roadType: 'Village / Rural Roads', authority: AUTHORITIES.VILLAGE_RURAL_ROADS };
    }
    if (locLower.includes('city') || locLower.includes('municipal') || locLower.includes('civil lines') || locLower.includes('chowk') || locLower.includes('model town')) {
      return { roadType: 'City / Municipal Roads', authority: AUTHORITIES.CITY_MUNICIPAL_ROADS };
    }
    if (locLower.includes('nh-') || locLower.includes('national highway')) {
      return { roadType: 'National Highways (NH)', authority: AUTHORITIES.NATIONAL_HIGHWAYS };
    }
  }

  // 4. Deterministic distribution across the 9 road departments based on coordinates or id
  const latVal = Math.abs(Number(detection.lat) || 31.530);
  const lngVal = Math.abs(Number(detection.lng) || 75.892);
  const idStr = String(detection._id || '');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
  }
  const geoSeed = Math.floor((latVal * 10000 + lngVal * 10000 + hash) % 9);
  const assignedRoadType = ROAD_TYPES[geoSeed];
  const authKey = Object.keys(AUTHORITIES).find((k) => AUTHORITIES[k].startsWith(assignedRoadType)) || 'NATIONAL_HIGHWAYS';

  return {
    roadType: assignedRoadType,
    authority: AUTHORITIES[authKey]
  };
}

/**
 * Main routing pipeline: assigns authority, priority, congestion, and routing status
 */
export function routeDetection(rawDetection) {
  const doc = rawDetection.toObject ? rawDetection.toObject() : { ...rawDetection };
  const normType = normalizeType(doc.type);

  const { roadType, authority } = determineRoadTypeAndAuthority(doc);

  let vehicleCount = doc.vehicleCount;
  let pedestrianCount = doc.pedestrianCount;
  const genericCount = Number(doc.count) || 0;

  if (normType === 'vehicle' && (vehicleCount === undefined || vehicleCount === 0)) {
    vehicleCount = genericCount || 1;
  }
  if (normType === 'pedestrian' && (pedestrianCount === undefined || pedestrianCount === 0)) {
    pedestrianCount = genericCount || 1;
  }

  const priority = doc.priority || calculatePriority({ ...doc, type: normType, count: genericCount, vehicleCount, pedestrianCount });

  let congestionLevel = doc.congestionLevel;
  if (normType === 'vehicle' || normType === 'congestion') {
    congestionLevel = estimateCongestion(vehicleCount || genericCount);
  }

  const routingStatus = doc.routingStatus || 'routed';

  let locationName = doc.locationName;
  if (!locationName || locationName.includes('Urban Transport') || locationName.includes('GT Road Transit Corridor')) {
    const template = ROAD_CORRIDOR_TEMPLATES[roadType] || 'NH-44 GT Road Transit Corridor';
    if (doc.lat && doc.lng) {
      locationName = `${template} (${Number(doc.lat).toFixed(4)}, ${Number(doc.lng).toFixed(4)})`;
    } else {
      locationName = template;
    }
  }

  return {
    ...doc,
    type: normType,
    roadType,
    vehicleCount: vehicleCount || 0,
    pedestrianCount: pedestrianCount || 0,
    authority,
    priority,
    congestionLevel: congestionLevel || 'LOW',
    routingStatus,
    locationName,
    timestamp: doc.timestamp || doc.createdAt || new Date()
  };
}

export default {
  AUTHORITIES,
  ROAD_TYPES,
  ROAD_CORRIDOR_TEMPLATES,
  ROUTING_STATUSES,
  PRIORITIES,
  CONGESTION_LEVELS,
  normalizeType,
  estimateCongestion,
  calculatePriority,
  determineRoadTypeAndAuthority,
  routeDetection
};
