import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { Ritual } from "./options";

const RITUAL_COLUMNS = "id, title, description, moment, days, integrations";

// RLS scopes this to the signed-in user.
export async function getRituals(): Promise<Ritual[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select(RITUAL_COLUMNS)
    .order("position")
    .order("created_at");

  if (error) {
    throw new Error(`Failed to load rituals: ${error.message}`);
  }

  return data as Ritual[];
}

export type TodaysRitual = Ritual & { completed: boolean };

// The rituals scheduled for today in the user's time zone, and whether each
// one is already done.
export async function getTodaysRituals(): Promise<TodaysRitual[]> {
  const user = await getCurrentUser();
  const { date, weekday } = today(user.timeZone);

  const supabase = await createClient();
  const [rituals, completions] = await Promise.all([
    supabase
      .from("rituals")
      .select(RITUAL_COLUMNS)
      .contains("days", [weekday])
      .order("position")
      .order("created_at"),
    supabase
      .from("ritual_completions")
      .select("ritual_id")
      .eq("completed_on", date),
  ]);

  if (rituals.error) {
    throw new Error(`Failed to load rituals: ${rituals.error.message}`);
  }
  if (completions.error) {
    throw new Error(`Failed to load completions: ${completions.error.message}`);
  }

  const done = new Set(completions.data.map((c) => c.ritual_id));
  return (rituals.data as Ritual[]).map((r) => ({
    ...r,
    completed: done.has(r.id),
  }));
}
