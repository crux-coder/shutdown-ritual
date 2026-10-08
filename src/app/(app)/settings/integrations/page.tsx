import type { Metadata } from "next";
import { Suspense } from "react";
import { IntegrationIcon } from "@/components/integration-icon";
import {
  getConnections,
  INTEGRATIONS_ENABLED,
} from "@/lib/integrations/connections";
import { isTodoistConfigured } from "@/lib/integrations/todoist";
import {
  RITUAL_INTEGRATIONS,
  type RitualIntegration,
} from "@/lib/rituals/options";
import { getRituals } from "@/lib/rituals/queries";
import { SettingsSection, SettingsSkeleton } from "../settings-section";
import { DisconnectButton } from "./disconnect-button";

export const metadata: Metadata = { title: "Integrations · Settings" };

// What each integration will bring to a ritual once it's connected.
const DETAILS: Record<RitualIntegration, string> = {
  gmail: "Unanswered threads and anything urgent, before you close the day.",
  google_calendar: "Today’s and tomorrow’s events, while you plan.",
  todoist: "What’s due, and a place to capture open tasks before you stop.",
  github: "Pull requests waiting on you, reviews, and today’s commits.",
};

// Where to start connecting each integration that can be connected so far.
const CONNECT_PATHS: Partial<Record<RitualIntegration, string>> = {
  todoist: "/api/integrations/todoist/connect",
};

const NO_CONNECTIONS: Awaited<ReturnType<typeof getConnections>> = {};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function IntegrationSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <IntegrationSettings searchParams={searchParams} />
    </Suspense>
  );
}

async function IntegrationSettings({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [rituals, connections, params] = await Promise.all([
    getRituals(),
    INTEGRATIONS_ENABLED ? getConnections() : NO_CONNECTIONS,
    searchParams,
  ]);
  const available: Partial<Record<RitualIntegration, boolean>> = {
    todoist: isTodoistConfigured(),
  };

  return (
    <SettingsSection
      title="Integrations"
      description={
        INTEGRATIONS_ENABLED
          ? "The tools your rituals look at. Connect them with your account there; no keys to copy."
          : "The tools your rituals look at. Connecting accounts is on the way."
      }
    >
      <Outcome params={params} />
      <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100/50">
        {RITUAL_INTEGRATIONS.map((integration) => {
          const usedBy = rituals.filter((r) =>
            r.integrations.includes(integration.id),
          ).length;
          const connection = connections[integration.id];
          const connectPath = available[integration.id]
            ? CONNECT_PATHS[integration.id]
            : undefined;

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
                <p className="mt-1 truncate text-xs text-base-content/40">
                  {connection
                    ? `Connected${connection.accountLabel ? ` as ${connection.accountLabel}` : ""}`
                    : usedBy === 0
                      ? "Not used by any ritual yet"
                      : `Used by ${usedBy} ${usedBy === 1 ? "ritual" : "rituals"}`}
                </p>
              </div>
              {connection ? (
                <DisconnectButton />
              ) : connectPath ? (
                // A plain link: connecting leaves the app for the service's
                // own sign-in page, so there's nothing to prefetch.
                <a href={connectPath} className="btn btn-sm shrink-0">
                  Connect
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="btn btn-sm shrink-0"
                >
                  Connect
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </SettingsSection>
  );
}

// How the last connection attempt went, after the service sends the user back.
function Outcome({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  if (params.connected === "todoist") {
    return (
      <p role="status" className="mb-4 text-sm text-success">
        Todoist is connected.
      </p>
    );
  }
  if (params.declined === "todoist") {
    return (
      <p role="status" className="mb-4 text-sm text-base-content/60">
        Todoist wasn’t connected. You can connect it whenever you like.
      </p>
    );
  }
  if (params.error === "todoist") {
    return (
      <p role="alert" className="mb-4 text-sm text-error">
        Couldn’t connect Todoist. Please try again.
      </p>
    );
  }
  return null;
}
