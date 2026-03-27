import express from 'express';
import { getPatientDashboard } from '../controllers/patientController';

const router = express.Router();

router.get('/:id/dashboard', getPatientDashboard);

export default router;
