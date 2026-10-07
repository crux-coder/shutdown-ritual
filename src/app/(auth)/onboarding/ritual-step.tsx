"use client";

import { useActionState } from "react";
import { RitualFields } from "@/components/rituals/ritual-fields";
import {
  TemplateOrigin,
  TemplatePicker,
  useRitualTemplate,
} from "@/components/rituals/template-picker";
import { DEFAULT_RITUAL_VALUES } from "@/lib/rituals/form";
import { createFirstRitual, skipFirstRitual } from "./actions";

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
      {template.browsing ? (
        <TemplatePicker picked={template.picked} onPick={template.pick} />
      ) : (
        <>
          <TemplateOrigin picked={template.picked} onBrowse={template.browse} />
          <RitualFields key={template.fieldsKey} values={template.values} />
        </>
      )}

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
        <div className="flex items-center gap-2">
          <button
            type="submit"
            formAction={skipFirstRitual}
            formNoValidate
            disabled={pending}
            className="btn btn-ghost"
          >
            Skip for now
          </button>
          {!template.browsing && (
            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary btn-lg"
            >
              {pending && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {pending ? "Creating…" : "Create ritual"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
