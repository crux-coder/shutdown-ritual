"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  validateDayHours,
  validateName,
  validateShutdownPhrase,
} from "@/lib/profile";
import { isSoundId } from "@/lib/sounds";
import { createClient } from "@/lib/supabase/server";

export type SettingsState =
  { status: "saved" } | { status: "error"; error: string } | undefined;

export async function updateName(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  const error = validateName(firstName, lastName);
  if (error) return { status: "error", error };

  return updateProfile({ first_name: firstName, last_name: lastName });
}

export async function updateDayHours(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const dayStartsAt = String(formData.get("dayStartsAt") ?? "");
  const dayEndsAt = String(formData.get("dayEndsAt") ?? "");

  const error = validateDayHours(dayStartsAt, dayEndsAt);
  if (error) return { status: "error", error };

  return updateProfile({ day_starts_at: dayStartsAt, day_ends_at: dayEndsAt });
}

export async function updateStartSound(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  return updateSound("start_sound", formData);
}

export async function updateShutdownSound(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  return updateSound("shutdown_sound", formData);
}

async function updateSound(
  column: "start_sound" | "shutdown_sound",
  formData: FormData,
): Promise<SettingsState> {
  const sound = String(formData.get("sound") ?? "");
  if (!isSoundId(sound)) {
    return { status: "error", error: "Please pick a sound." };
  }

  return updateProfile({ [column]: sound });
}

export async function updateShutdownPhrase(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const phrase = String(formData.get("shutdownPhrase") ?? "").trim();

  const error = validateShutdownPhrase(phrase);
  if (error) return { status: "error", error };

  return updateProfile({ shutdown_phrase: phrase });
}

async function updateProfile(
  values: Record<string, string>,
): Promise<SettingsState> {
  const user = await getCurrentUser();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", user.id);

  if (error) return { status: "error", error: error.message };

  refresh();
  return { status: "saved" };
}
