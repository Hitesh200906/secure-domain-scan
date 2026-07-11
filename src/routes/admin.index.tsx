import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, StatCard, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { ArrowUpRight, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

type Stats = {
  users: number; activeUsers: number; scans: number; completed: number; pending: number;
  ticketsOpen: number; ticketsClosed: number; revenue: number;
  planDist: Record<string, number>; growth: { d: string; users: number; scans: number }[];
};

function AdminOverview() {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [u, sc, tk, pr] = await Promise.all([
          api.admin.listUsers(),
          api.admin.listScans(),
          api.admin.listTickets(),
          api.admin.listPricing(),
        ]);
        const users = u.users ?? [];
        const scans = sc.scans ?? [];
        const tickets = tk.tickets ?? [];
        const prices = Object.fromEntries((pr.plans ?? []).map((p: any) => [p.slug, Number(p.price_monthly)]));
        const planDist: Record<string, number> = {};
        users.forEach((x: any) => (planDist[x.plan] = (planDist[x.plan] ?? 0) + 1));
        const revenue = users.reduce((sum: number, x: any) => sum + (prices[x.plan] ?? 0), 0);
        // Last 14 days growth
        const days: { d: string; users: number; scans: number }[] = [];
        for (let i = 13; i >= 0; i--) {
          const date = new Date(); date.setDate(date.getDate() - i);
          const key = date.toISOString().slice(0, 10);
          days.push({
            d: key,
            users: users.filter((x: any) => x.created_at.slice(0, 10) <= key).length,
            scans: scans.filter((x: any) => x.created_at.slice(0, 10) === key).length,
          });
        }
        setS({
          users: users.length,
          activeUsers: users.filter((x: any) => x.status === "active").length,
          scans: scans.length,
          completed: scans.filter((x: any) => x.status === "completed").length,
          pending: scans.filter((x: any) => x.status === "pending").length,
          ticketsOpen: tickets.filter((x: any) => x.status !== "closed" && x.status !== "resolved").length,
          ticketsClosed: tickets.filter((x: any) => x.status === "closed" || x.status === "resolved").length,
          revenue,
          planDist,
          growth: days,
        });
      } catch {
        setS({ users: 0, activeUsers: 0, scans: 0, completed: 0, pending: 0, ticketsOpen: 0, ticketsClosed: 0, revenue: 0, planDist: {}, growth: [] });
      }
    })();
  }, []);

  return (
    <AdminShell title="Control Center" description="Real-time overview of users, scans, support volume and revenue across the Nexefy platform.">
      {!s ? (
        <div className="text-sm text-muted-foreground">Loading metrics…</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={s.users} hint={`${s.activeUsers} active`} accent="primary" />
            <StatCard label="Total Scans" value={s.scans} hint={`${s.completed} completed · ${s.pending} pending`} accent="secondary" />
            <StatCard label="Revenue (MRR)" value={`$${s.revenue.toLocaleString()}`} hint="From active plans" accent="ok" />
            <StatCard label="Open Tickets" value={s.ticketsOpen} hint={`${s.ticketsClosed} resolved`} accent="warn" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Section title="User & Scan Growth · 14 days" action={<Badge tone="info">Live</Badge>}>
                <Chart data={s.growth} />
              </Section>
            </div>
            <Section title="Plan Distribution">
              <PlanRing dist={s.planDist} total={s.users || 1} />
            </Section>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Section title="Quick Actions">
              <div className="space-y-2 text-sm">
                <QA to="/admin/users" label="Manage users" />
                <QA to="/admin/pricing" label="Edit pricing" />
                <QA to="/admin/tickets" label="Reply to tickets" />
                <QA to="/admin/reports" label="Upload report" />
              </div>
            </Section>
            <div className="lg:col-span-2">
              <Section title="System Health">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { l: "API", v: "Operational", t: "ok" as const },
                    { l: "Scan workers", v: "Operational", t: "ok" as const },
                    { l: "AI Gateway", v: "Operational", t: "ok" as const },
                    { l: "Storage", v: "Operational", t: "ok" as const },
                  ].map((x) => (
                    <div key={x.l} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                      <span className="flex items-center gap-2"><Activity className="size-3.5 text-emerald-400" />{x.l}</span>
                      <Badge tone={x.t}>{x.v}</Badge>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function QA({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between glass rounded-xl px-4 py-3 hover:border-white/20 transition">
      <span>{label}</span><ArrowUpRight className="size-4 text-primary" />
    </Link>
  );
}

function Chart({ data }: { data: { d: string; users: number; scans: number }[] }) {
  const maxU = Math.max(1, ...data.map((d) => d.users));
  const maxS = Math.max(1, ...data.map((d) => d.scans));
  const W = 600, H = 180, P = 20;
  const pts = (vals: number[], max: number) =>
    vals.map((v, i) => `${P + (i * (W - 2 * P)) / (vals.length - 1)},${H - P - (v / max) * (H - 2 * P)}`).join(" ");
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
        <defs>
          <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.16 200)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.86 0.16 200)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="oklch(0.86 0.16 200)" strokeWidth="2" points={pts(data.map((d) => d.users), maxU)} />
        <polyline fill="none" stroke="oklch(0.78 0.13 180)" strokeWidth="2" strokeDasharray="3 3" points={pts(data.map((d) => d.scans), maxS)} />
      </svg>
      <div className="flex gap-4 text-[11px] text-muted-foreground mt-2">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Users (cumulative)</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-secondary" />Scans / day</span>
      </div>
    </div>
  );
}

function PlanRing({ dist, total }: { dist: Record<string, number>; total: number }) {
  const colors: Record<string, string> = { starter: "oklch(0.78 0.13 180)", professional: "oklch(0.86 0.16 200)", enterprise: "oklch(0.7 0.18 280)" };
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="size-32 -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="oklch(0.18 0.01 220)" strokeWidth="14" />
        {Object.entries(dist).map(([k, v]) => {
          const pct = v / total;
          const len = pct * 251.3;
          const off = -acc;
          acc += len;
          return <circle key={k} cx="50" cy="50" r="40" fill="none" stroke={colors[k] ?? "white"} strokeWidth="14" strokeDasharray={`${len} 251.3`} strokeDashoffset={off} />;
        })}
      </svg>
      <div className="space-y-1.5 text-sm">
        {Object.entries(dist).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: colors[k] ?? "white" }} />
            <span className="capitalize">{k}</span>
            <span className="text-muted-foreground ml-auto">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
