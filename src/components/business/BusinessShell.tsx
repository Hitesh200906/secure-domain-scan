import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Store as StoreIcon, Package, Users, ShoppingBag,
  BarChart3, MessageSquare, Share2, Wallet, Settings, LifeBuoy, Menu, X, UsersRound,
  ChevronsUpDown, Plus, Check,
} from "lucide-react";
import type { Store } from "@/lib/business";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { to: string; label: string; icon: any; exact?: boolean };

const MAIN_NAV: NavItem[] = [
  { to: "/business", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/business/store", label: "My Store", icon: StoreIcon },
  { to: "/business/products", label: "Products", icon: Package },
  { to: "/business/community", label: "Community", icon: UsersRound },
  { to: "/business/members", label: "Members", icon: Users },
  { to: "/business/orders", label: "Orders", icon: ShoppingBag },
  { to: "/business/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/business/messages", label: "Messages", icon: MessageSquare },
  { to: "/business/affiliates", label: "Affiliates", icon: Share2 },
  { to: "/business/payouts", label: "Payouts", icon: Wallet },
];

const FOOTER_NAV: NavItem[] = [
  { to: "/business/settings", label: "Settings", icon: Settings },
  { to: "/business/support", label: "Support", icon: LifeBuoy },
];

function StoreSwitcher({ store }: { store: Store | null }) {
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("stores").select("*").eq("owner_id", user.id).order("created_at", { ascending: true });
      setStores((data as Store[]) ?? []);
    })();
  }, [store?.id]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const Logo = ({ s, size = "size-9" }: { s: Store | null; size?: string }) =>
    s?.logo_url ? (
      <img src={s.logo_url} alt={s.name} className={`${size} shrink-0 rounded-xl object-cover border border-white/10`} />
    ) : (
      <div
        className={`${size} shrink-0 rounded-xl grid place-items-center text-sm font-bold border border-white/10`}
        style={{ background: s?.theme_color ? `linear-gradient(135deg, ${s.theme_color}, ${s.accent_color ?? s.theme_color})` : "linear-gradient(135deg, oklch(0.5 0.18 280), oklch(0.6 0.2 320))" }}
      >
        {(s?.name ?? "S")[0].toUpperCase()}
      </div>
    );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition px-2.5 py-2"
      >
        <Logo s={store} />
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-semibold truncate">{store?.name ?? "My Business"}</div>
          {store?.slug && <div className="text-[11px] text-muted-foreground truncate">/{store.slug}</div>}
        </div>
        <div className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] p-1.5">
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl p-1.5">
          <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Your stores</div>
          <div className="max-h-72 overflow-y-auto">
            {stores.map((s) => {
              const active = s.id === store?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setOpen(false); /* single-store today; route to store page */ navigate({ to: "/business/store" }); }}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left hover:bg-white/5 transition ${active ? "bg-white/[0.04]" : ""}`}
                >
                  <Logo s={s} size="size-8" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">/{s.slug}</div>
                  </div>
                  {active && <Check className="size-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="mt-1 border-t border-white/10 pt-1">
            <Link
              to="/business/create"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm hover:bg-white/5 transition"
            >
              <div className="size-8 rounded-xl border border-dashed border-white/15 grid place-items-center">
                <Plus className="size-4 text-muted-foreground" />
              </div>
              <span>Create new store</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function BusinessShell({ store, children }: { store: Store | null; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const NavItemRow = ({ item, onNav }: { item: NavItem; onNav?: () => void }) => {
    const active = item.exact ? path === item.to : path.startsWith(item.to);
    const Icon = item.icon;
    return (
      <Link
        to={item.to as any}
        onClick={onNav}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
          active ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        <Icon className={`size-5 shrink-0 ${active ? "text-white" : "text-muted-foreground group-hover:text-white"}`} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const SidebarBody = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-3 pt-4 pb-3 border-b border-white/10">
        <div className="px-1 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Workspace</div>
        <StoreSwitcher store={store} />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
        {MAIN_NAV.map((item) => <NavItemRow key={item.to} item={item} onNav={onNav} />)}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-2 py-3 space-y-1 bg-background">
        {FOOTER_NAV.map((item) => <NavItemRow key={item.to} item={item} onNav={onNav} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-[1600px] flex">
        <aside className="hidden lg:block w-72 shrink-0 border-r border-white/10 sticky top-20 h-[calc(100vh-5rem)]">
          <SidebarBody />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
              <Menu className="size-5" />
            </button>
            <div className="text-sm font-medium truncate">{store?.name ?? "Business"}</div>
            <div className="w-9" />
          </div>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 z-[70] h-full w-72 bg-background border-r border-white/10 lg:hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-sm font-semibold">Menu</span>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/5"><X className="size-5" /></button>
            </div>
            <div className="h-[calc(100%-49px)]">
              <SidebarBody onNav={() => setOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
