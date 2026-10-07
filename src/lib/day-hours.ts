// The user's working day, as local "HH:MM" times. Defaults match the column
// defaults in supabase/migrations/*_add_day_hours.sql.

import type { RitualMoment } from "@/lib/rituals/options";

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

// Which ritual moment is up next: start-of-day rituals until halfway through
// the day (including the early hours before it starts), end-of-day rituals
// from then on.
export function currentMoment(
  nowMinutes: number,
  dayStartsAt: string,
  dayEndsAt: string,
): RitualMoment {
  const midday = (toMinutes(dayStartsAt) + toMinutes(dayEndsAt)) / 2;
  return nowMinutes < midday ? "start_of_day" : "end_of_day";
}
