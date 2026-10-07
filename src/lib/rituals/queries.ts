import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Ritual } from "./options";

// RLS scopes this to the signed-in user.
export async function getRituals(): Promise<Ritual[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select("id, title, description, moment, days, integrations")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load rituals: ${error.message}`);
  }

  return data as Ritual[];
}
