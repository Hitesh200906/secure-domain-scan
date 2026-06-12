import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Store as StoreIcon, Package, Users, ShoppingBag,
  BarChart3, MessageSquare, Share2, Wallet, Settings, LifeBuoy, Menu, X, UsersRound,
} from "lucide-react";
import type { Store } from "@/lib/business";

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
          active
            ? "bg-white/10 text-white"
            : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        <Icon className={`size-5 shrink-0 ${active ? "text-white" : "text-muted-foreground group-hover:text-white"}`} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const SidebarBody = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Workspace header */}
      <div className="shrink-0 px-4 py-4 border-b border-white/10">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Workspace</div>
        <div className="mt-1 text-sm font-semibold truncate">{store?.name ?? "My Business"}</div>
        {store?.slug && <div className="text-xs text-muted-foreground truncate">/{store.slug}</div>}
      </div>

      {/* Scrollable main nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
        {MAIN_NAV.map((item) => (
          <NavItemRow key={item.to} item={item} onNav={onNav} />
        ))}
      </nav>

      {/* Pinned footer nav */}
      <div className="shrink-0 border-t border-white/10 px-2 py-3 space-y-1 bg-background">
        {FOOTER_NAV.map((item) => (
          <NavItemRow key={item.to} item={item} onNav={onNav} />
        ))}
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
