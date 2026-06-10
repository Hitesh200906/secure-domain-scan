import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

/** The only account allowed to see/use the Admin console. */
export const SUPERADMIN_EMAIL = "hitesh.tanwar8318@gmail.com";

export function isSuperAdmin(user: User | null | undefined): boolean {
  return (user?.email ?? "").toLowerCase() === SUPERADMIN_EMAIL;
}

function isLovableHost(): boolean {
  const h = window.location.hostname;
  return h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com") || h === "localhost";
}

/**
 * Google sign-in that works both on Lovable hosting (managed OAuth broker)
 * and on external hosts like Vercel (direct OAuth redirect flow).
 */
export async function signInWithGoogle(redirectPath = "/dashboard"): Promise<{ error?: Error }> {
  const redirectTo = window.location.origin + redirectPath;

  if (isLovableHost()) {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectTo });
    if (res.error) return { error: res.error instanceof Error ? res.error : new Error(String(res.error)) };
    return {};
  }

  // External hosting (e.g. Vercel): use the standard OAuth redirect flow.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) return { error };
  return {};
}
