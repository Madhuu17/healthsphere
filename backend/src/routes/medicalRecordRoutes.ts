import { Router } from 'express';
import { upload } from '../utils/upload';
import {
  createRecord,
  getRecordById,
  summarizeRecord,
  getPatientRecords,
} from '../controllers/medicalRecordController';

const router = Router();

// ── Creation (doctor adds record for a patient) ──────────────────────────────
// POST /api/medical-records   → create record (JSON or multipart with attachments)
router.post('/', upload.array('attachments', 5), createRecord);

// ── AI Summarization (one-time per record) ────────────────────────────────────
// POST /api/medical-records/summarize/:recordId → generate & store AI summary
// NOTE: specific named paths MUST precede dynamic /:recordId to avoid conflicts
router.post('/summarize/:recordId', summarizeRecord);

// ── Patient view: all records ─────────────────────────────────────────────────
// GET  /api/medical-records/patient/:patientId  → all records (with aiSummary)
router.get('/patient/:patientId', getPatientRecords);

// ── Single record fetch ───────────────────────────────────────────────────────
// GET  /api/medical-records/:recordId    → fetch one record by _id (put LAST)
router.get('/:recordId', getRecordById);

export default router;


