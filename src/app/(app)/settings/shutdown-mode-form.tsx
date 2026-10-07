"use client";

import { useActionState, useRef } from "react";
import type { ShutdownMode } from "@/lib/profile";
import { updateShutdownMode } from "./actions";
import { SaveStatus } from "./settings-section";

const MODES: { id: ShutdownMode; label: string; hint: string }[] = [
  {
    id: "phrase",
    label: "Type my phrase",
    hint: "Saying and typing it makes the ending deliberate.",
  },
  {
    id: "button",
    label: "Just a button",
    hint: "One tap: “I’m done for today.”",
  },
];

// Saves as soon as a way is picked.
export function ShutdownModeForm({ mode }: { mode: ShutdownMode }) {
  const [state, formAction] = useActionState(updateShutdownMode, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase">
          To close the day
        </span>
        <SaveStatus state={state} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODES.map((m) => (
          <label
            key={m.id}
            className="flex cursor-pointer gap-3 rounded-field border border-base-300 bg-base-100/60 p-3 has-checked:border-primary/50"
          >
            <input
              type="radio"
              name="shutdownMode"
              value={m.id}
              defaultChecked={m.id === mode}
              onChange={() => formRef.current?.requestSubmit()}
              className="radio radio-sm radio-primary mt-0.5"
            />
            <span className="flex flex-col gap-0.5">
              <span>{m.label}</span>
              <span className="text-sm text-base-content/50">{m.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </form>
  );
}
