"use server";

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { isValidTimeZone } from "@/lib/dates";
import { nextStep, previousStep, type OnboardingStep } from "@/lib/onboarding";
import { validateDayHours, validateName } from "@/lib/profile";
import {
  readRitualValues,
  toRitualRow,
  validateRitual,
  type RitualFormValues,
} from "@/lib/rituals/form";
import {
  MAX_ANSWER_LENGTH,
  SUGGESTION_QUESTIONS,
  type SuggestionAnswers,
} from "@/lib/rituals/questions";
import { suggestRituals, type RitualSuggestion } from "@/lib/rituals/suggest";
import { createClient } from "@/lib/supabase/server";

export type NameStepState =
  { error?: string; firstName?: string; lastName?: string } | undefined;

export type DayHoursStepState =
  { error: string; dayStartsAt: string; dayEndsAt: string } | undefined;

export type RitualStepState =
  { error: string; values: RitualFormValues } | undefined;

export async function saveName(
  _prev: NameStepState,
  formData: FormData,
): Promise<NameStepState> {
  const profile = await getProfile();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const timeZone = String(formData.get("timeZone") ?? "");

  const nameError = validateName(firstName, lastName);
  if (nameError) {
    return { error: nameError, firstName, lastName };
  }

  // Upsert in case the profile row is missing; the signup trigger normally
  // creates it.
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert({
    id: profile.id,
    first_name: firstName,
    last_name: lastName,
    time_zone: isValidTimeZone(timeZone) ? timeZone : profile.timeZone,
    onboarding_step: nextStep("name"),
  });

  if (error) {
    return { error: error.message, firstName, lastName };
  }

  redirect("/onboarding");
}

export async function saveDayHours(
  _prev: DayHoursStepState,
  formData: FormData,
): Promise<DayHoursStepState> {
  const profile = await getProfile();
  const dayStartsAt = String(formData.get("dayStartsAt") ?? "");
  const dayEndsAt = String(formData.get("dayEndsAt") ?? "");

  const hoursError = validateDayHours(dayStartsAt, dayEndsAt);
  if (hoursError) {
    return { error: hoursError, dayStartsAt, dayEndsAt };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      day_starts_at: dayStartsAt,
      day_ends_at: dayEndsAt,
      onboarding_step: nextStep("day_hours"),
    })
    .eq("id", profile.id);

  if (error) {
    return { error: error.message, dayStartsAt, dayEndsAt };
  }

  redirect("/onboarding");
}

export async function createFirstRitual(
  _prev: RitualStepState,
  formData: FormData,
): Promise<RitualStepState> {
  const profile = await getProfile();
  const values = readRitualValues(formData);

  const error = validateRitual(values);
  if (error) {
    return { error, values };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase
    .from("rituals")
    .insert({ user_id: profile.id, ...toRitualRow(values) });

  if (insertError) {
    return { error: insertError.message, values };
  }

  const { error: stepError } = await setStep(
    profile.id,
    nextStep("first_ritual"),
  );
  if (stepError) {
    return { error: stepError.message, values };
  }

  redirect("/");
}

export type SuggestionsResult =
  { suggestions: RitualSuggestion[] } | { error: string };

// Rituals written for the user from their three answers.
export async function suggestFirstRituals(
  answers: SuggestionAnswers,
): Promise<SuggestionsResult> {
  await getProfile();

  const cleaned = Object.fromEntries(
    SUGGESTION_QUESTIONS.map((q) => [
      q.id,
      String(answers?.[q.id] ?? "")
        .trim()
        .slice(0, MAX_ANSWER_LENGTH),
    ]),
  ) as SuggestionAnswers;
  if (Object.values(cleaned).some((a) => !a)) {
    return { error: "Answer all three questions first." };
  }

  try {
    return { suggestions: await suggestRituals(cleaned) };
  } catch (error) {
    console.error("Ritual suggestions failed:", error);
    return {
      error: "We couldn’t come up with suggestions just now.",
    };
  }
}

// Rituals can wait: the user lands on an empty today view that points them
// to the Rituals page.
export async function skipFirstRitual() {
  const profile = await getProfile();
  await setStep(profile.id, nextStep("first_ritual"));
  redirect("/");
}

export async function goBack(step: OnboardingStep) {
  const profile = await getProfile();
  await setStep(profile.id, previousStep(step));
  redirect("/onboarding");
}

async function setStep(userId: string, step: OnboardingStep) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .update({ onboarding_step: step })
    .eq("id", userId);
}
