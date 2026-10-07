"use client";

import { useActionState, useState } from "react";
import { TimePicker } from "@/components/time-picker";
import { toMinutes } from "@/lib/day-hours";
import { updateDayHours } from "./actions";
import { SaveButton, SaveStatus } from "./settings-section";

export function DayHoursForm({
  dayStartsAt,
  dayEndsAt,
}: {
  dayStartsAt: string;
  dayEndsAt: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateDayHours,
    undefined,
  );
  const [start, setStart] = useState(dayStartsAt);
  const [end, setEnd] = useState(dayEndsAt);

  const length = toMinutes(end) - toMinutes(start);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <TimePicker
          label="Day starts"
          name="dayStartsAt"
          value={start}
          onChange={setStart}
        />
        <TimePicker
          label="Day ends"
          name="dayEndsAt"
          value={end}
          onChange={setEnd}
        />
      </div>

      {length <= 0 && (
        <p role="alert" className="text-sm text-error">
          Your day should end after it starts.
        </p>
      )}

      <div className="flex items-center justify-end gap-4">
        <SaveStatus state={state} />
        <SaveButton pending={pending} disabled={length <= 0} />
      </div>
    </form>
  );
}
