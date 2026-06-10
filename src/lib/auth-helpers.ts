import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

/**
 * Admin authorization is sourced from the `user_roles` table via the
 * `has_role(_user_id, _role)` security-definer RPC. There is no hardcoded
 * superadmin email anymore — grant admin by inserting a row into
 * `public.user_roles` with role = 'admin'.
 */
export async function checkIsAdmin(user: User | null | undefined): Promise<boolean> {
  if (!user?.id) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (error) return false;
  return Boolean(data);
}

/** Kept for backwards-compatible imports; always false now (no hardcoded admin). */
export function isSuperAdmin(_user: User | null | undefined): boolean {
  return false;
}

/** Admin console passcode gate — optional extra layer kept for UX continuity. */
const ADMIN_PASSCODE =
  (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.VITE_ADMIN_PASSCODE) ||
  "Hitesh@2009#";
const PASSCODE_KEY = "nexus_admin_unlocked";

export function hasAdminPasscode(): boolean {
  try {
    return sessionStorage.getItem(PASSCODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function verifyAdminPasscode(code: string): boolean {
  if (code === ADMIN_PASSCODE) {
    try {
      sessionStorage.setItem(PASSCODE_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  }
  return false;
}

function isLovableHost(): boolean {
  const h = window.location.hostname;
  return h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com") || h === "localhost";
}

/**
 * Google sign-in. Uses the Lovable managed broker on Lovable hosts and the
 * standard Supabase OAuth redirect on external hosts (e.g. Vercel).
 * On Vercel the Supabase project's Google provider must be enabled and the
 * site's URL added to Authentication → URL Configuration → Redirect URLs.
 */
export async function signInWithGoogle(redirectPath = "/dashboard"): Promise<{ error?: Error }> {
  const redirectTo = window.location.origin + redirectPath;

  if (isLovableHost()) {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectTo });
    if (res.error) return { error: res.error instanceof Error ? res.error : new Error(String(res.error)) };
    return {};
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) return { error };
  return {};
}
