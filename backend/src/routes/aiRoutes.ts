import { Router } from 'express';
import { checkSymptoms, matchDoctor, simplifyReport } from '../controllers/aiController';

const router = Router();

// POST /api/ai/symptoms
router.post('/symptoms', checkSymptoms);

// POST /api/ai/match-doctor
router.post('/match-doctor', matchDoctor);

// POST /api/ai/simplify-report
router.post('/simplify-report', simplifyReport);

export default router;
