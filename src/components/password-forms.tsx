"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, updatePassword } from "@/app/(auth)/actions";
import { TextField } from "@/components/text-field";

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-10 text-center">
      <h1 className="font-serif text-4xl font-light tracking-tight">{title}</h1>
      <p className="mt-3 text-base-content/60">{subtitle}</p>
    </header>
  );
}

function Submit({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-lg mt-2"
    >
      {pending && <span className="loading loading-spinner loading-sm" />}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  return (
    <div className="w-full">
      <Header
        title="Forgot your password?"
        subtitle="We’ll email you a link to choose a new one."
      />

      {state?.message ? (
        <div role="status" className="alert alert-soft alert-success">
          <span>{state.message}</span>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={state?.email}
            required
            autoFocus
          />
          {state?.error && (
            <p role="alert" className="text-sm text-error">
              {state.error}
            </p>
          )}
          <Submit pending={pending} label="Send link" pendingLabel="Sending…" />
        </form>
      )}

      <p className="mt-8 text-center text-sm text-base-content/60">
        <Link href="/sign-in" className="link link-primary link-hover">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    undefined,
  );

  return (
    <div className="w-full">
      <Header title="Choose a new password" subtitle="At least 8 characters." />
      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          label="New password"
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          autoFocus
        />
        {state?.error && (
          <p role="alert" className="text-sm text-error">
            {state.error}
          </p>
        )}
        <Submit
          pending={pending}
          label="Save password"
          pendingLabel="Saving…"
        />
      </form>
    </div>
  );
}
