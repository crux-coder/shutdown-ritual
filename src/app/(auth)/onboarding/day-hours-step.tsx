"use client";

import { useActionState, useState } from "react";
import { TimePicker } from "@/components/time-picker";
import { formatDuration, toMinutes } from "@/lib/day-hours";
import { saveDayHours } from "./actions";

export function DayHoursStep({
  dayStartsAt,
  dayEndsAt,
  backAction,
}: {
  dayStartsAt: string;
  dayEndsAt: string;
  backAction: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(saveDayHours, undefined);
  const [start, setStart] = useState(state?.dayStartsAt ?? dayStartsAt);
  const [end, setEnd] = useState(state?.dayEndsAt ?? dayEndsAt);

  const length = start && end ? toMinutes(end) - toMinutes(start) : 0;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <TimePicker
          label="Day starts"
          name="dayStartsAt"
          value={start}
          onChange={setStart}
          autoFocus
        />
        <TimePicker
          label="Day ends"
          name="dayEndsAt"
          value={end}
          onChange={setEnd}
        />
      </div>

      <p
        aria-live="polite"
        className="text-center text-sm text-base-content/50"
      >
        {length > 0
          ? `A ${formatDuration(length)} day`
          : "Your day should end after it starts."}
      </p>

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
          disabled={pending || length <= 0}
          className="btn btn-primary btn-lg"
        >
          {pending && <span className="loading loading-spinner loading-sm" />}
          {pending ? "Setting up…" : "Get started"}
        </button>
      </div>
    </form>
  );
}
