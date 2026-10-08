"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { disconnectTodoist } from "@/lib/integrations/todoist";
import {
  DELETE_CONFIRMATION,
  isShutdownMode,
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

  const error = validateName(firstName);
  if (error) return { status: "error", error };

  return updateProfile({ first_name: firstName });
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

export async function updateShutdownMode(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const mode = String(formData.get("shutdownMode") ?? "");
  if (!isShutdownMode(mode)) {
    return { status: "error", error: "Please pick a way to close the day." };
  }

  return updateProfile({ shutdown_mode: mode });
}

// Checks the current password before setting the new one, so a device left
// signed in isn't enough to change it.
export async function changePassword(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!currentPassword) {
    return { status: "error", error: "Enter your current password." };
  }
  if (newPassword.length < 8) {
    return {
      status: "error",
      error: "New passwords should be at least 8 characters.",
    };
  }
  if (newPassword === currentPassword) {
    return {
      status: "error",
      error: "Pick a password different from your current one.",
    };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();

  const { error: checkError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (checkError) {
    return {
      status: "error",
      error:
        checkError.status === 429
          ? "Too many tries. Wait a little and try again."
          : "That isn’t your current password.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { status: "error", error: error.message };

  return { status: "saved" };
}

export type DeleteAccountState = { error: string } | undefined;

// Deletes the user's account and everything in it, then signs them out.
export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const typed = String(formData.get("confirmation") ?? "")
    .trim()
    .toLowerCase();
  if (typed !== DELETE_CONFIRMATION) {
    return { error: `Type “${DELETE_CONFIRMATION}” to confirm.` };
  }

  await getCurrentUser();
  const supabase = await createClient();

  // Revoke Todoist's access too; the account's rows go with the account.
  await disconnectTodoist().catch(() => {});

  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    return { error: `Couldn’t delete your account: ${error.message}` };
  }

  // The user no longer exists, so only the local session needs clearing.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}

// Disconnects Todoist: revokes its access and forgets the tokens.
export async function disconnectTodoistAction(): Promise<SettingsState> {
  await getCurrentUser();

  try {
    await disconnectTodoist();
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Couldn’t disconnect.",
    };
  }

  refresh();
  return { status: "saved" };
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
