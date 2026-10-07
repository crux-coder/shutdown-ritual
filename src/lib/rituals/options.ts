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

export const RITUAL_INTEGRATIONS = [
  { id: "gmail", label: "Gmail", hint: "Unanswered threads, sent mail" },
  { id: "github", label: "GitHub", hint: "PRs, reviews, commits" },
  { id: "linear", label: "Linear", hint: "Issues you moved today" },
  { id: "notion", label: "Notion", hint: "Pages you edited" },
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

export type Ritual = {
  id: string;
  title: string;
  description: string | null;
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
