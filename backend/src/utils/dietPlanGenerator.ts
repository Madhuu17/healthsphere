import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface DietPlanInput {
  height: number;     // cm
  weight: number;     // kg
  gender: string;
  age:    number;
  dietType: 'vegan' | 'vegetarian' | 'non-vegetarian';
  allergies: string;
  goal: string;
}

export interface DietPlanResult {
  bmi: number;
  dailyCalories: number;
  plan: string;
}

export async function generateDietPlanAI(input: DietPlanInput): Promise<DietPlanResult> {
  const { height, weight, gender, age, dietType, allergies, goal } = input;

  // ── BMI ───────────────────────────────────────────────────────────────────
  const heightM = height / 100;
  const bmi     = parseFloat((weight / (heightM * heightM)).toFixed(1));

  // ── Mifflin-St Jeor BMR then TDEE at moderate activity ───────────────────
  let bmr: number;
  if (gender?.toLowerCase() === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }
  let tdee = Math.round(bmr * 1.55); // moderate activity

  // Adjust for goal
  let goalAdj = '';
  if (goal === 'weight-loss')  { tdee = Math.round(tdee * 0.85); goalAdj = 'The patient wants to lose weight — the plan should be in a slight caloric deficit.'; }
  if (goal === 'weight-gain')  { tdee = Math.round(tdee * 1.10); goalAdj = 'The patient wants to gain healthy weight — the plan should be in a slight caloric surplus.'; }
  if (!goal || goal === 'maintenance') goalAdj = 'The patient wants to maintain current weight.';

  const dailyCalories = tdee;

  const bmiCategory =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal weight' :
    bmi < 30   ? 'Overweight' : 'Obese';

  const allergyNote = allergies?.trim()
    ? `The patient is allergic to or wants to avoid: ${allergies}. Do NOT include any of these foods.`
    : 'No specific allergies reported.';

  const prompt = `
You are a certified clinical nutritionist AI. Generate a detailed, personalized daily diet plan for a patient.

PATIENT PROFILE:
- Height: ${height} cm
- Weight: ${weight} kg
- Gender: ${gender}
- Age: ${age} years
- BMI: ${bmi} (${bmiCategory})
- Estimated Daily Calorie Requirement: ${dailyCalories} kcal
- Diet Preference: ${dietType}
- Goal: ${goal || 'Maintenance'}
- ${goalAdj}
- Allergies/Restrictions: ${allergyNote}

Generate the diet plan strictly in the following text format (use this template exactly, do not use JSON):

DAILY CALORIE REQUIREMENT: ${dailyCalories} kcal

---BREAKFAST---
(List 3-4 breakfast items with portion sizes)

---MID-MORNING SNACK---
(List 1-2 healthy snacks)

---LUNCH---
(List 4-5 lunch items with portion sizes)

---EVENING SNACK---
(List 1-2 snacks)

---DINNER---
(List 4-5 dinner items with portion sizes)

---NOTES---
• Hydration: (water intake advice)
• Allergen reminder: (remind about allergens to avoid)
• Health tip: (one personalized health tip based on BMI/goal)
• General: (one general wellness advice)

RULES:
- Only suggest ${dietType} foods. Never include meat/fish for vegan/vegetarian.
- Avoid all allergens listed above.
- Keep portions realistic and practical.
- Use simple, everyday Indian or globally common ingredients.
- Keep language simple and friendly.
- Each meal should balance macronutrients appropriately.
`.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  console.log("Gemini response:", response);

  const plan = (response.text ?? '').trim();

  return { bmi, dailyCalories, plan };
}
