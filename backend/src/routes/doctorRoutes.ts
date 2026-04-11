import express from 'express';
import { upload } from '../utils/upload';
import {
  getAllDoctors,
  getDoctorProfile,
  updateBlockedDates,
  getDoctorWeekAppointments,
  bookAppointment,
  getAvailableSlots,
  requestPatientAccess,
  verifyPatientAccess,
  addPatientRecord,
  setupDoctorProfile,
  getPatientSummary,
} from '../controllers/doctorController';

const router = express.Router();

router.get('/all',                 getAllDoctors);
router.get('/profile/:id',         getDoctorProfile);
router.post('/blocked-dates',      updateBlockedDates);
router.get('/schedule/:doctorId',  getDoctorWeekAppointments);
router.post('/book',               bookAppointment);
router.get('/slots',               getAvailableSlots);
router.post('/search',             requestPatientAccess);
router.post('/verify',             verifyPatientAccess);

// AI Symptom Summary for doctor
router.get('/patient-summary/:patientId', getPatientSummary);

// Multipart form with up to 5 image/file attachments
router.post('/add-record', upload.array('attachments', 5), addPatientRecord);

// First-login profile setup
router.put('/setup/:doctorId', setupDoctorProfile);

export default router;
