// Profile rules shared by onboarding and settings.

import { isValidTime, toMinutes } from "@/lib/day-hours";

export const MAX_NAME_LENGTH = 50;

// An error message, or null if the name is fine. Expects a trimmed value.
export function validateName(firstName: string): string | null {
  if (!firstName) {
    return "Please enter your first name.";
  }
  if (firstName.length > MAX_NAME_LENGTH) {
    return `Names can be up to ${MAX_NAME_LENGTH} characters.`;
  }
  return null;
}

// An error message, or null if the day hours are fine.
export function validateDayHours(
  dayStartsAt: string,
  dayEndsAt: string,
): string | null {
  if (!isValidTime(dayStartsAt) || !isValidTime(dayEndsAt)) {
    return "Please pick both times.";
  }
  if (toMinutes(dayEndsAt) <= toMinutes(dayStartsAt)) {
    return "Your day should end after it starts.";
  }
  return null;
}

// How the day is closed: by typing the shutdown phrase, or with one button.
// Matches the profiles.shutdown_mode check.
export const SHUTDOWN_MODES = ["phrase", "button"] as const;
export type ShutdownMode = (typeof SHUTDOWN_MODES)[number];

export function isShutdownMode(value: string): value is ShutdownMode {
  return (SHUTDOWN_MODES as readonly string[]).includes(value);
}

// The note left for tomorrow; matches the profiles.handoff_note check.
export const MAX_HANDOFF_NOTE_LENGTH = 500;

// Matches the profiles.shutdown_phrase column default.
export const DEFAULT_SHUTDOWN_PHRASE = "Schedule shutdown, complete.";
export const MAX_SHUTDOWN_PHRASE_LENGTH = 80;

// An error message, or null if the phrase is fine. Expects a trimmed value.
export function validateShutdownPhrase(phrase: string): string | null {
  if (!normalizePhrase(phrase)) {
    return "Please enter a phrase.";
  }
  if (phrase.length > MAX_SHUTDOWN_PHRASE_LENGTH) {
    return `Keep it to ${MAX_SHUTDOWN_PHRASE_LENGTH} characters.`;
  }
  return null;
}

// What counts when the phrase is typed: letters and numbers, in order, with
// case, punctuation and spacing ignored.
export function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
