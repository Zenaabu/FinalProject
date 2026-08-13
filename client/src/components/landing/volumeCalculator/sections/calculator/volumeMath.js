// Standard surfing-industry approach: Weight (kg) * Skill Factor = Volume (L).
// The skill factor is the main driver; fitness level nudges it slightly since
// a stronger paddler needs a touch less volume than an equally-skilled surfer
// who tires quickly.
export const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner", factor: 0.65 },
  { value: "intermediate", label: "Intermediate", factor: 0.55 },
  { value: "advanced", label: "Advanced", factor: 0.45 },
  { value: "expert", label: "Expert / Pro", factor: 0.35 },
];

export const FITNESS_LEVELS = [
  { value: "below_average", label: "Below Average", adjustment: 0.03 },
  { value: "average", label: "Average", adjustment: 0 },
  { value: "very_fit", label: "Very Fit", adjustment: -0.03 },
];

export function calculateVolumeLiters(weightKg, skillLevel, fitnessLevel) {
  const skill = SKILL_LEVELS.find((s) => s.value === skillLevel);
  const fitness = FITNESS_LEVELS.find((f) => f.value === fitnessLevel);
  if (!weightKg || weightKg <= 0 || !skill || !fitness) return null;

  const skillFactor = skill.factor + fitness.adjustment;
  return Math.round(weightKg * skillFactor * 10) / 10;
}
