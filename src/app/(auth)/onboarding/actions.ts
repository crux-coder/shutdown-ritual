"use server";

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { isValidTimeZone } from "@/lib/dates";
import { nextStep, previousStep, type OnboardingStep } from "@/lib/onboarding";
import { validateDayHours, validateName } from "@/lib/profile";
import { toRitualRow } from "@/lib/rituals/form";
import { DEFAULT_RITUAL } from "@/lib/rituals/templates";
import { createClient } from "@/lib/supabase/server";

export type NameStepState = { error?: string; firstName?: string } | undefined;

export type DayHoursStepState =
  { error: string; dayStartsAt: string; dayEndsAt: string } | undefined;

export async function saveName(
  _prev: NameStepState,
  formData: FormData,
): Promise<NameStepState> {
  const profile = await getProfile();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const timeZone = String(formData.get("timeZone") ?? "");

  const nameError = validateName(firstName);
  if (nameError) {
    return { error: nameError, firstName };
  }

  // Upsert in case the profile row is missing; the signup trigger normally
  // creates it.
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert({
    id: profile.id,
    first_name: firstName,
    time_zone: isValidTimeZone(timeZone) ? timeZone : profile.timeZone,
    onboarding_step: nextStep("name"),
  });

  if (error) {
    return { error: error.message, firstName };
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

  // The last step: onboarding ends with a ready-made ritual rather than
  // asking the user to design one before they've felt a shutdown.
  const ritualError = await giveDefaultRitual(profile.id);
  if (ritualError) {
    return { error: ritualError, dayStartsAt, dayEndsAt };
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

  redirect("/today");
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

// Adds the default ritual, unless the user already has rituals (say, from
// going back and forth through onboarding). Returns an error message, if any.
async function giveDefaultRitual(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("rituals")
    .select("id", { count: "exact", head: true });
  if (error) return error.message;
  if (count) return null;

  const { error: insertError } = await supabase
    .from("rituals")
    .insert({ user_id: userId, ...toRitualRow(DEFAULT_RITUAL) });
  return insertError?.message ?? null;
}
