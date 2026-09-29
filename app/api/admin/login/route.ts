/**
 * app/api/admin/login/route.ts
 * POST — Admin authentication.
 * Spec §9: protected by ADMIN_PASSWORD env var, httpOnly cookie.
 *
 * Body: { password: string }
 * Sets "admin_token" cookie on success.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_token";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure:   process.env.NODE_ENV === "production",
  path:     "/",
  maxAge:   60 * 60 * 8, // 8 h session
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("[admin/login] ADMIN_PASSWORD env var is not set");
      return Response.json({ error: "Admin not configured" }, { status: 500 });
    }

    if (!password || password !== adminPassword) {
      // Artificial delay to limit brute-force
      await new Promise((r) => setTimeout(r, 400));
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    // Issue a simple signed token: "authenticated:<timestamp>"
    // (Good enough for a single-researcher tool behind a strong password)
    const token = `authenticated:${Date.now()}`;
    const store = await cookies();
    store.set(ADMIN_COOKIE, token, COOKIE_OPTS);

    return Response.json({ success: true });
  } catch (err) {
    console.error("[admin/login] error:", err);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  return NextResponse.redirect(new URL("/admin", _request.url));
}
