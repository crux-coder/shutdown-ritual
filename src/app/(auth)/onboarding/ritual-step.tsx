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
        {(stage.kind === "form" || flow.choosingSuggestion) && state?.error && (
          <p role="alert" className="text-sm text-error">
            {state.error}
          </p>
        )}
      </div>

      {/* Back on the left and the next step on the right, with Skip
          centred on its own row below. */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            {/* Back steps through the flow; from its first screen, it goes
                back to the previous onboarding step. */}
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
          </div>

          <div>
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
            {flow.loadingSuggestions && (
              <div aria-hidden className="skeleton h-12 w-40 rounded-field" />
            )}
            {flow.choosingSuggestion && (
              <button
                type="submit"
                disabled={flow.selected === null || pending}
                className="btn btn-primary btn-lg"
              >
                {pending && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {pending ? "Saving…" : "Use this ritual"}
              </button>
            )}
            {stage.kind === "form" && (
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

        {/* Leaves without a ritual; one can be made later from Rituals. */}
        {(stage.kind === "choose" || stage.kind === "suggestions") && (
          <button
            type="submit"
            formAction={skipFirstRitual}
            formNoValidate
            className="btn btn-ghost btn-sm text-base-content/60"
          >
            Skip for now
          </button>
        )}
      </div>
    </form>
  );
}
