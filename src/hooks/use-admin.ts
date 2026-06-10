import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Admin check driven by the `user_roles` table via the security-definer
 * `has_role(_user_id, _role)` RPC. No hardcoded emails. Falls back to the
 * legacy `admins` table only if the RPC is unavailable.
 */
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user?.id) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    (async () => {
      // Primary: user_roles via has_role RPC
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!cancelled) {
        if (!error && typeof data === "boolean") {
          setIsAdmin(data);
        } else {
          // Fallback: legacy admins table by email
          const { data: row } = await supabase
            .from("admins")
            .select("id, active")
            .ilike("email", user.email ?? "")
            .limit(1)
            .maybeSingle();
          setIsAdmin(Boolean(row?.active));
        }
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, user?.email]);

  return {
    user,
    isAdmin,
    isSuperAdmin: isAdmin,
    loading: authLoading || checking,
  };
}
