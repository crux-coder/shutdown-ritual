import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { shutdownCalendarUrl } from "@/lib/calendar-cue";
import { today } from "@/lib/dates";
import { getRituals } from "@/lib/rituals/queries";
import { DayHoursForm } from "../day-hours-form";
import { PhraseForm } from "../phrase-form";
import { ShutdownModeForm } from "../shutdown-mode-form";
import { SettingsSection, SettingsSkeleton } from "../settings-section";
import { SoundForm } from "../sound-form";

export const metadata: Metadata = { title: "Your day · Settings" };

// How the day closes: its hours, the phrase that ends it, and the sound it
// ends on.
export default function DaySettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <DaySettings />
    </Suspense>
  );
}

async function DaySettings() {
  const [user, rituals] = await Promise.all([getCurrentUser(), getRituals()]);
  const now = today(user.timeZone);
  const calendarUrl = shutdownCalendarUrl({
    dayEndsAt: user.dayEndsAt,
    days: rituals.flatMap((r) => r.days),
    timeZone: user.timeZone,
    todayDate: now.date,
    todayWeekday: now.weekday,
  });

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
        title="A cue to return"
        description="Put your shutdown in your calendar, so the end of the day finds you."
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-base-content/60">
            A repeating event for when your shutdown opens, in the half hour
            before your day ends at {user.dayEndsAt}. You can adjust it in
            Google Calendar before saving.
          </p>
          {/* Opens Google Calendar with the event filled in; nothing is
              added until the user saves it there. */}
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn shrink-0"
          >
            Add to Google Calendar
          </a>
        </div>
      </SettingsSection>
      <SettingsSection
        title="Shutting down"
        description="How you close the day once you’re ready."
      >
        <div className="flex flex-col gap-8">
          <ShutdownModeForm mode={user.shutdownMode} />
          <PhraseForm phrase={user.shutdownPhrase} />
        </div>
      </SettingsSection>
      <SettingsSection
        title="Sound"
        description="Plays as you shut down for the day."
      >
        <SoundForm sound={user.shutdownSound} />
      </SettingsSection>
    </div>
  );
}
