"use client";

import { useActionState, useState } from "react";
import { TextField } from "@/components/text-field";
import { DELETE_CONFIRMATION } from "@/lib/profile";
import { deleteAccount } from "./actions";

// Two steps: open the confirmation, then type the word to enable the button.
export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, undefined);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const ready = typed.trim().toLowerCase() === DELETE_CONFIRMATION;

  if (!confirming) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn btn-outline btn-error"
        >
          Delete account
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-base-content/70">
        This permanently deletes your account, your rituals, your history and
        your note for tomorrow. It can’t be undone.
      </p>
      <TextField
        label={`Type “${DELETE_CONFIRMATION}” to confirm`}
        name="confirmation"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        autoFocus
      />
      {state?.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setTyped("");
          }}
          disabled={pending}
          className="btn btn-ghost"
        >
          Keep my account
        </button>
        <button
          type="submit"
          disabled={!ready || pending}
          className="btn btn-error"
        >
          {pending && <span className="loading loading-spinner loading-sm" />}
          {pending ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </form>
  );
}
