import { Router } from 'express';
import {
  searchDoctors,
  checkAvailability,
  voiceBook,
} from '../controllers/voiceBookingController';

const router = Router();

// POST /api/voice-booking/search-doctors
router.post('/search-doctors', searchDoctors);

// POST /api/voice-booking/check-availability
router.post('/check-availability', checkAvailability);

// POST /api/voice-booking/book
router.post('/book', voiceBook);

export default router;
