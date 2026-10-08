import Link from "next/link";
import type { ComponentProps } from "react";
import { TimeZoneSync } from "@/components/time-zone-sync";
import { getCurrentUser } from "@/lib/auth";
import { today } from "@/lib/dates";
import { minutesUntilRitualsOpen, ritualsOpen } from "@/lib/day-hours";
import { getTodaysRituals, type TodaysRitual } from "@/lib/rituals/queries";
import { suggestionsEnabled } from "@/lib/rituals/suggest";
import { DayPrompt, RefreshIn, ShutDownView } from "./day-prompt";
import { TailorNudge, WelcomeCard } from "./first-day-cards";
import { HandoffNote } from "./handoff-note";
import { ShutdownFlow } from "./shutdown-flow";
import { TodayRitual } from "./today-ritual";

// Each item rises in a beat after the one before it.
const STAGGER_MS = 90;

type ShutdownProps = Pick<
  ComponentProps<typeof ShutdownFlow>,
  "quiet" | "label" | "delayMs"
>;

export async function TodayList() {
  const [user, rituals] = await Promise.all([
    getCurrentUser(),
    getTodaysRituals(),
  ]);
  const { date, minutes } = today(user.timeZone);

  const open = ritualsOpen({
    nowMinutes: minutes,
    dayEndsAt: user.dayEndsAt,
    endedEarly: user.dayEndedEarlyOn === date,
  });
  const refreshIn = minutesUntilRitualsOpen(minutes, user.dayEndsAt);

  // A note written on an earlier day is waiting to be read; one written
  // today is still being drafted, and the shutdown screen picks it up.
  const noteFromBefore =
    user.handoffNote && user.handoffNoteOn && user.handoffNoteOn < date
      ? user.handoffNote
      : null;
  const noteFromToday =
    user.handoffNoteOn === date ? (user.handoffNote ?? "") : "";

  // For someone new: a welcome until they put it away or first shut down,
  // then, from the next day, an offer to make the ritual their own.
  const showWelcome = !user.welcomeDismissed && !user.dayShutDownOn;
  const showTailorNudge =
    !user.tailorNudgeDismissed &&
    !!user.dayShutDownOn &&
    user.dayShutDownOn < date;
  const welcomeOpens =
    rituals.length === 0
      ? `It runs on weekdays, opening at ${user.dayEndsAt} when your workday ends.`
      : open
        ? "It’s open below. Work through it whenever you’re ready."
        : `It opens at ${user.dayEndsAt}, when your workday ends. To try it now, tap “End my day early” below.`;

  // Closing the day is always possible, whatever's still open; unfinished
  // rituals just stay unticked.
  const shutdown = (props: ShutdownProps) => (
    <ShutdownFlow
      phrase={user.shutdownPhrase}
      sound={user.shutdownSound}
      mode={user.shutdownMode}
      note={noteFromToday}
      {...props}
    />
  );
  // A day without rituals: straight to closing the day.
  const finishForToday = shutdown({ label: "Finish for today", delayMs: 200 });
  // The shorter way out on a tired evening: straight to the note and the
  // close, leaving whatever rituals are open for today.
  const essentials = shutdown({
    quiet: true,
    label: (
      <>
        <span className="text-primary">Too tired?</span> Skip to shutdown
      </>
    ),
    delayMs: 400,
  });

  if (user.dayShutDownOn === date) {
    return (
      <>
        <TimeZoneSync stored={user.timeZone} />
        <ShutDownView />
      </>
    );
  }

  return (
    <>
      <TimeZoneSync stored={user.timeZone} />
      {refreshIn !== null && <RefreshIn minutes={refreshIn} />}
      {noteFromBefore && <HandoffNote note={noteFromBefore} />}
      {showWelcome && <WelcomeCard opens={welcomeOpens} />}
      {showTailorNudge && (
        <TailorNudge suggestionsEnabled={suggestionsEnabled()} />
      )}

      {rituals.length === 0 ? (
        <div className="flex flex-col gap-2">
          <div className="px-6 pt-10 text-center motion-safe:animate-rise">
            <p className="font-serif text-lg">Nothing on for today</p>
            <p className="mt-1 text-sm text-base-content/60">
              Enjoy the quiet, or{" "}
              <Link href="/rituals" className="link link-hover">
                plan a ritual
              </Link>
              .
            </p>
          </div>
          {finishForToday}
        </div>
      ) : !open ? (
        // Before the evening: open its rituals early, or close the day.
        <div className="flex flex-col">
          <DayPrompt />
          {essentials}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <RitualList rituals={rituals} />
          {rituals.every((r) => r.completed)
            ? shutdown({ delayMs: 400 })
            : // Not everything got done, and that's fine: leave it for today.
              essentials}
        </div>
      )}
    </>
  );
}

function RitualList({ rituals }: { rituals: TodaysRitual[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {rituals.map((ritual, index) => (
        <TodayRitual
          key={ritual.id}
          ritual={ritual}
          delayMs={index * STAGGER_MS + STAGGER_MS / 2}
        />
      ))}
    </ul>
  );
}

export function TodayListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton h-22 w-full" />
      <div className="skeleton h-22 w-full" />
    </div>
  );
}
