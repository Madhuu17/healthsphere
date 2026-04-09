import express from 'express';
import { getPatientDashboard, setupPatientProfile } from '../controllers/patientController';

const router = express.Router();

router.get('/:id/dashboard',       getPatientDashboard);
router.put('/:patientId/setup',    setupPatientProfile);   // first-login profile setup

export default router;
