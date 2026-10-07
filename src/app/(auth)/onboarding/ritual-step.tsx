"use client";

import { useActionState } from "react";
import { RitualFields } from "@/components/rituals/ritual-fields";
import {
  TemplatePicker,
  useRitualTemplate,
} from "@/components/rituals/template-picker";
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
  const template = useRitualTemplate(state?.values, DEFAULT_RITUAL_VALUES);

  return (
    <form
      action={formAction}
      onSubmit={template.submitted}
      className="flex flex-col gap-6"
    >
      <TemplatePicker picked={template.picked} onPick={template.pick} />

      <RitualFields key={template.fieldsKey} values={template.values} />

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
