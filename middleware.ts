/**
 * middleware.ts — Stage Guard
 * Reads the participant cookie and redirects to the correct stage URL.
 * Runs on every non-API, non-static request.
 *
 * Stage → URL mapping (canonical):
 *   consent     → /consent
 *   background  → /background
 *   pretest     → /pretest
 *   session     → /session
 *   posttest    → /posttest
 *   trust       → /trust
 *   cogload     → /cogload
 *   debrief     → /debrief
 *   complete    → /complete
 *
 * "/" always redirects to /consent (entry point).
 * If no cookie → /consent.
 * If cookie present → fetch stage from DB and redirect to canonical URL.
 * NOTE: Middleware cannot call Supabase directly (Edge runtime).
 *   We store the stage in a second cookie "ps_stage" (set by API routes),
 *   and verify against it here for instant redirect without a DB call.
 */

import { NextRequest, NextResponse } from "next/server";

const STAGE_COOKIE = "ps_pid";
const STAGE_VALUE_COOKIE = "ps_stage";

// Paths that are always accessible regardless of stage
const PUBLIC_PATHS = new Set(["/", "/api", "/preview", "/_next", "/favicon.ico"]);

// Maps stage value → canonical URL path
const STAGE_PATHS: Record<string, string> = {
  consent:    "/consent",
  background: "/background",
  pretest:    "/pretest",
  session:    "/session",
  posttest:   "/posttest",
  trust:      "/trust",
  cogload:    "/cogload",
  debrief:    "/debrief",
  complete:   "/complete",
};

// Maps URL path → expected stage (reverse lookup)
const PATH_STAGES: Record<string, string> = Object.fromEntries(
  Object.entries(STAGE_PATHS).map(([stage, path]) => [path, stage])
);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through API routes, static files, preview, and admin pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/admin") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const pid   = request.cookies.get(STAGE_COOKIE)?.value;
  const stage = request.cookies.get(STAGE_VALUE_COOKIE)?.value;

  // No cookie → redirect to consent (start of study)
  if (!pid) {
    if (pathname === "/" || pathname === "/consent") return NextResponse.next();
    return NextResponse.redirect(new URL("/consent", request.url));
  }

  // Has cookie but no stage cookie → allow, server component will handle
  if (!stage) {
    return NextResponse.next();
  }

  const canonicalPath = STAGE_PATHS[stage];
  if (!canonicalPath) return NextResponse.next();

  // Root → redirect to current stage
  if (pathname === "/") {
    return NextResponse.redirect(new URL(canonicalPath, request.url));
  }

  // Participant is on the correct page → let through
  if (pathname === canonicalPath) {
    return NextResponse.next();
  }

  // Special case: if stage is 'complete', always allow /consent so a new
  // participant (or a tester doing another run) can start fresh.
  if (stage === "complete" && pathname === "/consent") {
    return NextResponse.next();
  }

  // Participant is on a wrong stage page → redirect to their current stage
  if (pathname in PATH_STAGES) {
    return NextResponse.redirect(new URL(canonicalPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (Next.js image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
