import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Store as StoreIcon, Package, Users, ShoppingBag,
  BarChart3, Share2, Wallet, Settings, LifeBuoy, Menu, X,
  Check, UserCog, Blocks, Search, ChevronRight, ExternalLink, Plus,
} from "lucide-react";
import { getMyStores, type Store } from "@/lib/business";
import { supabase } from "@/integrations/supabase/client";
import { CommandPalette } from "./CommandPalette";
import { BackButton } from "@/components/site/BackButton";


type NavItem = { to: string; label: string; icon: any; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/business", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/business/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/business/products", label: "Products", icon: Package },
      { to: "/business/orders", label: "Orders", icon: ShoppingBag },
      { to: "/business/payouts", label: "Payouts", icon: Wallet },
    ],
  },
  {
    label: "Growth",
    items: [
      { to: "/business/members", label: "Members", icon: Users },
      { to: "/business/affiliates", label: "Affiliates", icon: Share2 },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/business/team", label: "Team", icon: UserCog },
      { to: "/business/marketplace", label: "Marketplace", icon: Blocks },
      { to: "/business/settings", label: "Settings", icon: Settings },
      { to: "/business/support", label: "Support", icon: LifeBuoy },
    ],
  },
];

function StoreCard({ store }: { store: Store | null }) {
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setStores(await getMyStores());
    })();
  }, [store?.id]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const Logo = ({ s, size = "size-11" }: { s: Store | null; size?: string }) =>
    s?.logo_url ? (
      <img src={s.logo_url} alt={s.name} className={`${size} shrink-0 rounded-xl object-cover border border-white/10`} />
    ) : (
      <div
        className={`${size} shrink-0 rounded-xl grid place-items-center text-sm font-bold border border-white/10`}
        style={{ background: s?.theme_color ? `linear-gradient(135deg, ${s.theme_color}, ${s.accent_color ?? s.theme_color})` : "linear-gradient(135deg, #4730D8, #1F55F5)" }}
      >
        {(s?.name ?? "F")[0].toUpperCase()}
      </div>
    );

  return (
    <div ref={ref} className="relative space-y-2.5">
      <div className="flex items-start gap-3">
        <Logo s={store} size="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-semibold tracking-tight truncate text-white leading-tight">{store?.name ?? "Workspace"}</span>
            <span className="shrink-0 inline-flex items-center rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wider">
              Business
            </span>
          </div>
          {store?.slug && (
            <a
              href={`/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-neutral-400 hover:text-white transition"
            >
              View store <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition px-3 py-2 text-[12.5px] text-neutral-300 hover:text-white"
      >
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
          Switch workspace
        </span>
        <ChevronRight className={`size-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+2px)] z-50 rounded-xl border border-white/10 bg-[#111] backdrop-blur-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-neutral-500">Your stores</div>
          <div className="max-h-72 overflow-y-auto">
            {stores.map((s) => {
              const active = s.id === store?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setOpen(false); navigate({ to: "/business/store" }); }}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-white/[0.04] transition ${active ? "bg-white/[0.04]" : ""}`}
                >
                  <Logo s={s} size="size-8" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{s.name}</div>
                    <div className="text-[10.5px] text-neutral-500 truncate">/{s.slug}</div>
                  </div>
                  {active && <Check className="size-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="mt-1 border-t border-white/10 pt-1">
            <Link
              to="/business/create"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] hover:bg-white/[0.04] transition"
            >
              <div className="size-8 rounded-lg border border-dashed border-white/15 grid place-items-center">
                <Plus className="size-4 text-neutral-500" />
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
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const NavItemRow = ({ item, onNav }: { item: NavItem; onNav?: () => void }) => {
    const active = item.exact ? path === item.to : path.startsWith(item.to);
    const Icon = item.icon;
    return (
      <Link
        to={item.to as any}
        onClick={onNav}
        className={`group relative flex items-center gap-3 rounded-full pl-1.5 pr-4 py-1.5 text-[13.5px] font-medium transition ${
          active
            ? "text-white bg-white/[0.05]"
            : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
        }`}
      >
        <span
          className={`grid place-items-center size-8 rounded-xl shrink-0 transition ${
            active
              ? "text-blue-300 bg-blue-500/10"
              : "text-neutral-500 group-hover:text-neutral-300 bg-white/[0.02]"
          }`}
        >
          <Icon className="size-[15px]" />
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };



  const SidebarBody = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      <div className="shrink-0 px-4 pt-5 pb-4 border-b border-white/[0.06]">
        <StoreCard store={store} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {NAV_GROUPS.filter((g) => g.label !== "Workspace").map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-neutral-600 font-medium">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => <NavItemRow key={item.to} item={item} onNav={onNav} />)}
            </div>
          </div>
        ))}
      </nav>

      {(() => {
        const workspace = NAV_GROUPS.find((g) => g.label === "Workspace");
        if (!workspace) return null;
        return (
          <div className="shrink-0 border-t border-white/[0.06] px-3 py-4">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-neutral-600 font-medium">
              {workspace.label}
            </div>
            <div className="space-y-0.5">
              {workspace.items.map((item) => <NavItemRow key={item.to} item={item} onNav={onNav} />)}
            </div>
          </div>
        );
      })()}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      <div className="mx-auto max-w-[1600px] flex">
        <aside className="hidden lg:block w-[260px] shrink-0 border-r border-white/[0.06] sticky top-0 h-screen">
          <SidebarBody />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0a]">
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
              <Menu className="size-5" />
            </button>
            <div className="text-[13px] font-medium truncate">{store?.name ?? "Forge"}</div>
            <button onClick={() => setPaletteOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
              <Search className="size-4" />
            </button>
          </div>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mb-4"><BackButton fallback="/" /></div>
            {children}
          </main>
        </div>
      </div>


      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 z-[70] h-full w-72 border-r border-white/[0.06] lg:hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/[0.06] bg-[#0a0a0a]">
              <span className="text-[13px] font-semibold">Menu</span>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/5"><X className="size-4" /></button>
            </div>
            <div className="h-[calc(100%-49px)]">
              <SidebarBody onNav={() => setOpen(false)} />
            </div>
          </aside>
        </>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
