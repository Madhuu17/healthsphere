import { Request, Response } from 'express';
import MedicalRecord from '../models/MedicalRecord';
import { generateAiSummary } from '../utils/aiSummarizer';

/**
 * POST /api/medical-records
 *
 * Creates a new medical record (prescription or report).
 * aiSummary is always null on creation — patient generates it on demand.
 */
export const createRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId, type, title, description, date } = req.body;

    if (!patientId || !type || !title || !description) {
      res.status(400).json({ success: false, message: 'patientId, type, title, and description are required.' });
      return;
    }

    // Build attachment URLs (if files uploaded via multipart)
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const attachments = files
      ? files.map((f) => `http://localhost:5000/uploads/${f.filename}`)
      : (req.body.attachments
          ? (Array.isArray(req.body.attachments) ? req.body.attachments : [req.body.attachments])
          : []);

    const record = await MedicalRecord.create({
      patientId,
      doctorId: doctorId || undefined,
      type:     type || 'prescription',
      title,
      description,
      date:     date ? new Date(date) : new Date(),
      attachments,
      aiSummary: null, // always null on create — generated on demand
    });

    res.status(201).json({ success: true, record });
  } catch (error: any) {
    console.error('[MedicalRecord] createRecord error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create record.', error: error.message });
  }
};

/**
 * GET /api/medical-records/:recordId
 *
 * Returns a single medical record by its MongoDB _id.
 */
export const getRecordById = async (req: Request, res: Response): Promise<void> => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId);
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found.' });
      return;
    }
    res.json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch record.', error: error.message });
  }
};

/**
 * POST /api/medical-records/summarize/:recordId
 *
 * Generates an AI summary for a single medical record.
 * - If aiSummary already exists → returns it immediately (no AI call)
 * - If aiSummary is null → calls Gemini, saves result, returns it
 * This guarantees ONE-TIME generation per record (idempotent).
 */
export const summarizeRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.params;

    // 1. Fetch the record
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      res.status(404).json({ success: false, message: 'Medical record not found.' });
      return;
    }

    // 2. Guard: summary already exists → return stored summary, no API call
    if (record.aiSummary) {
      res.json({
        success: true,
        alreadyExists: true,
        aiSummary: record.aiSummary,
        summaryGeneratedAt: record.summaryGeneratedAt,
      });
      return;
    }

    // 3. Build the content to summarize
    //    We include title + description as the full context
    const content = `Title: ${record.title}\n\nDetails: ${record.description}`;

    // 4. Call Gemini
    const result = await generateAiSummary(content, record.type, record.title);

    // 5. Persist the summary — atomic update so concurrent calls can't double-write
    const updated = await MedicalRecord.findOneAndUpdate(
      { _id: recordId, aiSummary: null }, // only update if still null
      {
        $set: {
          aiSummary: result.formatted,
          summaryGeneratedAt: new Date(),
        },
      },
      { new: true }
    );

    // If another request beat us to it (race condition), return whatever is in DB
    const finalSummary = updated?.aiSummary ?? record.aiSummary;
    const finalDate    = updated?.summaryGeneratedAt ?? record.summaryGeneratedAt;

    res.json({
      success: true,
      alreadyExists: !updated,
      aiSummary: finalSummary,
      summaryGeneratedAt: finalDate,
    });
  } catch (error: any) {
    console.error('[AI Summarizer] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'AI summarization failed. Please try again.',
      error: error.message,
    });
  }
};

/**
 * GET /api/medical-records/patient/:patientId
 *
 * Returns all medical records for a patient (includes aiSummary field).
 * Used by patient dashboard to check which records already have a summary.
 */
export const getPatientRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.find({ patientId }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch records.', error: error.message });
  }
};
