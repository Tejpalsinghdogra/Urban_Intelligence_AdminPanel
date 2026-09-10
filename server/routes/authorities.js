import express from 'express';
import {
  getAuthorities,
  getAuthorityIncidents
} from '../controllers/authorityController.js';

const router = express.Router();

// GET /api/authorities
router.get('/', getAuthorities);

// GET /api/authorities/:authorityName/incidents
router.get('/:authorityName/incidents', getAuthorityIncidents);

export default router;
