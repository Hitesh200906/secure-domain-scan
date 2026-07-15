import { useStore } from "@/lib/store-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DollarSign, ShoppingBag, Users, TrendingUp, Package, Wallet, Bell, Plus,
  ArrowUpRight, ArrowDownRight, Sparkles, CreditCard, Activity, Zap, Eye, Target,
  Lightbulb, Rocket, Store as StoreIcon, Heart, LineChart, Cog, Globe2, Check,
  Command, Radio,
} from "lucide-react";
import type { Order, Product } from "@/lib/business";
import { getStoreOrders, getStoreProducts } from "@/lib/business";

export const Route = createFileRoute("/business/")({
  component: BusinessDashboard,
});

/* ----------------------------- data ----------------------------- */

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

    const todayKey = new Date().toISOString().slice(0, 10);
    const yKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today = orders.filter(o => o.created_at.slice(0, 10) === todayKey).reduce((s, o) => s + Number(o.amount || 0), 0);
    const yesterday = orders.filter(o => o.created_at.slice(0, 10) === yKey).reduce((s, o) => s + Number(o.amount || 0), 0);

    const hourly: number[] = Array(24).fill(0);
    orders.forEach(o => {
      if (o.created_at.slice(0, 10) === todayKey) {
        const h = new Date(o.created_at).getHours();
        hourly[h] += Number(o.amount || 0);
      }
    });

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

  // Journey progress derived from real state
  const journeyStep = useMemo(() => {
    if (!store) return 0;
    if (products.length === 0) return 1; // launched store, no product
    if (orders.length === 0) return 2;   // has product, no sale
    if (orders.length < 10) return 3;    // acquiring customers
    if ((store.member_count ?? 0) < 100) return 4; // community building
    if (metrics.gross < 10000) return 5; // scaling revenue
    return 6;                            // automating / global
  }, [store, products.length, orders.length, metrics.gross]);

  return (
    <div
      className={`space-y-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {/* Command header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <Command className="size-3" />
            <span>Command Center</span>
            <span className="mx-1 size-1 rounded-full bg-white/20" />
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-70 animate-ping" />
                <span className="relative rounded-full bg-emerald-400 size-1.5" />
              </span>
              Live
            </span>
          </div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-white/95">
            {greeting()}, <span className="text-white/50">{store?.name?.split(" ")[0] ?? "operator"}.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-full border border-white/10 p-0.5">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setRange(d as 7 | 30 | 90)}
                className={`px-3.5 py-1.5 text-[11px] tracking-wide rounded-full transition-all duration-200 ${
                  range === d ? "bg-white text-black font-medium" : "text-muted-foreground hover:text-white"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <Link
            to="/business/products"
            className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-[13px] font-medium hover:bg-white/90 transition"
          >
            <Plus className="size-3.5" /> New product
          </Link>
        </div>
      </header>

      {/* Hero bento: revenue + balance */}
      <section className="grid gap-4 lg:grid-cols-12">
        {/* Revenue */}
        <Panel className="lg:col-span-8 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap items-end gap-10">
              <div>
                <Eyebrow>Gross revenue · today</Eyebrow>
                <div className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums">
                  ${metrics.today.toFixed(2)}
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} local
                </div>
              </div>
              <div>
                <Eyebrow>Yesterday</Eyebrow>
                <div className="mt-2 text-2xl font-medium text-white/40 tabular-nums">
                  ${metrics.yesterday.toFixed(2)}
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">24h prior</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-emerald-400/90">
              <Radio className="size-3" /> Streaming
            </span>
          </div>

          <div className="mt-8">
            <LiveChart hourly={metrics.hourly} />
            <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-2 tracking-wider">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
            </div>
          </div>
        </Panel>

        {/* Balance */}
        <Panel className="lg:col-span-4 p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between">
            <Eyebrow>Total balance</Eyebrow>
            <Link to="/business/payouts" className="text-[11px] text-white/50 hover:text-white transition">View</Link>
          </div>
          <div className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
            ${available.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground tabular-nums">
            ${available.toFixed(2)} available
          </div>

          <button className="mt-6 group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm hover:bg-white/[0.05] hover:border-white/20 transition">
            <CreditCard className="size-4 text-white/70" />
            <span>Spend instantly</span>
            <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <div className="mt-auto pt-6 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <Eyebrow>Payouts pending</Eyebrow>
              <Link to="/business/payouts" className="text-[11px] text-white/50 hover:text-white transition">View</Link>
            </div>
            <div className="mt-2 text-xl font-medium tabular-nums">${pending.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              {orders.filter(o => o.status === "pending").length} order{orders.filter(o => o.status === "pending").length === 1 ? "" : "s"}
            </div>
          </div>
        </Panel>
      </section>

      {/* Stats grid */}
      <section>
        <SectionHeader
          eyebrow="Metrics"
          title="Performance"
          hint={`Last ${range} days vs previous period`}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            label="Gross revenue"
            value={`$${metrics.gross.toFixed(2)}`}
            delta={metrics.dGross}
            spark={metrics.daily.map(d => d.v)}
            icon={DollarSign}
          />
          <StatTile
            label="Net revenue"
            value={`$${metrics.net.toFixed(2)}`}
            delta={metrics.dGross}
            spark={metrics.daily.map(d => d.v * 0.95)}
            icon={TrendingUp}
          />
          <StatTile
            label="Sales"
            value={metrics.sales}
            delta={metrics.dSales}
            spark={metrics.daily.map((_, i) => orders.filter(o => o.created_at.slice(0, 10) === metrics.daily[i].d).length)}
            icon={ShoppingBag}
          />
          <StatTile
            label="New customers"
            value={metrics.buyers}
            delta={metrics.dBuyers}
            spark={metrics.daily.map(d => (d.v > 0 ? 1 : 0))}
            icon={Users}
          />
        </div>
      </section>

      {/* Growth journey */}
      <section>
        <SectionHeader
          eyebrow="Trajectory"
          title="Business growth journey"
          hint="Where you are, and what unlocks next"
        />
        <JourneyRail step={journeyStep} />
      </section>

      {/* Top products + AI insights */}
      <section className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-7 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <Eyebrow>Catalog</Eyebrow>
              <h2 className="mt-1 text-lg font-medium">Top products</h2>
            </div>
            <Link to="/business/products" className="text-[11px] text-white/50 hover:text-white transition">
              Manage →
            </Link>
          </div>
          {topProducts.length === 0 || topProducts.every(t => t.count === 0) ? (
            <EmptyHint icon={Package} title="No sales yet" hint="Once your products start selling, your top performers will appear here." />
          ) : (
            <div className="space-y-1">
              {topProducts.map((t, i) => {
                const max = Math.max(...topProducts.map(x => x.revenue), 1);
                const pct = (t.revenue / max) * 100;
                return (
                  <div
                    key={t.product.id}
                    className="group relative overflow-hidden rounded-xl px-3 py-3 hover:bg-white/[0.02] transition"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-white/[0.04] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center gap-3">
                      <div className="size-7 rounded-lg border border-white/10 grid place-items-center text-[11px] font-medium text-white/70 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{t.product.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {t.count} {t.count === 1 ? "sale" : "sales"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium tabular-nums">${t.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel className="lg:col-span-5 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="size-3.5 text-white/70" />
            <Eyebrow>AI insights</Eyebrow>
          </div>
          <div className="space-y-4">
            <Insight
              icon={Target}
              text={
                metrics.dGross >= 0
                  ? `Revenue is up ${metrics.dGross.toFixed(0)}% — your momentum is building.`
                  : `Revenue is down ${Math.abs(metrics.dGross).toFixed(0)}%. Consider a flash promo.`
              }
            />
            <Insight
              icon={Zap}
              text={
                topProducts[0]?.count
                  ? `"${topProducts[0].product.name}" is your hero — feature it on your storefront.`
                  : "Pin a featured product to your storefront to boost discovery."
              }
            />
            <Insight
              icon={Eye}
              text={`Average order value: $${metrics.aov.toFixed(2)} ${metrics.dAov >= 0 ? "↑" : "↓"} ${Math.abs(metrics.dAov).toFixed(0)}%`}
            />
          </div>
          <Link
            to="/business/analytics"
            className="mt-6 inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition"
          >
            See full analytics <ArrowUpRight className="size-3" />
          </Link>
        </Panel>
      </section>

      {/* Recent activity + quick actions */}
      <section className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-8 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="size-3.5 text-white/70" />
              <div>
                <Eyebrow>Feed</Eyebrow>
                <h2 className="mt-0.5 text-lg font-medium">Recent activity</h2>
              </div>
            </div>
            <Link to="/business/orders" className="text-[11px] text-white/50 hover:text-white transition">
              View all →
            </Link>
          </div>
          {orders.length === 0 ? (
            <EmptyHint icon={ShoppingBag} title="No orders yet" hint="Share your storefront link to receive your first sale." />
          ) : (
            <ol className="relative">
              {orders.slice(0, 6).map((o, i, arr) => {
                const p = products.find(p => p.id === o.product_id);
                const isLast = i === arr.length - 1;
                return (
                  <li key={o.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {!isLast && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-white/[0.06]" />}
                    <div className="relative size-8 shrink-0 rounded-full border border-white/10 bg-white/[0.02] grid place-items-center text-[11px] font-medium">
                      {(o.buyer_email ?? "G")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{o.buyer_email ?? "Guest"}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {p?.name ?? "Product"} · {new Date(o.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium tabular-nums">${Number(o.amount).toFixed(2)}</div>
                        <StatusPill status={o.status} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>

        <div className="lg:col-span-4 space-y-4">
          <Panel className="p-6">
            <Eyebrow>Quick actions</Eyebrow>
            <div className="mt-4 grid gap-1.5">
              <QA to="/business/products" label="Add a product" icon={Package} />
              <QA to="/business/store" label="Edit storefront" icon={Sparkles} />
              <QA to="/business/payouts" label="Set up payouts" icon={Wallet} />
              {store?.slug && (
                <a
                  href={`/${store.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/[0.03] hover:border-white/15 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Eye className="size-4 text-white/50" />
                    View public store
                  </span>
                  <ArrowUpRight className="size-3.5 text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center gap-2">
              <Bell className="size-3.5 text-white/70" />
              <Eyebrow>Notifications</Eyebrow>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">You&apos;re all caught up.</div>
          </Panel>
        </div>
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

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-[20px] border border-white/[0.07] bg-white/[0.015] transition-colors ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">{children}</div>
  );
}

function SectionHeader({ eyebrow, title, hint }: { eyebrow: string; title: string; hint?: string }) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-1 text-xl font-medium tracking-tight">{title}</h2>
      </div>
      {hint && <div className="text-[11px] text-muted-foreground text-right">{hint}</div>}
    </div>
  );
}

function StatTile({ label, value, delta, spark, icon: Icon }: {
  label: string; value: React.ReactNode; delta: number; spark: number[]; icon: any;
}) {
  const up = delta >= 0;
  return (
    <div className="group rounded-[18px] border border-white/[0.07] bg-white/[0.015] p-5 hover:border-white/[0.12] hover:bg-white/[0.025] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-white/50">{label}</div>
        <Icon className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`inline-flex items-center gap-0.5 text-[11px] tabular-nums ${up ? "text-emerald-400/90" : "text-rose-400/90"}`}>
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
      <polyline
        fill="none"
        stroke={up ? "rgb(52 211 153 / 0.9)" : "rgb(251 113 133 / 0.9)"}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

function LiveChart({ hourly }: { hourly: number[] }) {
  const max = Math.max(...hourly, 1);
  const W = 800, H = 160;
  const hasData = hourly.some(v => v > 0);
  const pts = hourly.map((v, i) => `${(i / 23) * W},${H - (v / max) * (H - 12) - 6}`).join(" ");
  const area = `0,${H} ${pts} ${W},${H}`;
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(255 255 255)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1="0" x2={W}
            y1={(i / 4) * H} y2={(i / 4) * H}
            stroke="white" strokeOpacity="0.04"
          />
        ))}
        {hasData && (
          <>
            <polygon points={area} fill="url(#rg)" />
            <polyline points={pts} fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      {!hasData && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[11px] text-muted-foreground border border-white/10 px-3 py-1 rounded-full">
            No data yet today
          </span>
        </div>
      )}
    </div>
  );
}

function Insight({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="size-3.5 mt-1 text-white/50 shrink-0" />
      <span className="text-white/80 leading-relaxed">{text}</span>
    </div>
  );
}

function QA({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/[0.03] hover:border-white/15 transition"
    >
      <span className="flex items-center gap-2.5">
        <Icon className="size-4 text-white/50" />
        {label}
      </span>
      <ArrowUpRight className="size-3.5 text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "text-emerald-400 border-emerald-400/20",
    pending: "text-amber-400 border-amber-400/20",
    refunded: "text-rose-400 border-rose-400/20",
  };
  return (
    <span className={`inline-block text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1 ${map[status] ?? "text-muted-foreground border-white/10"}`}>
      {status}
    </span>
  );
}

function EmptyHint({ icon: Icon, title, hint }: { icon: any; title: string; hint: string }) {
  return (
    <div className="text-center py-12">
      <div className="inline-grid size-11 place-items-center rounded-2xl border border-white/[0.07]">
        <Icon className="size-4 text-white/40" />
      </div>
      <div className="mt-4 text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{hint}</div>
    </div>
  );
}

/* ----------------------------- journey rail ----------------------------- */

const JOURNEY = [
  { icon: Lightbulb, label: "Idea" },
  { icon: StoreIcon, label: "Store" },
  { icon: Rocket, label: "Launch" },
  { icon: Users, label: "Customers" },
  { icon: Heart, label: "Community" },
  { icon: LineChart, label: "Scale" },
  { icon: Cog, label: "Automate" },
  { icon: Globe2, label: "Global" },
];

function JourneyRail({ step }: { step: number }) {
  const pct = Math.min(1, step / (JOURNEY.length - 1));
  return (
    <Panel className="p-6 sm:p-8">
      <div className="relative">
        {/* rail */}
        <div className="absolute left-0 right-0 top-5 h-px bg-white/[0.06]" />
        <div
          className="absolute left-0 top-5 h-px bg-white/60 transition-all duration-700"
          style={{ width: `${pct * 100}%` }}
        />
        <ol className="relative grid grid-cols-4 md:grid-cols-8 gap-y-6">
          {JOURNEY.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const Icon = s.icon;
            return (
              <li key={s.label} className="flex flex-col items-center text-center group">
                <div
                  className={`relative z-10 size-10 rounded-full grid place-items-center border transition-all duration-300 ${
                    active
                      ? "bg-white text-black border-white scale-105"
                      : done
                      ? "bg-white/[0.08] border-white/40 text-white"
                      : "bg-background border-white/10 text-white/40 group-hover:border-white/25 group-hover:text-white/70"
                  }`}
                >
                  {done && !active ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <div className={`mt-2 text-[11px] tracking-wide ${active ? "text-white" : done ? "text-white/70" : "text-white/40"}`}>
                  {s.label}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Panel>
  );
}
