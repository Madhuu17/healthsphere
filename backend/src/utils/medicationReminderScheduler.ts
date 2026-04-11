/**
 * medicationReminderScheduler.ts
 *
 * Runs every minute. For each active prescription medicine:
 *  - Generates reminder times based on frequency (once/twice/thrice daily)
 *  - Checks if the current time matches a reminder slot
 *  - Creates an in-app Notification in MongoDB so the patient sees it
 *  - Stops automatically once the medicine endDate has passed
 *
 * Reminder time slots (IST):
 *   Once daily   → 08:00
 *   Twice daily  → 08:00, 20:00
 *   Thrice daily → 08:00, 14:00, 20:00
 */
import cron from 'node-cron';
import Prescription from '../models/Prescription';
import Notification from '../models/Notification';

// Map frequency strings to IST time slots (HH:MM 24h)
const FREQUENCY_SLOTS: Record<string, string[]> = {
  'once daily':          ['08:00'],
  'once a day':          ['08:00'],
  'twice daily':         ['08:00', '20:00'],
  'twice a day':         ['08:00', '20:00'],
  'three times daily':   ['08:00', '14:00', '20:00'],
  'thrice daily':        ['08:00', '14:00', '20:00'],
  'three times a day':   ['08:00', '14:00', '20:00'],
  'every 8 hours':       ['08:00', '16:00', '00:00'],
  'every 12 hours':      ['08:00', '20:00'],
  'four times daily':    ['08:00', '12:00', '16:00', '20:00'],
  'before breakfast':    ['07:30'],
  'after meals':         ['09:00', '14:30', '21:00'],
  'before bed':          ['21:30'],
};

function normaliseFrequency(freq: string): string {
  return (freq || '').toLowerCase().trim();
}

async function runMedicationReminderCheck() {
  const now = new Date();

  // Current IST time as HH:MM
  const currentIST = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Asia/Kolkata',
  }); // e.g. "08:00"

  // Only fetch prescriptions with at least one active medicine
  const prescriptions = await Prescription.find({ 'medicines.status': 'active' });

  for (const rx of prescriptions) {
    for (const med of rx.medicines) {
      if (med.status !== 'active') continue;

      // Auto-expire check
      if (new Date(med.endDate) < now) {
        med.status = 'completed';
        await rx.save();
        continue;
      }

      // Find time slots for this medicine's frequency
      const slots = FREQUENCY_SLOTS[normaliseFrequency(med.frequency)] || [];
      if (!slots.includes(currentIST)) continue;

      // Deduplicate: don't create two notifications in the same minute
      const alreadyNotified = await Notification.findOne({
        patientId: rx.patientId,
        text: { $regex: med.medicineName, $options: 'i' },
        createdAt: { $gte: new Date(now.getTime() - 60_000) }, // within last 60s
      });
      if (alreadyNotified) continue;

      const notifText = `💊 Reminder: Take ${med.medicineName} (${med.dosage}) — ${med.frequency}`;

      // Save in-app notification
      await Notification.create({
        patientId: rx.patientId,
        type: 'prescription',
        text: notifText,
        date: now.toISOString().slice(0, 10),
        isRead: false,
      });

      console.log(`[MedReminder] 🔔 ${notifText} → patient ${rx.patientId}`);
    }
  }
}

export function startMedicationReminderScheduler() {
  // Run once immediately on startup
  runMedicationReminderCheck().catch(err =>
    console.error('[MedReminder] Startup check failed:', err.message)
  );

  // Every minute
  cron.schedule('* * * * *', async () => {
    try {
      await runMedicationReminderCheck();
    } catch (err: any) {
      console.error('[MedReminder] Cron error:', err.message);
    }
  });

  console.log('✅ Medication reminder scheduler started (checks every minute).');
}
