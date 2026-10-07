"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  RITUAL_INTEGRATIONS,
  RITUAL_MOMENTS,
  WEEKDAYS,
  type RitualIntegration,
  type RitualMoment,
  type Weekday,
} from "./options";

export type RitualFormValues = {
  title: string;
  description: string;
  moment: RitualMoment;
  days: Weekday[];
  integrations: RitualIntegration[];
};

export type RitualFormState =
  | { status: "error"; error: string; values: RitualFormValues }
  | { status: "success" }
  | undefined;

const MOMENT_IDS = new Set<string>(RITUAL_MOMENTS.map((m) => m.id));
const INTEGRATION_IDS = new Set<string>(RITUAL_INTEGRATIONS.map((i) => i.id));
const WEEKDAY_IDS = new Set<number>(WEEKDAYS.map((d) => d.id));

function readValues(formData: FormData): RitualFormValues {
  const moment = String(formData.get("moment") ?? "");
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    moment: (MOMENT_IDS.has(moment) ? moment : "end_of_day") as RitualMoment,
    days: [...new Set(formData.getAll("days").map(Number))]
      .filter((d) => WEEKDAY_IDS.has(d))
      .sort((a, b) => a - b) as Weekday[],
    integrations: formData
      .getAll("integrations")
      .map(String)
      .filter((i) => INTEGRATION_IDS.has(i)) as RitualIntegration[],
  };
}

function validate(values: RitualFormValues): string | undefined {
  if (!values.title) return "Give your ritual a name.";
  if (values.title.length > MAX_TITLE_LENGTH)
    return `Names can be up to ${MAX_TITLE_LENGTH} characters.`;
  if (values.description.length > MAX_DESCRIPTION_LENGTH)
    return `Descriptions can be up to ${MAX_DESCRIPTION_LENGTH} characters.`;
  if (values.days.length === 0) return "Pick at least one day.";
}

function toRow(values: RitualFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    moment: values.moment,
    days: values.days,
    integrations: values.integrations,
  };
}

export async function createRitual(
  _prev: RitualFormState,
  formData: FormData,
): Promise<RitualFormState> {
  const user = await getCurrentUser();
  const values = readValues(formData);

  const error = validate(values);
  if (error) {
    return { status: "error", error, values };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase
    .from("rituals")
    .insert({ user_id: user.id, ...toRow(values) });

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
  const values = readValues(formData);

  const error = validate(values);
  if (error) {
    return { status: "error", error, values };
  }

  // RLS already limits updates to the owner; the user_id filter makes that
  // explicit, and selecting the row tells us whether anything matched.
  const supabase = await createClient();
  const { data, error: updateError } = await supabase
    .from("rituals")
    .update(toRow(values))
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
