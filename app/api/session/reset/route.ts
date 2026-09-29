/**
 * app/api/session/reset/route.ts
 * GET — Clears the ps_pid and ps_stage cookies without deleting any DB data.
 *
 * Used by:
 *  - The /complete page "Start new session" button (lets a new participant begin).
 *  - Developers/testers who need a fresh cookie state.
 *
 * This does NOT delete the participant record — use DELETE /api/participant
 * (the Withdraw flow) for that. This just ends the browser session.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_CLEAR = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure:   process.env.NODE_ENV === "production",
  path:     "/",
  maxAge:   0,   // expire immediately
};

export async function GET(request: NextRequest) {
  const store = await cookies();
  store.set("ps_pid",   "", COOKIE_CLEAR);
  store.set("ps_stage", "", COOKIE_CLEAR);

  // Redirect to /consent so a fresh session starts immediately
  return NextResponse.redirect(new URL("/consent", request.url));
}
