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
import { RitualFields } from "./ritual-fields";
import {
  TemplateOrigin,
  TemplatePicker,
  useRitualTemplate,
} from "./template-picker";

export function NewRitualButton() {
  return (
    <RitualDialog triggerClassName="btn btn-primary">
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
  triggerLabel,
  triggerClassName,
  children,
}: {
  ritual?: Ritual;
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

          <RitualForm key={formKey} ritual={ritual} onDone={close} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </>
  );
}

function RitualForm({
  ritual,
  onDone,
}: {
  ritual?: Ritual;
  onDone: () => void;
}) {
  const save = ritual ? updateRitual : createRitual;
  const [state, formAction, pending] = useActionState(
    async (...args: Parameters<typeof save>) => {
      const result = await save(...args);
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

  // Templates are offered for new rituals only.
  const template = useRitualTemplate(
    state?.status === "error" ? state.values : undefined,
    toFormValues(ritual),
  );
  const error =
    deleteError ?? (state?.status === "error" ? state.error : undefined);

  // A new ritual starts from a template list; the form comes after a pick.
  if (!ritual && template.browsing) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        <TemplatePicker picked={template.picked} onPick={template.pick} />
        <div className="modal-action mt-0">
          <button type="button" onClick={onDone} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={template.submitted}
      className="mt-6 flex flex-col gap-6"
    >
      {ritual ? (
        <input type="hidden" name="id" value={ritual.id} />
      ) : (
        <TemplateOrigin
          title={template.picked?.values.title ?? null}
          onBack={template.browse}
        />
      )}

      <RitualFields key={template.fieldsKey} values={template.values} />

      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      {ritual && confirmingDelete ? (
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
          {ritual && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={pending}
              className="btn btn-ghost mr-auto text-error"
            >
              Delete
            </button>
          )}
          <button type="button" onClick={onDone} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending
              ? ritual
                ? "Saving…"
                : "Creating…"
              : ritual
                ? "Save changes"
                : "Create ritual"}
          </button>
        </div>
      )}
    </form>
  );
}
