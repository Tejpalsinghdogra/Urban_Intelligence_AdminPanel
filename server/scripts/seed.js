import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Detection from '../models/Detection.js';
import Authority from '../models/Authority.js';
import { AUTHORITIES_META } from '../controllers/authorityController.js';
import { routeDetection } from '../services/authorityRouter.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_intelligence';

const POTHOLE_IMAGES = [
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/sample.jpg'
];

const VEHICLE_IMAGES = [
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
];

const PEDESTRIAN_IMAGES = [
  'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
];

const TRAFFIC_LIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80'
];

// Corridors around Ludhiana
const TRANSIT_CORRIDORS = [
  { name: 'Ferozepur Road - Transit Sector 4', lat: 30.9010, lng: 75.8573 },
  { name: 'Civil Lines Bus Bay 3', lat: 30.9080, lng: 75.8640 },
  { name: 'Sarabha Nagar Market Crossing', lat: 30.8985, lng: 75.8420 },
  { name: 'Clock Tower Junction Bus Lane', lat: 30.9170, lng: 75.8720 },
  { name: 'Railway Station Approach Flyover', lat: 30.9260, lng: 75.8830 },
  { name: 'Mall Road Pedestrian Crosswalk', lat: 30.9120, lng: 75.8670 },
  { name: 'PAU Gate 2 Transit Lane', lat: 30.9025, lng: 75.8390 },
  { name: 'Model Town Gol Market Arterial', lat: 30.8890, lng: 75.8460 },
  { name: 'Bharat Nagar Chowk Expressway Link', lat: 30.9045, lng: 75.8520 },
  { name: 'Jalandhar Bypass Transit Hub', lat: 30.9380, lng: 75.8750 }
];

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Seed Authorities
    console.log('Seeding Authorities collection...');
    await Authority.deleteMany({});
    for (const auth of AUTHORITIES_META) {
      await Authority.create({
        name: auth.name,
        code: auth.code,
        description: auth.description,
        color: auth.color,
        icon: auth.icon,
        categories: auth.categories
      });
    }

    // Preserve existing database documents if needed, but let's refresh or enhance
    console.log('Refreshing detection seed data...');
    await Detection.deleteMany({});

    const rawDetections = [];
    const statuses = ['pending', 'routed', 'acknowledged', 'resolved'];

    // 1. Generate 24 Potholes (matches section 1 requirement: 24 potholes)
    for (let i = 1; i <= 24; i++) {
      const corridor = TRANSIT_CORRIDORS[i % TRANSIT_CORRIDORS.length];
      const latOffset = (Math.random() - 0.5) * 0.006;
      const lngOffset = (Math.random() - 0.5) * 0.006;
      const confidence = Number((0.74 + Math.random() * 0.24).toFixed(2));
      const hoursAgo = Math.floor(Math.random() * 72);

      const status = i <= 15 ? 'routed' : i <= 21 ? 'acknowledged' : 'resolved';

      rawDetections.push({
        type: 'pothole',
        confidence,
        lat: Number((corridor.lat + latOffset).toFixed(6)),
        lng: Number((corridor.lng + lngOffset).toFixed(6)),
        locationName: `${corridor.name} (Sec #${i})`,
        imageUrl: POTHOLE_IMAGES[i % POTHOLE_IMAGES.length],
        timestamp: new Date(Date.now() - hoursAgo * 3600 * 1000),
        notes: `AI Detector observed asphalt crater defect (${(confidence * 100).toFixed(0)}% confidence). Requires patching.`,
        routingStatus: status
      });
    }

    // 2. Generate Vehicles & Traffic Congestion records
    // Total vehicle sum ~ 187 to match prompt requirement
    const vehicleCounts = [18, 22, 14, 16, 12, 15, 11, 19, 13, 10, 8, 9, 7, 6, 4, 3];
    vehicleCounts.forEach((count, idx) => {
      const corridor = TRANSIT_CORRIDORS[idx % TRANSIT_CORRIDORS.length];
      const latOffset = (Math.random() - 0.5) * 0.005;
      const lngOffset = (Math.random() - 0.5) * 0.005;
      const hoursAgo = Math.floor(Math.random() * 48);
      const status = idx % 3 === 0 ? 'routed' : idx % 3 === 1 ? 'acknowledged' : 'resolved';

      rawDetections.push({
        type: 'vehicle',
        vehicleCount: count,
        confidence: Number((0.82 + Math.random() * 0.16).toFixed(2)),
        lat: Number((corridor.lat + latOffset).toFixed(6)),
        lng: Number((corridor.lng + lngOffset).toFixed(6)),
        locationName: `${corridor.name} (Lane #${idx + 1})`,
        imageUrl: VEHICLE_IMAGES[idx % VEHICLE_IMAGES.length],
        timestamp: new Date(Date.now() - hoursAgo * 3600 * 1000),
        notes: `Fleet camera logged ${count} vehicles. Dynamic queue density evaluated.`,
        routingStatus: status
      });
    });

    // 3. Generate Pedestrian records
    // Total pedestrian sum ~ 542 to match prompt requirement
    const pedCounts = [47, 52, 60, 41, 55, 38, 49, 44, 50, 42, 36, 28];
    pedCounts.forEach((count, idx) => {
      const corridor = TRANSIT_CORRIDORS[idx % TRANSIT_CORRIDORS.length];
      const latOffset = (Math.random() - 0.5) * 0.005;
      const lngOffset = (Math.random() - 0.5) * 0.005;
      const hoursAgo = Math.floor(Math.random() * 36);
      const status = idx % 2 === 0 ? 'routed' : idx % 3 === 0 ? 'acknowledged' : 'resolved';

      rawDetections.push({
        type: 'pedestrian',
        pedestrianCount: count,
        confidence: Number((0.85 + Math.random() * 0.13).toFixed(2)),
        lat: Number((corridor.lat + latOffset).toFixed(6)),
        lng: Number((corridor.lng + lngOffset).toFixed(6)),
        locationName: `${corridor.name} (Transit Shelter)`,
        imageUrl: PEDESTRIAN_IMAGES[idx % PEDESTRIAN_IMAGES.length],
        timestamp: new Date(Date.now() - hoursAgo * 3600 * 1000),
        notes: `High pedestrian concentration (${count} people) detected at transit point.`,
        routingStatus: status
      });
    });

    // 4. Generate Traffic Light detections
    for (let i = 1; i <= 6; i++) {
      const corridor = TRANSIT_CORRIDORS[i % TRANSIT_CORRIDORS.length];
      rawDetections.push({
        type: 'traffic_light',
        confidence: 0.94,
        lat: corridor.lat,
        lng: corridor.lng,
        locationName: `${corridor.name} Signal Box`,
        imageUrl: TRAFFIC_LIGHT_IMAGES[0],
        timestamp: new Date(Date.now() - i * 4 * 3600 * 1000),
        notes: 'Smart camera signal synchronization verified.',
        routingStatus: 'resolved'
      });
    }

    console.log(`Processing ${rawDetections.length} detections through authority router...`);
    for (const raw of rawDetections) {
      const routed = routeDetection(raw);
      routed.statusHistory = [
        {
          status: routed.routingStatus,
          changedAt: routed.timestamp,
          notes: `Automated dispatch to ${routed.authority} with ${routed.priority} priority`
        }
      ];
      await Detection.create(routed);
    }

    const count = await Detection.countDocuments();
    console.log(`Successfully seeded ${count} detections!`);

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
