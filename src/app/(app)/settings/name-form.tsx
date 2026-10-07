"use client";

import { useActionState } from "react";
import { TextField } from "@/components/text-field";
import { MAX_NAME_LENGTH } from "@/lib/profile";
import { updateName } from "./actions";
import { SaveButton, SaveStatus } from "./settings-section";

export function NameForm({
  firstName,
  email,
}: {
  firstName: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateName, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="First name"
          name="firstName"
          autoComplete="given-name"
          defaultValue={firstName}
          maxLength={MAX_NAME_LENGTH}
          required
        />
        <TextField label="Email" type="email" value={email} readOnly disabled />
      </div>

      <div className="flex items-center justify-end gap-4">
        <SaveStatus state={state} />
        <SaveButton pending={pending} />
      </div>
    </form>
  );
}
