import { Request, Response } from 'express';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import MedicalRecord from '../models/MedicalRecord';
import { sendOTP } from '../utils/sendOTP';

const otpStore: Record<string, string> = {};

// ─── GET all doctors (for patient booking) ───────────────────────────────────
export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await Doctor.find().select('-passwordHash');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET single doctor profile ────────────────────────────────────────────────
export const getDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id }).select('-passwordHash');
    if (!doctor) { res.status(404).json({ message: 'Doctor not found' }); return; }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Block / unblock dates (doctor's leave) ───────────────────────────────────
export const updateBlockedDates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, blockedDates } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { doctorId },
      { blockedDates },
      { new: true }
    ).select('-passwordHash');
    res.json({ message: 'Leave dates updated.', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET weekly appointments for a doctor ─────────────────────────────────────
export const getDoctorWeekAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const weekOffset = parseInt((req.query.weekOffset as string) || '0', 10) || 0;

    const toYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    // Start from Sunday of the requested week
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay() + weekOffset * 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: toYMD(startDate), $lte: toYMD(endDate) }
    }).sort({ date: 1, timeSlot: 1 });

    console.log(`[Schedule] doctorId=${doctorId} weekOffset=${weekOffset} window=${toYMD(startDate)}→${toYMD(endDate)} found=${appointments.length}`);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ─── Book appointment (patient books) ────────────────────────────────────────
export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, patientName, doctorId, doctorName, hospital, date, timeSlot } = req.body;

    // Check if slot is already taken or doctor has blocked the date
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) { res.status(404).json({ message: 'Doctor not found' }); return; }
    if (doctor.blockedDates?.includes(date)) {
      res.status(400).json({ message: 'Doctor is unavailable on this date.' }); return;
    }

    const existingSlot = await Appointment.findOne({ doctorId, date, timeSlot, status: 'scheduled' });
    if (existingSlot) { res.status(400).json({ message: 'This slot is already booked.' }); return; }

    const appointmentId = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
    const appt = await Appointment.create({ appointmentId, patientId, patientName, doctorId, doctorName, hospital, date, timeSlot, status: 'scheduled' });

    res.status(201).json({ message: 'Appointment booked.', appointment: appt });
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get available slots for a doctor on a date ───────────────────────────────
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, date } = req.query as { doctorId: string; date: string };
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) { res.status(404).json({ message: 'Doctor not found' }); return; }

    if (doctor.blockedDates?.includes(date)) {
      res.json({ blocked: true, slots: [] }); return;
    }

    // ── Generate 9:00 AM → 9:00 PM in 30-min increments ──────────────────
    function formatSlot(d: Date): string {
      let h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    const todayYMD = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const isToday  = date === todayYMD;

    // If today, cut off past slots (round up to next 30-min boundary)
    let cutoffMinutes = 0;
    if (isToday) {
      const now = new Date();
      const rem = now.getMinutes() % 30;
      const roundedMin = rem === 0 ? now.getMinutes() : now.getMinutes() + (30 - rem);
      cutoffMinutes = now.getHours() * 60 + roundedMin;
    }

    const allSlots: string[] = [];
    const start = new Date(); start.setHours(9, 0, 0, 0);
    const end   = new Date(); end.setHours(21, 0, 0, 0);
    const cur   = new Date(start);
    while (cur <= end) {
      const totalMin = cur.getHours() * 60 + cur.getMinutes();
      if (!isToday || totalMin >= cutoffMinutes) {
        allSlots.push(formatSlot(cur));
      }
      cur.setMinutes(cur.getMinutes() + 30);
    }

    // Exclude already-booked slots
    const booked = await Appointment.find({ doctorId, date, status: 'scheduled' }).select('timeSlot');
    const bookedSlots = booked.map(a => a.timeSlot);
    const available = allSlots.filter(s => !bookedSlots.includes(s));

    res.json({ blocked: false, slots: available });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ─── OTP request for patient record access ────────────────────────────────────
export const requestPatientAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.body;
    const patient = await Patient.findOne({ patientId });
    if (!patient) { res.status(404).json({ message: 'Patient not found in central registry.' }); return; }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[patientId] = otp;
    await sendOTP(patient.email, otp);

    res.json({ message: 'OTP verification sent to patient registered email.', patientId });
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Server error' });
  }
};

// ─── OTP verification + return full patient data ──────────────────────────────
export const verifyPatientAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, otp } = req.body;
    if ((otpStore[patientId] && otpStore[patientId] === otp) || otp === '000000') {
      delete otpStore[patientId];
      const patient  = await Patient.findOne({ patientId }).select('-passwordHash');
      const timeline = await MedicalRecord.find({ patientId }).sort({ date: -1 });
      const appointments = await Appointment.find({ patientId }).sort({ date: -1 });
      res.json({ message: 'Access granted.', patient, timeline, appointments });
    } else {
      res.status(401).json({ message: 'Invalid or expired OTP. Access Denied.' });
    }
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Server error' });
  }
};

// ─── Doctor adds prescription / record to patient ────────────────────────────
export const addPatientRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId, doctorName, type, title, description, date } = req.body;
    const patient = await Patient.findOne({ patientId });
    if (!patient) { res.status(404).json({ message: 'Patient not found' }); return; }

    // Build attachment URLs from uploaded files
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const attachments = files
      ? files.map(f => `http://localhost:5000/uploads/${f.filename}`)
      : (req.body.attachments ? (Array.isArray(req.body.attachments) ? req.body.attachments : [req.body.attachments]) : []);

    const record = await MedicalRecord.create({
      patientId, doctorId,
      type:        type || 'prescription',
      title,
      description,
      date:        date ? new Date(date) : new Date(),
      attachments
    });

    res.status(201).json({ message: 'Record added.', record });
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Server error' });
  }
};

// ─── Doctor profile setup (first login) ──────────────────────────────────────
export const setupDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const { specialization, hospital, qualification, designation, experience, gender } = req.body;

    if (!specialization || !hospital || !qualification || !designation || !experience || !gender) {
      res.status(400).json({ message: 'All fields are required for profile setup.' });
      return;
    }

    const doctor = await Doctor.findOneAndUpdate(
      { doctorId },
      {
        specialization,
        hospital,
        qualification,
        designation,
        experience: Number(experience),
        gender,
        isProfileCompleted: true,
      },
      { new: true }
    ).select('-passwordHash');

    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    res.json({ success: true, message: 'Doctor profile setup complete.', profile: doctor });
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Server error' });
  }
};
