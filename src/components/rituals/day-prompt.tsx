"use client";

import {
  Moon02Icon,
  SunriseIcon,
  SunsetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { endDayEarly, reopenDay, startDayEarly } from "@/lib/profile-actions";

const PROMPTS = {
  start: {
    action: startDayEarly,
    label: "Start my day early",
    icon: SunriseIcon,
  },
  end: { action: endDayEarly, label: "End my day early", icon: SunsetIcon },
} as const;

// One big button that opens the next rituals early.
export function DayPrompt({ moment }: { moment: keyof typeof PROMPTS }) {
  const { action, label, icon } = PROMPTS[moment];
  const [pending, startTransition] = useTransition();

  return (
    <PromptButton
      icon={icon}
      label={label}
      pending={pending}
      onClick={() => startTransition(action)}
    />
  );
}

// The big, centred, rounded button the home page uses for each turn of the
// day. Also starts the shut-down flow.
export function PromptButton({
  icon,
  label,
  onClick,
  pending = false,
  delayMs = 0,
}: {
  icon: IconSvgElement;
  label: ReactNode;
  onClick: () => void;
  pending?: boolean;
  delayMs?: number;
}) {
  return (
    <div
      className="flex justify-center py-10 motion-safe:animate-rise"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <button
        type="button"
        disabled={pending}
        onClick={onClick}
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
export const LEAVE_MS = 700;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Set while the night is already on screen for the shutdown phrase, so the
// shut-down view that takes its place doesn't fade in from the day again.
let nightShowing = false;

export function keepNightShowing(): void {
  nightShowing = true;
}

// The dark screen over everything that the day closes into.
export function NightScreen({
  leaving = false,
  fadeIn = true,
  children,
}: {
  leaving?: boolean;
  fadeIn?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-leaving={leaving || undefined}
      data-fade-in={fadeIn || undefined}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-12 bg-[linear-gradient(to_bottom,#0b0d16,#141220_60%,#1b1418)] px-6 text-center text-[#ece4d8] transition-opacity duration-1000 ease-out data-fade-in:starting:opacity-0 data-leaving:pointer-events-none data-leaving:opacity-0 data-leaving:duration-700"
    >
      {children}
    </div>
  );
}

// The day is done: the app dims to a night screen over everything. Reopening
// is possible but deliberately quiet, so the ending holds.
export function ShutDownView() {
  const [, startTransition] = useTransition();
  const [leaving, setLeaving] = useState(false);
  // Coming from the shutdown screen, the night is already up.
  const [fadeIn] = useState(() => !nightShowing);

  useEffect(() => {
    nightShowing = false;
  }, []);

  // Fade the night away while the day reopens; the page only swaps back once
  // both are done, so the rituals rise in behind a screen that's already gone.
  function reopen() {
    setLeaving(true);
    startTransition(async () => {
      await Promise.all([reopenDay(), wait(LEAVE_MS)]);
    });
  }

  return (
    <NightScreen leaving={leaving} fadeIn={fadeIn}>
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
          You’re done for today.
        </p>
        <p className="mt-3 opacity-50">
          Everything you left here will be waiting tomorrow.
        </p>
      </div>
      <button
        type="button"
        disabled={leaving}
        onClick={reopen}
        className="absolute bottom-10 text-sm text-[#ece4d8]/30 underline-offset-4 transition-colors hover:text-[#ece4d8]/60 hover:underline motion-safe:animate-rise"
        style={{ animationDelay: "2000ms" }}
      >
        Reopen day
      </button>
    </NightScreen>
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
