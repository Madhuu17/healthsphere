import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController';

const router = Router();

// POST /api/appointments
router.post('/', createAppointment);

// GET /api/appointments?patientId=xxx  or  ?doctorId=xxx
router.get('/', getAppointments);

// PATCH /api/appointments/:id/status
router.patch('/:id/status', updateAppointmentStatus);

export default router;
