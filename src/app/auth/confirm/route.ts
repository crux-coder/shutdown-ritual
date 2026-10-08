import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { landingPath } from "@/lib/auth";
import { publicOrigin } from "@/lib/public-origin";
import { createClient } from "@/lib/supabase/server";

// Handles both email link styles Supabase can send — PKCE (`?code=`) and
// token hash (`?token_hash=&type=`) — and the return from Sign in with Google,
// which also brings a `?code=`.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = publicOrigin(request);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Sign in with Google comes back here too, with `?error=` if the user
  // cancelled or Google refused.
  if (searchParams.has("error")) {
    return NextResponse.redirect(`${origin}/sign-in?error=google`);
  }

  const supabase = await createClient();

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { data: null, error: new Error("Missing confirmation token") };

  if (error || !data?.user) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${type === "recovery" ? "reset" : "confirm"}`,
    );
  }

  // A password reset link signs the user in to choose a new password.
  return NextResponse.redirect(
    `${origin}${type === "recovery" ? "/reset-password" : await landingPath(data.user.id)}`,
  );
}
