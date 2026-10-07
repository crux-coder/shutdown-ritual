"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useOptimistic, useTransition } from "react";
import { setRitualCompleted } from "@/lib/rituals/actions";
import type { TodaysRitual } from "@/lib/rituals/queries";

export function TodayRitual({
  ritual,
  delayMs,
}: {
  ritual: TodaysRitual;
  delayMs: number;
}) {
  const [completed, setCompleted] = useOptimistic(ritual.completed);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setCompleted(!completed);
      await setRitualCompleted(ritual.id, !completed);
    });
  }

  return (
    <li
      className="motion-safe:animate-rise"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={completed}
        className="group flex w-full items-start gap-4 rounded-box border border-base-300 bg-base-200/40 p-4 text-left transition-colors duration-300 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-transparent aria-pressed:bg-base-200/20"
      >
        <span
          aria-hidden
          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-base-content/25 transition-all duration-300 group-hover:border-primary group-aria-pressed:border-primary group-aria-pressed:bg-primary"
        >
          <HugeiconsIcon
            aria-hidden
            icon={Tick02Icon}
            strokeWidth={2.5}
            className="size-3.5 text-primary-content opacity-0 transition-opacity duration-300 group-aria-pressed:opacity-100"
          />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium decoration-base-content/30 transition-colors duration-300 group-aria-pressed:text-base-content/40 group-aria-pressed:line-through">
            {ritual.title}
          </span>
          {ritual.description && (
            <span className="text-sm text-base-content/60 transition-colors duration-300 group-aria-pressed:text-base-content/30">
              {ritual.description}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
