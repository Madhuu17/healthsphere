import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  prioritizeAppointment,
} from '../controllers/appointmentController';

const router = Router();

// POST /api/appointments
router.post('/', createAppointment);

// GET /api/appointments?patientId=xxx  or  ?doctorId=xxx
router.get('/', getAppointments);

// GET /api/appointments/patient/:patientId — dedicated patient endpoint
router.get('/patient/:patientId', getPatientAppointments);

// PATCH /api/appointments/:id/status
router.patch('/:id/status', updateAppointmentStatus);

// PATCH /api/appointments/:id/prioritize
router.patch('/:id/prioritize', prioritizeAppointment);

export default router;
