"use client";

import { useActionState } from "react";
import { RitualFields } from "@/components/rituals/ritual-fields";
import { DEFAULT_RITUAL_VALUES } from "@/lib/rituals/form";
import { createFirstRitual } from "./actions";

export function RitualStep({
  backAction,
}: {
  backAction: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(
    createFirstRitual,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <RitualFields values={state?.values ?? DEFAULT_RITUAL_VALUES} />

      {state?.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="submit"
          formAction={backAction}
          formNoValidate
          disabled={pending}
          className="btn btn-ghost"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-lg"
        >
          {pending && <span className="loading loading-spinner loading-sm" />}
          {pending ? "Creating…" : "Create ritual"}
        </button>
      </div>
    </form>
  );
}
