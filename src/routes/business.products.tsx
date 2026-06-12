import { useStore } from "@/lib/store-context";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStoreProducts, type Product, type Store } from "@/lib/business";
import { Plus, Trash2, Edit, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/business/products")({
  component: ProductsPage,
  validateSearch: (s: Record<string, unknown>) => ({ new: s.new ? Number(s.new) : undefined }),
});


function ProductsPage() {
  const store = useStore();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const load = async () => {
    setLoading(true);
    setItems(await getStoreProducts(store.id));
    setLoading(false);
  };
  useEffect(() => { load(); }, [store.id]);

  const save = async () => {
    if (!editing?.name) { toast.error("Name required"); return; }
    const payload = {
      store_id: store.id,
      name: editing.name,
      description: editing.description ?? null,
      product_type: editing.product_type ?? "digital",
      price: Number(editing.price ?? 0),
      billing_type: editing.billing_type ?? "one_time",
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null);
    load();
  };

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
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-primary transition">
          <Plus className="size-4" /> New product
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">No products yet. Create your first.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.product_type}</div>
                  <div className="mt-1 font-semibold truncate">{p.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${Number(p.price).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{p.billing_type.replace("_", " ")}</div>
                </div>
              </div>
              {p.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEditing(p)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                  <Edit className="size-3.5" /> Edit
                </button>
                <button onClick={() => remove(p.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-destructive hover:bg-white/5">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-lg" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing.id ? "Edit product" : "New product"}</h2>
              <button onClick={() => setEditing(null)}><X className="size-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Product name" value={editing.name ?? ""} onChange={e=>setEditing({...editing, name:e.target.value})} />
              <textarea className="input min-h-[80px]" placeholder="Description" value={editing.description ?? ""} onChange={e=>setEditing({...editing, description:e.target.value})} />
              <div className="grid grid-cols-3 gap-2">
                <select className="input" value={editing.product_type ?? "digital"} onChange={e=>setEditing({...editing, product_type:e.target.value})}>
                  <option value="community">Community</option>
                  <option value="digital">Digital</option>
                  <option value="software">Software</option>
                  <option value="membership">Membership</option>
                </select>
                <select className="input" value={editing.billing_type ?? "one_time"} onChange={e=>setEditing({...editing, billing_type:e.target.value})}>
                  <option value="one_time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input className="input" placeholder="Price" inputMode="decimal" value={editing.price ?? ""} onChange={e=>setEditing({...editing, price:Number(e.target.value)})} />
              </div>
              <button onClick={save} className="w-full rounded-full bg-white text-black py-2.5 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:0.625rem;padding:0.55rem 0.75rem;color:white;font-size:0.875rem;outline:none}.input:focus{border-color:rgba(124,58,237,0.6)}`}</style>
    </div>
  );
}
