/**
 * app/admin/page.tsx
 * Admin dashboard — Spec §9.
 * Protected by ADMIN_PASSWORD (httpOnly cookie "admin_token").
 *
 * If not authenticated → shows login form.
 * If authenticated → shows per-condition stats and CSV export buttons.
 */

import { cookies } from "next/headers";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function isAdminAuthenticated(token: string | undefined): boolean {
  return typeof token === "string" && token.startsWith("authenticated:");
}

export default async function AdminPage() {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  const authed = isAdminAuthenticated(token);

  if (!authed) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
