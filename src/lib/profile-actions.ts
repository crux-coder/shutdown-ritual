"use server";

import { refresh } from "next/cache";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { isValidTimeZone, today } from "@/lib/dates";
import { MAX_HANDOFF_NOTE_LENGTH } from "@/lib/profile";
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

// "Reopen day": leaves the shut-down view for today's rituals, still
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

// Saves the note for tomorrow as it's typed on the shutdown screen, dated
// today so it shows from the next day on. An empty note clears it. Doesn't
// refresh the page, which would interrupt the typing.
export async function saveHandoffNote(
  note: string,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  const { date } = today(user.timeZone);
  const text = note.trim().slice(0, MAX_HANDOFF_NOTE_LENGTH);

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      handoff_note: text || null,
      handoff_note_on: text ? date : null,
    })
    .eq("id", user.id);

  return error ? { error: error.message } : {};
}

// Puts away the note once it's been read on the next day.
export async function dismissHandoffNote(): Promise<void> {
  const user = await getCurrentUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ handoff_note: null, handoff_note_on: null })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to put the note away: ${error.message}`);
  }

  refresh();
}

// Puts away Today's welcome card for good.
export async function dismissWelcome(): Promise<void> {
  await markNow("welcome_dismissed_at");
}

// Puts away the "make it your own" card for good.
export async function dismissTailorNudge(): Promise<void> {
  await markNow("tailor_nudge_dismissed_at");
}

async function markNow(
  column: "welcome_dismissed_at" | "tailor_nudge_dismissed_at",
): Promise<void> {
  const user = await getCurrentUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ [column]: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to put the card away: ${error.message}`);
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
