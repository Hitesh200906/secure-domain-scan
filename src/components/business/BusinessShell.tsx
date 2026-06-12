import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Store as StoreIcon, Package, Users, ShoppingBag,
  BarChart3, MessageSquare, Share2, Wallet, Settings, LifeBuoy, Menu, X,
} from "lucide-react";
import type { Store } from "@/lib/business";

const NAV = [
  { to: "/business", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/business/store", label: "My Store", icon: StoreIcon },
  { to: "/business/products", label: "Products", icon: Package },
  { to: "/business/community", label: "Community", icon: Users },
  { to: "/business/members", label: "Members", icon: Users },
  { to: "/business/orders", label: "Orders", icon: ShoppingBag },
  { to: "/business/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/business/messages", label: "Messages", icon: MessageSquare },
  { to: "/business/affiliates", label: "Affiliates", icon: Share2 },
  { to: "/business/payouts", label: "Payouts", icon: Wallet },
  { to: "/business/settings", label: "Settings", icon: Settings },
  { to: "/business/support", label: "Support", icon: LifeBuoy },
] as const;

export function BusinessShell({ store, children }: { store: Store | null; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const Side = (
    <nav className="flex flex-col gap-0.5 p-3">
      <div className="px-3 py-3 mb-2 border-b border-white/10">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Workspace</div>
        <div className="mt-1 text-sm font-semibold truncate">{store?.name ?? "My Business"}</div>
        {store?.slug && <div className="text-xs text-muted-foreground truncate">/{store.slug}</div>}
      </div>
      {NAV.map((item) => {
        const active = item.exact ? path === item.to : path.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to as any}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-[1600px] flex">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-white/10 min-h-[calc(100vh-5rem)] sticky top-20">
          {Side}
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
              <Menu className="size-5" />
            </button>
            <div className="text-sm font-medium">{store?.name ?? "Business"}</div>
            <div className="w-9" />
          </div>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 z-[70] h-full w-72 bg-background border-r border-white/10 lg:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-sm font-semibold">Menu</span>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/5"><X className="size-5" /></button>
            </div>
            {Side}
          </aside>
        </>
      )}
    </div>
  );
}
