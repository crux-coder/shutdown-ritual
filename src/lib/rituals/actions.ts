"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/dates";
import {
  readRitualValues,
  toRitualRow,
  validateRitual,
  type RitualFormValues,
} from "./form";

export type RitualFormState =
  | { status: "error"; error: string; values: RitualFormValues }
  | { status: "success" }
  | undefined;

export async function createRitual(
  _prev: RitualFormState,
  formData: FormData,
): Promise<RitualFormState> {
  const user = await getCurrentUser();
  const values = readRitualValues(formData);

  const error = validateRitual(values);
  if (error) {
    return { status: "error", error, values };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase
    .from("rituals")
    .insert({ user_id: user.id, ...toRitualRow(values) });

  if (insertError) {
    return { status: "error", error: insertError.message, values };
  }

  refresh();
  return { status: "success" };
}

export async function updateRitual(
  _prev: RitualFormState,
  formData: FormData,
): Promise<RitualFormState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const values = readRitualValues(formData);

  const error = validateRitual(values);
  if (error) {
    return { status: "error", error, values };
  }

  // RLS already limits updates to the owner; the user_id filter makes that
  // explicit, and selecting the row tells us whether anything matched.
  const supabase = await createClient();
  const { data, error: updateError } = await supabase
    .from("rituals")
    .update(toRitualRow(values))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (updateError) {
    return { status: "error", error: updateError.message, values };
  }
  if (data.length === 0) {
    return { status: "error", error: "This ritual no longer exists.", values };
  }

  refresh();
  return { status: "success" };
}

export async function deleteRitual(id: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("rituals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  refresh();
  return {};
}

export async function setRitualCompleted(
  ritualId: string,
  completed: boolean,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  const { date } = today(user.timeZone);

  const supabase = await createClient();
  const { error } = completed
    ? await supabase
        .from("ritual_completions")
        .upsert(
          { ritual_id: ritualId, user_id: user.id, completed_on: date },
          { ignoreDuplicates: true },
        )
    : await supabase
        .from("ritual_completions")
        .delete()
        .eq("ritual_id", ritualId)
        .eq("user_id", user.id)
        .eq("completed_on", date);

  if (error) {
    return { error: error.message };
  }

  refresh();
  return {};
}

// Saves the order the user dragged their rituals into.
export async function reorderRituals(
  ids: string[],
): Promise<{ error?: string }> {
  await getCurrentUser();

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_rituals", { ids });

  if (error) {
    return { error: error.message };
  }

  refresh();
  return {};
}
