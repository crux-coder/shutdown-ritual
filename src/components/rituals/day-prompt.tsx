"use client";

import {
  ArrowTurnBackwardIcon,
  Moon02Icon,
  ShutDownIcon,
  SunriseIcon,
  SunsetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  endDayEarly,
  reopenDay,
  shutDownDay,
  startDayEarly,
} from "@/lib/profile-actions";
import { playSound, type SoundId } from "@/lib/sounds";

const PROMPTS = {
  start: {
    action: startDayEarly,
    label: "Start my day early",
    icon: SunriseIcon,
  },
  end: { action: endDayEarly, label: "End my day early", icon: SunsetIcon },
  shutdown: {
    action: shutDownDay,
    label: "Shut down for the day",
    icon: ShutDownIcon,
  },
} as const;

// One big button: open the next rituals early, or shut down once they're done.
export function DayPrompt({
  moment,
  delayMs = 0,
  sound = "none",
}: {
  moment: keyof typeof PROMPTS;
  delayMs?: number;
  // Played on click, alongside the action.
  sound?: SoundId;
}) {
  const { action, label, icon } = PROMPTS[moment];
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="flex justify-center py-10 motion-safe:animate-rise"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          playSound(sound);
          startTransition(action);
        }}
        className="btn h-16 gap-3 rounded-full border-base-300 bg-base-100/60 px-8 text-lg font-normal shadow-sm shadow-base-content/5 backdrop-blur-sm hover:border-primary/40 hover:bg-base-100"
      >
        {pending ? (
          <span className="loading size-6 loading-spinner text-primary" />
        ) : (
          <HugeiconsIcon
            aria-hidden
            icon={icon}
            strokeWidth={1.75}
            className="size-6 text-primary"
          />
        )}
        {label}
      </button>
    </div>
  );
}

// Matches data-leaving:duration-700 below.
const LEAVE_MS = 700;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The day is done: the app dims to a night screen over everything, with one
// way back in.
export function ShutDownView({ backAt }: { backAt: string | null }) {
  const [, startTransition] = useTransition();
  const [leaving, setLeaving] = useState(false);

  // Fade the night away while the day reopens; the page only swaps back once
  // both are done, so the rituals rise in behind a screen that's already gone.
  function reopen() {
    setLeaving(true);
    startTransition(async () => {
      await Promise.all([reopenDay(), wait(LEAVE_MS)]);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-12 bg-[linear-gradient(to_bottom,#0b0d16,#141220_60%,#1b1418)] px-6 text-center text-[#ece4d8] transition-opacity duration-1000 ease-out starting:opacity-0 data-leaving:pointer-events-none data-leaving:opacity-0 data-leaving:duration-700"
      data-leaving={leaving || undefined}
    >
      <HugeiconsIcon
        aria-hidden
        icon={Moon02Icon}
        strokeWidth={1.25}
        className="size-14 opacity-30 motion-safe:animate-rise"
        style={{ animationDelay: "500ms" }}
      />
      <div
        className="motion-safe:animate-rise"
        style={{ animationDelay: "800ms" }}
      >
        <p className="font-serif text-3xl font-light tracking-tight sm:text-4xl">
          Done for the day
        </p>
        {backAt && <p className="mt-3 opacity-50">Back at it {backAt}</p>}
      </div>
      <button
        type="button"
        disabled={leaving}
        onClick={reopen}
        className="btn gap-2 rounded-full border-[#ece4d8]/15 bg-transparent px-6 font-normal text-[#ece4d8]/50 shadow-none hover:border-[#ece4d8]/30 hover:bg-[#ece4d8]/5 hover:text-[#ece4d8] motion-safe:animate-rise"
        style={{ animationDelay: "1400ms" }}
      >
        <HugeiconsIcon
          aria-hidden
          icon={ArrowTurnBackwardIcon}
          strokeWidth={1.75}
          className="size-4"
        />
        One more thing
      </button>
    </div>
  );
}

// Refreshes the page when the next phase of the day begins, so rituals open
// on time even if the page was left open.
export function RefreshIn({ minutes }: { minutes: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), minutes * 60_000 + 1_000);
    return () => clearTimeout(timer);
  }, [minutes, router]);

  return null;
}
