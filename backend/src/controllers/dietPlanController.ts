import { Request, Response } from 'express';
import Patient from '../models/Patient';
import DietPlan from '../models/DietPlan';
import { generateDietPlanAI } from '../utils/dietPlanGenerator';

// ── Helper: calculate age from DOB ─────────────────────────────────────────
function calcAge(dob: string): number {
  if (!dob) return 25; // default fallback
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age || 25;
}

// ── GET saved diet plan for a patient ──────────────────────────────────────
export const getDietPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const plan = await DietPlan.findOne({ patientId });
    res.json({ success: true, plan: plan || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GENERATE diet plan ─────────────────────────────────────────────────────
export const generateDietPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { dietType, allergies, goal } = req.body;

    console.log("Incoming request:", req.body);

    if (!dietType) {
      res.status(400).json({ success: false, message: 'dietType is required.' });
      return;
    }

    // Fetch patient profile
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    // Check required fields
    if (!patient.height || !patient.weight) {
      res.status(422).json({
        success: false,
        missingProfile: true,
        message: 'Height and weight are required to generate a diet plan.',
      });
      return;
    }

    const age = calcAge(patient.dob || '');
    const gender = patient.gender || 'Male';

    // Call AI generator
    console.log("Calling Gemini API...");
    const result = await generateDietPlanAI({
      height: patient.height,
      weight: patient.weight,
      gender,
      age,
      dietType,
      allergies: allergies || '',
      goal: goal || '',
    });

    // Upsert (one plan per patient)
    const savedPlan = await DietPlan.findOneAndUpdate(
      { patientId },
      {
        patientId,
        preferences: { dietType, allergies: allergies || '', goal: goal || '' },
        metrics: { bmi: result.bmi, dailyCalories: result.dailyCalories },
        generatedPlan: result.plan,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, plan: savedPlan });
  } catch (error: any) {
    console.error("Diet Plan Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── UPDATE patient height/weight (called from the incomplete-profile modal) ─
export const updateProfileForDiet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { height, weight } = req.body;

    if (!height || !weight) {
      res.status(400).json({ success: false, message: 'Height and weight are required.' });
      return;
    }

    const patient = await Patient.findOneAndUpdate(
      { patientId },
      { $set: { height: Number(height), weight: Number(weight) } },
      { new: true }
    ).select('-passwordHash');

    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    res.json({ success: true, profile: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
