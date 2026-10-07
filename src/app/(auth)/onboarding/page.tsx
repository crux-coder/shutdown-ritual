import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getProfile } from "@/lib/auth";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { signOut } from "../actions";
import { AuthBottom, AuthMain, AuthTop } from "../frame";
import { goBack } from "./actions";
import { DayHoursStep } from "./day-hours-step";
import { NameStep } from "./name-step";

export const metadata: Metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <>
      <Suspense fallback={<StepSkeleton />}>
        <CurrentStep />
      </Suspense>

      <AuthBottom>
        <form action={signOut}>
          <button
            type="submit"
            className="link link-hover text-sm text-base-content/50"
          >
            Sign out
          </button>
        </form>
      </AuthBottom>
    </>
  );
}

// Progress is stored on the profile, so this picks up wherever the user left
// off — on any device.
async function CurrentStep() {
  const profile = await getProfile();

  switch (profile.onboardingStep) {
    case "complete":
      redirect("/today");

    case "name":
      return (
        <Step
          step="name"
          title="Nice to meet you"
          subtitle="What should we call you at the end of the day?"
          className="max-w-sm"
        >
          <NameStep firstName={profile.firstName} />
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
    <>
      <AuthTop>
        <StepDots current={index} />
      </AuthTop>
      <AuthMain className={className}>
        <div className="motion-safe:animate-rise">
          <header className="mb-10 text-center">
            <h1 className="font-serif text-4xl font-light tracking-tight">
              {title}
            </h1>
            <p className="mt-3 text-base-content/60">{subtitle}</p>
          </header>
          {children}
        </div>
      </AuthMain>
    </>
  );
}

function StepDots({ current }: { current: number }) {
  return (
    <div
      role="img"
      aria-label={`Step ${current + 1} of ${ONBOARDING_STEPS.length}`}
      className="flex justify-center gap-2"
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
    <AuthMain>
      <div className="flex flex-col gap-4">
        <div className="skeleton mx-auto h-10 w-3/4" />
        <div className="skeleton mx-auto mb-6 h-5 w-full" />
        <div className="skeleton h-14 w-full" />
        <div className="skeleton h-14 w-full" />
      </div>
    </AuthMain>
  );
}
