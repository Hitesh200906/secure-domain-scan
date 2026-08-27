/**
 * The business-email confirmation link is delivered as a Supabase auth link.
 * If the browser's Supabase client is allowed to consume it, it would replace
 * the signed-in requester's session with one for the business email address.
 *
 * This module runs before the Supabase client is ever created: on
 * /scan/verify it lifts the auth tokens out of the URL, stashes them in
 * memory for the page to verify server-side, and rewrites the URL so
 * `detectSessionInUrl` finds nothing to consume.
 */
export type CapturedVerifyTokens = {
  access_token?: string;
  token_hash?: string;
  type?: string;
};

declare global {
  interface Window {
    __scanVerifyTokens?: CapturedVerifyTokens;
  }
}

if (typeof window !== "undefined" && window.location.pathname.startsWith("/scan/verify")) {
  try {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const captured: CapturedVerifyTokens = {
      access_token: hash.get("access_token") ?? undefined,
      token_hash: query.get("token_hash") ?? query.get("token") ?? undefined,
      type: hash.get("type") ?? query.get("type") ?? undefined,
    };
    window.__scanVerifyTokens = captured;

    const id = query.get("id");
    const cleaned = `${window.location.pathname}${id ? `?id=${encodeURIComponent(id)}` : ""}`;
    window.history.replaceState(window.history.state, "", cleaned);
  } catch {
    /* non-fatal: verification simply falls back to the signed-in identity */
  }
}

export function readCapturedVerifyTokens(): CapturedVerifyTokens {
  if (typeof window === "undefined") return {};
  return window.__scanVerifyTokens ?? {};
}
