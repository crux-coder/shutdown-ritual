import Link from "next/link";
import { TimeZoneSync } from "@/components/time-zone-sync";
import { getCurrentUser } from "@/lib/auth";
import { today } from "@/lib/dates";
import { currentMoment } from "@/lib/day-hours";
import { RITUAL_MOMENTS } from "@/lib/rituals/options";
import { getTodaysRituals } from "@/lib/rituals/queries";
import { TodayRitual } from "./today-ritual";

// Each item rises in a beat after the one before it.
const STAGGER_MS = 90;

export async function TodayList() {
  const [user, rituals] = await Promise.all([
    getCurrentUser(),
    getTodaysRituals(),
  ]);
  const doneCount = rituals.filter((r) => r.completed).length;

  // What's up next comes first; the rest of the day waits quietly below.
  const now = currentMoment(
    today(user.timeZone).minutes,
    user.dayStartsAt,
    user.dayEndsAt,
  );
  const moments = [...RITUAL_MOMENTS].sort(
    (a, b) => Number(b.id === now) - Number(a.id === now),
  );

  let index = 0;
  const groups = moments
    .map((moment) => ({
      moment,
      isCurrent: moment.id === now,
      rituals: rituals
        .filter((r) => r.moment === moment.id)
        .map((ritual) => ({ ritual, index: index++ })),
    }))
    .filter((g) => g.rituals.length > 0);

  return (
    <>
      <TimeZoneSync stored={user.timeZone} />

      {rituals.length === 0 ? (
        <div className="motion-safe:animate-rise px-6 py-10 text-center">
          <p className="font-serif text-lg">Nothing on for today</p>
          <p className="mt-1 text-sm text-base-content/60">
            Enjoy the quiet, or{" "}
            <Link href="/rituals" className="link link-hover">
              plan a ritual
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(({ moment, isCurrent, rituals }) => (
            <section
              key={moment.id}
              className={
                isCurrent
                  ? undefined
                  : "opacity-60 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100"
              }
            >
              <h3
                className="mb-3 text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase motion-safe:animate-rise"
                style={{ animationDelay: `${rituals[0].index * STAGGER_MS}ms` }}
              >
                {moment.label}
                {!isCurrent && (
                  <span className="font-normal tracking-normal normal-case">
                    {" · "}
                    {moment.id === "start_of_day" ? "earlier" : "later"}
                  </span>
                )}
              </h3>
              <ul className="flex flex-col gap-2">
                {rituals.map(({ ritual, index }) => (
                  <TodayRitual
                    key={ritual.id}
                    ritual={ritual}
                    delayMs={index * STAGGER_MS + STAGGER_MS / 2}
                  />
                ))}
              </ul>
            </section>
          ))}

          <p
            className="text-center text-sm text-base-content/50 motion-safe:animate-rise"
            style={{ animationDelay: `${(index + 1) * STAGGER_MS}ms` }}
          >
            {doneCount === rituals.length
              ? "All done. Rest well."
              : `${doneCount} of ${rituals.length} done`}
          </p>
        </div>
      )}
    </>
  );
}

export function TodayListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton h-18 w-full" />
      <div className="skeleton h-18 w-full" />
    </div>
  );
}
