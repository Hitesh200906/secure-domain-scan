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
    let authEventReceived = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      authEventReceived = true;
      setSession(s);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active || authEventReceived) return;
      if (error) console.error("[auth] Initial session restoration failed", error);
      setSession(data.session);
      setLoading(false);
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
