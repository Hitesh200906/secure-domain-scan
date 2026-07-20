import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStoreBySlug, type Store } from "@/lib/business";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import { BackButton } from "@/components/site/BackButton";


export const Route = createFileRoute("/$slug")({ component: StorefrontPage });

function StorefrontPage() {
  const { slug } = Route.useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getStoreBySlug(slug);
      setStore(s);
      const { data: { user } } = await supabase.auth.getUser();
      setViewerId(user?.id ?? null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen pt-24 grid place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!store) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-2xl font-semibold">Store not found</h1>
        <p className="text-muted-foreground mt-2">No store at /{slug}</p>
      </div>
    );
  }

  const isOwner = viewerId === store.owner_id;

  const join = async () => {
    if (!viewerId) { toast.error("Sign in to join"); return; }
    await supabase.from("stores").update({ member_count: (store.member_count ?? 0) + 1 }).eq("id", store.id);
    setStore({ ...store, member_count: (store.member_count ?? 0) + 1 });
    toast.success(`Joined ${store.name}`);
  };

  // Public/member view: no global navbar/footer — dedicated storefront chrome
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4"><BackButton fallback="/discover" /></div>
        <StoreLayout store={store} isOwner={isOwner} viewerId={viewerId} onJoin={join} />
      </div>
    </div>
  );
}

