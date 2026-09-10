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
  ROAD_SAFETY: 'Road Safety Department',
  TRAFFIC_POLICE: 'Traffic Police',
  POLICE: 'Police'
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
 * 0-3 vehicles -> LOW
 * 4-6 vehicles -> MEDIUM
 * 7+ vehicles  -> HIGH
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
 * Routes detection to the concerned authority based on detection category
 */
export function determineAuthority(type) {
  const normType = normalizeType(type);
  switch (normType) {
    case 'pothole':
      return AUTHORITIES.ROAD_SAFETY;

    case 'vehicle':
    case 'congestion':
    case 'traffic_light':
      return AUTHORITIES.TRAFFIC_POLICE;

    case 'pedestrian':
      return AUTHORITIES.POLICE;

    default:
      return AUTHORITIES.ROAD_SAFETY;
  }
}

/**
 * Main routing pipeline: assigns authority, priority, congestion, and routing status
 */
export function routeDetection(rawDetection) {
  const doc = rawDetection.toObject ? rawDetection.toObject() : { ...rawDetection };
  const normType = normalizeType(doc.type);

  const authority = doc.authority || determineAuthority(normType);

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
  if (!locationName) {
    // Generate location from coords if in Jalandhar / Punjab corridor
    if (doc.lat && doc.lng) {
      locationName = `GT Road Transit Corridor (${Number(doc.lat).toFixed(4)}, ${Number(doc.lng).toFixed(4)})`;
    } else {
      locationName = 'Urban Transit Corridor';
    }
  }

  return {
    ...doc,
    type: normType,
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
  ROUTING_STATUSES,
  PRIORITIES,
  CONGESTION_LEVELS,
  normalizeType,
  estimateCongestion,
  calculatePriority,
  determineAuthority,
  routeDetection
};
