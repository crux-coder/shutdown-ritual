"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useOptimistic, useTransition } from "react";
import { setRitualCompleted, setStepChecked } from "@/lib/rituals/actions";
import type { TodaysRitual } from "@/lib/rituals/queries";
import { playSound, type SoundId } from "@/lib/sounds";

type Progress = { completed: boolean; checked: number[] };
type ProgressChange =
  | { kind: "ritual"; completed: boolean }
  | { kind: "step"; step: number; checked: boolean };

// Mirrors setRitualCompleted and setStepChecked: the last step completes the
// ritual, and undoing a ritual starts its steps over.
function applyChange(
  stepCount: number,
  progress: Progress,
  change: ProgressChange,
): Progress {
  if (change.kind === "ritual") {
    return change.completed
      ? { ...progress, completed: true }
      : { completed: false, checked: [] };
  }
  const checked = change.checked
    ? [...new Set([...progress.checked, change.step])]
    : progress.checked.filter((s) => s !== change.step);
  return {
    completed: progress.completed || checked.length === stepCount,
    checked,
  };
}

export function TodayRitual({
  ritual,
  delayMs,
  finishSound = "none",
}: {
  ritual: TodaysRitual;
  delayMs: number;
  // Played when finishing this one finishes the list.
  finishSound?: SoundId;
}) {
  const steps = ritual.steps;
  const [progress, change] = useOptimistic(
    { completed: ritual.completed, checked: ritual.checkedSteps },
    (state: Progress, c: ProgressChange) => applyChange(steps.length, state, c),
  );
  const [, startTransition] = useTransition();
  const { completed } = progress;
  // A ritual with steps is worked through step by step until it's done.
  const stepping = steps.length > 0 && !completed;

  function toggleRitual() {
    if (!completed) playSound(finishSound);
    startTransition(async () => {
      change({ kind: "ritual", completed: !completed });
      await setRitualCompleted(ritual.id, !completed);
    });
  }

  function toggleStep(step: number) {
    const checked = !progress.checked.includes(step);
    if (checked && progress.checked.length === steps.length - 1)
      playSound(finishSound);
    startTransition(async () => {
      change({ kind: "step", step, checked });
      await setStepChecked(ritual.id, step, checked);
    });
  }

  const tick = (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-full border border-base-content/25 transition-all duration-300 group-hover:border-primary group-aria-pressed:border-primary group-aria-pressed:bg-primary"
    >
      <HugeiconsIcon
        aria-hidden
        icon={Tick02Icon}
        strokeWidth={2.5}
        className="size-4 text-primary-content opacity-0 transition-opacity duration-300 group-aria-pressed:opacity-100"
      />
    </span>
  );

  const heading = (
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-lg font-medium decoration-base-content/30 transition-colors duration-300 group-aria-pressed:text-base-content/40 group-aria-pressed:line-through">
        {ritual.title}
      </span>
      {ritual.description && (
        <span className="text-base-content/60 transition-colors duration-300 group-aria-pressed:text-base-content/30">
          {ritual.description}
        </span>
      )}
      {stepping && (
        <span className="text-xs text-base-content/50 tabular-nums">
          {progress.checked.length} of {steps.length} done
        </span>
      )}
    </span>
  );

  return (
    <li
      className="motion-safe:animate-rise"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className={`rounded-box border transition-colors duration-300 ${
          completed
            ? "border-transparent bg-base-200/20"
            : "border-base-300 bg-base-200/40"
        } ${stepping ? "" : "hover:border-primary/40"}`}
      >
        {stepping ? (
          // The steps tick it off; the circle finishes it in one go.
          <div className="flex items-center gap-5 px-6 pt-5">
            {heading}
            <button
              type="button"
              onClick={toggleRitual}
              aria-pressed={false}
              aria-label={`Mark all of ${ritual.title} done`}
              title="Mark it all done"
              className="group cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-primary"
            >
              {tick}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleRitual}
            aria-pressed={completed}
            className="group flex w-full cursor-pointer items-center gap-5 rounded-box px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-primary"
          >
            {heading}
            {tick}
          </button>
        )}

        {steps.length > 0 && (
          // Folds away once the ritual is done.
          <div
            className={`grid transition-[grid-template-rows] duration-500 ease-out ${
              stepping ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden" inert={!stepping}>
              <ol className="flex flex-col gap-0.5 px-3 pt-3 pb-3">
                {steps.map((step, index) => (
                  <li key={index}>
                    <StepButton
                      text={step}
                      checked={progress.checked.includes(index)}
                      onToggle={() => toggleStep(index)}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function StepButton({
  text,
  checked,
  onToggle,
}: {
  text: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-field px-3 py-2 text-left transition-colors duration-200 hover:bg-base-200/60 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span
        aria-hidden
        className="grid size-5 shrink-0 place-items-center rounded-full border border-base-content/25 transition-all duration-300 group-hover:border-primary group-aria-pressed:border-primary group-aria-pressed:bg-primary"
      >
        <HugeiconsIcon
          aria-hidden
          icon={Tick02Icon}
          strokeWidth={3}
          className="size-3 text-primary-content opacity-0 transition-opacity duration-300 group-aria-pressed:opacity-100"
        />
      </span>
      <span className="text-base-content/80 decoration-base-content/30 transition-colors duration-300 group-aria-pressed:text-base-content/40 group-aria-pressed:line-through">
        {text}
      </span>
    </button>
  );
}
