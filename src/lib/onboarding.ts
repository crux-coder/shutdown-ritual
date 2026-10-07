// Keep in sync with the `onboarding_step` enum in
// supabase/migrations (created in *_create_profiles_and_completions.sql).
export const ONBOARDING_STEPS = ["name", "day_hours", "first_ritual"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number] | "complete";

export function nextStep(step: OnboardingStep): OnboardingStep {
  if (step === "complete") return step;
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1] ?? "complete";
}

export function previousStep(step: OnboardingStep): OnboardingStep {
  if (step === "complete") return ONBOARDING_STEPS.at(-1)!;
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) - 1] ?? step;
}
