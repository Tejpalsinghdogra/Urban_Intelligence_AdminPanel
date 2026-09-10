import express from 'express';
import {
  getDetections,
  getDetectionById,
  createDetection,
  getPotholesHeatmap
} from '../controllers/detectionController.js';

const router = express.Router();

// GET /api/detections
router.get('/', getDetections);

// GET /api/detections/heatmap/potholes
router.get('/heatmap/potholes', getPotholesHeatmap);

// GET /api/detections/:id
router.get('/:id', getDetectionById);

// POST /api/detections
router.post('/', createDetection);

export default router;
