import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DayHoursForm } from "./day-hours-form";
import { NameForm } from "./name-form";
import { PhraseForm } from "./phrase-form";
import { SettingsSection } from "./settings-section";
import { SoundForm } from "./sound-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-12 pb-24 sm:pt-20">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-light tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-base-content/60">
          Make the ritual fit your day.
        </p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <Settings />
      </Suspense>
    </main>
  );
}

async function Settings() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title="Profile" description="How we greet you each day.">
        <NameForm
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
        />
      </SettingsSection>
      <SettingsSection
        title="Workday"
        description="When your day starts and ends decides when your rituals open."
      >
        <DayHoursForm
          dayStartsAt={user.dayStartsAt}
          dayEndsAt={user.dayEndsAt}
        />
      </SettingsSection>
      <SettingsSection
        title="Shutdown phrase"
        description="The words you type to close the day."
      >
        <PhraseForm phrase={user.shutdownPhrase} />
      </SettingsSection>
      <SettingsSection
        title="Sounds"
        description="One plays as you finish your morning rituals, the other as you shut down."
      >
        <div className="flex flex-col gap-6">
          <SoundForm moment="start" sound={user.startSound} />
          <SoundForm moment="shutdown" sound={user.shutdownSound} />
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="skeleton h-64 w-full" />
      <div className="skeleton h-56 w-full" />
      <div className="skeleton h-48 w-full" />
      <div className="skeleton h-48 w-full" />
    </div>
  );
}
