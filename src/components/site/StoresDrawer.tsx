import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Store as StoreIcon, ChevronUp, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/lib/business";

export function StoresDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [owned, setOwned] = useState<Store[]>([]);
  const [joined, setJoined] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setOwned([]); setJoined([]); setLoading(false); return; }

      const { data: ownedData } = await supabase.from("stores").select("*").eq("owner_id", user.id);
      setOwned((ownedData as Store[]) ?? []);

      const { data: orders } = await supabase.from("orders").select("store_id").eq("buyer_id", user.id);
      const ids = Array.from(new Set((orders ?? []).map((o: any) => o.store_id))).filter(Boolean);
      if (ids.length > 0) {
        const { data: joinedData } = await supabase.from("stores").select("*").in("id", ids);
        setJoined((joinedData as Store[]) ?? []);
      } else {
        setJoined([]);
      }
      setIdx(0);
      setLoading(false);
    })();
  }, [open]);

  const next = () => setIdx((i) => (owned.length ? (i + 1) % owned.length : 0));
  const prev = () => setIdx((i) => (owned.length ? (i - 1 + owned.length) % owned.length : 0));

  const StoreLogo = ({ s, size = "size-12", text = "text-lg" }: { s: Store; size?: string; text?: string }) => (
    s.logo_url ? (
      <img src={s.logo_url} alt={s.name} className={`${size} rounded-xl object-cover border border-white/10`} />
    ) : (
      <div className={`${size} rounded-xl grid place-items-center ${text} font-bold border border-white/10`}
        style={{ background: `linear-gradient(135deg, ${s.theme_color ?? "#7c3aed"}, ${s.accent_color ?? "#22d3ee"})` }}>
        {s.name[0]}
      </div>
    )
  );

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
            className="fixed left-0 top-0 z-[90] h-full w-[340px] bg-black border-r border-white/10 flex flex-col"
            initial={{ x: -360 }} animate={{ x: 0 }} exit={{ x: -360 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <StoreIcon className="size-4 text-primary" />
                <span className="text-sm font-semibold tracking-[0.2em]">STORES</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-sm text-muted-foreground">Loading…</div>
              ) : (
                <>
                  {/* Your Stores - vertical slideshow */}
                  <section className="p-4 border-b border-white/10">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Your Stores</div>
                    {owned.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-4">You haven't created a store yet.</div>
                    ) : (
                      <div className="relative h-[88px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={owned[idx].id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 p-3 flex items-center gap-3"
                          >
                            <StoreLogo s={owned[idx]} size="size-10" text="text-base" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{owned[idx].name}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {owned[idx].member_count} total members
                              </div>
                            </div>
                            <Link
                              to="/$slug"
                              params={{ slug: owned[idx].slug }}
                              onClick={onClose}
                              className="shrink-0 rounded-full bg-white text-black px-3 py-1.5 text-[11px] font-medium hover:bg-white/90 transition"
                            >
                              Visit store →
                            </Link>
                          </motion.div>
                        </AnimatePresence>

                        {owned.length > 1 && (
                          <>
                            <button onClick={prev} className="absolute top-1.5 right-1.5 size-6 rounded-full glass grid place-items-center hover:border-white/20">
                              <ChevronUp className="size-3" />
                            </button>
                            <button onClick={next} className="absolute bottom-1.5 right-1.5 size-6 rounded-full glass grid place-items-center hover:border-white/20">
                              <ChevronDown className="size-3" />
                            </button>
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                              {owned.map((_, i) => (
                                <button key={i} onClick={() => setIdx(i)}
                                  className={`w-1 rounded-full transition-all ${i === idx ? "h-4 bg-white" : "h-1 bg-white/30"}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Joined Stores - simple list */}
                  <section className="p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Joined Stores</div>
                    {joined.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-4">No joined stores yet.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {joined.map((s) => (
                          <Link
                            key={s.id}
                            to="/$slug"
                            params={{ slug: s.slug }}
                            onClick={onClose}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition"
                          >
                            <StoreLogo s={s} size="size-10" text="text-base" />
                            <div className="text-sm font-medium truncate flex-1">{s.name}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
