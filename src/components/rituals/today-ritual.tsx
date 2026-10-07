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
        className="group flex w-full cursor-pointer items-center gap-5 rounded-box border border-base-300 bg-base-200/40 px-6 py-5 text-left transition-colors duration-300 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-transparent aria-pressed:bg-base-200/20"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-lg font-medium decoration-base-content/30 transition-colors duration-300 group-aria-pressed:text-base-content/40 group-aria-pressed:line-through">
            {ritual.title}
          </span>
          {ritual.description && (
            <span className="text-base-content/60 transition-colors duration-300 group-aria-pressed:text-base-content/30">
              {ritual.description}
            </span>
          )}
        </span>
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
      </button>
    </li>
  );
}
