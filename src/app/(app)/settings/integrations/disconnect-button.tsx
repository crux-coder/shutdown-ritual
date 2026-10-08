"use client";

import { useActionState } from "react";
import { disconnectTodoistAction } from "../actions";

export function DisconnectButton() {
  const [state, formAction, pending] = useActionState(
    disconnectTodoistAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex shrink-0 flex-col items-end gap-1">
      <button type="submit" disabled={pending} className="btn btn-sm">
        {pending && <span className="loading loading-xs loading-spinner" />}
        Disconnect
      </button>
      {state?.status === "error" && (
        <p role="alert" className="text-xs text-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
