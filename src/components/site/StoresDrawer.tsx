import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Store as StoreIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/lib/business";

export function StoresDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStores([]); setLoading(false); return; }
      const { data: orders } = await supabase.from("orders").select("store_id").eq("buyer_id", user.id);
      const ids = Array.from(new Set((orders ?? []).map((o: any) => o.store_id)));
      if (ids.length === 0) {
        // fallback: show featured stores so the drawer isn't empty
        const { data } = await supabase.from("stores").select("*").limit(8);
        setStores((data as Store[]) ?? []);
      } else {
        const { data } = await supabase.from("stores").select("*").in("id", ids);
        setStores((data as Store[]) ?? []);
      }
      setIdx(0);
      setLoading(false);
    })();
  }, [open]);

  const next = () => setIdx((i) => (stores.length ? (i + 1) % stores.length : 0));
  const prev = () => setIdx((i) => (stores.length ? (i - 1 + stores.length) % stores.length : 0));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-0 z-[90] h-full w-[320px] bg-black border-r border-white/10 flex flex-col"
            initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <StoreIcon className="size-4 text-primary" />
                <span className="text-sm font-semibold">Your Stores</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {loading ? (
                <div className="p-6 text-sm text-muted-foreground">Loading…</div>
              ) : stores.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No joined stores yet.</div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={stores[idx].id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 p-5 flex flex-col"
                      >
                        <div
                          className="h-32 rounded-2xl border border-white/10 mb-4"
                          style={{
                            background: stores[idx].banner_url
                              ? `url(${stores[idx].banner_url}) center/cover`
                              : `linear-gradient(135deg, ${stores[idx].theme_color ?? "#7c3aed"}, ${stores[idx].accent_color ?? "#22d3ee"})`,
                          }}
                        />
                        <div className="flex items-center gap-3 mb-3">
                          {stores[idx].logo_url ? (
                            <img src={stores[idx].logo_url} alt={stores[idx].name} className="size-12 rounded-xl object-cover border border-white/10" />
                          ) : (
                            <div className="size-12 rounded-xl grid place-items-center text-lg font-bold border border-white/10"
                              style={{ background: `linear-gradient(135deg, ${stores[idx].theme_color ?? "#7c3aed"}, ${stores[idx].accent_color ?? "#22d3ee"})` }}>
                              {stores[idx].name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{stores[idx].name}</div>
                            <div className="text-xs text-muted-foreground truncate">/{stores[idx].slug}</div>
                          </div>
                        </div>
                        {stores[idx].description && (
                          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{stores[idx].description}</p>
                        )}
                        <div className="text-[11px] text-muted-foreground mb-4">
                          {stores[idx].member_count} members
                        </div>
                        <Link
                          to="/$slug"
                          params={{ slug: stores[idx].slug }}
                          onClick={onClose}
                          className="mt-auto text-center rounded-full bg-white text-black px-4 py-2 text-sm font-medium"
                        >
                          Visit store →
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <button onClick={prev} className="size-9 rounded-full glass grid place-items-center hover:border-white/20">
                      <ChevronLeft className="size-4" />
                    </button>
                    <div className="flex gap-1.5">
                      {stores.map((_, i) => (
                        <button key={i} onClick={() => setIdx(i)}
                          className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
                      ))}
                    </div>
                    <button onClick={next} className="size-9 rounded-full glass grid place-items-center hover:border-white/20">
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
