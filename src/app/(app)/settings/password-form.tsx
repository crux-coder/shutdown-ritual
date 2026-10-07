"use client";

import { useActionState } from "react";
import { TextField } from "@/components/text-field";
import { changePassword } from "./actions";
import { SaveButton, SaveStatus } from "./settings-section";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Current password"
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
        <TextField
          label="New password"
          type="password"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <SaveStatus state={state} />
        <SaveButton pending={pending} />
      </div>
    </form>
  );
}
