import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  doctorId: string;
  name: string;
  email: string;
  passwordHash: string;
  specialization: string;
  hospital: string;
  contactNumber: string;
  qualification: string;
  designation: string;
  experience: number;
  age: number;
  blockedDates: string[]; // ISO date strings
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema({
  doctorId:       { type: String, required: true, unique: true },
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  passwordHash:   { type: String, required: true },
  specialization: { type: String, required: true },
  hospital:       { type: String, required: true },
  contactNumber:  { type: String, required: true },
  qualification:  { type: String, default: '' },
  designation:    { type: String, default: '' },
  experience:     { type: Number, default: 0 },
  age:            { type: Number, default: 0 },
  blockedDates:   [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
