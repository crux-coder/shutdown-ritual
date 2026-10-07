import { Suspense } from "react";
import { TodayList, TodayListSkeleton } from "@/components/rituals/today-list";
import { getCurrentUser } from "@/lib/auth";
import { currentDaypart, type Daypart } from "@/lib/daypart";

const GREETINGS: Record<Daypart, { title: string; subtitle: string }> = {
  morning: {
    title: "Good morning",
    subtitle: "Take a breath. Let\u2019s set a gentle pace for the day.",
  },
  afternoon: {
    title: "Good afternoon",
    subtitle: "Keep it steady. Your rituals are here when you need them.",
  },
  evening: {
    title: "Good evening",
    subtitle:
      "Take a breath. Let\u2019s gently wrap up today and make space for tomorrow.",
  },
  night: {
    title: "Good evening",
    subtitle: "It\u2019s late. Close what\u2019s open, and let the day go.",
  },
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pt-12 pb-24 sm:pt-20">
        <div className="text-center">
          <Suspense fallback={<GreetingSkeleton />}>
            <UserGreeting />
          </Suspense>
        </div>

        <section className="mt-16">
          <Suspense fallback={<TodayListSkeleton />}>
            <TodayList />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

async function UserGreeting() {
  const user = await getCurrentUser();
  const { title, subtitle } = GREETINGS[currentDaypart(user.timeZone)];

  return (
    <div className="motion-safe:animate-rise">
      <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">
        {title}, {user.firstName}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base-content/60">{subtitle}</p>
    </div>
  );
}

function GreetingSkeleton() {
  return (
    <div aria-hidden className="flex flex-col items-center">
      <div className="skeleton h-10 w-72 sm:h-12" />
      <div className="skeleton mt-4 h-5 w-80 max-w-full" />
    </div>
  );
}
