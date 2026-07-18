import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Store as StoreIcon, Package, Users, ShoppingBag,
  BarChart3, MessageSquare, Share2, Wallet, Settings, LifeBuoy, Menu, X, UsersRound,
  ChevronsUpDown, Plus, Check, Sparkles, Zap, Megaphone, UserCog, Blocks, Bell,
  Search, Command as CmdIcon, ChevronDown,
} from "lucide-react";
import type { Store } from "@/lib/business";
import { supabase } from "@/integrations/supabase/client";
import { CommandPalette } from "./CommandPalette";

type NavItem = { to: string; label: string; icon: any; exact?: boolean; accent?: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/business", label: "Dashboard", icon: LayoutDashboard, exact: true, accent: "text-blue-400" },
      { to: "/business/notifications", label: "Notifications", icon: Bell, accent: "text-orange-400" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/business/store", label: "My Store", icon: StoreIcon, accent: "text-purple-400" },
      { to: "/business/products", label: "Products", icon: Package, accent: "text-emerald-400" },
      { to: "/business/orders", label: "Orders", icon: ShoppingBag, accent: "text-cyan-400" },
      { to: "/business/payouts", label: "Payouts", icon: Wallet, accent: "text-emerald-400" },
    ],
  },
  {
    label: "Growth",
    items: [
      { to: "/business/community", label: "Community", icon: UsersRound, accent: "text-pink-400" },
      { to: "/business/members", label: "Members", icon: Users, accent: "text-blue-400" },
      { to: "/business/analytics", label: "Analytics", icon: BarChart3, accent: "text-cyan-400" },
      { to: "/business/messages", label: "Messages", icon: MessageSquare, accent: "text-purple-400" },
      { to: "/business/affiliates", label: "Affiliates", icon: Share2, accent: "text-orange-400" },
      { to: "/business/campaigns", label: "Campaigns", icon: Megaphone, accent: "text-pink-400" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/business/ai", label: "AI Assistant", icon: Sparkles, accent: "text-purple-400" },
      { to: "/business/automation", label: "Automation", icon: Zap, accent: "text-orange-400" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/business/team", label: "Team", icon: UserCog, accent: "text-blue-400" },
      { to: "/business/marketplace", label: "App Marketplace", icon: Blocks, accent: "text-emerald-400" },
      { to: "/business/settings", label: "Settings", icon: Settings },
      { to: "/business/support", label: "Support", icon: LifeBuoy },
    ],
  },
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
        style={{ background: s?.theme_color ? `linear-gradient(135deg, ${s.theme_color}, ${s.accent_color ?? s.theme_color})` : "linear-gradient(135deg, #4730D8, #1F55F5)" }}
      >
        {(s?.name ?? "F")[0].toUpperCase()}
      </div>
    );

  return (
    <div ref={ref} className="relative">
      <div className="w-full flex items-center gap-3 px-1">
        <button onClick={() => setOpen((v) => !v)} className="shrink-0 transition hover:opacity-90">
          <Logo s={store} size="size-11" />
        </button>
        <button onClick={() => setOpen((v) => !v)} className="flex-1 min-w-0 text-left">
          <div className="text-[17px] font-semibold tracking-tight truncate text-white leading-tight">{store?.name ?? "Workspace"}</div>
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:text-white"
        >
          <ChevronsUpDown className="size-3" />
          Switch
        </button>
      </div>


      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-white/10 bg-[#111] backdrop-blur-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
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
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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
        className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition ${
          active
            ? "bg-white/[0.06] text-white"
            : "text-neutral-400 hover:bg-white/[0.03] hover:text-white"
        }`}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r-full bg-white" />}
        <Icon className={`size-[15px] shrink-0 ${active ? item.accent ?? "text-white" : "text-neutral-500 group-hover:text-neutral-300"}`} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const SidebarBody = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col bg-[#0b0b0b]">
      <div className="shrink-0 px-3 pt-4 pb-3 border-b border-white/[0.06]">
        <StoreSwitcher store={store} />
      </div>


      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">
        {NAV_GROUPS.filter((g) => g.label !== "Workspace").map((group) => {
          const collapsed = collapsedGroups[group.label];
          return (
            <div key={group.label}>
              <button
                onClick={() => setCollapsedGroups((c) => ({ ...c, [group.label]: !c[group.label] }))}
                className="w-full flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-600 hover:text-neutral-400 transition"
              >
                <ChevronDown className={`size-3 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
                {group.label}
              </button>
              {!collapsed && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => <NavItemRow key={item.to} item={item} onNav={onNav} />)}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {(() => {
        const workspace = NAV_GROUPS.find((g) => g.label === "Workspace");
        if (!workspace) return null;
        const collapsed = collapsedGroups[workspace.label];
        return (
          <div className="shrink-0 border-t border-white/[0.06] px-2 py-3">
            <button
              onClick={() => setCollapsedGroups((c) => ({ ...c, [workspace.label]: !c[workspace.label] }))}
              className="w-full flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-600 hover:text-neutral-400 transition"
            >
              <ChevronDown className={`size-3 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
              {workspace.label}
            </button>
            {!collapsed && (
              <div className="mt-1 space-y-0.5">
                {workspace.items.map((item) => <NavItemRow key={item.to} item={item} onNav={onNav} />)}
              </div>
            )}
          </div>
        );
      })()}

      <div className="shrink-0 border-t border-white/[0.06] px-3 py-3 text-[10.5px] text-neutral-600 flex items-center justify-between">
        <span>Forge · v1.0</span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Operational
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] pt-20">
      <div className="mx-auto max-w-[1600px] flex">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-white/[0.06] sticky top-20 h-[calc(100vh-5rem)]">
          <SidebarBody />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0b0b0b]">
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
              <Menu className="size-5" />
            </button>
            <div className="text-[13px] font-medium truncate">{store?.name ?? "Forge"}</div>
            <button onClick={() => setPaletteOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
              <Search className="size-4" />
            </button>
          </div>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 z-[70] h-full w-72 border-r border-white/[0.06] lg:hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/[0.06] bg-[#0b0b0b]">
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
