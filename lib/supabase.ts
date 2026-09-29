/**
 * lib/supabase.ts
 * Server-side Supabase client using the service-role key.
 * This client bypasses Row Level Security — only call it from Server Components
 * or API routes. NEVER import this in client components.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local"
  );
}

/**
 * Singleton service-role client.
 * Use this for all server-side DB operations (bypasses RLS by design).
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
