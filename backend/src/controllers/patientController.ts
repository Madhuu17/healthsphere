import { Request, Response } from 'express';
import Patient from '../models/Patient';
import MedicalRecord from '../models/MedicalRecord';
import Appointment from '../models/Appointment';

export const getPatientDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id;
    
    const patient = await Patient.findOne({ patientId }).select('-passwordHash');
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const timeline     = await MedicalRecord.find({ patientId }).sort({ date: -1 });
    const appointments = await Appointment.find({ patientId }).sort({ date: -1 });

    res.json({ profile: patient, timeline, appointments });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};
