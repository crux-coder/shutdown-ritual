// A cue to come back at the end of the day: a recurring event in the user's
// own calendar, added through Google Calendar's "create event" page. No
// account connection or calendar access needed; Google shows the event
// prefilled and the user saves it there.

import { RITUALS_OPEN_EARLY_MINUTES, toMinutes } from "@/lib/day-hours";
import type { Weekday } from "@/lib/rituals/options";
import { SITE_URL } from "@/lib/site-url";

const RRULE_DAYS: Record<Weekday, string> = {
  1: "MO",
  2: "TU",
  3: "WE",
  4: "TH",
  5: "FR",
  6: "SA",
  7: "SU",
};

const WEEKDAYS_ONLY: Weekday[] = [1, 2, 3, 4, 5];

// The event runs from when end-of-day rituals open until the day ends, on
// the days they happen (weekdays if none are set up), starting with the next
// of those days from `todayDate`, which can be today itself.
export function shutdownCalendarUrl({
  dayEndsAt,
  days,
  timeZone,
  todayDate,
  todayWeekday,
}: {
  dayEndsAt: string;
  days: Weekday[];
  timeZone: string | null;
  todayDate: string;
  todayWeekday: Weekday;
}): string {
  const repeatOn = days.length > 0 ? [...new Set(days)].sort() : WEEKDAYS_ONLY;
  const ahead = Math.min(
    ...repeatOn.map((day) => (day - todayWeekday + 7) % 7),
  );
  const date = addDays(todayDate, ahead).replaceAll("-", "");

  const ends = toMinutes(dayEndsAt);
  const starts = Math.max(0, ends - RITUALS_OPEN_EARLY_MINUTES);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Shut down for the day",
    details: `Your shutdown ritual is open.\n\n${SITE_URL}/today`,
    dates: `${date}T${clock(starts)}/${date}T${clock(ends)}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${repeatOn.map((d) => RRULE_DAYS[d]).join(",")}`,
  });
  // Without a time zone, Google reads the times in the calendar's own zone,
  // which is usually the same one.
  if (timeZone) params.set("ctz", timeZone);

  return `https://calendar.google.com/calendar/render?${params}`;
}

// "HHMMSS" for minutes past midnight.
function clock(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}${m}00`;
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
