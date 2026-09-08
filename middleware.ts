import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_SITE_URL } from "@/lib/site-url";

const CANONICAL_HOST = new URL(DEFAULT_SITE_URL).host;

/**
 * - Block direct static access to pending user uploads (`/media/pending-*`).
 * - Canonical host: www → apex (https://irkportal.ru) to avoid duplicate indexation.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host === `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith("/media/pending-")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/media/pending-:path*",
    /*
     * Host canonicalization for all page navigations (exclude Next internals / static assets).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
