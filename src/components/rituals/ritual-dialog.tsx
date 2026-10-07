"use client";

import { Add01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  useActionState,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  createRitual,
  deleteRitual,
  updateRitual,
} from "@/lib/rituals/actions";
import { toFormValues } from "@/lib/rituals/form";
import type { Ritual } from "@/lib/rituals/options";
import { NewRitualScreen, useNewRitualFlow } from "./new-ritual-flow";
import { RitualFields } from "./ritual-fields";

export function NewRitualButton({
  suggestionsEnabled,
}: {
  // Whether OpenAI is set up; without it, AI isn't offered.
  suggestionsEnabled: boolean;
}) {
  return (
    <RitualDialog
      triggerClassName="btn btn-primary"
      suggestionsEnabled={suggestionsEnabled}
    >
      <HugeiconsIcon
        aria-hidden
        icon={Add01Icon}
        strokeWidth={2}
        className="size-4"
      />
      New ritual
    </RitualDialog>
  );
}

export function EditRitualButton({ ritual }: { ritual: Ritual }) {
  return (
    <RitualDialog
      ritual={ritual}
      triggerLabel={`Edit ${ritual.title}`}
      triggerClassName="btn btn-ghost btn-sm btn-square -mt-1 -mr-2 text-base-content/60"
    >
      <HugeiconsIcon
        aria-hidden
        icon={PencilEdit02Icon}
        strokeWidth={2}
        className="size-4"
      />
    </RitualDialog>
  );
}

function RitualDialog({
  ritual,
  suggestionsEnabled = false,
  triggerLabel,
  triggerClassName,
  children,
}: {
  ritual?: Ritual;
  suggestionsEnabled?: boolean;
  triggerLabel?: string;
  triggerClassName: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Remount the form on every open so a previous error or draft doesn't linger.
  const [formKey, setFormKey] = useState(0);

  function open() {
    setFormKey((k) => k + 1);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={triggerLabel}
        className={triggerClassName}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box max-w-lg">
          <h2
            id={titleId}
            className="font-serif text-2xl font-light tracking-tight"
          >
            {ritual ? "Edit ritual" : "New ritual"}
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            {ritual
              ? "Adjust when it runs and what it looks at."
              : "A small routine you come back to on the days that matter."}
          </p>

          {ritual ? (
            <EditRitualForm key={formKey} ritual={ritual} onDone={close} />
          ) : (
            <NewRitualForm
              key={formKey}
              suggestionsEnabled={suggestionsEnabled}
              onDone={close}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </>
  );
}

function NewRitualForm({
  suggestionsEnabled,
  onDone,
}: {
  suggestionsEnabled: boolean;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (...args: Parameters<typeof createRitual>) => {
      const result = await createRitual(...args);
      if (result?.status === "success") onDone();
      return result;
    },
    undefined,
  );
  const flow = useNewRitualFlow();
  const { stage } = flow;

  return (
    <form
      action={formAction}
      onSubmit={flow.submitted}
      className="mt-6 flex flex-col gap-6"
    >
      <NewRitualScreen
        flow={flow}
        suggestionsEnabled={suggestionsEnabled}
        submitted={state?.status === "error" ? state.values : undefined}
      />
      {(stage.kind === "form" || flow.choosingSuggestion) &&
        state?.status === "error" && (
          <p role="alert" className="text-sm text-error">
            {state.error}
          </p>
        )}

      <div className="modal-action mt-0">
        {stage.kind !== "choose" && (
          <button
            type="button"
            onClick={flow.back}
            disabled={pending}
            className="btn btn-ghost mr-auto"
          >
            Back
          </button>
        )}
        <button type="button" onClick={onDone} className="btn btn-ghost">
          Cancel
        </button>
        {flow.question && (
          <button
            type="button"
            onClick={flow.next}
            disabled={!flow.answered}
            className="btn btn-primary"
          >
            {flow.isLastQuestion ? "See rituals" : "Next"}
          </button>
        )}
        {flow.loadingSuggestions && (
          <div aria-hidden className="skeleton h-10 w-32 rounded-field" />
        )}
        {flow.choosingSuggestion && (
          <button
            type="submit"
            disabled={flow.selected === null || pending}
            className="btn btn-primary"
          >
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending ? "Saving…" : "Use this ritual"}
          </button>
        )}
        {stage.kind === "form" && (
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending ? "Creating…" : "Create ritual"}
          </button>
        )}
      </div>
    </form>
  );
}

function EditRitualForm({
  ritual,
  onDone,
}: {
  ritual: Ritual;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (...args: Parameters<typeof updateRitual>) => {
      const result = await updateRitual(...args);
      if (result?.status === "success") onDone();
      return result;
    },
    undefined,
  );

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, startDelete] = useTransition();

  function handleDelete(id: string) {
    startDelete(async () => {
      const result = await deleteRitual(id);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      onDone();
    });
  }

  const error =
    deleteError ?? (state?.status === "error" ? state.error : undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-6">
      <input type="hidden" name="id" value={ritual.id} />

      <RitualFields
        values={state?.status === "error" ? state.values : toFormValues(ritual)}
      />

      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      {confirmingDelete ? (
        <div className="modal-action mt-0 flex-wrap items-center justify-between">
          <p className="text-sm">Delete this ritual for good?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="btn btn-ghost"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={() => handleDelete(ritual.id)}
              disabled={deleting}
              className="btn btn-error"
            >
              {deleting && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div className="modal-action mt-0">
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending}
            className="btn btn-ghost mr-auto text-error"
          >
            Delete
          </button>
          <button type="button" onClick={onDone} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </form>
  );
}
