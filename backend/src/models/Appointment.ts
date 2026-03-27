import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 AM"
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientId:    { type: String, required: true },
  patientName:  { type: String, required: true },
  doctorId:     { type: String, required: true },
  doctorName:   { type: String, required: true },
  hospital:     { type: String, required: true },
  date:         { type: String, required: true },
  timeSlot:     { type: String, required: true },
  status:       { type: String, default: 'scheduled', enum: ['scheduled','completed','cancelled'] }
}, { timestamps: true });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
