import "server-only";
import type { RitualIntegration } from "@/lib/rituals/options";
import { createClient } from "@/lib/supabase/server";

// Off until integrations launch: every one shows as coming soon, and none can
// be connected. The Todoist flow is built; flip this to turn it on.
export const INTEGRATIONS_ENABLED = false;

export type Connection = {
  // Who the user is signed in as there, when the service told us.
  accountLabel: string | null;
};

// The signed-in user's connected services. Tokens stay out of it.
export async function getConnections(): Promise<
  Partial<Record<RitualIntegration, Connection>>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_connections")
    .select("provider, account_label");

  if (error) {
    throw new Error(`Failed to load connections: ${error.message}`);
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [
      row.provider,
      { accountLabel: row.account_label },
    ]),
  );
}
