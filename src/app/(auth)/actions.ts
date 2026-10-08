"use server";

import { redirect } from "next/navigation";
import { landingPath } from "@/lib/auth";
import { SITE_URL } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export type AuthState =
  { error?: string; message?: string; email?: string } | undefined;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Please enter your email and password.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, email };
  }

  redirect(await landingPath(data.user.id));
}

// Google handles both sign-in and sign-up: Supabase creates the account on
// first use. Google sends the user back to /auth/confirm with a code.
export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${SITE_URL}/auth/confirm` },
  });

  redirect(error ? "/sign-in?error=google" : data.url);
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readCredentials(formData);

  if (!email) {
    return { error: "Please enter your email.", email };
  }
  if (password.length < 8) {
    return { error: "Password should be at least 8 characters.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message, email };
  }

  // Email confirmation disabled in Supabase → we already have a session.
  if (data.session) {
    redirect("/onboarding");
  }

  return {
    message: "Check your inbox — we sent you a link to confirm your email.",
    email,
  };
}

// Sends a reset link. Says the same thing whether or not the account exists,
// so the form can't be used to find out who has one.
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Please enter your email.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/confirm`,
  });

  // Too many requests is worth saying; anything else would give away
  // whether the account exists.
  if (error?.status === 429) {
    return { error: "Too many requests. Try again in a little while.", email };
  }

  return {
    message:
      "If there’s an account for that email, a reset link is on its way.",
    email,
  };
}

// Sets a new password for the user signed in by a reset link.
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Password should be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/today");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
