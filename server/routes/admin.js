import express from 'express';
import { getOverview } from '../controllers/adminController.js';

const router = express.Router();

// GET /api/admin/overview
router.get('/overview', getOverview);

export default router;
