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
  "";
const PASSCODE_KEY = "nexus_admin_unlocked";

export function hasAdminPasscode(): boolean {
  try {
    return sessionStorage.getItem(PASSCODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function verifyAdminPasscode(code: string): boolean {
  if (!ADMIN_PASSCODE) return false;
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

/**
 * Google sign-in through the managed OAuth broker. It supports the editor
 * preview popup as well as full-page redirects on deployed domains.
 *
 * `redirect_uri` must be a public same-origin URL — we always send the user
 * back to the origin and remember the intended path separately.
 */
const POST_LOGIN_KEY = "nexefy_post_login_path";

export function takePostLoginPath(): string | null {
  try {
    const p = sessionStorage.getItem(POST_LOGIN_KEY);
    if (p) sessionStorage.removeItem(POST_LOGIN_KEY);
    return p;
  } catch {
    return null;
  }
}

export async function signInWithGoogle(
  redirectPath = "/dashboard",
  opts: { forceAccountChooser?: boolean } = {},
): Promise<{ error?: Error }> {
  try {
    sessionStorage.setItem(POST_LOGIN_KEY, redirectPath);
  } catch {
    /* ignore */
  }
  const prompt = opts.forceAccountChooser ? "select_account" : undefined;

  try {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      ...(prompt ? { extraParams: { prompt } } : {}),
    });
    if (res.error) {
      const err = res.error instanceof Error ? res.error : new Error(String(res.error));
      console.error("[auth] Google sign-in failed", err);
      return { error: err };
    }
    if (!res.redirected) {
      window.location.assign(redirectPath);
    }
    return {};
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[auth] Google sign-in threw", err);
    return { error: err };
  }
}

