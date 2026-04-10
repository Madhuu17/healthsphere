import express from 'express';
import { getDietPlan, generateDietPlan, updateProfileForDiet } from '../controllers/dietPlanController';

const router = express.Router();

router.get('/:patientId',                  getDietPlan);           // GET saved plan
router.post('/:patientId/generate',        generateDietPlan);      // POST generate plan
router.patch('/:patientId/update-profile', updateProfileForDiet);  // PATCH height/weight

export default router;
