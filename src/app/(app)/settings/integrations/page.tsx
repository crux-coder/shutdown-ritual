import type { Metadata } from "next";
import { Suspense } from "react";
import { IntegrationIcon } from "@/components/integration-icon";
import {
  RITUAL_INTEGRATIONS,
  type RitualIntegration,
} from "@/lib/rituals/options";
import { getRituals } from "@/lib/rituals/queries";
import { SettingsSection, SettingsSkeleton } from "../settings-section";

export const metadata: Metadata = { title: "Integrations · Settings" };

// What each integration will bring to a ritual once it's connected.
const DETAILS: Record<RitualIntegration, string> = {
  gmail: "Unanswered threads and anything urgent, before you close the day.",
  google_calendar: "Today’s and tomorrow’s events, while you plan.",
  todoist: "What’s due, and a place to capture open tasks before you stop.",
  github: "Pull requests waiting on you, reviews, and today’s commits.",
};

export default function IntegrationSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <IntegrationSettings />
    </Suspense>
  );
}

async function IntegrationSettings() {
  const rituals = await getRituals();

  return (
    <SettingsSection
      title="Integrations"
      description="The tools your rituals look at. Connecting accounts is on the way."
    >
      <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100/50">
        {RITUAL_INTEGRATIONS.map((integration) => {
          const usedBy = rituals.filter((r) =>
            r.integrations.includes(integration.id),
          ).length;

          return (
            <li key={integration.id} className="flex items-center gap-4 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-field bg-base-200">
                <IntegrationIcon
                  integration={integration.id}
                  className="size-5 text-base-content/80"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{integration.label}</p>
                <p className="text-sm text-base-content/60">
                  {DETAILS[integration.id]}
                </p>
                <p className="mt-1 text-xs text-base-content/40">
                  {usedBy === 0
                    ? "Not used by any ritual yet"
                    : `Used by ${usedBy} ${usedBy === 1 ? "ritual" : "rituals"}`}
                </p>
              </div>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="btn btn-sm shrink-0"
              >
                Connect
              </button>
            </li>
          );
        })}
      </ul>
    </SettingsSection>
  );
}
