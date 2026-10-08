import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  connectTodoist,
  TODOIST_CALLBACK_PATH,
  TODOIST_STATE_COOKIE,
} from "@/lib/integrations/todoist";
import { publicOrigin } from "@/lib/public-origin";

// Where Todoist sends the user back after they approve (or decline) access.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = publicOrigin(request);
  const back = (outcome: string) => {
    const response = NextResponse.redirect(
      `${origin}/settings/integrations?${outcome}`,
    );
    response.cookies.delete({
      name: TODOIST_STATE_COOKIE,
      path: TODOIST_CALLBACK_PATH,
    });
    return response;
  };

  // The user chose not to give access: not an error, just nothing to do.
  if (searchParams.get("error") === "access_denied") {
    return back("declined=todoist");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expected = request.cookies.get(TODOIST_STATE_COOKIE)?.value;
  if (!code || !state || !expected || !sameString(state, expected)) {
    return back("error=todoist");
  }

  try {
    await connectTodoist(code, `${origin}${TODOIST_CALLBACK_PATH}`);
  } catch (error) {
    console.error(error);
    return back("error=todoist");
  }

  return back("connected=todoist");
}

function sameString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
