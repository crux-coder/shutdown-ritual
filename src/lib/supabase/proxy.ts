import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/signup"];
const PUBLIC_PREFIXES = ["/auth"];
const ONBOARDING_ROUTE = "/onboarding";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Don't run code between createServerClient and getClaims — it refreshes
  // the session token and keeps the user signed in.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const isSignedIn = Boolean(claims);
  const isOnboarded = Boolean(claims?.user_metadata?.first_name);

  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublic =
    isAuthRoute || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isSignedIn && !isPublic) {
    return redirectTo(request, response, "/login");
  }

  if (isSignedIn && isAuthRoute) {
    return redirectTo(request, response, "/");
  }

  const isOnboarding = pathname === ONBOARDING_ROUTE;

  if (isSignedIn && !isOnboarded && !isPublic && !isOnboarding) {
    return redirectTo(request, response, ONBOARDING_ROUTE);
  }

  if (isSignedIn && isOnboarded && isOnboarding) {
    return redirectTo(request, response, "/");
  }

  return response;
}

// Carry refreshed session cookies over to the redirect response.
function redirectTo(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}
