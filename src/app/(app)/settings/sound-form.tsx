"use client";

import { PlayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useRef } from "react";
import { SOUNDS, playSound, type SoundId } from "@/lib/sounds";
import { updateShutdownSound, updateStartSound } from "./actions";
import { SaveStatus } from "./settings-section";

const MOMENTS = {
  start: { label: "Start of day", action: updateStartSound },
  shutdown: { label: "Shutdown", action: updateShutdownSound },
} as const;

// Saves as soon as a sound is picked; each one can be previewed first.
export function SoundForm({
  moment,
  sound,
}: {
  moment: keyof typeof MOMENTS;
  sound: SoundId;
}) {
  const { label, action } = MOMENTS[moment];
  const [state, formAction] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase">
          {label}
        </span>
        <SaveStatus state={state} />
      </div>
      <div className="flex flex-col gap-2">
        {SOUNDS.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 rounded-field border border-base-300 bg-base-100/60 p-3 has-checked:border-primary/50"
          >
            <label className="flex flex-1 cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="sound"
                value={s.id}
                defaultChecked={s.id === sound}
                onChange={() => formRef.current?.requestSubmit()}
                className="radio radio-sm radio-primary"
              />
              {s.label}
            </label>
            {s.id !== "none" && (
              <button
                type="button"
                onClick={() => playSound(s.id)}
                className="btn btn-circle btn-ghost btn-sm text-base-content/60"
              >
                <span className="sr-only">Play {s.label}</span>
                <HugeiconsIcon
                  aria-hidden
                  icon={PlayIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              </button>
            )}
          </div>
        ))}
      </div>
    </form>
  );
}
