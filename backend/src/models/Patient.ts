import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  name: string;
  email: string;
  passwordHash: string;
  contactNumber: string;

  // Profile setup fields (filled on first login)
  isProfileCompleted: boolean;
  dob?: string;           // ISO date string e.g. "2000-05-15" — used to calc age
  gender?: string;
  height?: number;        // cm
  weight?: number;        // kg
  bloodGroup?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };

  // Optional extra info
  address?: string;
  profilePicture?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    patientId:          { type: String, required: true, unique: true },
    name:               { type: String, required: true },
    email:              { type: String, required: true, unique: true },
    passwordHash:       { type: String, required: true },
    contactNumber:      { type: String, required: true },

    isProfileCompleted: { type: Boolean, default: false },
    dob:                { type: String, default: '' },
    gender:             { type: String, default: '' },
    height:             { type: Number, default: null },
    weight:             { type: Number, default: null },
    bloodGroup:         { type: String, default: '' },
    emergencyContact: {
      name:  { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    address: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);
