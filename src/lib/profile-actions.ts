"use server";

import { refresh } from "next/cache";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { isValidTimeZone, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

// Keeps "today" right when the user travels or signed up before we stored
// their time zone.
export async function updateTimeZone(timeZone: string): Promise<void> {
  if (!isValidTimeZone(timeZone)) return;

  const profile = await getProfile();
  if (profile.timeZone === timeZone) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ time_zone: timeZone })
    .eq("id", profile.id);

  if (!error) refresh();
}

// Opens today's start-of-day rituals before their usual time.
export async function startDayEarly(): Promise<void> {
  await markToday("day_started_early_on");
}

// Opens today's end-of-day rituals before their usual time.
export async function endDayEarly(): Promise<void> {
  await markToday("day_ended_early_on");
}

// Puts the home page into its quiet view for the rest of today.
export async function shutDownDay(): Promise<void> {
  await markToday("day_shut_down_on");
}

// "One more thing": leaves the shut-down view for today's rituals, still
// checked off, so the user can uncheck just the ones they want to revisit.
export async function reopenDay(): Promise<void> {
  const user = await getCurrentUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ day_shut_down_on: null })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to reopen your day: ${error.message}`);
  }

  refresh();
}

async function markToday(
  column: "day_started_early_on" | "day_ended_early_on" | "day_shut_down_on",
): Promise<void> {
  const user = await getCurrentUser();
  const { date } = today(user.timeZone);

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ [column]: date })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to update your day: ${error.message}`);
  }

  refresh();
}
