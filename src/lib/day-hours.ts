// The user's working day, as local "HH:MM" times. Defaults match the column
// defaults in supabase/migrations/*_add_day_hours.sql.

export const DEFAULT_DAY_STARTS_AT = "09:00";
export const DEFAULT_DAY_ENDS_AT = "17:30";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// "8h 30m", "9h"
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ") || "0m";
}

// Rituals open this long before the day ends.
export const RITUALS_OPEN_EARLY_MINUTES = 30;

// Whether today's rituals are open on the home page: from 30 minutes before
// the day ends (or once the user ends early) until midnight. Before that it
// shows a quiet prompt, with the option to end the day early.
export function ritualsOpen({
  nowMinutes,
  dayEndsAt,
  endedEarly,
}: {
  nowMinutes: number;
  dayEndsAt: string;
  endedEarly: boolean;
}): boolean {
  return (
    endedEarly ||
    nowMinutes >= toMinutes(dayEndsAt) - RITUALS_OPEN_EARLY_MINUTES
  );
}

// Minutes from now until the rituals open on their own, or null if they
// already have.
export function minutesUntilRitualsOpen(
  nowMinutes: number,
  dayEndsAt: string,
): number | null {
  const opens = toMinutes(dayEndsAt) - RITUALS_OPEN_EARLY_MINUTES;
  return opens > nowMinutes ? Math.ceil(opens - nowMinutes) : null;
}
