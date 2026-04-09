import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import Appointment from '../models/Appointment';

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, patientName, doctorId, doctorName, hospital, date, timeSlot } = req.body;

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
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('[Appointment] createAppointment error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create appointment', error: error.message });
  }
};

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId } = req.query;

    const filter: Record<string, string> = {};
    if (patientId) filter.patientId = patientId as string;
    if (doctorId)  filter.doctorId  = doctorId  as string;

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error: any) {
    console.error('[Appointment] getAppointments error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
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

    res.status(200).json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('[Appointment] updateAppointmentStatus error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update appointment', error: error.message });
  }
};
