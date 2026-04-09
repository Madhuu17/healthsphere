import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  patientId: string;
  doctorId?: string;
  type: 'consultation' | 'prescription' | 'lab_report' | 'xray' | 'vaccination';
  title: string;
  description: string;
  date: Date;
  attachments?: string[];
  aiSummary: string | null;
  summaryGeneratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema: Schema = new Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String },
  type: { type: String, required: true, enum: ['consultation', 'prescription', 'lab_report', 'xray', 'vaccination'] },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  attachments: [{ type: String }],
  aiSummary: { type: String, default: null },
  summaryGeneratedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
