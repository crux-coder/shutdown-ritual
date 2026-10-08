"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type AuthState, signInWithGoogle } from "@/app/(auth)/actions";
import { GoogleButton } from "@/components/google-button";
import { TextField } from "@/components/text-field";

type Props = {
  mode: "login" | "signup";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  initialError?: string;
};

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Time to close the day gently.",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "New here?",
    switchLink: "Create an account",
    switchHref: "/sign-up",
    autoComplete: "current-password",
  },
  signup: {
    title: "Begin your ritual",
    subtitle: "A quiet way to end each workday.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/sign-in",
    autoComplete: "new-password",
  },
} as const;

export function AuthForm({ mode, action, initialError }: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    initialError ? { error: initialError } : undefined,
  );
  const t = copy[mode];

  return (
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-light tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 text-base-content/60">{t.subtitle}</p>
      </header>

      {state?.message ? (
        <div role="status" className="alert alert-soft alert-success">
          <span>{state.message}</span>
        </div>
      ) : (
        <>
          <form action={signInWithGoogle}>
            <GoogleButton />
          </form>
          <div className="divider my-6 text-xs text-base-content/45">or</div>
          <form action={formAction} className="flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={state?.email}
              required
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              autoComplete={t.autoComplete}
              minLength={mode === "signup" ? 8 : undefined}
              required
            />
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="-mt-2 self-end text-sm text-base-content/50 link link-hover"
              >
                Forgot password?
              </Link>
            )}

            {state?.error && (
              <p role="alert" className="text-sm text-error">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary btn-lg mt-2"
            >
              {pending && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {pending ? t.pending : t.submit}
            </button>
            {mode === "signup" && (
              <p className="text-center text-xs text-base-content/45">
                By creating an account, you agree to the{" "}
                <Link href="/terms" className="link link-hover">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="link link-hover">
                  Privacy policy
                </Link>
                .
              </p>
            )}
          </form>
        </>
      )}

      <p className="mt-8 text-center text-sm text-base-content/60">
        {t.switchText}{" "}
        <Link href={t.switchHref} className="link link-primary link-hover">
          {t.switchLink}
        </Link>
      </p>
      {/* For people who already have an account but can't get in. */}
      {mode === "signup" && (
        <p className="mt-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="link link-hover text-base-content/50"
          >
            Forgot your password?
          </Link>
        </p>
      )}
    </div>
  );
}
