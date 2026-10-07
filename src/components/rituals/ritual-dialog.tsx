"use client";

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
  type RitualFormValues,
} from "@/lib/rituals/actions";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  RITUAL_INTEGRATIONS,
  RITUAL_MOMENTS,
  WEEKDAYS,
  type Ritual,
} from "@/lib/rituals/options";

const DEFAULT_VALUES: RitualFormValues = {
  title: "",
  description: "",
  moment: "end_of_day",
  days: [1, 2, 3, 4, 5],
  integrations: [],
};

function toFormValues(ritual?: Ritual): RitualFormValues {
  if (!ritual) return DEFAULT_VALUES;
  return {
    title: ritual.title,
    description: ritual.description ?? "",
    moment: ritual.moment,
    days: ritual.days,
    integrations: ritual.integrations,
  };
}

export function NewRitualButton() {
  return (
    <RitualDialog triggerClassName="btn btn-primary">
      <PlusIcon />
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
      <PencilIcon />
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

  const values =
    state?.status === "error" ? state.values : toFormValues(ritual);
  const error =
    deleteError ?? (state?.status === "error" ? state.error : undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-6">
      {ritual && <input type="hidden" name="id" value={ritual.id} />}

      <fieldset className="fieldset gap-3">
        <label className="floating-label">
          <span>Name</span>
          <input
            type="text"
            name="title"
            placeholder="Name, e.g. Friday wrap-up"
            defaultValue={values.title}
            maxLength={MAX_TITLE_LENGTH}
            required
            autoFocus
            className="input w-full"
          />
        </label>
        <label className="floating-label">
          <span>Description (optional)</span>
          <textarea
            name="description"
            placeholder="Description (optional)"
            defaultValue={values.description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={2}
            className="textarea w-full"
          />
        </label>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">When</legend>
        <div className="grid grid-cols-2 gap-2">
          {RITUAL_MOMENTS.map((moment) => (
            <label
              key={moment.id}
              className="flex cursor-pointer flex-col gap-0.5 rounded-box border border-base-300 p-3 transition-colors has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:outline-2 has-focus-visible:outline-primary"
            >
              <input
                type="radio"
                name="moment"
                value={moment.id}
                defaultChecked={values.moment === moment.id}
                className="sr-only"
              />
              <span className="text-sm font-medium">{moment.label}</span>
              <span className="text-xs text-base-content/60">
                {moment.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Repeat on</legend>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => (
            <input
              key={day.id}
              type="checkbox"
              name="days"
              value={day.id}
              aria-label={day.short}
              title={day.long}
              defaultChecked={values.days.includes(day.id)}
              className="btn btn-sm btn-circle size-10 checked:btn-primary"
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">
          Integrations
          <span className="badge badge-ghost badge-sm font-normal">
            Coming soon
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {RITUAL_INTEGRATIONS.map((integration) => (
            <label
              key={integration.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-box border border-base-300 p-3 transition-colors has-checked:border-primary has-checked:bg-primary/10"
            >
              <input
                type="checkbox"
                name="integrations"
                value={integration.id}
                defaultChecked={values.integrations.includes(integration.id)}
                className="checkbox checkbox-sm checkbox-primary mt-0.5"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{integration.label}</span>
                <span className="text-xs text-base-content/60">
                  {integration.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="label">
          Pick what this ritual should look at. Connecting accounts is on the
          way.
        </p>
      </fieldset>

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

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden
      className="size-4"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      <path d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z" />
    </svg>
  );
}
