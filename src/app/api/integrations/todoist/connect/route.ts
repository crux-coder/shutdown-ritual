import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  isTodoistConfigured,
  TODOIST_CALLBACK_PATH,
  TODOIST_STATE_COOKIE,
  todoistAuthorizeUrl,
} from "@/lib/integrations/todoist";
import { publicOrigin } from "@/lib/public-origin";

// Starts connecting Todoist: sends the user to Todoist to approve access.
// The proxy has already made sure they're signed in.
export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);

  if (!isTodoistConfigured()) {
    return NextResponse.redirect(
      `${origin}/settings/integrations?error=todoist`,
    );
  }

  // Checked on the way back, so only a flow this browser started can finish.
  const state = randomBytes(24).toString("base64url");
  const response = NextResponse.redirect(
    todoistAuthorizeUrl(state, `${origin}${TODOIST_CALLBACK_PATH}`),
  );
  response.cookies.set(TODOIST_STATE_COOKIE, state, {
    httpOnly: true,
    secure: origin.startsWith("https:"),
    sameSite: "lax",
    path: TODOIST_CALLBACK_PATH,
    maxAge: 10 * 60,
  });
  return response;
}
