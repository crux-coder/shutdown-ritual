import "server-only";
import { INTEGRATIONS_ENABLED } from "@/lib/integrations/connections";
import { decryptToken, encryptToken } from "@/lib/integrations/crypto";
import { createClient } from "@/lib/supabase/server";

// Todoist over OAuth: the user approves access on Todoist's own page, and the
// server keeps the tokens. Nobody pastes an API key.
// https://developer.todoist.com/api/v1/#tag/Authorization

const AUTHORIZE_URL = "https://app.todoist.com/oauth/authorize";
const TOKEN_URL = "https://todoist.com/oauth/access_token";
const API_URL = "https://api.todoist.com/api/v1";

// Read what's due, add tasks captured at shutdown, tick them off.
const SCOPE = "data:read_write";

export const TODOIST_CALLBACK_PATH = "/api/integrations/todoist/callback";
export const TODOIST_STATE_COOKIE = "todoist_oauth_state";

// Refresh this long before the access token actually expires.
const EXPIRY_MARGIN_MS = 60_000;
// A refresh still marked as running after this long is assumed to have died.
const REFRESH_LEASE_MS = 30_000;

export type TodoistTask = {
  id: string;
  content: string;
  // "YYYY-MM-DD", or a full date-time when the task has a time.
  dueDate: string | null;
  // 1 (normal) … 4 (urgent), as the API numbers them.
  priority: number;
  url: string;
};

// The user's Todoist connection was revoked or its refresh token has expired;
// they need to connect again.
export class TodoistDisconnectedError extends Error {
  constructor() {
    super("Todoist is no longer connected.");
  }
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

type ConnectionRow = {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
};

function credentials() {
  const clientId = process.env.TODOIST_CLIENT_ID;
  const clientSecret = process.env.TODOIST_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function isTodoistConfigured(): boolean {
  return (
    INTEGRATIONS_ENABLED &&
    credentials() !== null &&
    Boolean(process.env.INTEGRATIONS_ENCRYPTION_KEY)
  );
}

function requireCredentials() {
  const creds = credentials();
  if (!creds) {
    throw new Error("TODOIST_CLIENT_ID and TODOIST_CLIENT_SECRET must be set.");
  }
  return creds;
}

export function todoistAuthorizeUrl(state: string, redirectUri: string) {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", requireCredentials().clientId);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", redirectUri);
  return url.toString();
}

async function requestToken(
  params: Record<string, string>,
): Promise<{ ok: true; token: TokenResponse } | { ok: false; status: number }> {
  const { clientId, clientSecret } = requireCredentials();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      ...params,
    }),
    cache: "no-store",
  });
  if (!response.ok) return { ok: false, status: response.status };

  const token = (await response.json()) as TokenResponse;
  if (!token.access_token) return { ok: false, status: response.status };
  return { ok: true, token };
}

function tokenColumns(token: TokenResponse, now = Date.now()) {
  return {
    access_token: encryptToken(token.access_token),
    refresh_token: token.refresh_token
      ? encryptToken(token.refresh_token)
      : null,
    expires_at: token.expires_in
      ? new Date(now + token.expires_in * 1000).toISOString()
      : null,
    scope: token.scope ?? SCOPE,
  };
}

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return user.id;
}

// Finishes the OAuth flow: trades the code Todoist sent back for tokens, and
// stores them against the signed-in user.
export async function connectTodoist(code: string, redirectUri: string) {
  const result = await requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  if (!result.ok) {
    throw new Error(`Todoist token exchange failed (${result.status}).`);
  }

  const userId = await requireUserId();
  const accountLabel = await fetchAccountLabel(result.token.access_token);

  const supabase = await createClient();
  const { error } = await supabase.from("integration_connections").upsert({
    user_id: userId,
    provider: "todoist",
    ...tokenColumns(result.token),
    account_label: accountLabel,
    refresh_started_at: null,
  });
  if (error) {
    throw new Error(`Failed to save Todoist connection: ${error.message}`);
  }
}

async function fetchAccountLabel(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const user = (await response.json()) as {
      email?: string;
      full_name?: string;
    };
    return user.email || user.full_name || null;
  } catch {
    return null;
  }
}

// Revokes access at Todoist and forgets the tokens. Removing the row matters
// more than the revoke, so a failed revoke doesn't stop it.
export async function disconnectTodoist() {
  const userId = await requireUserId();
  const supabase = await createClient();

  const row = await readConnection(userId);
  if (row) {
    try {
      await revoke(decryptToken(row.access_token));
    } catch {
      // Todoist unreachable, or the token is unreadable: forget it anyway.
    }
  }

  const { error } = await supabase
    .from("integration_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "todoist");
  if (error) {
    throw new Error(`Failed to remove Todoist connection: ${error.message}`);
  }
}

async function revoke(accessToken: string) {
  const creds = credentials();
  if (!creds) return;
  const basic = Buffer.from(
    `${creds.clientId}:${creds.clientSecret}`,
  ).toString("base64");
  await fetch(`${API_URL}/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: accessToken,
      token_type_hint: "access_token",
    }),
    cache: "no-store",
  });
}

async function readConnection(userId: string): Promise<ConnectionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_connections")
    .select("user_id, access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("provider", "todoist")
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load Todoist connection: ${error.message}`);
  }
  return data;
}

function isFresh(row: ConnectionRow) {
  return (
    !row.expires_at ||
    new Date(row.expires_at).getTime() - EXPIRY_MARGIN_MS > Date.now()
  );
}

// A usable access token for the signed-in user, refreshed if it's about to
// expire. Null when they haven't connected Todoist.
async function getAccessToken(force = false): Promise<string | null> {
  const userId = await requireUserId();
  const row = await readConnection(userId);
  if (!row) return null;
  if (!force && isFresh(row)) return decryptToken(row.access_token);
  if (!row.refresh_token) throw new TodoistDisconnectedError();

  return refreshAccessToken(row);
}

// Todoist rotates the refresh token on every refresh, and each one works only
// once. So one request takes a lease on the row and refreshes; any other that
// arrives meanwhile waits and then uses the tokens it saved.
async function refreshAccessToken(row: ConnectionRow): Promise<string> {
  const supabase = await createClient();
  const now = Date.now();
  const staleBefore = new Date(now - REFRESH_LEASE_MS).toISOString();

  const { data: claimed, error: claimError } = await supabase
    .from("integration_connections")
    .update({ refresh_started_at: new Date(now).toISOString() })
    .eq("user_id", row.user_id)
    .eq("provider", "todoist")
    .eq("refresh_token", row.refresh_token!)
    .or(`refresh_started_at.is.null,refresh_started_at.lt."${staleBefore}"`)
    .select("user_id")
    .maybeSingle();
  if (claimError) {
    throw new Error(`Failed to refresh Todoist token: ${claimError.message}`);
  }

  if (!claimed) return waitForRefresh(row);

  const result = await requestToken({
    grant_type: "refresh_token",
    refresh_token: decryptToken(row.refresh_token!),
  });

  if (!result.ok) {
    // 400/401: the grant is gone (revoked in Todoist, or expired). Anything
    // else is likely temporary, so keep the connection and let it retry.
    if (result.status === 400 || result.status === 401) {
      await supabase
        .from("integration_connections")
        .delete()
        .eq("user_id", row.user_id)
        .eq("provider", "todoist")
        .eq("refresh_token", row.refresh_token!);
      throw new TodoistDisconnectedError();
    }
    await supabase
      .from("integration_connections")
      .update({ refresh_started_at: null })
      .eq("user_id", row.user_id)
      .eq("provider", "todoist");
    throw new Error(`Todoist token refresh failed (${result.status}).`);
  }

  const { error } = await supabase
    .from("integration_connections")
    .update({
      ...tokenColumns(result.token, now),
      // Keep the old refresh token if Todoist didn't send a new one.
      ...(result.token.refresh_token ? {} : { refresh_token: row.refresh_token }),
      refresh_started_at: null,
    })
    .eq("user_id", row.user_id)
    .eq("provider", "todoist");
  if (error) {
    throw new Error(`Failed to save refreshed Todoist token: ${error.message}`);
  }

  return result.token.access_token;
}

async function waitForRefresh(stale: ConnectionRow): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const row = await readConnection(stale.user_id);
    if (!row) throw new TodoistDisconnectedError();
    if (row.refresh_token !== stale.refresh_token && isFresh(row)) {
      return decryptToken(row.access_token);
    }
  }
  throw new Error("Timed out waiting for the Todoist token to refresh.");
}

// Calls the Todoist API as the signed-in user. Null when Todoist isn't
// connected. Retries once with a fresh token if the current one is rejected.
async function todoistFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response | null> {
  let token = await getAccessToken();
  if (!token) return null;

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      cache: "no-store",
    });

    if (response.status !== 401 || attempt > 0) {
      if (response.status === 401) throw new TodoistDisconnectedError();
      if (!response.ok) {
        throw new Error(`Todoist request failed (${response.status}).`);
      }
      return response;
    }

    token = await getAccessToken(true);
    if (!token) return null;
  }
}

type ApiTask = {
  id: string;
  content: string;
  priority: number;
  due: { date: string } | null;
};

function toTask(task: ApiTask): TodoistTask {
  return {
    id: task.id,
    content: task.content,
    dueDate: task.due?.date ?? null,
    priority: task.priority,
    url: `https://app.todoist.com/app/task/${task.id}`,
  };
}

// Open tasks due today or overdue. Null when Todoist isn't connected.
export async function getTodayTasks(limit = 50): Promise<TodoistTask[] | null> {
  const params = new URLSearchParams({
    query: "today | overdue",
    limit: String(limit),
  });
  const response = await todoistFetch(`/tasks/filter?${params}`);
  if (!response) return null;

  const { results } = (await response.json()) as { results: ApiTask[] };
  return results.map(toTask);
}

// Adds a task, e.g. one captured before shutting down. `due` takes Todoist's
// natural language, like "tomorrow".
export async function addTodoistTask(
  content: string,
  due?: string,
): Promise<TodoistTask | null> {
  const response = await todoistFetch("/tasks", {
    method: "POST",
    body: JSON.stringify({ content, ...(due ? { due_string: due } : {}) }),
  });
  if (!response) return null;
  return toTask((await response.json()) as ApiTask);
}

export async function closeTodoistTask(id: string): Promise<boolean> {
  const response = await todoistFetch(
    `/tasks/${encodeURIComponent(id)}/close`,
    { method: "POST" },
  );
  return response !== null;
}
