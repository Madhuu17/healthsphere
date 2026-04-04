import { Request, Response } from 'express';
import { checkSymptomsAI } from '../utils/aiSymptomChecker';
import { matchDoctorAI } from '../utils/doctorMatcher';
import { simplifyReportAI } from '../utils/reportSimplifier';

export const checkSymptoms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
      res.status(400).json({ success: false, message: 'symptoms field is required and must be a non-empty string' });
      return;
    }

    const result = await checkSymptomsAI(symptoms.trim());

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[AI] checkSymptoms error:', error.message);
    res.status(500).json({ success: false, message: 'AI symptom analysis failed', error: error.message });
  }
};

export const matchDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
      res.status(400).json({ success: false, message: 'symptoms field is required and must be a non-empty string' });
      return;
    }

    const result = await matchDoctorAI(symptoms.trim());

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[AI] matchDoctor error:', error.message);
    res.status(500).json({ success: false, message: 'AI doctor matching failed', error: error.message });
  }
};

export const simplifyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { report } = req.body;

    if (!report || typeof report !== 'string' || report.trim() === '') {
      res.status(400).json({ success: false, message: 'report field is required and must be a non-empty string' });
      return;
    }

    const result = await simplifyReportAI(report.trim());

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[AI] simplifyReport error:', error.message);
    res.status(500).json({ success: false, message: 'AI report simplification failed', error: error.message });
  }
};
