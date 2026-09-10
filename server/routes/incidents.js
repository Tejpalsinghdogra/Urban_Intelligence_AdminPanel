import express from 'express';
import {
  getIncidents,
  updateIncidentStatus
} from '../controllers/incidentController.js';

const router = express.Router();

// GET /api/incidents
router.get('/', getIncidents);

// PATCH /api/incidents/:id/status
router.patch('/:id/status', updateIncidentStatus);

export default router;
