import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import Appointment from '../models/Appointment';
import MedicalRecord from '../models/MedicalRecord';

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, patientName, doctorId, doctorName, hospital, date, timeSlot, severityScore } = req.body;

    if (!patientId || !patientName || !doctorId || !doctorName || !hospital || !date || !timeSlot) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const appointment = await Appointment.create({
      appointmentId: randomUUID(),
      patientId,
      patientName,
      doctorId,
      doctorName,
      hospital,
      date,
      timeSlot,
      status: 'scheduled',
      severityScore: severityScore ?? null,
      isPriority: false,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('[Appointment] createAppointment error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create appointment', error: error.message });
  }
};

// GET /api/appointments?patientId=xxx  or  ?doctorId=xxx
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId } = req.query;

    const filter: Record<string, string> = {};
    if (patientId) filter.patientId = patientId as string;
    if (doctorId)  filter.doctorId  = doctorId  as string;

    const appointments = await Appointment.find(filter).sort({ date: -1, createdAt: -1 });

    // Return flat array for backward compat AND wrapped format
    res.status(200).json(appointments);
  } catch (error: any) {
    console.error('[Appointment] getAppointments error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
  }
};

// GET /api/appointments/patient/:patientId — dedicated patient endpoint
export const getPatientAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId }).sort({ date: -1, createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error: any) {
    console.error('[Appointment] getPatientAppointments error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch patient appointments' });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }

    const appointment = await Appointment.findOneAndUpdate(
      { appointmentId: id },
      { status },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    // ── TIMELINE SYNC: auto-create timeline entry when completed ──
    if (status === 'completed') {
      const existingEntry = await MedicalRecord.findOne({
        patientId: appointment.patientId,
        type: 'consultation',
        title: { $regex: appointment.appointmentId, $options: 'i' }
      });

      if (!existingEntry) {
        await MedicalRecord.create({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          type: 'consultation',
          title: `Consultation with ${appointment.doctorName} [${appointment.appointmentId}]`,
          description: `Completed appointment at ${appointment.hospital}. Time slot: ${appointment.timeSlot}. Date: ${appointment.date}.`,
          date: new Date(appointment.date),
          attachments: [],
        });
        console.log(`[Timeline] Created timeline entry for completed appointment ${appointment.appointmentId}`);
      }
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('[Appointment] updateAppointmentStatus error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update appointment', error: error.message });
  }
};

// POST /api/appointments/:id/prioritize
export const prioritizeAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOneAndUpdate(
      { appointmentId: id },
      { isPriority: true },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    // Create a notification for the patient (matches Notification schema)
    const Notification = (await import('../models/Notification')).default;
    await Notification.create({
      patientId: appointment.patientId,
      type:      'appointment',
      text:      'The doctor is available now. Please come immediately.',
      date:      new Date().toISOString().split('T')[0],
      isRead:    false,
    });

    console.log(`[Priority] Appointment ${id} prioritised; notification sent to ${appointment.patientId}`);
    res.status(200).json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('[Appointment] prioritizeAppointment error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to prioritize appointment', error: error.message });
  }
};
