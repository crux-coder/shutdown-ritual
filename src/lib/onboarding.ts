// Keep in sync with the `onboarding_step` enum in
// supabase/migrations (created in *_create_profiles_and_completions.sql).
// The enum still holds 'first_ritual' from when onboarding had a ritual step;
// nothing uses it now.
export const ONBOARDING_STEPS = ["name", "day_hours"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number] | "complete";

export function nextStep(step: OnboardingStep): OnboardingStep {
  if (step === "complete") return step;
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1] ?? "complete";
}

export function previousStep(step: OnboardingStep): OnboardingStep {
  if (step === "complete") return ONBOARDING_STEPS.at(-1)!;
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) - 1] ?? step;
}
