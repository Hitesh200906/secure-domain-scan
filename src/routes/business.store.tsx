import { useStore } from "@/lib/store-context";
import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/business/store")({ component: StoreInterior });

function StoreInterior() {
  const store = useStore();
  const [viewerId, setViewerId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setViewerId(data.user?.id ?? null)); }, []);
  return <StoreLayout store={store} isOwner={true} viewerId={viewerId} />;
}
