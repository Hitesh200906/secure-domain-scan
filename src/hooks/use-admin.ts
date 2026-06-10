import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { isSuperAdmin } from "@/lib/auth-helpers";

/**
 * Determines whether the current user is an admin (listed + active in the
 * admins table) or the superadmin. Superadmin always counts as admin.
 */
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const superAdmin = isSuperAdmin(user);
  const [listed, setListed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user?.email || superAdmin) {
      setListed(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    supabase
      .from("admins")
      .select("id, active")
      .ilike("email", user.email)
      .limit(1)
      .then(({ data }) => {
        if (cancelled) return;
        setListed(Boolean(data?.[0]?.active));
        setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.email, superAdmin]);

  return {
    user,
    isAdmin: superAdmin || listed,
    isSuperAdmin: superAdmin,
    loading: authLoading || (!superAdmin && checking),
  };
}
