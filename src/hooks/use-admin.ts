import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "master_admin" | "super_admin" | "admin" | "user" | null;

/**
 * Role lookup via Supabase `get_user_role` RPC (security definer).
 * Returns a precise tier so the UI can render the correct badge and
 * gate destructive admin actions by hierarchy.
 */
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user?.id) { setRole(null); setChecking(false); return; }
    setChecking(true);
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("get_user_role", { _user_id: user.id });
      if (cancelled) return;
      if (!error && typeof data === "string") {
        setRole(data as AppRole);
      } else {
        // Legacy fallback
        const { data: row } = await supabase
          .from("admins").select("role, active").ilike("email", user.email ?? "")
          .limit(1).maybeSingle();
        setRole(row?.active ? ((row.role as AppRole) ?? "admin") : null);
      }
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [authLoading, user?.id, user?.email]);

  const isMasterAdmin = role === "master_admin";
  const isSuperAdmin = isMasterAdmin || role === "super_admin";
  const isAdmin = isSuperAdmin || role === "admin";

  return { user, role, isAdmin, isSuperAdmin, isMasterAdmin, loading: authLoading || checking };
}
