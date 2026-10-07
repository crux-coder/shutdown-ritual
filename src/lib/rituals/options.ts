// Shared by the server action and the client form — keep in sync with the
// enums in supabase/migrations/*_create_rituals.sql.

export const RITUAL_MOMENTS = [
  {
    id: "start_of_day",
    label: "Start of day",
    hint: "Ease into work with intention",
  },
  {
    id: "end_of_day",
    label: "End of day",
    hint: "Close loops and switch off",
  },
] as const;

export type RitualMoment = (typeof RITUAL_MOMENTS)[number]["id"];

// Linear and Notion are still in the enum but no longer offered: they're
// dropped from a ritual the next time it's saved.
export const RITUAL_INTEGRATIONS = [
  { id: "gmail", label: "Gmail", hint: "Unanswered threads, sent mail" },
  {
    id: "google_calendar",
    label: "Google Calendar",
    hint: "Today’s and tomorrow’s events",
  },
  { id: "todoist", label: "Todoist", hint: "Tasks due and done today" },
  { id: "github", label: "GitHub", hint: "PRs, reviews, commits" },
] as const;

export type RitualIntegration = (typeof RITUAL_INTEGRATIONS)[number]["id"];

// ISO weekdays: 1 = Monday … 7 = Sunday.
export const WEEKDAYS = [
  { id: 1, short: "Mon", long: "Monday" },
  { id: 2, short: "Tue", long: "Tuesday" },
  { id: 3, short: "Wed", long: "Wednesday" },
  { id: 4, short: "Thu", long: "Thursday" },
  { id: 5, short: "Fri", long: "Friday" },
  { id: 6, short: "Sat", long: "Saturday" },
  { id: 7, short: "Sun", long: "Sunday" },
] as const;

export type Weekday = (typeof WEEKDAYS)[number]["id"];

export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
// Keep in sync with ritual_steps_are_valid in supabase/migrations/*_add_ritual_steps.sql.
export const MAX_STEPS = 10;
export const MAX_STEP_LENGTH = 100;

export type Ritual = {
  id: string;
  title: string;
  description: string | null;
  // In order; empty for a ritual that is ticked off whole.
  steps: string[];
  moment: RitualMoment;
  days: Weekday[];
  integrations: RitualIntegration[];
};

export function formatDays(days: readonly Weekday[]): string {
  const set = new Set(days);
  if (set.size === 7) return "Every day";
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d as Weekday)))
    return "Weekdays";
  if (set.size === 2 && set.has(6) && set.has(7)) return "Weekends";
  if (set.size === 1) return WEEKDAYS.find((d) => set.has(d.id))!.long + "s";
  return WEEKDAYS.filter((d) => set.has(d.id))
    .map((d) => d.short)
    .join(" · ");
}
