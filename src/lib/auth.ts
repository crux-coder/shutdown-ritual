import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { DEFAULT_DAY_ENDS_AT, DEFAULT_DAY_STARTS_AT } from "@/lib/day-hours";
import type { OnboardingStep } from "@/lib/onboarding";
import { DEFAULT_SHUTDOWN_PHRASE, type ShutdownMode } from "@/lib/profile";
import {
  DEFAULT_SHUTDOWN_SOUND,
  DEFAULT_START_SOUND,
  isSoundId,
  type SoundId,
} from "@/lib/sounds";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  firstName: string;
  timeZone: string | null;
  // Local wall-clock times, "HH:MM".
  dayStartsAt: string;
  dayEndsAt: string;
  // Local dates ("YYYY-MM-DD") the user last started or ended their day
  // early, and last shut down for the day.
  dayStartedEarlyOn: string | null;
  dayEndedEarlyOn: string | null;
  dayShutDownOn: string | null;
  startSound: SoundId;
  shutdownSound: SoundId;
  shutdownPhrase: string;
  // Whether shutting down takes typing the phrase or a single button.
  shutdownMode: ShutdownMode;
  // The note left for the next day, and the local date it was written on.
  handoffNote: string | null;
  handoffNoteOn: string | null;
  // Whether the user has put away Today's first-day cards.
  welcomeDismissed: boolean;
  tailorNudgeDismissed: boolean;
  onboardingStep: OnboardingStep;
};

export type User = Profile & { onboardingStep: "complete" };

// Authoritative check: getUser() validates the token with Supabase.
// The proxy is only an optimistic redirect.
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

// The signed-in user's profile, wherever they are in onboarding.
// Deduped per request, so several components can call it for one lookup.
export const getProfile = cache(async (): Promise<Profile> => {
  const user = await getAuthenticatedUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "first_name, time_zone, day_starts_at, day_ends_at, day_started_early_on, day_ended_early_on, day_shut_down_on, start_sound, shutdown_sound, shutdown_phrase, shutdown_mode, handoff_note, handoff_note_on, welcome_dismissed_at, tailor_nudge_dismissed_at, onboarding_step",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  const startSound = data?.start_sound ?? "";
  const shutdownSound = data?.shutdown_sound ?? "";

  // A missing row is treated as a fresh start; the first step creates it.
  return {
    id: user.id,
    email: user.email ?? "",
    firstName: data?.first_name ?? nameFromProvider(user.user_metadata),
    timeZone: data?.time_zone ?? null,
    // Postgres returns "HH:MM:SS".
    dayStartsAt: data?.day_starts_at?.slice(0, 5) ?? DEFAULT_DAY_STARTS_AT,
    dayEndsAt: data?.day_ends_at?.slice(0, 5) ?? DEFAULT_DAY_ENDS_AT,
    dayStartedEarlyOn: data?.day_started_early_on ?? null,
    dayEndedEarlyOn: data?.day_ended_early_on ?? null,
    dayShutDownOn: data?.day_shut_down_on ?? null,
    startSound: isSoundId(startSound) ? startSound : DEFAULT_START_SOUND,
    shutdownSound: isSoundId(shutdownSound)
      ? shutdownSound
      : DEFAULT_SHUTDOWN_SOUND,
    shutdownPhrase: data?.shutdown_phrase ?? DEFAULT_SHUTDOWN_PHRASE,
    shutdownMode: data?.shutdown_mode === "button" ? "button" : "phrase",
    handoffNote: data?.handoff_note || null,
    handoffNoteOn: data?.handoff_note_on ?? null,
    welcomeDismissed: Boolean(data?.welcome_dismissed_at),
    tailorNudgeDismissed: Boolean(data?.tailor_nudge_dismissed_at),
    onboardingStep: data?.onboarding_step ?? "name",
  };
});

// The first name a sign-in provider gave us (Google sends `given_name`), to
// prefill onboarding. Email sign-ups have none.
function nameFromProvider(metadata: Record<string, unknown>): string {
  const given = metadata.given_name;
  if (typeof given === "string" && given.trim()) return given.trim();

  const full = metadata.full_name ?? metadata.name;
  return typeof full === "string" ? (full.trim().split(/\s+/)[0] ?? "") : "";
}

// A user who has finished onboarding. Anyone else is sent back to it.
export const getCurrentUser = cache(async (): Promise<User> => {
  const profile = await getProfile();

  if (profile.onboardingStep !== "complete") {
    redirect("/onboarding");
  }

  return { ...profile, onboardingStep: "complete" };
});

// Where a user who has just signed in should land: the today view once
// onboarding is done, else onboarding. Going straight there avoids a flash of
// the home page's loading state before getCurrentUser redirects.
export async function landingPath(
  userId: string,
): Promise<"/today" | "/onboarding"> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", userId)
    .maybeSingle();

  return data?.onboarding_step === "complete" ? "/today" : "/onboarding";
}
