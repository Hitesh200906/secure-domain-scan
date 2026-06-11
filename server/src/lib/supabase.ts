import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Service-role client — bypasses RLS. Server-only.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Per-request client bound to a user's access token — RLS applies as that user.
export function supabaseAsUser(accessToken: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
