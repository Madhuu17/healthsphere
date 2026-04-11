import { Router } from 'express';
import {
  checkSymptoms,
  matchDoctor,
  simplifyReport,
  getInsights,
  getEvolution,
  getHealthReport,
} from '../controllers/aiController';

const router = Router();

// POST /api/ai/symptoms
router.post('/symptoms', checkSymptoms);

// POST /api/ai/match-doctor
router.post('/match-doctor', matchDoctor);

// POST /api/ai/simplify-report
router.post('/simplify-report', simplifyReport);

// GET /api/ai/insights/:userId — memory insights + evolution
router.get('/insights/:userId', getInsights);

// GET /api/ai/evolution/:userId — AI evolution level
router.get('/evolution/:userId', getEvolution);

// GET /api/ai/health-report/:userId — health intelligence report
router.get('/health-report/:userId', getHealthReport);

// Legacy route (kept for backward compat — redirects to new insights)
router.get('/memory-insights/:userId', getInsights);

export default router;
