import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getProfile } from "@/lib/auth";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { signOut } from "../actions";
import { goBack } from "./actions";
import { DayHoursStep } from "./day-hours-step";
import { NameStep } from "./name-step";
import { RitualStep } from "./ritual-step";

export const metadata: Metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <>
      <Suspense fallback={<StepSkeleton />}>
        <CurrentStep />
      </Suspense>

      <form action={signOut} className="mt-8 text-center">
        <button
          type="submit"
          className="link link-hover text-sm text-base-content/60"
        >
          Sign out
        </button>
      </form>
    </>
  );
}

// Progress is stored on the profile, so this picks up wherever the user left
// off — on any device.
async function CurrentStep() {
  const profile = await getProfile();

  switch (profile.onboardingStep) {
    case "complete":
      redirect("/");

    case "name":
      return (
        <Step
          step="name"
          title="Nice to meet you"
          subtitle="What should we call you at the end of the day?"
          className="max-w-sm"
        >
          <NameStep firstName={profile.firstName} lastName={profile.lastName} />
        </Step>
      );

    case "day_hours":
      return (
        <Step
          step="day_hours"
          title="Your day"
          subtitle="When does work begin and end? We'll bring up the right rituals at the right time."
          className="max-w-sm"
        >
          <DayHoursStep
            dayStartsAt={profile.dayStartsAt}
            dayEndsAt={profile.dayEndsAt}
            backAction={goBack.bind(null, "day_hours")}
          />
        </Step>
      );

    case "first_ritual":
      return (
        <Step
          step="first_ritual"
          title={`Your first ritual, ${profile.firstName}`}
          subtitle="Start small. One routine you'd like to come back to — you can add more later."
          className="max-w-lg"
        >
          <RitualStep backAction={goBack.bind(null, "first_ritual")} />
        </Step>
      );
  }
}

function Step({
  step,
  title,
  subtitle,
  className,
  children,
}: {
  step: (typeof ONBOARDING_STEPS)[number];
  title: string;
  subtitle: string;
  className: string;
  children: React.ReactNode;
}) {
  const index = ONBOARDING_STEPS.indexOf(step);

  return (
    <div className={`w-full motion-safe:animate-rise ${className}`}>
      <StepDots current={index} />
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-light tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-base-content/60">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

function StepDots({ current }: { current: number }) {
  return (
    <div
      role="img"
      aria-label={`Step ${current + 1} of ${ONBOARDING_STEPS.length}`}
      className="mb-8 flex justify-center gap-2"
    >
      {ONBOARDING_STEPS.map((step, i) => (
        <span
          key={step}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === current
              ? "w-6 bg-primary"
              : i < current
                ? "w-1.5 bg-primary/50"
                : "w-1.5 bg-base-300"
          }`}
        />
      ))}
    </div>
  );
}

function StepSkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="skeleton mx-auto h-10 w-3/4" />
      <div className="skeleton mx-auto mb-6 h-5 w-full" />
      <div className="skeleton h-14 w-full" />
      <div className="skeleton h-14 w-full" />
    </div>
  );
}
