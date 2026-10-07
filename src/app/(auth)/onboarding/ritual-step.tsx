"use client";

import { useActionState } from "react";
import {
  NewRitualScreen,
  useNewRitualFlow,
} from "@/components/rituals/new-ritual-flow";
import { createFirstRitual, skipFirstRitual } from "./actions";

export function RitualStep({
  backAction,
  suggestionsEnabled,
}: {
  backAction: () => Promise<void>;
  // Whether OpenAI is set up; without it, AI isn't offered.
  suggestionsEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    createFirstRitual,
    undefined,
  );
  const flow = useNewRitualFlow();
  const { stage } = flow;

  return (
    <form
      action={formAction}
      onSubmit={flow.submitted}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-6">
        <NewRitualScreen
          flow={flow}
          suggestionsEnabled={suggestionsEnabled}
          submitted={state?.values}
          minimal
        />
        {stage.kind === "form" && state?.error && (
          <p role="alert" className="text-sm text-error">
            {state.error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Back steps through the flow; from its first screen, it goes back
            to the previous onboarding step. */}
        {stage.kind === "choose" ? (
          <button
            type="submit"
            formAction={backAction}
            formNoValidate
            disabled={pending}
            className="btn btn-ghost"
          >
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={flow.back}
            disabled={pending}
            className="btn btn-ghost"
          >
            Back
          </button>
        )}

        {stage.kind === "choose" && (
          <button
            type="submit"
            formAction={skipFirstRitual}
            formNoValidate
            className="btn btn-ghost text-base-content/60"
          >
            Skip for now
          </button>
        )}
        {flow.question && (
          <button
            type="button"
            onClick={flow.next}
            disabled={!flow.answered}
            className="btn btn-primary btn-lg"
          >
            {flow.isLastQuestion ? "See rituals" : "Next"}
          </button>
        )}
        {stage.kind === "form" && (
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-lg"
          >
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending ? "Creating…" : "Create ritual"}
          </button>
        )}
      </div>
    </form>
  );
}
