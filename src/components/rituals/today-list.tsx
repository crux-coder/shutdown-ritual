import Link from "next/link";
import type { ComponentProps } from "react";
import { TimeZoneSync } from "@/components/time-zone-sync";
import { getCurrentUser } from "@/lib/auth";
import { today } from "@/lib/dates";
import { minutesUntilNextPhase, todayPhase } from "@/lib/day-hours";
import { getTodaysRituals, type TodaysRitual } from "@/lib/rituals/queries";
import type { SoundId } from "@/lib/sounds";
import { DayPrompt, RefreshIn, ShutDownView } from "./day-prompt";
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

  const startRituals = rituals.filter((r) => r.moment === "start_of_day");
  const endRituals = rituals.filter((r) => r.moment === "end_of_day");

  const phase = todayPhase({
    nowMinutes: minutes,
    dayStartsAt: user.dayStartsAt,
    dayEndsAt: user.dayEndsAt,
    startedEarly: user.dayStartedEarlyOn === date,
    endedEarly: user.dayEndedEarlyOn === date,
    hasStartRituals: startRituals.length > 0,
  });
  const refreshIn = minutesUntilNextPhase(
    minutes,
    user.dayStartsAt,
    user.dayEndsAt,
  );

  // A note written on an earlier day is waiting to be read; one written
  // today is still being drafted, and the shutdown screen picks it up.
  const noteFromBefore =
    user.handoffNote && user.handoffNoteOn && user.handoffNoteOn < date
      ? user.handoffNote
      : null;
  const noteFromToday =
    user.handoffNoteOn === date ? (user.handoffNote ?? "") : "";

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
  // The evening without rituals of its own: straight to closing the day.
  const finishForToday = shutdown({ label: "Finish for today", delayMs: 200 });
  // The shorter way out on a tired evening: straight to the note and the
  // close, leaving whatever rituals are open for today.
  const essentials = shutdown({
    quiet: true,
    label: "Just the essentials tonight",
    delayMs: 400,
  });
  // Before the evening: open its rituals early, or close the day.
  const evening =
    endRituals.length > 0 ? (
      <div className="flex flex-col">
        <DayPrompt moment="end" />
        {essentials}
      </div>
    ) : (
      finishForToday
    );

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
      ) : phase === "start_prompt" ? (
        <DayPrompt moment="start" />
      ) : phase === "start" ? (
        <div className="flex flex-col gap-6">
          <RitualList rituals={startRituals} finishSound={user.startSound} />
          {/* Morning done: the evening can be opened early from here. */}
          {startRituals.every((r) => r.completed) && evening}
        </div>
      ) : phase === "end_prompt" ? (
        evening
      ) : endRituals.length > 0 ? (
        <div className="flex flex-col gap-6">
          <RitualList rituals={endRituals} />
          {endRituals.every((r) => r.completed)
            ? shutdown({ delayMs: 400 })
            : // Not everything got done, and that's fine: leave it for today.
              essentials}
        </div>
      ) : (
        finishForToday
      )}
    </>
  );
}

function RitualList({
  rituals,
  finishSound,
}: {
  rituals: TodaysRitual[];
  // Played as the last open ritual is checked off.
  finishSound?: SoundId;
}) {
  const open = rituals.filter((r) => !r.completed);

  return (
    <ul className="flex flex-col gap-3">
      {rituals.map((ritual, index) => (
        <TodayRitual
          key={ritual.id}
          ritual={ritual}
          delayMs={index * STAGGER_MS + STAGGER_MS / 2}
          finishSound={
            open.length === 1 && open[0] === ritual ? finishSound : "none"
          }
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
