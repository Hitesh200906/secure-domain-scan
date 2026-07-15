import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Store, Package, Users, ShoppingBag, BarChart3, MessageSquare,
  Share2, Wallet, Settings, LifeBuoy, UsersRound, Sparkles, Zap, Megaphone,
  UserCog, Blocks, Bell, Plus, Search,
} from "lucide-react";

type Action = { id: string; label: string; hint?: string; icon: any; to?: string; group: string };

const ACTIONS: Action[] = [
  { id: "d", label: "Dashboard", icon: LayoutDashboard, to: "/business", group: "Navigate" },
  { id: "s", label: "My Store", icon: Store, to: "/business/store", group: "Navigate" },
  { id: "p", label: "Products", icon: Package, to: "/business/products", group: "Navigate" },
  { id: "o", label: "Orders", icon: ShoppingBag, to: "/business/orders", group: "Navigate" },
  { id: "c", label: "Community", icon: UsersRound, to: "/business/community", group: "Navigate" },
  { id: "m", label: "Members", icon: Users, to: "/business/members", group: "Navigate" },
  { id: "a", label: "Analytics", icon: BarChart3, to: "/business/analytics", group: "Navigate" },
  { id: "msg", label: "Messages", icon: MessageSquare, to: "/business/messages", group: "Navigate" },
  { id: "af", label: "Affiliates", icon: Share2, to: "/business/affiliates", group: "Navigate" },
  { id: "pay", label: "Payouts", icon: Wallet, to: "/business/payouts", group: "Navigate" },
  { id: "cmp", label: "Campaigns", icon: Megaphone, to: "/business/campaigns", group: "Navigate" },
  { id: "ai", label: "AI Assistant", icon: Sparkles, to: "/business/ai", group: "Navigate" },
  { id: "auto", label: "Automation", icon: Zap, to: "/business/automation", group: "Navigate" },
  { id: "tm", label: "Team", icon: UserCog, to: "/business/team", group: "Navigate" },
  { id: "mk", label: "App Marketplace", icon: Blocks, to: "/business/marketplace", group: "Navigate" },
  { id: "n", label: "Notifications", icon: Bell, to: "/business/notifications", group: "Navigate" },
  { id: "set", label: "Settings", icon: Settings, to: "/business/settings", group: "Navigate" },
  { id: "sup", label: "Support", icon: LifeBuoy, to: "/business/support", group: "Navigate" },
  { id: "np", label: "New product", hint: "Create a product", icon: Plus, to: "/business/products", group: "Actions" },
  { id: "ns", label: "New store", hint: "Create a store", icon: Plus, to: "/business/create", group: "Actions" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) { setQ(""); setActive(0); }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ACTIONS;
    return ACTIONS.filter((a) => a.label.toLowerCase().includes(term) || a.hint?.toLowerCase().includes(term));
  }, [q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Action[]>();
    results.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return Array.from(map.entries());
  }, [results]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") {
        const r = results[active];
        if (r?.to) { navigate({ to: r.to as any }); onClose(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, navigate, onClose]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-start pt-[12vh] px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
          <Search className="size-4 text-neutral-500" />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            placeholder="Search anywhere in Forge…"
            className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder:text-neutral-600"
          />
          <kbd className="text-[10px] text-neutral-500 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {grouped.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px] text-neutral-500">No results</div>
          )}
          {grouped.map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-neutral-600">{group}</div>
              {items.map((a) => {
                flatIndex++;
                const isActive = flatIndex === active;
                const Icon = a.icon;
                const idx = flatIndex;
                return (
                  <button
                    key={a.id}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => { if (a.to) { navigate({ to: a.to as any }); onClose(); } }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition ${isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
                  >
                    <Icon className="size-4 text-neutral-400" />
                    <span className="text-[13px] text-white">{a.label}</span>
                    {a.hint && <span className="text-[11px] text-neutral-500">{a.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] text-[10.5px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span><kbd className="border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
            <span><kbd className="border border-white/10 rounded px-1">↵</kbd> select</span>
          </div>
          <span>Forge Command</span>
        </div>
      </div>
    </div>
  );
}
