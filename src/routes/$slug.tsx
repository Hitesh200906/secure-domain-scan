import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStoreBySlug, getStoreProducts, type Store, type Product } from "@/lib/business";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, BadgeCheck, Users, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/$slug")({ component: StorefrontPage });

function StorefrontPage() {
  const { slug } = Route.useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getStoreBySlug(slug);
      setStore(s);
      if (s) setProducts(await getStoreProducts(s.id));
      setLoading(false);
    })();
  }, [slug]);

  const buy = async (p: Product) => {
    if (!store) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in to purchase"); return; }
    setBuying(p.id);
    const { error } = await supabase.from("orders").insert({
      store_id: store.id, product_id: p.id, buyer_id: user.id,
      buyer_email: user.email, amount: p.price, status: "paid",
    });
    setBuying(null);
    if (error) toast.error(error.message); else toast.success("Purchase recorded (mock checkout)");
  };

  if (loading) return <div className="min-h-screen pt-24 grid place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (!store) return <div className="min-h-screen pt-32 text-center"><h1 className="text-2xl font-semibold">Store not found</h1><p className="text-muted-foreground mt-2">No store at /{slug}</p></div>;

  const theme = store.theme_color ?? "#7c3aed";
  const accent = store.accent_color ?? "#22d3ee";

  return (
    <div className="min-h-screen pt-20">
      <div className="relative h-40 sm:h-72 overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-14 sm:-mt-16 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="size-20 sm:size-28 rounded-2xl border-2 border-background overflow-hidden grid place-items-center text-2xl font-bold text-white shrink-0" style={{ background: theme }}>
            {store.logo_url ? <img src={store.logo_url} alt="" className="size-full object-cover" /> : store.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-semibold truncate">{store.name}</h1>
              {store.verified && <BadgeCheck className="size-5 text-primary shrink-0" />}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">/{store.slug} · {store.category}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {store.website_url && <a href={store.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm"><Globe className="size-4" /> Website</a>}
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <div className="glass rounded-xl p-4 flex items-center gap-3"><Users className="size-5 text-primary" /><div><div className="text-xs text-muted-foreground">Members</div><div className="font-semibold">{store.member_count}</div></div></div>
          <div className="glass rounded-xl p-4 flex items-center gap-3"><ShoppingBag className="size-5 text-primary" /><div><div className="text-xs text-muted-foreground">Sales</div><div className="font-semibold">${Number(store.total_sales).toFixed(0)}</div></div></div>
          <div className="glass rounded-xl p-4 flex items-center gap-3"><Star className="size-5 text-primary" /><div><div className="text-xs text-muted-foreground">Rating</div><div className="font-semibold">New</div></div></div>
        </div>

        {store.description && <p className="mt-6 text-sm text-muted-foreground max-w-3xl">{store.description}</p>}

        <h2 className="mt-10 text-lg font-semibold">Products</h2>
        {products.length === 0 ? (
          <div className="mt-4 glass rounded-2xl p-12 text-center text-sm text-muted-foreground">No products yet.</div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
            {products.filter(p=>p.active).map((p) => (
              <div key={p.id} className="glass rounded-2xl p-5 flex flex-col">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.product_type}</div>
                <div className="mt-1 font-semibold">{p.name}</div>
                {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">${Number(p.price).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{p.billing_type.replace("_"," ")}</div>
                  </div>
                  <button onClick={() => buy(p)} disabled={buying===p.id} className="rounded-full text-black px-4 py-2 text-sm font-medium" style={{ background: accent }}>
                    {buying===p.id ? "…" : "Buy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
