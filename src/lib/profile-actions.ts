"use server";

import { refresh } from "next/cache";
import { getProfile } from "@/lib/auth";
import { isValidTimeZone } from "@/lib/dates";
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
