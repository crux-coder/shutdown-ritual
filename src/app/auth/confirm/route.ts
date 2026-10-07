import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { publicOrigin } from "@/lib/public-origin";
import { createClient } from "@/lib/supabase/server";

// Handles both email link styles Supabase can send:
// PKCE (`?code=`) and token hash (`?token_hash=&type=`).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = publicOrigin(request);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing confirmation token") };

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${type === "recovery" ? "reset" : "confirm"}`,
    );
  }

  // A password reset link signs the user in to choose a new password.
  return NextResponse.redirect(
    `${origin}${type === "recovery" ? "/reset-password" : "/"}`,
  );
}
