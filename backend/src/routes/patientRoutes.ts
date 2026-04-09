import express from 'express';
import {
  getPatientDashboard,
  setupPatientProfile,
  updatePatientProfile,
} from '../controllers/patientController';

const router = express.Router();

router.get('/:id/dashboard',           getPatientDashboard);
router.put('/:patientId/setup',        setupPatientProfile);    // first-login profile setup
router.put('/:patientId/profile',      updatePatientProfile);   // edit profile from dashboard

export default router;
