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
  if (completed) {
    const { error } = await completeRitual(supabase, ritualId, user.id, date);
    if (error) {
      return { error: error.message };
    }
  } else {
    // Undoing a ritual starts its steps over too, so they never all show
    // ticked on a ritual that isn't done.
    const [completion, checks] = await Promise.all([
      supabase
        .from("ritual_completions")
        .delete()
        .eq("ritual_id", ritualId)
        .eq("user_id", user.id)
        .eq("completed_on", date),
      supabase
        .from("ritual_step_checks")
        .delete()
        .eq("ritual_id", ritualId)
        .eq("user_id", user.id)
        .eq("checked_on", date),
    ]);
    const error = completion.error ?? checks.error;
    if (error) {
      return { error: error.message };
    }
  }

  refresh();
  return {};
}

// Ticks one of a ritual's steps on or off for today. Ticking the last open
// step completes the ritual.
export async function setStepChecked(
  ritualId: string,
  step: number,
  checked: boolean,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  const { date } = today(user.timeZone);

  const supabase = await createClient();
  if (!checked) {
    const { error } = await supabase
      .from("ritual_step_checks")
      .delete()
      .eq("ritual_id", ritualId)
      .eq("user_id", user.id)
      .eq("checked_on", date)
      .eq("step", step);
    if (error) {
      return { error: error.message };
    }
    refresh();
    return {};
  }

  const { error: checkError } = await supabase
    .from("ritual_step_checks")
    .upsert(
      { ritual_id: ritualId, user_id: user.id, checked_on: date, step },
      { ignoreDuplicates: true },
    );
  if (checkError) {
    return { error: checkError.message };
  }

  const [ritual, checks] = await Promise.all([
    supabase.from("rituals").select("steps").eq("id", ritualId).single(),
    supabase
      .from("ritual_step_checks")
      .select("step")
      .eq("ritual_id", ritualId)
      .eq("checked_on", date),
  ]);
  if (ritual.error) {
    return { error: ritual.error.message };
  }
  if (checks.error) {
    return { error: checks.error.message };
  }

  const ticked = new Set(checks.data.map((c) => c.step));
  if ((ritual.data.steps as string[]).every((_, i) => ticked.has(i))) {
    const { error } = await completeRitual(supabase, ritualId, user.id, date);
    if (error) {
      return { error: error.message };
    }
  }

  refresh();
  return {};
}

function completeRitual(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ritualId: string,
  userId: string,
  date: string,
) {
  return supabase
    .from("ritual_completions")
    .upsert(
      { ritual_id: ritualId, user_id: userId, completed_on: date },
      { ignoreDuplicates: true },
    );
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
