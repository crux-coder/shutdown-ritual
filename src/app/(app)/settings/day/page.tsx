import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DayHoursForm } from "../day-hours-form";
import { PhraseForm } from "../phrase-form";
import { SettingsSection, SettingsSkeleton } from "../settings-section";
import { SoundForm } from "../sound-form";

export const metadata: Metadata = { title: "Your day · Settings" };

// How the day opens and closes: its hours, the phrase that ends it, and the
// sounds along the way.
export default function DaySettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <DaySettings />
    </Suspense>
  );
}

async function DaySettings() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
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
