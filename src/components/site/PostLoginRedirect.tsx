import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { takePostLoginPath } from "@/lib/auth-helpers";

/**
 * After a full-page Google OAuth redirect the user lands on the origin ("/").
 * Once the Supabase session is hydrated, send them to the page they intended —
 * unless they have never set an account password, in which case the security
 * section of the profile takes priority (first-time sign-up onboarding).
 */
export function PostLoginRedirect() {
  useEffect(() => {
    let done = false;
    const go = (path: string | null) => {
      if (done || !path) return;
      const [pathname] = path.split("?");
      if (pathname === window.location.pathname && !path.includes("?")) return;
      done = true;
      window.location.replace(path);
    };

    const resolve = async (userId: string) => {
      if (done) return;
      const intended = takePostLoginPath();
      try {
        const { data } = await supabase
          .from("profiles")
          .select("password_set")
          .eq("id", userId)
          .maybeSingle();
        if (data && data.password_set === false) {
          if (window.location.pathname === "/profile" && window.location.search.includes("tab=security")) return;
          go("/profile?tab=security");
          return;
        }
      } catch {
        /* fall through to the intended path */
      }
      go(intended);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void resolve(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) void resolve(data.session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
