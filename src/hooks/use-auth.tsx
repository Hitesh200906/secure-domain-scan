import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Owns the single application-wide auth subscription. Supabase may need to
 * exchange an OAuth callback or restore persisted storage before the initial
 * session is known, so consumers remain in `loading` until that work settles.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let authEventVersion = 0;
    let latestEventSession: Session | null = null;

    // ── TEMPORARY OAUTH CALLBACK DIAGNOSTICS (remove after debugging) ──
    const dbg = (label: string, payload: Record<string, unknown>) => {
      try {
        console.log(`[auth-debug] ${label}`, payload);
      } catch { /* ignore */ }
    };
    if (typeof window !== "undefined") {
      const { href, search, hash } = window.location;
      const callbackKind = search.includes("code=")
        ? "?code= (PKCE-style authorization code in query)"
        : hash.includes("access_token=")
          ? "#access_token= (implicit tokens in hash)"
          : "neither (no code or token in URL)";
      dbg("location after return from provider", {
        href,
        search,
        hash,
        callbackKind,
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      authEventVersion += 1;
      latestEventSession = s;
      // ── TEMPORARY OAUTH CALLBACK DIAGNOSTICS ──
      dbg("onAuthStateChange event", {
        event,
        sessionNull: s === null,
        userId: s?.user?.id ?? null,
        provider: s?.user?.app_metadata?.provider ?? null,
        expiresAt: s?.expires_at ?? null,
      });
      setSession(s);
    });

    const versionAtStart = authEventVersion;
    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("[auth] Initial session restoration failed", error);
        // ── TEMPORARY OAUTH CALLBACK DIAGNOSTICS ──
        dbg("getSession() result", {
          error: error ? String(error.message ?? error) : null,
          sessionNull: data.session === null,
          userId: data.session?.user?.id ?? null,
          provider: data.session?.user?.app_metadata?.provider ?? null,
          expiresAt: data.session?.expires_at ?? null,
          storageKeys: (() => {
            try {
              return Object.keys(window.localStorage).filter((k) => k.includes("auth") || k.startsWith("sb-"));
            } catch {
              return [];
            }
          })(),
        });

        // An auth callback may complete while getSession() is resolving. In
        // that case the newer auth event is authoritative and must not be
        // overwritten by an older getSession() result.
        setSession(authEventVersion === versionAtStart ? data.session : latestEventSession);
      })
      .catch((error: unknown) => {
        if (active) console.error("[auth] Initial session restoration failed", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => ({
    session,
    user: session?.user ?? null,
    loading,
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used within AuthProvider");
  return auth;
}
