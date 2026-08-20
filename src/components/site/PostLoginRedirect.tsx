import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { takePostLoginPath } from "@/lib/auth-helpers";

/**
 * After a full-page Google OAuth redirect the user lands on the origin ("/").
 * Once the Supabase session is hydrated, send them to the page they intended.
 */
export function PostLoginRedirect() {
  useEffect(() => {
    let done = false;
    const go = (path: string | null) => {
      if (done || !path) return;
      if (path === window.location.pathname) return;
      done = true;
      window.location.replace(path);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        go(takePostLoginPath());
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go(takePostLoginPath());
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
