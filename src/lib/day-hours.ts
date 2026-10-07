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

// Rituals open this long before the day starts or ends.
export const RITUALS_OPEN_EARLY_MINUTES = 30;

// What the home page shows right now:
// - "start": start-of-day rituals, from 30 minutes before the day starts (or
//   once the user starts early) until the day is half over.
// - "end": end-of-day rituals, from 30 minutes before the day ends (or once
//   the user ends early) until midnight.
// - "start_prompt" / "end_prompt": the quiet stretch before either opens,
//   with the option to begin it early.
export type TodayPhase = "start_prompt" | "start" | "end_prompt" | "end";

export function todayPhase({
  nowMinutes,
  dayStartsAt,
  dayEndsAt,
  startedEarly,
  endedEarly,
  hasStartRituals,
}: {
  nowMinutes: number;
  dayStartsAt: string;
  dayEndsAt: string;
  startedEarly: boolean;
  endedEarly: boolean;
  hasStartRituals: boolean;
}): TodayPhase {
  const starts = toMinutes(dayStartsAt);
  const ends = toMinutes(dayEndsAt);

  if (endedEarly || nowMinutes >= ends - RITUALS_OPEN_EARLY_MINUTES) {
    return "end";
  }
  if (hasStartRituals && nowMinutes < (starts + ends) / 2) {
    return startedEarly || nowMinutes >= starts - RITUALS_OPEN_EARLY_MINUTES
      ? "start"
      : "start_prompt";
  }
  return "end_prompt";
}

// Minutes from now until the phase could next change on its own, or null if
// it won't again today.
export function minutesUntilNextPhase(
  nowMinutes: number,
  dayStartsAt: string,
  dayEndsAt: string,
): number | null {
  const starts = toMinutes(dayStartsAt);
  const ends = toMinutes(dayEndsAt);
  const boundaries = [
    starts - RITUALS_OPEN_EARLY_MINUTES,
    (starts + ends) / 2,
    ends - RITUALS_OPEN_EARLY_MINUTES,
  ];
  const next = boundaries.find((b) => b > nowMinutes);
  return next === undefined ? null : Math.ceil(next - nowMinutes);
}
