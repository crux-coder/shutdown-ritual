"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState =
  | { error?: string; firstName?: string; lastName?: string }
  | undefined;

const MAX_NAME_LENGTH = 50;

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!firstName || !lastName) {
    return { error: "Please enter your first and last name.", firstName, lastName };
  }
  if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
    return { error: `Names can be up to ${MAX_NAME_LENGTH} characters.`, firstName, lastName };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { first_name: firstName, last_name: lastName },
  });

  if (error) {
    return { error: error.message, firstName, lastName };
  }

  // updateUser doesn't reissue the access token, and the proxy reads the
  // names from its claims — refresh so it sees the user as onboarded.
  await supabase.auth.refreshSession();

  redirect("/");
}
