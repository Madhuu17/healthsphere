import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  name: string;
  email: string;
  passwordHash: string;
  bloodGroup: string;
  age: number;
  gender: string;
  contactNumber: string;
  emergencyContact: {
    name: string;
    relation: string;
    number: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    number: { type: String, required: true }
  }
}, { timestamps: true });

export default mongoose.model<IPatient>('Patient', PatientSchema);
