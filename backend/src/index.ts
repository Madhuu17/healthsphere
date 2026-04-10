import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import connectDB from './config/db';
import { startReminderScheduler } from './utils/reminderScheduler';

dotenv.config();
connectDB().then(() => startReminderScheduler());

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Test Route
app.get('/', (req, res) => {
  res.send('HealthSphere API is running...');
});

import authRoutes          from './routes/authRoutes';
import patientRoutes       from './routes/patientRoutes';
import doctorRoutes        from './routes/doctorRoutes';
import aiRoutes            from './routes/aiRoutes';
import appointmentRoutes   from './routes/appointmentRoutes';
import medicalRecordRoutes from './routes/medicalRecordRoutes';
import reminderRoutes      from './routes/reminderRoutes';
import notificationRoutes  from './routes/notificationRoutes';
import dietPlanRoutes      from './routes/dietPlanRoutes';

app.use('/api/auth',            authRoutes);
app.use('/api/patients',        patientRoutes);
app.use('/api/doctor',          doctorRoutes);
app.use('/api/ai',              aiRoutes);
app.use('/api/appointments',    appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reminders',       reminderRoutes);
app.use('/api/notifications',   notificationRoutes);
app.use('/api/diet-plans',      dietPlanRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
