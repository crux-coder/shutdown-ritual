"use client";

import { useActionState, type InputHTMLAttributes } from "react";
import { MAX_NAME_LENGTH } from "@/lib/profile";
import { updateName } from "./actions";
import { SaveButton, SaveStatus } from "./settings-section";

export function NameForm({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateName, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="First name"
          name="firstName"
          autoComplete="given-name"
          defaultValue={firstName}
          maxLength={MAX_NAME_LENGTH}
          required
        />
        <Field
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          defaultValue={lastName}
          maxLength={MAX_NAME_LENGTH}
          required
        />
      </div>
      <Field label="Email" type="email" value={email} readOnly disabled />

      <div className="flex items-center justify-end gap-4">
        <SaveStatus state={state} />
        <SaveButton pending={pending} />
      </div>
    </form>
  );
}

// Labelled like the TimePicker: a small uppercase caption above the field.
function Field({
  label,
  ...input
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase">
        {label}
      </span>
      <input
        type="text"
        {...input}
        className="h-14 w-full rounded-field border border-base-300 bg-base-100/70 px-4 text-lg transition-colors duration-200 enabled:hover:border-primary/40 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-base-300/60 disabled:bg-base-200/40 disabled:text-base-content/50"
      />
    </label>
  );
}
