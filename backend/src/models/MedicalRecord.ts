import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  patientId: string;
  doctorId?: string;
  type: 'consultation' | 'prescription' | 'lab_report' | 'xray' | 'vaccination';
  /** High-level section: "prescription" | "report"  (used by new UI tabs) */
  recordType: 'prescription' | 'report';
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
  patientId:  { type: String, required: true },
  doctorId:   { type: String },
  type:       { type: String, required: true, enum: ['consultation', 'prescription', 'lab_report', 'xray', 'vaccination'] },
  /** "prescription" → Prescriptions tab  |  "report" → Other Records tab */
  recordType: { type: String, required: true, enum: ['prescription', 'report'], default: 'report' },
  title:      { type: String, required: true },
  description:{ type: String, required: true },
  date:       { type: Date, required: true, default: Date.now },
  attachments:[{ type: String }],
  aiSummary:  { type: String, default: null },
  summaryGeneratedAt: { type: Date, default: null },
}, { timestamps: true });

// Index for fast per-patient, per-type queries sorted by date
MedicalRecordSchema.index({ patientId: 1, recordType: 1, date: -1 });

export default mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
