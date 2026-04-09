import { Request, Response } from 'express';
import Reminder from '../models/Reminder';

// POST /api/reminders — Create a new reminder
export const createReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, medicineName, dosage, times, notes, timezone } = req.body;

    if (!patientId || !medicineName || !dosage || !times || !times.length) {
      res.status(400).json({ success: false, message: 'patientId, medicineName, dosage, and times are required.' });
      return;
    }

    const reminder = new Reminder({ patientId, medicineName, dosage, times, notes: notes || '', timezone: timezone || 'Asia/Kolkata' });
    await reminder.save();

    res.status(201).json({ success: true, data: reminder });
  } catch (err: any) {
    console.error('[Reminder] createReminder error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create reminder.' });
  }
};

// GET /api/reminders/:patientId — Get all reminders for a patient
export const getReminders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const reminders = await Reminder.find({ patientId, isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reminders });
  } catch (err: any) {
    console.error('[Reminder] getReminders error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch reminders.' });
  }
};

// DELETE /api/reminders/:id — Delete (deactivate) a reminder
export const deleteReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!reminder) {
      res.status(404).json({ success: false, message: 'Reminder not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Reminder removed.' });
  } catch (err: any) {
    console.error('[Reminder] deleteReminder error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete reminder.' });
  }
};
