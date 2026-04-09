import { Request, Response } from 'express';
import Patient from '../models/Patient';
import MedicalRecord from '../models/MedicalRecord';
import Appointment from '../models/Appointment';

// ── GET Dashboard ────────────────────────────────────────────────────────────
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
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Server error' });
  }
};

// ── SETUP PROFILE (first login) ───────────────────────────────────────────────
export const setupPatientProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { dob, gender, height, weight, bloodGroup, emergencyContact } = req.body;

    // Validate mandatory fields
    if (!dob || !gender || !emergencyContact?.name || !emergencyContact?.phone) {
      res.status(400).json({ message: 'DOB, gender, emergency contact name and phone are required.' });
      return;
    }

    const patient = await Patient.findOneAndUpdate(
      { patientId },
      {
        dob,
        gender,
        height:   height   ? Number(height)   : undefined,
        weight:   weight   ? Number(weight)    : undefined,
        bloodGroup: bloodGroup || '',
        emergencyContact: {
          name:  emergencyContact.name,
          phone: emergencyContact.phone,
        },
        isProfileCompleted: true,
      },
      { new: true }
    ).select('-passwordHash');

    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    res.json({ success: true, message: 'Profile setup complete.', profile: patient });
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Server error' });
  }
};
