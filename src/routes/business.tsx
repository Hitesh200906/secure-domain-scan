import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyStore, type Store } from "@/lib/business";
import { BusinessShell } from "@/components/business/BusinessShell";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/business")({
  component: BusinessLayout,
});

function BusinessLayout() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      const s = await getMyStore(user.id);
      if (!mounted) return;
      setStore(s);
      setLoading(false);
      if (!s && window.location.pathname !== "/business/create") {
        navigate({ to: "/business/create" });
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center pt-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Wizard route doesn't need the shell
  if (!store) return <Outlet />;

  return (
    <BusinessShell store={store}>
      <Outlet context={{ store }} />
    </BusinessShell>
  );
}
