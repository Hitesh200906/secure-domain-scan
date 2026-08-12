import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, CheckCircle2, Clock,
  CreditCard, Globe2, LayoutDashboard, LogOut, ScanSearch, Settings,
  Shield, ShieldAlert, TrendingUp, User as UserIcon,
  Zap, ArrowUpRight, Search, Wifi, FileText, Eye, Menu, X, UploadCloud,
  Building2, Mail, BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import nexusLogo from "@/assets/nexefy-logo.png";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Security Dashboard — Nexefy Sec" },
      { name: "description", content: "Track scan reports, security posture, findings and live threat activity across your monitored assets." },
      { property: "og:title", content: "Security Dashboard — Nexefy Sec" },
      { property: "og:description", content: "Track scan reports, security posture, findings and live threat activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

import {
  type Scan, type ReportModel, ACTIVE_KEY, buildReport, DEMO_REPORT, scoreColor,
} from "@/lib/report-model";



/* --------------------------------- page --------------------------------- */
function Dashboard() {
  const { user } = useAuth();
  const { role } = useAdmin();

  const [scans, setScans] = useState<Scan[]>([]);
  const [profile, setProfile] = useState<{ plan: string; credits: number; full_name: string | null } | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [view, setView] = useState<"overview" | "reports">("overview");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveId(localStorage.getItem(ACTIVE_KEY));
  }, []);

  useEffect(() => {
    if (!user) return;
    api.listScans().then(({ scans }) => setScans((scans as Scan[]) ?? [])).catch(() => setScans([]));
    api.profile().then(({ profile }) => profile && setProfile(profile)).catch(() => undefined);
  }, [user]);

  useEffect(() => {
    setTime(new Date());
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const report = useMemo<ReportModel>(() => {
    if (!scans.length) return DEMO_REPORT;
    const picked = (activeId && scans.find((s) => s.id === activeId)) || scans[0];
    return buildReport(picked);
  }, [scans, activeId]);

  const uploadReport = (id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
    setView("overview");
  };

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Workspace</div>
      <SidebarButton icon={LayoutDashboard} label="Overview" active={view === "overview"} onClick={() => { setView("overview"); onNav?.(); }} />
      <SidebarButton icon={FileText} label="Scan Reports" active={view === "reports"} badge={scans.length ? String(scans.length) : undefined} onClick={() => { setView("reports"); onNav?.(); }} />
      <SidebarLink to="/scan/new" icon={ScanSearch} label="New Scan" onClick={onNav} />
      <div className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Account</div>
      <SidebarLink to="/profile" icon={UserIcon} label="Profile" onClick={onNav} />
      <SidebarLink to="/profile" search={{ tab: "credits" }} icon={CreditCard} label="Billing" onClick={onNav} />
      <SidebarLink to="/contact" icon={Settings} label="Support" onClick={onNav} />
    </>
  );

  return (
    <div className="h-screen flex bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 -left-40 size-[600px] rounded-full bg-[oklch(0.86_0.16_200_/0.08)] blur-[120px] animate-aurora-1" />
        <div className="absolute bottom-0 -right-40 size-[600px] rounded-full bg-[oklch(0.75_0.13_180_/0.08)] blur-[120px] animate-aurora-2" />
        <div className="absolute inset-0 grid-bg opacity-30 animate-grid-pan" />
      </div>

      {/* Static sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen flex-col border-r border-white/[0.06] bg-[oklch(0.04_0.008_220)]/80 backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2">
            <img src={nexusLogo} alt="Nexefy" className="size-6 object-contain" />
            <span className="text-[13px] font-semibold tracking-[0.2em]">NEXEFY<span className="text-muted-foreground ml-1.5">SEC</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-hidden">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          <div className="glass rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-40" />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-widest text-primary">{profile?.plan ?? "starter"} Plan</div>
              <div className="text-sm mt-1.5 font-medium">{profile?.credits ?? 0} credits left</div>
              <div className="mt-2.5 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(100, ((profile?.credits ?? 0) / 15) * 100)}%` }} />
              </div>
              <Link to="/pricing" className="mt-3 block text-[11px] text-primary hover:underline">Upgrade plan →</Link>
            </div>
          </div>
          {user && (
            <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-white hover:bg-white/[0.03] inline-flex items-center gap-2">
              <LogOut className="size-3.5" /> Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Scrollable content */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto relative">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <button onClick={() => setMobileNav(true)} className="lg:hidden size-9 shrink-0 rounded-full glass grid place-items-center hover:border-white/20 transition mt-1" aria-label="Open menu">
                <Menu className="size-4" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                  </span>
                  All systems operational{mounted && time ? ` · ${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <h1 className="text-2xl font-medium tracking-tight">
                    {view === "reports" ? "Scan Reports" : user ? `Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}` : "Security Dashboard"}
                  </h1>
                  <RoleBadge role={role} size="md" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-full glass px-3.5 py-2 text-xs text-muted-foreground w-72">
                <Search className="size-3.5" />
                <input placeholder="Search scans, findings, assets…" className="bg-transparent outline-none flex-1 text-white placeholder:text-muted-foreground" />
                <kbd className="text-[10px] text-muted-foreground/60 border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
              </div>
              <button className="size-9 rounded-full glass grid place-items-center hover:border-white/20 transition">
                <Bell className="size-4" />
              </button>
              <Link to="/scan/new" search={{ plan: "professional" as const }} className="rounded-full bg-white text-black px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/90 transition">
                <ScanSearch className="size-3.5" /> New Scan
              </Link>
            </div>
          </div>
        </header>

        {view === "reports" ? (
          <ReportsSection scans={scans} activeId={activeId} onUpload={uploadReport} mounted={mounted} />
        ) : (
          <Overview report={report} profile={profile} scans={scans} mounted={mounted} onOpenReports={() => setView("reports")} />
        )}
      </div>

      {/* Mobile nav drawer */}
      <div onClick={() => setMobileNav(false)}
        className={`lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity ${mobileNav ? "opacity-100" : "opacity-0 pointer-events-none"}`} />
      <aside className={`lg:hidden fixed left-0 top-0 z-[70] h-full w-72 bg-[oklch(0.04_0.008_220)] border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <Link to="/" onClick={() => setMobileNav(false)} className="flex items-center gap-2.5">
            <img src={nexusLogo} alt="Nexefy" className="size-5 object-contain" />
            <span className="text-[13px] font-semibold tracking-[0.2em]">NEXEFY<span className="text-muted-foreground ml-1.5">SEC</span></span>
          </Link>
          <button onClick={() => setMobileNav(false)} className="size-8 grid place-items-center rounded-full hover:bg-white/10 transition" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks onNav={() => setMobileNav(false)} />
        </nav>
        {user && (
          <div className="p-3 border-t border-white/[0.06]">
            <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-white hover:bg-white/[0.03] inline-flex items-center gap-2">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* -------------------------------- overview -------------------------------- */
const SEV = {
  Critical: "#d64545",
  High: "#d18b2c",
  Medium: "#c2ae3a",
  Low: "#6b8cae",
};

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-xl border border-white/[0.07] bg-[oklch(0.055_0.006_240)] transition-colors hover:border-white/[0.12] ${className}`}>
      {children}
    </section>
  );
}

function PanelHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold tracking-tight text-white">{title}</h2>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function Overview({ report, profile, scans, mounted, onOpenReports }: {
  report: ReportModel; profile: { plan: string; credits: number } | null; scans: Scan[]; mounted: boolean; onOpenReports: () => void;
}) {
  const risk = [
    { label: "Critical", val: Math.max(1, Math.floor(report.findings * 0.08)), color: SEV.Critical },
    { label: "High", val: Math.max(1, Math.floor(report.findings * 0.22)), color: SEV.High },
    { label: "Medium", val: Math.max(1, Math.floor(report.findings * 0.38)), color: SEV.Medium },
    { label: "Low", val: Math.max(1, Math.floor(report.findings * 0.32)), color: SEV.Low },
  ];
  const riskTotal = risk.reduce((a, b) => a + b.val, 0) || 1;
  const sevOrder = ["Critical", "High", "Medium", "Low"] as const;

  const blocked = report.findings * 52;
  const investigating = Math.max(1, Math.floor(report.findings * 0.4));
  const critical = Math.max(1, Math.floor(report.findings * 0.08));

  const kpis = [
    {
      label: "Security Score", value: `${report.score}`, suffix: "/100", icon: Shield,
      note: "Risk-weighted across monitored assets", color: scoreColor(report.score),
      tag: report.score >= 80 ? "Strong" : report.score >= 40 ? "Good" : "At risk",
    },
    { label: "Open Findings", value: `${report.findings}`, icon: AlertTriangle, note: "Across monitored assets", color: "#ffffff", tag: report.status },
    { label: "Assets Monitored", value: `${scans.length || 1}`, icon: Globe2, note: `${scans.length} scans this month`, color: "#ffffff", tag: null },
    { label: "Credits Left", value: (profile?.credits ?? 0).toLocaleString(), icon: Zap, note: `${profile?.plan ?? "starter"} plan`, color: "#ffffff", tag: null },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px]">
      {/* Welcome / demo banner */}
      {report.demo ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="size-8 shrink-0 rounded-lg grid place-items-center border border-white/[0.08] bg-white/[0.03]">
              <FileText className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-white">Demo environment</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You're currently viewing sample security data. Run your first scan to populate the dashboard with real findings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onOpenReports} className="rounded-lg border border-white/10 hover:bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium transition">Manage reports</button>
            <Link to="/scan/new" search={{ plan: "professional" as const }} className="rounded-lg bg-white text-black hover:bg-white/90 px-3 py-1.5 text-[11px] font-medium transition">Run First Scan</Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] font-medium text-white truncate">Active report · {report.target}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {report.requester.company} · {report.plan} plan{mounted ? ` · ${new Date(report.createdAt).toLocaleDateString()}` : ""}
            </div>
          </div>
          <button onClick={onOpenReports} className="rounded-lg border border-white/10 hover:bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium transition inline-flex items-center gap-1.5">
            <FileText className="size-3.5" /> Manage reports
          </button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
            className="rounded-xl border border-white/[0.07] bg-[oklch(0.055_0.006_240)] p-4 sm:p-5 transition-colors hover:border-white/[0.13]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground truncate">{k.label}</span>
              <k.icon className="size-3.5 text-muted-foreground/50 shrink-0" />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-1 min-w-0">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums truncate" style={{ color: k.color }}>{k.value}</span>
                {k.suffix && <span className="text-xs text-muted-foreground">{k.suffix}</span>}
              </div>
              {k.label === "Security Score" && (
                <div className="hidden sm:block shrink-0"><ScoreRing value={report.score} size={52} /></div>
              )}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              {k.tag && (
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-white/70 capitalize shrink-0">{k.tag}</span>
              )}
              <span className="text-[10px] text-muted-foreground truncate">{k.note}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Posture + risk distribution */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <PanelHead title="Overall Security Posture" sub="Risk-weighted across monitored assets" />
          <div className="p-5 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="flex items-center gap-4">
              <ScoreRing value={report.score} size={124} />
              <div className="sm:hidden">
                <div className="text-lg font-semibold" style={{ color: scoreColor(report.score) }}>{report.score}/100</div>
              </div>
            </div>
            <div className="space-y-4">
              {report.posture.map((p, i) => (
                <div key={p.label}>
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-mono tabular-nums text-white/90">{p.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.value}%` }} transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                      className="h-full rounded-full" style={{ background: p.color }} />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                Weakest area: <span className="text-white/85">{[...report.posture].sort((a, b) => a.value - b.value)[0]?.label}</span>
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Risk Distribution" sub={`${riskTotal} findings by severity`} right={<BarChart3 className="size-4 text-muted-foreground/60" />} />
          <div className="p-5">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
              {risk.map((r, i) => (
                <motion.div key={r.label} initial={{ width: 0 }} animate={{ width: `${(r.val / riskTotal) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }} style={{ background: r.color }} className="h-full" />
              ))}
            </div>
            <ul className="mt-5 space-y-3">
              {risk.map((r) => (
                <li key={r.label} className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-sm" style={{ background: r.color }} />{r.label}
                  </span>
                  <span className="font-mono tabular-nums text-white/90">{r.val}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* Threat activity */}
      <Panel>
        <PanelHead
          title="Threat Activity"
          sub={`Last 24 hours · ${report.demo ? "demo feed" : report.target}`}
          right={
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground border border-white/10 rounded px-2 py-1">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          }
        />
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {[
              { l: "Blocked", v: blocked.toLocaleString(), c: "#2f9e6a" },
              { l: "Investigating", v: investigating.toLocaleString(), c: "#d18b2c" },
              { l: "Critical", v: critical.toLocaleString(), c: SEV.Critical },
            ].map((s) => (
              <div key={s.l} className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground truncate">{s.l}</div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <Chart data={report.trend} height={110} />
          </div>
        </div>
      </Panel>

      {/* Recent scans + live feed */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 overflow-hidden">
          <PanelHead
            title="Recent Scans"
            sub={`${scans.length} total this month`}
            right={
              <button onClick={onOpenReports} className="text-[11px] text-muted-foreground hover:text-white transition">View all</button>
            }
          />
          {scans.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="size-10 mx-auto rounded-lg border border-white/[0.08] bg-white/[0.02] grid place-items-center">
                <ScanSearch className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-[13px] font-medium text-white">No scans yet</div>
              <p className="mt-1 text-[11px] text-muted-foreground max-w-sm mx-auto">
                Run your first security scan to start building your security history.
              </p>
              <Link to="/scan/new" search={{ plan: "professional" as const }}
                className="mt-4 inline-flex rounded-lg bg-white hover:bg-white/90 text-black px-4 py-2 text-[11px] font-medium transition">
                Start New Scan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="text-left font-normal px-5 py-3">Target</th>
                    <th className="text-left font-normal py-3">Plan</th>
                    <th className="text-left font-normal py-3">Status</th>
                    <th className="text-left font-normal py-3">Score</th>
                    <th className="text-right font-normal px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.05] hover:bg-white/[0.02] transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 rounded border border-white/[0.08] bg-white/[0.02] grid place-items-center"><Globe2 className="size-3 text-muted-foreground" /></div>
                          <span className="font-mono text-xs truncate max-w-[220px]">{r.target_url}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs capitalize text-muted-foreground">{r.plan}</td>
                      <td className="py-3"><StatusPill status={r.status} /></td>
                      <td className="py-3 font-mono text-xs tabular-nums">{r.score != null ? `${r.score}/100` : "—"}</td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground">{mounted ? new Date(r.created_at).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHead
            title="Live Threat Activity"
            sub="Real-time security events across monitored assets"
            right={<Wifi className="size-4 text-muted-foreground/60" />}
          />
          <ul className="divide-y divide-white/[0.05]">
            {report.threats.map((t, i) => {
              const sev = sevOrder[i % 4];
              return (
                <motion.li key={t.ip} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-7 shrink-0 rounded border border-white/[0.08] bg-white/[0.02] grid place-items-center text-[10px] font-mono text-muted-foreground">{t.country}</div>
                    <div className="min-w-0">
                      <div className="font-mono text-[12px] text-white truncate">{t.ip}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{t.type} · {t.ago}</div>
                    </div>
                  </div>
                  <span className="shrink-0 text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded border"
                    style={{ color: SEV[sev], borderColor: `${SEV[sev]}55` }}>{sev}</span>
                </motion.li>
              );
            })}
          </ul>
          <div className="px-5 py-3 border-t border-white/[0.06]">
            <Link to="/report/$id" params={{ id: report.id }} className="text-[11px] text-muted-foreground hover:text-white transition inline-flex items-center gap-1">
              View all activity <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </Panel>
      </div>

      {/* Recent workspace activity (preserved) */}
      {scans.length > 0 && (
        <Panel>
          <PanelHead title="Activity" sub="Latest workspace events" right={<Activity className="size-4 text-muted-foreground/60" />} />
          <ul className="p-5 space-y-3.5">
            {scans.slice(0, 5).map((s) => (
              <li key={s.id} className="flex gap-3">
                <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${s.status === "completed" ? "bg-emerald-500" : s.status === "running" ? "bg-[#5a8fe8] animate-pulse" : "bg-muted-foreground"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white/90 truncate">Scan {s.status} for <span className="font-mono">{s.target_url}</span></div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{mounted ? new Date(s.created_at).toLocaleString() : ""}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* Security intelligence CTA */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.09] bg-[oklch(0.05_0.006_240)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative px-5 sm:px-7 py-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <FileText className="size-3" /> Security Intelligence
            </div>
            <h3 className="mt-2 text-base sm:text-lg font-semibold tracking-tight text-white">Full technical report</h3>
            <p className="mt-1.5 text-[12px] sm:text-[13px] text-muted-foreground max-w-2xl">
              Deep-dive into vulnerabilities, findings, affected assets, CVSS scores, reproduction evidence, and remediation guidance for {report.demo ? "the demo target" : report.target}.
            </p>
          </div>
          <Link to="/report/$id" params={{ id: report.id }}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black hover:bg-white/90 px-5 py-2.5 text-xs sm:text-[13px] font-medium transition">
            View Full Technical Report <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}


/* -------------------------------- reports -------------------------------- */
function ReportsSection({ scans, activeId, onUpload, mounted }: {
  scans: Scan[]; activeId: string | null; onUpload: (id: string) => void; mounted: boolean;
}) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="glass rounded-2xl px-5 py-4">
        <div className="text-sm font-medium">Submitted scan reports</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          Every scan you submitted, with full submission details and status. Upload one to the overview dashboard to drive its metrics.
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-16 text-center">
          <div className="size-12 mx-auto rounded-full glass grid place-items-center text-[#5aa0d6]"><FileText className="size-5" /></div>
          <div className="mt-4 text-sm">No reports submitted yet</div>
          <p className="mt-1 text-xs text-muted-foreground">Once you submit a scan, its report will appear here.</p>
          <Link to="/scan/new" search={{ plan: "professional" as const }} className="mt-5 inline-flex rounded-lg bg-[#1b3a5c] hover:bg-[#234a75] text-white px-4 py-2 text-xs font-medium transition">Submit a scan</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {scans.map((s) => {
            const r = buildReport(s);
            const active = activeId === s.id;
            return (
              <div key={s.id} className={`glass rounded-2xl p-5 transition ${active ? "border-emerald-500/40" : "hover:border-white/15"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="size-10 rounded-xl grid place-items-center bg-[#132a3d]"><Globe2 className="size-4 text-[#5aa0d6]" /></div>
                    <div className="min-w-0">
                      <div className="font-mono text-sm truncate">{s.target_url}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                        {s.plan} plan{mounted ? ` · submitted ${new Date(s.created_at).toLocaleString()}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={s.status} />
                    {active && (
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 inline-flex items-center gap-1">
                        <BadgeCheck className="size-3" /> On dashboard
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Detail icon={UserIcon} label="Requester" value={r.requester.name} />
                  <Detail icon={Mail} label="Email" value={r.requester.email} />
                  <Detail icon={Building2} label="Company" value={r.requester.company} />
                  <Detail icon={Shield} label="Verification" value={`${r.requester.verification} · ${r.requester.verified}`} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
                      <div className="text-xl font-semibold" style={{ color: scoreColor(r.score) }}>{r.score}<span className="text-xs text-muted-foreground">/100</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Findings</div>
                      <div className="text-xl font-semibold text-white">{r.findings}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Role</div>
                      <div className="text-sm mt-1 text-white/90">{r.requester.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpload(s.id)}
                    disabled={active}
                    className={`rounded-lg px-4 py-2 text-xs font-medium inline-flex items-center gap-2 transition ${
                      active ? "bg-white/[0.05] text-muted-foreground cursor-default" : "bg-[#1b3a5c] hover:bg-[#234a75] text-white"
                    }`}
                  >
                    <UploadCloud className="size-3.5" /> {active ? "Uploaded to dashboard" : "Upload Report to Dashboard"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5"><Icon className="size-3" />{label}</div>
      <div className="text-xs mt-1 truncate text-white/90 capitalize">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full glass inline-flex items-center gap-1.5 ${
      status === "completed" ? "text-emerald-400" : status === "running" ? "text-[#5aa0d6]" : "text-muted-foreground"
    }`}>
      {status === "completed" ? <CheckCircle2 className="size-3" /> : status === "running" ? <Clock className="size-3 animate-spin" /> : <Clock className="size-3" />}
      {status}
    </span>
  );
}

/* -------------------------------- widgets -------------------------------- */
function SidebarLink({ to, icon: Icon, label, onClick, search }: { to: string; icon: typeof LayoutDashboard; label: string; onClick?: () => void; search?: Record<string, string> }) {
  return (
    <Link to={to} search={search as never} onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition text-muted-foreground hover:bg-white/[0.03] hover:text-white">
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

function SidebarButton({ icon: Icon, label, active, badge, onClick }: { icon: typeof LayoutDashboard; label: string; active?: boolean; badge?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${active ? "bg-white/[0.06] text-white" : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"}`}>
      <Icon className="size-4" />
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">{badge}</span>}
    </button>
  );
}

function ScoreRing({ value, size = 132 }: { value: number; size?: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const col = scoreColor(value);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={r} stroke="oklch(1 0 0 / 0.07)" strokeWidth="9" fill="none" />
        <motion.circle
          cx="90" cy="90" r={r} stroke={col} strokeWidth="9" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[28px] leading-none font-semibold tabular-nums" style={{ color: col }}>{value}</div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5">Secure</div>
        </div>
      </div>
    </div>
  );
}

function Chart({ data, height = 120 }: { data: number[]; height?: number }) {
  const max = Math.max(...data);
  const w = 600, h = 160;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h * 0.85 - 8}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f6fed" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2f6fed" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke="oklch(1 0 0 / 0.04)" />
      ))}
      <motion.polygon points={area} fill="url(#ca)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.polyline points={points} fill="none" stroke="#5a8fe8" strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
    </svg>
  );
}

