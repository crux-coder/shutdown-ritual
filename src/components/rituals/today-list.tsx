import Link from "next/link";
import { TimeZoneSync } from "@/components/time-zone-sync";
import { getCurrentUser } from "@/lib/auth";
import { today } from "@/lib/dates";
import { minutesUntilNextPhase, todayPhase } from "@/lib/day-hours";
import { WEEKDAYS, type Weekday } from "@/lib/rituals/options";
import { DEFAULT_SHUTDOWN_SOUND } from "@/lib/sounds";
import {
  getRituals,
  getTodaysRituals,
  type TodaysRitual,
} from "@/lib/rituals/queries";
import { DayPrompt, RefreshIn, ShutDownView } from "./day-prompt";
import { TodayRitual } from "./today-ritual";

// Each item rises in a beat after the one before it.
const STAGGER_MS = 90;

export async function TodayList() {
  const [user, rituals] = await Promise.all([
    getCurrentUser(),
    getTodaysRituals(),
  ]);
  const { date, weekday, minutes } = today(user.timeZone);

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

  return (
    <>
      <TimeZoneSync stored={user.timeZone} />
      {refreshIn !== null && <RefreshIn minutes={refreshIn} />}

      {user.dayShutDownOn === date ? (
        <ShutDownView
          backAt={await nextRitualsAt(
            weekday,
            user.dayStartsAt,
            user.dayEndsAt,
          )}
        />
      ) : rituals.length === 0 ? (
        <div className="px-6 py-10 text-center motion-safe:animate-rise">
          <p className="font-serif text-lg">Nothing on for today</p>
          <p className="mt-1 text-sm text-base-content/60">
            Enjoy the quiet, or{" "}
            <Link href="/rituals" className="link link-hover">
              plan a ritual
            </Link>
            .
          </p>
        </div>
      ) : phase === "start_prompt" ? (
        <DayPrompt moment="start" />
      ) : phase === "start" ? (
        <div className="flex flex-col gap-6">
          <RitualList rituals={startRituals} />
          {/* Morning done: the end of the day can be opened early from here. */}
          {startRituals.every((r) => r.completed) && (
            <EndPrompt hasRituals={endRituals.length > 0} />
          )}
        </div>
      ) : phase === "end_prompt" ? (
        <EndPrompt hasRituals={endRituals.length > 0} />
      ) : endRituals.length > 0 ? (
        <div className="flex flex-col gap-6">
          <RitualList rituals={endRituals} />
          {endRituals.every((r) => r.completed) && (
            <DayPrompt
              moment="shutdown"
              delayMs={400}
              sound={DEFAULT_SHUTDOWN_SOUND}
            />
          )}
        </div>
      ) : (
        <Quiet>Nothing left for today</Quiet>
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

function EndPrompt({ hasRituals }: { hasRituals: boolean }) {
  return hasRituals ? (
    <DayPrompt moment="end" />
  ) : (
    <Quiet>Nothing more planned today</Quiet>
  );
}

function Quiet({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-10 text-center font-serif text-xl text-base-content/70 motion-safe:animate-rise">
      {children}
    </p>
  );
}

// When rituals next open after today, e.g. "tomorrow at 09:00" or "Monday
// at 17:30": the start of the day if it has start-of-day rituals, else its end.
async function nextRitualsAt(
  weekday: Weekday,
  dayStartsAt: string,
  dayEndsAt: string,
): Promise<string | null> {
  const rituals = await getRituals();

  for (let ahead = 1; ahead <= 7; ahead++) {
    const day = (((weekday - 1 + ahead) % 7) + 1) as Weekday;
    const due = rituals.filter((r) => r.days.includes(day));
    if (due.length === 0) continue;

    const name = WEEKDAYS.find((d) => d.id === day)!.long;
    const when = ahead === 1 ? "tomorrow" : ahead === 7 ? `next ${name}` : name;
    const time = due.some((r) => r.moment === "start_of_day")
      ? dayStartsAt
      : dayEndsAt;
    return `${when} at ${time}`;
  }
  return null;
}

export function TodayListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton h-22 w-full" />
      <div className="skeleton h-22 w-full" />
    </div>
  );
}
