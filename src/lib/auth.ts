import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { DEFAULT_DAY_ENDS_AT, DEFAULT_DAY_STARTS_AT } from "@/lib/day-hours";
import type { OnboardingStep } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  timeZone: string | null;
  // Local wall-clock times, "HH:MM".
  dayStartsAt: string;
  dayEndsAt: string;
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
    redirect("/login");
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
      "first_name, last_name, time_zone, day_starts_at, day_ends_at, onboarding_step",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  // A missing row is treated as a fresh start; the first step creates it.
  return {
    id: user.id,
    email: user.email ?? "",
    firstName: data?.first_name ?? "",
    lastName: data?.last_name ?? "",
    timeZone: data?.time_zone ?? null,
    // Postgres returns "HH:MM:SS".
    dayStartsAt: data?.day_starts_at?.slice(0, 5) ?? DEFAULT_DAY_STARTS_AT,
    dayEndsAt: data?.day_ends_at?.slice(0, 5) ?? DEFAULT_DAY_ENDS_AT,
    onboardingStep: data?.onboarding_step ?? "name",
  };
});

// A user who has finished onboarding. Anyone else is sent back to it.
export const getCurrentUser = cache(async (): Promise<User> => {
  const profile = await getProfile();

  if (profile.onboardingStep !== "complete") {
    redirect("/onboarding");
  }

  return { ...profile, onboardingStep: "complete" };
});
