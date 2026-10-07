import type { NextRequest } from "next/server";

// The origin the visitor sees, for building redirects. Behind a proxy like
// Railway's, the request URL holds the server's own address (e.g.
// http://localhost:8080); the public host and scheme come in the forwarded
// headers instead.
export function publicOrigin(request: NextRequest): string {
  const host = firstValue(request.headers.get("x-forwarded-host"));
  if (!host) return request.nextUrl.origin;

  const proto =
    firstValue(request.headers.get("x-forwarded-proto")) ??
    request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

// Proxies may chain values ("a, b"); the first is the client-facing one.
function firstValue(header: string | null): string | null {
  return header?.split(",")[0]?.trim() || null;
}
