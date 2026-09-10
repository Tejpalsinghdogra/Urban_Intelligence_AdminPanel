import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import adminRoutes from './routes/admin.js';
import detectionRoutes from './routes/detections.js';
import incidentRoutes from './routes/incidents.js';
import authorityRoutes from './routes/authorities.js';
import { initSocket, emitNewDetection, emitIncidentUpdated } from './services/socketService.js';
import { fetchRealCloudinaryImages } from './services/cloudinary.js';
import Detection from './models/Detection.js';
import Authority from './models/Authority.js';
import { AUTHORITIES_META } from './controllers/authorityController.js';
import { routeDetection } from './services/authorityRouter.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

initSocket(io);

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/authorities', authorityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'UrbanSight Authority Routing Admin Server',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    targetDatabase: mongoose.connection.name
  });
});

// Root
app.get('/', (req, res) => {
  res.send('UrbanSight Authority API Server is running on real MongoDB Atlas & Cloudinary.');
});

/**
 * Initializes Authorities collection and synchronizes existing detections
 */
async function syncDatabase() {
  try {
    // Seed Authorities metadata if empty
    const authCount = await Authority.countDocuments();
    if (authCount === 0) {
      console.log('[Init] Seeding Authorities metadata...');
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
      console.log('[Init] Authorities metadata initialized.');
    }

    // Backfill any existing un-routed detections in Atlas
    const unrouted = await Detection.find({
      $or: [{ authority: { $exists: false } }, { authority: null }, { routingStatus: { $exists: false } }]
    });

    if (unrouted.length > 0) {
      console.log(`[Init] Backfilling ${unrouted.length} real detections with authority routing rules...`);
      for (const doc of unrouted) {
        const routed = routeDetection(doc);
        doc.authority = routed.authority;
        doc.priority = routed.priority;
        doc.routingStatus = routed.routingStatus;
        doc.locationName = routed.locationName;
        doc.congestionLevel = routed.congestionLevel;
        if (routed.vehicleCount) doc.vehicleCount = routed.vehicleCount;
        if (routed.pedestrianCount) doc.pedestrianCount = routed.pedestrianCount;
        await doc.save();
      }
      console.log('[Init] Real detections successfully routed and saved to Atlas.');
    }
  } catch (err) {
    console.error('[Init] Error during database synchronization:', err.message);
  }
}

/**
 * Sets up MongoDB Change Stream on Atlas to listen for real detections
 * created by external detector scripts in real-time!
 */
function setupAtlasChangeStream() {
  try {
    const changeStream = mongoose.connection.collection('detections').watch([], { fullDocument: 'updateLookup' });

    changeStream.on('change', async (change) => {
      console.log(`[ChangeStream] Detected real MongoDB change: ${change.operationType}`);

      if (change.operationType === 'insert' && change.fullDocument) {
        const raw = change.fullDocument;
        const routed = routeDetection(raw);

        // Ensure authority and routing status are persisted
        if (!raw.authority || !raw.routingStatus) {
          await Detection.findByIdAndUpdate(raw._id, {
            authority: routed.authority,
            priority: routed.priority,
            routingStatus: routed.routingStatus,
            locationName: routed.locationName,
            congestionLevel: routed.congestionLevel
          });
        }

        console.log(`[ChangeStream] Emitting new real detection: ${routed.type} -> ${routed.authority}`);
        emitNewDetection(routed);
      } else if (change.operationType === 'update' && change.fullDocument) {
        const formatted = routeDetection(change.fullDocument);
        emitIncidentUpdated(formatted);
      }
    });

    changeStream.on('error', (err) => {
      console.error('[ChangeStream] Atlas ChangeStream error:', err.message);
    });

    console.log('✓ Active MongoDB Atlas Change Stream listening on detections collection');
  } catch (err) {
    console.warn('[ChangeStream] Change stream could not be initialized:', err.message);
  }
}

// Database Connection & Server Start
async function startServer() {
  try {
    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(MONGODB_URI, {
      dbName: 'test' // Default database used by the detector
    });
    console.log(`✓ Connected to MongoDB database (${mongoose.connection.name})`);

    // Fetch real Cloudinary images
    await fetchRealCloudinaryImages();

    // Synchronize existing real data
    await syncDatabase();

    // Listen for live detector updates via Change Stream
    setupAtlasChangeStream();

    server.listen(PORT, () => {
      console.log(`✓ Admin Server running on http://localhost:${PORT}`);
      console.log(`✓ Real-time Socket.IO active on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, server, io };
