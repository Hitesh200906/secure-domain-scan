import { useStore } from "@/lib/store-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStoreProducts, type Product } from "@/lib/business";
import { Plus, Trash2, Edit, Loader2, Package, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import { ProductWizard } from "@/components/business/ProductWizard";

export const Route = createFileRoute("/business/products")({
  component: ProductsPage,
  validateSearch: (s: Record<string, unknown>) => ({ new: s.new ? Number(s.new) : undefined }),
});

function ProductsPage() {
  const store = useStore();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<{ open: boolean; initial?: Partial<Product> | null }>({ open: false });

  const load = async () => {
    setLoading(true);
    setItems(await getStoreProducts(store.id));
    setLoading(false);
  };
  useEffect(() => { load(); }, [store.id]);

  useEffect(() => {
    if (search.new) {
      setWizard({ open: true, initial: null });
      navigate({ search: {} as any, replace: true });
    }
  }, [search.new]);

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage what your store sells.</p>
        </div>
        <button onClick={() => setWizard({ open: true, initial: null })} className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition">
          <Plus className="size-4" /> Add product
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Package className="size-10 mx-auto mb-3 text-muted-foreground" />
          <div className="font-medium">No products yet</div>
          <div className="text-sm text-muted-foreground mt-1">Launch your first product with our 12-step wizard.</div>
          <button onClick={() => setWizard({ open: true })} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium">
            <Plus className="size-4" /> Create product
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => {
            const anyP = p as any;
            const banner = anyP.banner_url || anyP.thumbnail_url || p.image_url;
            const logo = anyP.logo_url || p.image_url;
            return (
              <div key={p.id} className="glass rounded-2xl overflow-hidden group">
                <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/20 to-emerald-500/10">
                  {banner && <img src={banner} className="absolute inset-0 w-full h-full object-cover" />}
                  {logo && <img src={logo} className="absolute bottom-2 left-2 size-10 rounded-lg border-2 border-black object-cover" />}
                  {anyP.status === "draft" && <span className="absolute top-2 right-2 text-[10px] rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5">Draft</span>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.product_type.replace("_"," ")}</div>
                      <div className="mt-0.5 font-semibold truncate">{p.name}</div>
                      {anyP.headline && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{anyP.headline}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm">{p.billing_type === "free" ? "Free" : `$${Number(p.price).toFixed(0)}`}</div>
                      <div className="text-[10px] text-muted-foreground">{p.billing_type.replace("_", " ")}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setWizard({ open: true, initial: p })} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                      <Edit className="size-3.5" /> Edit
                    </button>
                    <Link to="/$slug" params={{ slug: store.slug }} className="inline-flex items-center justify-center rounded-lg border border-white/10 px-2 py-1.5 text-xs hover:bg-white/5">
                      <Eye className="size-3.5" />
                    </Link>
                    <button onClick={() => remove(p.id)} className="inline-flex items-center justify-center rounded-lg border border-white/10 px-2 py-1.5 text-xs text-destructive hover:bg-white/5">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {wizard.open && (
        <ProductWizard
          store={store}
          initial={wizard.initial}
          onClose={() => setWizard({ open: false })}
          onSaved={load}
        />
      )}
    </div>
  );
}
