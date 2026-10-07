"use client";

import { useActionState } from "react";
import { saveName, type NameStepState } from "./actions";

export function NameStep({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const [state, formAction, pending] = useActionState(
    (prev: NameStepState, formData: FormData) => {
      // Only the browser knows where the user is; it decides which day is today.
      formData.set(
        "timeZone",
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      return saveName(prev, formData);
    },
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="floating-label">
        <span>First name</span>
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          autoComplete="given-name"
          defaultValue={state?.firstName ?? firstName}
          maxLength={50}
          required
          autoFocus
          className="input input-lg w-full"
        />
      </label>

      <label className="floating-label">
        <span>Last name</span>
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          autoComplete="family-name"
          defaultValue={state?.lastName ?? lastName}
          maxLength={50}
          required
          className="input input-lg w-full"
        />
      </label>

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
        {pending && <span className="loading loading-spinner loading-sm" />}
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
