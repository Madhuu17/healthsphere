import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  patientId: string;
  medicineName: string;
  dosage: string;
  times: string[]; // e.g. ["08:00", "20:00"]
  notes?: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    times: { type: [String], required: true },
    notes: { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
