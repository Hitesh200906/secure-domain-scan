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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      authEventVersion += 1;
      latestEventSession = s;
      setSession(s);
    });

    const versionAtStart = authEventVersion;
    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("[auth] Initial session restoration failed", error);

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
