import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Nexus Security" }],
  }),
  component: Dashboard,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard", label: "Scans", icon: Search },
  { to: "/dashboard", label: "Reports", icon: FileText },
  { to: "/dashboard", label: "Billing", icon: CreditCard },
  { to: "/dashboard", label: "Settings", icon: Settings },
];

function Dashboard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[oklch(0.04_0.008_220)]">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-primary" />
            <span className="text-[13px] font-semibold tracking-[0.2em]">
              NEXUS<span className="text-muted-foreground ml-1.5">SEC</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((n, i) => (
            <button
              key={n.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                i === 0
                  ? "bg-white/[0.06] text-white"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">Professional Plan</div>
            <div className="text-sm mt-1">12 scans remaining</div>
            <Link
              to="/pricing"
              className="mt-3 block text-xs text-primary hover:underline"
            >
              Upgrade plan →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="text-xs text-muted-foreground">{pathname}</div>
              <h1 className="text-xl font-medium tracking-tight">Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden sm:inline-flex items-center gap-2 rounded-full glass px-3.5 py-2 text-xs text-muted-foreground">
                <Search className="size-3.5" /> Search
                <kbd className="font-mono text-[10px] text-muted-foreground border border-white/10 rounded px-1">
                  ⌘K
                </kbd>
              </button>
              <button className="rounded-full bg-white text-black px-4 py-2 text-xs font-medium">
                New Scan
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Security Score", value: "72", delta: "+6", glow: true },
              { label: "Open Findings", value: "47", delta: "-12" },
              { label: "Scans This Month", value: "18", delta: "+4" },
              { label: "Avg. Resolve Time", value: "3.2d", delta: "-0.8d" },
            ].map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-5"
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {k.label}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div
                    className={`text-3xl font-semibold tracking-tight ${
                      k.glow ? "text-gradient-accent" : "text-white"
                    }`}
                  >
                    {k.value}
                  </div>
                  <div className="text-xs text-emerald-400">{k.delta}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Security Score
                  </div>
                  <div className="mt-1 text-lg font-medium">Last 30 days</div>
                </div>
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <SparkChart />
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Risk Distribution
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Critical", val: 3, color: "oklch(0.65 0.22 25)" },
                  { label: "High", val: 8, color: "oklch(0.78 0.17 50)" },
                  { label: "Medium", val: 14, color: "oklch(0.85 0.16 90)" },
                  { label: "Low", val: 22, color: "oklch(0.75 0.13 180)" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-mono">{r.val}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(r.val / 22) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ background: r.color }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent scans + Activity */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
                <div className="text-sm font-medium">Recent Scans</div>
                <button className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1">
                  View all <ArrowUpRight className="size-3" />
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="text-left font-normal px-6 py-3">Target</th>
                    <th className="text-left font-normal py-3">Status</th>
                    <th className="text-left font-normal py-3">Score</th>
                    <th className="text-right font-normal px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { t: "acme-fintech.com", s: "Completed", score: 72 },
                    { t: "api.lendwise.io", s: "Completed", score: 88 },
                    { t: "shop.quill.dev", s: "In Progress", score: null },
                    { t: "internal-admin.northwave.co", s: "Completed", score: 64 },
                    { t: "halcyon.ai", s: "Queued", score: null },
                  ].map((r) => (
                    <tr
                      key={r.t}
                      className="border-t border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-3.5 font-mono text-xs">{r.t}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full glass ${
                            r.s === "Completed"
                              ? "text-emerald-400"
                              : r.s === "In Progress"
                                ? "text-primary"
                                : "text-muted-foreground"
                          }`}
                        >
                          {r.s}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs">
                        {r.score ? `${r.score}/100` : "—"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button className="text-muted-foreground hover:text-white">
                          <Download className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Activity</div>
                <Activity className="size-4 text-muted-foreground" />
              </div>
              <ul className="mt-4 space-y-4">
                {[
                  { t: "Scan completed for acme-fintech.com", m: "2m ago" },
                  { t: "Critical finding resolved · VLN-2026-0421", m: "1h ago" },
                  { t: "Report rpt_8420 downloaded", m: "3h ago" },
                  { t: "Continuous scan started · halcyon.ai", m: "Yesterday" },
                  { t: "Plan upgraded to Professional", m: "2d ago" },
                ].map((a) => (
                  <li key={a.t} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <div className="text-sm text-white/90">{a.t}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {a.m}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkChart() {
  const data = [42, 48, 52, 50, 55, 60, 58, 63, 68, 65, 70, 72];
  const max = 100;
  const w = 600;
  const h = 180;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-5 w-full h-44">
      <defs>
        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00C2A8" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1="0"
          x2={w}
          y1={h * p}
          y2={h * p}
          stroke="white"
          strokeOpacity={0.04}
        />
      ))}
      <polygon points={area} fill="url(#area)" />
      <polyline
        points={points}
        fill="none"
        stroke="url(#line)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={h - (v / max) * h}
          r={i === data.length - 1 ? 4 : 0}
          fill="#00E5FF"
        />
      ))}
    </svg>
  );
}
