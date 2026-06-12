import { useStore } from "@/lib/store-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DollarSign, ShoppingBag, Users, TrendingUp, Package, Wallet, Bell, Plus,
  ArrowUpRight, ArrowDownRight, Sparkles, CreditCard, Activity, Zap, Eye, Target,
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

  useEffect(() => {
    if (!store) return;
    getStoreOrders(store.id).then(setOrders);
    getStoreProducts(store.id).then(setProducts);
  }, [store]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const metrics = useMemo(() => {
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
    const aov = inRange.length ? gross / inRange.length : 0;
    const prevAov = prev.length ? prevGross / prev.length : 0;
    const delta = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100);

    // today + yesterday
    const todayKey = new Date().toISOString().slice(0, 10);
    const yKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today = orders.filter(o => o.created_at.slice(0, 10) === todayKey).reduce((s, o) => s + Number(o.amount || 0), 0);
    const yesterday = orders.filter(o => o.created_at.slice(0, 10) === yKey).reduce((s, o) => s + Number(o.amount || 0), 0);

    // sparkline: hourly today
    const hourly: number[] = Array(24).fill(0);
    orders.forEach(o => {
      if (o.created_at.slice(0, 10) === todayKey) {
        const h = new Date(o.created_at).getHours();
        hourly[h] += Number(o.amount || 0);
      }
    });

    // daily for range
    const daily: { d: string; v: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      daily.push({ d: k, v: orders.filter(o => o.created_at.slice(0, 10) === k).reduce((s, o) => s + Number(o.amount || 0), 0) });
    }

    return {
      gross, prevGross, net, aov, prevAov,
      sales: inRange.length, prevSales: prev.length,
      buyers: buyers.size, prevBuyers: prevBuyers.size,
      today, yesterday, hourly, daily,
      dGross: delta(gross, prevGross),
      dSales: delta(inRange.length, prev.length),
      dBuyers: delta(buyers.size, prevBuyers.size),
      dAov: delta(aov, prevAov),
    };
  }, [orders, range]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { product: Product; revenue: number; count: number }>();
    products.forEach(p => map.set(p.id, { product: p, revenue: 0, count: 0 }));
    orders.forEach(o => {
      const e = map.get(o.product_id);
      if (e) { e.revenue += Number(o.amount || 0); e.count += 1; }
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders, products]);

  const available = metrics.net;
  const pending = orders.filter(o => o.status === "pending").reduce((s, o) => s + Number(o.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Dashboard</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Today</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · Live
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-white/[0.04] border border-white/10 p-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setRange(d as any)}
                className={`px-3 py-1.5 text-xs rounded-full transition ${range === d ? "bg-white text-black font-medium" : "text-muted-foreground hover:text-white"}`}>
                {d}d
              </button>
            ))}
          </div>
          <Link to="/business/products" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:opacity-90 transition">
            <Plus className="size-4" /> New product
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Live chart */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-12">
              <div>
                <div className="text-xs text-muted-foreground">Gross revenue</div>
                <div className="mt-1 text-3xl font-semibold">${metrics.today.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
                <div className="mt-1 text-3xl font-semibold text-muted-foreground">${metrics.yesterday.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">24h prior</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </div>
          </div>
          <LiveChart hourly={metrics.hourly} />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>12:00 AM</span><span>6:00 AM</span><span>12:00 PM</span><span>6:00 PM</span><span>11:59 PM</span>
          </div>
        </div>

        {/* Balance card */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-white/[0.03] to-transparent border border-white/10 p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total balance</span>
            <Link to="/business/payouts" className="text-xs text-primary hover:underline">View</Link>
          </div>
          <div className="mt-2 text-4xl font-semibold">${available.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">${available.toFixed(2)} available</div>

          <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2.5 text-sm font-medium transition">
            <CreditCard className="size-4" /> Spend instantly with Cards
          </button>

          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Payouts</span>
              <Link to="/business/payouts" className="text-xs text-primary hover:underline">View</Link>
            </div>
            <div className="mt-2 text-xl font-semibold">${pending.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">{orders.filter(o => o.status === "pending").length} pending</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">Stats</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last {range} days compared to previous period</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label="Gross revenue" value={`$${metrics.gross.toFixed(2)}`} delta={metrics.dGross} spark={metrics.daily.map(d => d.v)} icon={DollarSign} />
          <StatTile label="Net revenue" value={`$${metrics.net.toFixed(2)}`} delta={metrics.dGross} spark={metrics.daily.map(d => d.v * 0.95)} icon={TrendingUp} />
          <StatTile label="Sales" value={metrics.sales} delta={metrics.dSales} spark={metrics.daily.map((_, i) => orders.filter(o => o.created_at.slice(0, 10) === metrics.daily[i].d).length)} icon={ShoppingBag} />
          <StatTile label="New customers" value={metrics.buyers} delta={metrics.dBuyers} spark={metrics.daily.map(d => d.v > 0 ? 1 : 0)} icon={Users} />
        </div>
      </div>

      {/* Secondary panels */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Top products */}
        <div className="lg:col-span-2 rounded-3xl bg-white/[0.02] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Top products</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Best sellers in the last {range} days</p>
            </div>
            <Link to="/business/products" className="text-xs text-muted-foreground hover:text-white">Manage →</Link>
          </div>
          {topProducts.length === 0 || topProducts.every(t => t.count === 0) ? (
            <EmptyHint icon={Package} title="No sales yet" hint="Once your products start selling, your top performers will appear here." />
          ) : (
            <div className="space-y-2">
              {topProducts.map((t, i) => {
                const max = Math.max(...topProducts.map(x => x.revenue), 1);
                const pct = (t.revenue / max) * 100;
                return (
                  <div key={t.product.id} className="group relative overflow-hidden rounded-xl border border-white/5 p-3">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/15 to-transparent transition-all" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-white/10 grid place-items-center text-xs font-semibold">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{t.product.name}</div>
                        <div className="text-xs text-muted-foreground">{t.count} {t.count === 1 ? "sale" : "sales"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${t.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="rounded-3xl bg-gradient-to-br from-violet-500/15 via-white/[0.02] to-transparent border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-violet-300" />
            <span className="text-xs uppercase tracking-wider text-violet-200">AI Insights</span>
          </div>
          <div className="space-y-3">
            <Insight icon={Target} text={metrics.dGross >= 0
              ? `Revenue is up ${metrics.dGross.toFixed(0)}% — your momentum is building.`
              : `Revenue is down ${Math.abs(metrics.dGross).toFixed(0)}%. Consider a flash promo.`} />
            <Insight icon={Zap} text={topProducts[0]?.count
              ? `“${topProducts[0].product.name}” is your hero — feature it on your storefront.`
              : "Pin a featured product to your storefront to boost discovery."} />
            <Insight icon={Eye} text={`Average order value: $${metrics.aov.toFixed(2)} ${metrics.dAov >= 0 ? "↑" : "↓"} ${Math.abs(metrics.dAov).toFixed(0)}%`} />
          </div>
          <Link to="/business/analytics" className="mt-4 inline-flex items-center gap-1 text-xs text-violet-200 hover:text-white">
            See full analytics <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Recent activity + quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl bg-white/[0.02] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Recent activity</h2>
            </div>
            <Link to="/business/orders" className="text-xs text-muted-foreground hover:text-white">View all →</Link>
          </div>
          {orders.length === 0 ? (
            <EmptyHint icon={ShoppingBag} title="No orders yet" hint="Share your storefront link to receive your first sale." />
          ) : (
            <div className="divide-y divide-white/5">
              {orders.slice(0, 6).map((o) => {
                const p = products.find(p => p.id === o.product_id);
                return (
                  <div key={o.id} className="flex items-center gap-3 py-3 text-sm">
                    <div className="size-9 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 grid place-items-center text-xs font-semibold">
                      {(o.buyer_email ?? "G")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{o.buyer_email ?? "Guest"}</div>
                      <div className="text-xs text-muted-foreground truncate">{p?.name ?? "Product"} · {new Date(o.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${Number(o.amount).toFixed(2)}</div>
                      <StatusPill status={o.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6">
            <h2 className="text-sm font-semibold mb-3">Quick actions</h2>
            <div className="grid gap-2">
              <QA to="/business/products" label="Add a product" icon={Package} />
              <QA to="/business/store" label="Edit storefront" icon={Sparkles} />
              <QA to="/business/payouts" label="Set up payouts" icon={Wallet} />
              <a href={`/${store.slug}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5 transition">
                <span className="flex items-center gap-2"><Eye className="size-4 text-muted-foreground" />View public store</span>
                <ArrowUpRight className="size-3.5 text-muted-foreground" />
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Notifications</h2>
            </div>
            <div className="text-xs text-muted-foreground">You're all caught up.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, delta, spark, icon: Icon }: { label: string; value: any; delta: number; spark: number[]; icon: any }) {
  const up = delta >= 0;
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="mt-1 flex items-center justify-between">
        <span className={`inline-flex items-center gap-0.5 text-xs ${up ? "text-emerald-400" : "text-rose-400"}`}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(delta).toFixed(0)}%
        </span>
        <Sparkline values={spark} up={up} />
      </div>
    </div>
  );
}

function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const W = 70, H = 22;
  const pts = values.map((v, i) => `${(i / (values.length - 1 || 1)) * W},${H - (v / max) * H}`).join(" ");
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline fill="none" stroke={up ? "rgb(52 211 153)" : "rgb(251 113 133)"} strokeWidth="1.5" points={pts} />
    </svg>
  );
}

function LiveChart({ hourly }: { hourly: number[] }) {
  const max = Math.max(...hourly, 1);
  const W = 800, H = 160;
  const hasData = hourly.some(v => v > 0);
  const pts = hourly.map((v, i) => `${(i / 23) * W},${H - (v / max) * (H - 10) - 5}`).join(" ");
  const area = `0,${H} ${pts} ${W},${H}`;
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
        <defs>
          <linearGradient id="rg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.16 200)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.86 0.16 200)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={(i / 23) * W} x2={(i / 23) * W} y1="0" y2={H} stroke="white" strokeOpacity="0.03" />
        ))}
        {hasData && <>
          <polygon points={area} fill="url(#rg)" />
          <polyline points={pts} fill="none" stroke="oklch(0.86 0.16 200)" strokeWidth="2" />
        </>}
      </svg>
      {!hasData && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">No data yet today</span>
        </div>
      )}
    </div>
  );
}

function Insight({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="size-3.5 mt-0.5 text-violet-300 shrink-0" />
      <span className="text-white/80 leading-relaxed">{text}</span>
    </div>
  );
}

function QA({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5 transition">
      <span className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" />{label}</span>
      <ArrowUpRight className="size-3.5 text-muted-foreground" />
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "text-emerald-400 bg-emerald-400/10",
    pending: "text-amber-400 bg-amber-400/10",
    refunded: "text-rose-400 bg-rose-400/10",
  };
  return <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded mt-0.5 ${map[status] ?? "text-muted-foreground bg-white/5"}`}>{status}</span>;
}

function EmptyHint({ icon: Icon, title, hint }: { icon: any; title: string; hint: string }) {
  return (
    <div className="text-center py-10">
      <Icon className="size-8 mx-auto text-muted-foreground/40" />
      <div className="mt-3 text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{hint}</div>
    </div>
  );
}
