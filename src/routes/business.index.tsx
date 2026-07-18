import { useStore } from "@/lib/store-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DollarSign, ShoppingBag, Users, Target, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, Command, ChevronDown, Package, Landmark, UserPlus, Activity,
} from "lucide-react";
import type { Order, Product } from "@/lib/business";
import { getStoreOrders, getStoreProducts } from "@/lib/business";

export const Route = createFileRoute("/business/")({
  component: BusinessDashboard,
});

function BusinessDashboard() {
  const store = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!store) return;
    getStoreOrders(store.id).then(setOrders);
    getStoreProducts(store.id).then(setProducts);
  }, [store]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const isEmpty = orders.length === 0 && products.length === 0;

  const metrics = useMemo(() => {
    if (isEmpty) {
      const daily = Array.from({ length: range }).map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (range - 1 - i));
        const base = [1200, 1800, 1400, 2100, 2600, 3620, 3100][i % 7];
        return { d: d.toISOString().slice(0, 10), v: base };
      });
      return {
        gross: 12430, net: 11808.5, prevGross: 10050,
        buyers: 1245, sales: 356,
        dGross: 23.6, dSales: 12.4, dBuyers: 18.2,
        conversion: 4.32, dConversion: 8.7,
        daily,
      };
    }
    const start = new Date(); start.setDate(start.getDate() - range);
    const prevStart = new Date(); prevStart.setDate(prevStart.getDate() - range * 2);
    const inRange = orders.filter(o => new Date(o.created_at) >= start);
    const prev = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= prevStart && d < start;
    });
    const gross = inRange.reduce((s, o) => s + Number(o.amount || 0), 0);
    const prevGross = prev.reduce((s, o) => s + Number(o.amount || 0), 0);
    const net = gross * 0.95;
    const buyers = new Set(inRange.map(o => o.buyer_email ?? o.buyer_id).filter(Boolean));
    const prevBuyers = new Set(prev.map(o => o.buyer_email ?? o.buyer_id).filter(Boolean));
    const delta = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100);
    const conversion = buyers.size && inRange.length ? (buyers.size / Math.max(inRange.length, 1)) * 100 : 0;
    const prevConversion = prevBuyers.size && prev.length ? (prevBuyers.size / Math.max(prev.length, 1)) * 100 : 0;

    const daily: { d: string; v: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      daily.push({ d: k, v: orders.filter(o => o.created_at.slice(0, 10) === k).reduce((s, o) => s + Number(o.amount || 0), 0) });
    }

    return {
      gross, net, prevGross, buyers: buyers.size, sales: inRange.length,
      dGross: delta(gross, prevGross),
      dSales: delta(inRange.length, prev.length),
      dBuyers: delta(buyers.size, prevBuyers.size),
      conversion, dConversion: delta(conversion, prevConversion),
      daily,
    };
  }, [orders, range, isEmpty]);

  const topProducts = useMemo(() => {
    if (isEmpty) {
      return [
        { product: { id: "demo-1", name: "Notion Template Pack" } as Product, revenue: 3420, count: 152, growth: 24.5 },
        { product: { id: "demo-2", name: "UI/UX Design System" } as Product, revenue: 2180, count: 98, growth: 16.8 },
      ] as any;
    }
    const map = new Map<string, { product: Product; revenue: number; count: number }>();
    products.forEach(p => map.set(p.id, { product: p, revenue: 0, count: 0 }));
    orders.forEach(o => {
      const e = map.get(o.product_id);
      if (e) { e.revenue += Number(o.amount || 0); e.count += 1; }
    });
    return [...map.values()].filter(t => t.count > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  }, [orders, products, isEmpty]);

  const available = isEmpty ? 5680.5 : metrics.net;
  const pending = isEmpty ? 1240 : orders.filter(o => o.status === "pending").reduce((s, o) => s + Number(o.amount || 0), 0);
  const demoPayouts = [
    { last4: "4567", amount: 450, at: "Requested 18 Jul, 10:22" },
    { last4: "8421", amount: 420, at: "Requested 18 Jul, 09:15" },
    { last4: "1234", amount: 370, at: "Requested 17 Jul, 18:45" },
  ];
  const pendingPayouts = orders.filter(o => o.status === "pending").slice(0, 3);
  const demoOrders = [
    { id: "ORD-8421", buyer: "John Doe", at: "18 Jul, 14:20", amount: 49, status: "Completed" },
    { id: "ORD-8420", buyer: "Sarah Smith", at: "18 Jul, 13:15", amount: 79, status: "Completed" },
    { id: "ORD-8419", buyer: "Alex Johnson", at: "18 Jul, 12:05", amount: 29, status: "Completed" },
  ];
  const demoActivity = [
    { kind: "customer", title: "New customer registered", sub: "@johndoe", right: "", ago: "2m ago" },
    { kind: "sale", title: "Product sold", sub: "Notion Template Pack", right: "$49.00", ago: "" },
    { kind: "payout", title: "Payout initiated", sub: "To •••• 4567", right: "$450.00", ago: "8m ago" },
  ];

  const dateRangeLabel = useMemo(() => {
    const end = new Date();
    const start = new Date(); start.setDate(end.getDate() - (range - 1));
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
  }, [range]);

  return (
    <div className={`space-y-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      {/* Command header */}
      <header className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-br from-[#0b1120] via-[#0a0a12] to-[#0a0a0a] p-6 sm:p-8">
        <HeroDecor />
        <div className="relative flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/60">
              <Command className="size-3" />
              <span>Command Center</span>
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-70 animate-ping" />
                  <span className="relative rounded-full bg-emerald-400 size-1.5" />
                </span>
                Live
              </span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              {greeting()},
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {(store?.name ?? "operator").toLowerCase()}.
              </span>
            </h1>
            <p className="mt-3 text-sm text-neutral-400">Here's what's happening with your business today.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-neutral-400">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5">
                <Calendar className="size-3.5" />
                {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5">
                <Clock className="size-3.5" />
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex rounded-full border border-white/10 bg-white/[0.02] p-0.5">
                {[7, 30, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setRange(d as 7 | 30 | 90)}
                    className={`px-3 py-1 text-[11px] tracking-wide rounded-full transition-all ${
                      range === d ? "bg-white text-black font-medium" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] px-3 py-1.5 text-[12px] text-neutral-300">
                {dateRangeLabel}
                <ChevronDown className="size-3" />
              </button>
              <Link
                to="/business/products"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white transition hover:-translate-y-px"
                style={{
                  background: "linear-gradient(90deg, #4730D8 0%, #1F55F5 100%)",
                  boxShadow: "0 8px 24px -8px rgba(31,85,245,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <Plus className="size-3.5" /> New product
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stat tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Gross Revenue" value={`$${metrics.gross.toFixed(2)}`} delta={metrics.dGross}
          spark={metrics.daily.map(d => d.v)} icon={DollarSign} accent="from-blue-500/25 to-blue-500/5" iconClass="text-blue-300" strokeClass="stroke-blue-400" />
        <StatCard label="New Customers" value={metrics.buyers.toLocaleString()} delta={metrics.dBuyers}
          spark={metrics.daily.map(d => (d.v > 0 ? 1 : 0))} icon={Users} accent="from-purple-500/25 to-purple-500/5" iconClass="text-purple-300" strokeClass="stroke-purple-400" />
        <StatCard label="Orders" value={metrics.sales.toLocaleString()} delta={metrics.dSales}
          spark={metrics.daily.map((_, i) => orders.filter(o => o.created_at.slice(0, 10) === metrics.daily[i].d).length)} icon={ShoppingBag}
          accent="from-emerald-500/25 to-emerald-500/5" iconClass="text-emerald-300" strokeClass="stroke-emerald-400" />
        <StatCard label="Conversion Rate" value={`${metrics.conversion.toFixed(2)}%`} delta={metrics.dConversion}
          spark={metrics.daily.map(d => d.v)} icon={Target} accent="from-cyan-500/25 to-cyan-500/5" iconClass="text-cyan-300" strokeClass="stroke-cyan-400" />
      </section>

      {/* Revenue overview + Balance + Payouts */}
      <section className="grid gap-3 lg:grid-cols-12">
        <Panel className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-medium">Revenue Overview</h2>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[11px] text-neutral-400">
              This Week <ChevronDown className="size-3" />
            </button>
          </div>
          <RevenueChart daily={metrics.daily} />
        </Panel>

        <Panel className="lg:col-span-3 p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium">Total Balance</h2>
            <Link to="/business/payouts" className="text-[11px] text-neutral-400 hover:text-white">View all</Link>
          </div>
          <div className="mt-4 text-[11px] text-neutral-500">Available</div>
          <div className="text-3xl font-semibold tracking-tight tabular-nums text-white">${available.toFixed(2)}</div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="flex items-center gap-1.5 text-neutral-400"><span className="size-1.5 rounded-full bg-emerald-400" /> Available for payout</div>
              <div className="mt-1 text-white/90 tabular-nums">${available.toFixed(2)}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-neutral-400"><span className="size-1.5 rounded-full bg-amber-400" /> On hold</div>
              <div className="mt-1 text-white/90 tabular-nums">${pending.toFixed(2)}</div>
            </div>
          </div>
          <button
            className="mt-auto pt-6"
          >
            <div
              className="w-full inline-flex items-center justify-between rounded-xl px-4 py-3 text-[13px] font-medium text-white transition hover:-translate-y-px"
              style={{
                background: "linear-gradient(90deg, #4730D8 0%, #1F55F5 100%)",
                boxShadow: "0 8px 24px -8px rgba(31,85,245,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Withdraw funds
              <ArrowUpRight className="size-4" />
            </div>
          </button>
        </Panel>

        <Panel className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium">Payouts</h2>
            <Link to="/business/payouts" className="text-[11px] text-neutral-400 hover:text-white">View all</Link>
          </div>
          <div className="mt-4 text-[11px] text-neutral-500">Pending</div>
          <div className="text-3xl font-semibold tracking-tight tabular-nums text-white">${pending.toFixed(2)}</div>
          <div className="mt-1 text-[11px] text-neutral-500">{pendingPayouts.length} payout{pendingPayouts.length === 1 ? "" : "s"} pending</div>
          <div className="mt-4 space-y-2.5">
            {isEmpty ? demoPayouts.map((p) => (
              <div key={p.last4} className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-white/[0.04] border border-white/10 grid place-items-center">
                  <Landmark className="size-3.5 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-white truncate">Payout to •••• {p.last4}</div>
                  <div className="text-[10px] text-neutral-500">{p.at}</div>
                </div>
                <div className="text-[12px] tabular-nums text-white">${p.amount.toFixed(2)}</div>
              </div>
            )) : pendingPayouts.length === 0 ? (
              <div className="text-[11px] text-neutral-500">No pending payouts.</div>
            ) : pendingPayouts.map((o) => (
              <div key={o.id} className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-white/[0.04] border border-white/10 grid place-items-center">
                  <Landmark className="size-3.5 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-white truncate">Payout to •••• {String(o.id).slice(-4)}</div>
                  <div className="text-[10px] text-neutral-500">
                    Requested {new Date(o.created_at).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="text-[12px] tabular-nums text-white">${Number(o.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>

        </Panel>
      </section>

      {/* Top products + Recent orders + Live activity */}
      <section className="grid gap-3 lg:grid-cols-12">
        <Panel className="lg:col-span-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-medium">Top Products</h2>
            <Link to="/business/products" className="text-[11px] text-neutral-400 hover:text-white">View all</Link>
          </div>
          {topProducts.length === 0 ? (
            <EmptyLine text="No sales yet." />
          ) : (
            <div className="space-y-3.5">
              {topProducts.map((t) => (
                <div key={t.product.id} className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/10 grid place-items-center text-[13px] font-semibold">
                    {t.product.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{t.product.name}</div>
                    <div className="text-[10.5px] text-neutral-500">{t.count} Sales</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium tabular-nums">${t.revenue.toFixed(2)}</div>
                    <div className="text-[10.5px] text-emerald-400 tabular-nums">+{((t.revenue / Math.max(metrics.gross, 1)) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="lg:col-span-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-medium">Recent Orders</h2>
            <Link to="/business/orders" className="text-[11px] text-neutral-400 hover:text-white">View all</Link>
          </div>
          {orders.length === 0 ? (
            <EmptyLine text="No orders yet." />
          ) : (
            <div className="space-y-3.5">
              {orders.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-white/[0.04] border border-white/10 grid place-items-center">
                    <ShoppingBag className="size-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white truncate">#ORD-{String(o.id).slice(-4).toUpperCase()}</div>
                    <div className="text-[10.5px] text-neutral-500 truncate">{o.buyer_email ?? "Guest"}</div>
                  </div>
                  <div className="text-[10.5px] text-neutral-500 shrink-0">
                    {new Date(o.created_at).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-medium tabular-nums">${Number(o.amount).toFixed(2)}</div>
                    <div className={`text-[10.5px] tabular-nums ${o.status === "paid" ? "text-emerald-400" : o.status === "pending" ? "text-amber-400" : "text-neutral-500"}`}>
                      {o.status === "paid" ? "Completed" : o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="lg:col-span-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-medium">Live Activity</h2>
            <Link to="/business/analytics" className="text-[11px] text-neutral-400 hover:text-white">View all</Link>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 3).map((o, i) => {
              const p = products.find(p => p.id === o.product_id);
              const isCustomer = i % 3 === 0;
              const isSale = i % 3 === 1;
              return (
                <div key={o.id} className="flex items-start gap-3">
                  <div className={`size-8 rounded-lg border grid place-items-center shrink-0 ${
                    isCustomer ? "bg-purple-500/15 border-purple-500/25" :
                    isSale ? "bg-emerald-500/15 border-emerald-500/25" :
                    "bg-amber-500/15 border-amber-500/25"
                  }`}>
                    {isCustomer ? <UserPlus className="size-3.5 text-purple-300" /> :
                     isSale ? <Package className="size-3.5 text-emerald-300" /> :
                     <Landmark className="size-3.5 text-amber-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-white">
                      {isCustomer ? "New customer registered" : isSale ? "Product sold" : "Payout initiated"}
                    </div>
                    <div className="text-[10.5px] text-neutral-500 truncate">
                      {isCustomer ? (o.buyer_email ?? "guest") : isSale ? (p?.name ?? "Product") : `To •••• ${String(o.id).slice(-4)}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {isSale && <div className="text-[12px] tabular-nums text-white">${Number(o.amount).toFixed(2)}</div>}
                    <div className="text-[10px] text-neutral-500">{timeAgo(o.created_at)}</div>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-white/[0.04] border border-white/10 grid place-items-center shrink-0">
                  <Activity className="size-3.5 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0 text-[12px] text-neutral-500">Activity will appear here as your business grows.</div>
              </div>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

/* ----------------------------- primitives ----------------------------- */

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-[20px] border border-white/[0.06] bg-white/[0.015] ${className}`}>
      {children}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="text-[12px] text-neutral-500 py-4">{text}</div>;
}

function StatCard({
  label, value, delta, spark, icon: Icon, accent, iconClass, strokeClass,
}: {
  label: string; value: React.ReactNode; delta: number; spark: number[]; icon: any;
  accent: string; iconClass: string; strokeClass: string;
}) {
  const up = delta >= 0;
  return (
    <div className="group rounded-[18px] border border-white/[0.06] bg-white/[0.015] p-5 hover:border-white/[0.12] hover:bg-white/[0.025] transition">
      <div className="flex items-start gap-3">
        <div className={`size-9 rounded-full bg-gradient-to-br ${accent} border border-white/10 grid place-items-center shrink-0`}>
          <Icon className={`size-4 ${iconClass}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] text-neutral-400">{label}</div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="text-[22px] font-semibold tracking-tight tabular-nums text-white truncate">{value}</div>
            <MiniSpark values={spark} strokeClass={strokeClass} />
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px]">
        <span className={`inline-flex items-center ${up ? "text-emerald-400" : "text-rose-400"}`}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-neutral-500">vs last 7 days</span>
      </div>
    </div>
  );
}

function MiniSpark({ values, strokeClass }: { values: number[]; strokeClass: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const W = 70, H = 26;
  const pts = values.map((v, i) => `${(i / (values.length - 1 || 1)) * W},${H - (v / max) * H}`).join(" ");
  return (
    <svg width={W} height={H} className="overflow-visible shrink-0">
      <polyline fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} className={strokeClass} />
    </svg>
  );
}

function RevenueChart({ daily }: { daily: { d: string; v: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...daily.map(d => d.v), 1);
  const W = 800, H = 220;
  const padX = 30, padY = 20;
  const innerW = W - padX * 2, innerH = H - padY * 2;
  const x = (i: number) => padX + (i / (daily.length - 1 || 1)) * innerW;
  const y = (v: number) => padY + innerH - (v / max) * innerH;
  const pts = daily.map((d, i) => `${x(i)},${y(d.v)}`).join(" ");
  const area = `${padX},${padY + innerH} ${pts} ${x(daily.length - 1)},${padY + innerH}`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56" preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const rx = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((rx - padX) / innerW) * (daily.length - 1));
          setHover(Math.max(0, Math.min(daily.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id="revfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={i} x1={padX} x2={W - padX} y1={padY + (i / 4) * innerH} y2={padY + (i / 4) * innerH} stroke="white" strokeOpacity="0.05" />
        ))}
        <polygon points={area} fill="url(#revfill)" />
        <polyline points={pts} fill="none" stroke="rgb(96 165 250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={padY} y2={padY + innerH} stroke="white" strokeOpacity="0.15" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(daily[hover].v)} r="4" fill="rgb(59 130 246)" stroke="white" strokeWidth="1.5" />
          </>
        )}
      </svg>
      {hover !== null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none rounded-lg border border-white/10 bg-black/80 backdrop-blur px-2.5 py-1.5 text-[11px] whitespace-nowrap"
          style={{ left: `${(x(hover) / W) * 100}%`, top: `${((y(daily[hover].v) - 8) / H) * 100}%` }}
        >
          <div className="text-neutral-400">{new Date(daily[hover].d).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })}</div>
          <div className="text-white font-medium tabular-nums">${daily[hover].v.toFixed(2)}</div>
        </div>
      )}
      <div className="flex justify-between text-[10px] text-neutral-500 mt-2 px-6">
        {daily.map((d) => (
          <span key={d.d}>{new Date(d.d).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</span>
        ))}
      </div>
    </div>
  );
}

function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-70">
      <svg viewBox="0 0 600 320" className="w-full h-full">
        <defs>
          <linearGradient id="heroGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4c6ef5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cubeGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle cx="480" cy="160" r="180" fill="url(#heroGlow)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <path
            key={i}
            d={`M 100 ${60 + i * 40} Q 300 ${20 + i * 30} 600 ${100 + i * 25}`}
            fill="none"
            stroke="rgb(96 165 250)"
            strokeOpacity={0.08 + i * 0.02}
            strokeWidth="1"
          />
        ))}
        <g transform="translate(430 80)">
          <polygon points="60,0 120,30 60,60 0,30" fill="url(#cubeGlow)" opacity="0.9" />
          <polygon points="0,30 60,60 60,140 0,110" fill="#1e3a8a" opacity="0.7" />
          <polygon points="120,30 60,60 60,140 120,110" fill="#1e40af" opacity="0.85" />
          <polygon points="30,80 90,110 90,150 30,120" fill="#3b82f6" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
