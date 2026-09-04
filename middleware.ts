import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Block direct static access to pending user uploads (`/media/pending-*`).
 * Approved photos get media visibility=public and a non-pending filename
 * after moderation (see Photos afterChange hook).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/media/pending-")) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/media/pending-:path*"],
};
