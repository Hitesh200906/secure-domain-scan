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
  type Scan, type ReportModel, ACTIVE_KEY, buildReport, DEMO_REPORT, scoreColor, seeded, hash,
} from "@/lib/report-model";
void seeded; void hash;


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
function Overview({ report, profile, scans, mounted, onOpenReports }: {
  report: ReportModel; profile: { plan: string; credits: number } | null; scans: Scan[]; mounted: boolean; onOpenReports: () => void;
}) {
  const risk = [
    { label: "Critical", val: Math.max(1, Math.floor(report.findings * 0.08)), color: "#a83232", icon: ShieldAlert },
    { label: "High", val: Math.max(1, Math.floor(report.findings * 0.22)), color: "#b5702a", icon: AlertTriangle },
    { label: "Medium", val: Math.max(1, Math.floor(report.findings * 0.38)), color: "#9a8a2c", icon: Eye },
    { label: "Low", val: Math.max(1, Math.floor(report.findings * 0.32)), color: "#2f7361", icon: CheckCircle2 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="glass rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl grid place-items-center" style={{ background: "#132a3d" }}>
            <FileText className="size-4" style={{ color: "#5aa0d6" }} />

          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {report.demo ? "Demo report" : `Report · ${report.target}`}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {report.demo
                ? "This is a demo report — submit a scan and upload its report to see your own data here."
                : `${report.requester.company} · ${report.plan} plan${mounted ? ` · ${new Date(report.createdAt).toLocaleDateString()}` : ""}`}
            </div>
          </div>
        </div>
        <button onClick={onOpenReports} className="rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-medium transition inline-flex items-center gap-1.5">
          <FileText className="size-3.5" /> Manage reports
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Security Score", value: report.score, suffix: "/100", icon: Shield, trend: report.demo ? "demo data" : "from report", color: scoreColor(report.score) },
          { label: "Open Findings", value: report.findings, icon: AlertTriangle, trend: `${report.status}`, color: "#b52a20" },
          { label: "Assets Monitored", value: scans.length || 1, icon: Globe2, trend: `${scans.length} scans`, color: "#5aa0d6" },
          { label: "Credits Left", value: profile?.credits ?? 0, icon: Zap, trend: `${profile?.plan ?? "starter"}`, color: "#ffffff" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass rounded-2xl p-5 relative overflow-hidden group hover:border-white/15 transition">
            <div className="flex items-start justify-between">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k.label}</div>
              <k.icon className="size-4 text-muted-foreground/60" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <div className="text-3xl font-semibold tracking-tight" style={{ color: k.color }}>{k.value}</div>
              {k.suffix && <div className="text-sm text-muted-foreground">{k.suffix}</div>}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-400/80" /> {k.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart + posture */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium">Threat Activity</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Last 24 hours · {report.demo ? "demo feed" : report.target}</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Realtime
            </div>
          </div>
          <Chart data={report.trend} />
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
            {[
              { l: "Blocked", v: String(report.findings * 52), c: "#2f9e6a" },
              { l: "Investigating", v: String(Math.max(1, Math.floor(report.findings * 0.4))), c: "#b8912f" },
              { l: "Critical", v: String(Math.max(1, Math.floor(report.findings * 0.08))), c: "#c0392b" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                <div className="mt-1 text-xl font-semibold" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex flex-col">
          <div className="text-sm font-medium">Overall posture</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Risk-weighted across assets</div>
          <div className="flex-1 grid place-items-center py-4">
            <ScoreRing value={report.score} />
          </div>
          <div className="space-y-2.5">
            {report.posture.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full" style={{ background: p.color }} />{p.label}
                  </span>
                  <span className="font-mono">{p.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.value}%` }} transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full" style={{ background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent scans + risk */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06] gap-3">
            <div>
              <div className="text-sm font-medium">Recent Scans</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{scans.length} total this month</div>
            </div>
            <Link to="/scan/new" search={{ plan: "professional" as const }}
              className="rounded-lg bg-white hover:bg-white/90 text-black px-3.5 py-2 text-xs font-medium inline-flex items-center gap-1.5 transition">
              Start new <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {scans.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="size-12 mx-auto rounded-full glass grid place-items-center text-primary"><ScanSearch className="size-5" /></div>
              <div className="mt-4 text-sm">No scans yet</div>
              <p className="mt-1 text-xs text-muted-foreground">Run your first security scan in under 60 seconds.</p>
              <Link to="/scan/new" search={{ plan: "professional" as const }} className="mt-5 inline-flex rounded-lg bg-white hover:bg-white/90 text-black px-4 py-2 text-xs font-medium transition">Start your first scan</Link>
            </div>

          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="text-left font-normal px-6 py-3">Target</th>
                    <th className="text-left font-normal py-3">Plan</th>
                    <th className="text-left font-normal py-3">Status</th>
                    <th className="text-left font-normal py-3">Score</th>
                    <th className="text-right font-normal px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-lg glass grid place-items-center"><Globe2 className="size-3.5 text-[#5aa0d6]" /></div>
                          <span className="font-mono text-xs truncate max-w-[200px]">{r.target_url}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-xs capitalize text-muted-foreground">{r.plan}</td>
                      <td className="py-3.5"><StatusPill status={r.status} /></td>
                      <td className="py-3.5 font-mono text-xs">{r.score != null ? `${r.score}/100` : "—"}</td>
                      <td className="px-6 py-3.5 text-right text-xs text-muted-foreground">{mounted ? new Date(r.created_at).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Risk Distribution</div>
            <BarChart3 className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-5 space-y-3.5">
            {risk.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground inline-flex items-center gap-2"><r.icon className="size-3" style={{ color: r.color }} />{r.label}</span>
                  <span className="font-mono">{r.val}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, r.val * 8)}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ background: r.color }} className="h-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threat intel + activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Live Threat Activity</div>
            <Wifi className="size-4 text-[#5aa0d6] animate-pulse" />
          </div>
          <ul className="mt-4 space-y-3">
            {report.threats.map((t) => (
              <li key={t.ip} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg glass grid place-items-center text-[10px] font-mono text-[#5aa0d6]">{t.country}</div>
                  <div>
                    <div className="font-mono">{t.ip}</div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">{t.type}</div>
                  </div>
                </div>
                <span className="text-muted-foreground/70 text-[10px]">{t.ago}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Activity</div>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <ul className="mt-4 space-y-4">
            {(scans.length ? scans.slice(0, 5) : []).map((s) => (
              <li key={s.id} className="flex gap-3">
                <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${s.status === "completed" ? "bg-emerald-500" : s.status === "running" ? "bg-[#5aa0d6] animate-pulse" : "bg-muted-foreground"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white/90 truncate">Scan {s.status} for <span className="font-mono">{s.target_url}</span></div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{mounted ? new Date(s.created_at).toLocaleString() : ""}</div>
                </div>
              </li>
            ))}
            {!scans.length && <li className="text-xs text-muted-foreground">No activity yet — this overview is showing a demo report.</li>}
          </ul>
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

function ScoreRing({ value }: { value: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const col = scoreColor(value);
  return (
    <div className="relative size-44">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={r} stroke="oklch(1 0 0 / 0.06)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="90" cy="90" r={r} stroke={col} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl font-semibold" style={{ color: col }}>{value}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Secure</div>
        </div>
      </div>
    </div>
  );
}

function Chart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const w = 600, h = 160;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h * 0.85 - 8}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <defs>
        <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b5f8a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#2b5f8a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3c7fb1" />
          <stop offset="100%" stopColor="#2f7361" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke="oklch(1 0 0 / 0.04)" />
      ))}
      <motion.polygon points={area} fill="url(#ca)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.polyline points={points} fill="none" stroke="url(#cl)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} />
      {data.map((v, i) => i % 4 === 0 && (
        <circle key={i} cx={i * step} cy={h - (v / max) * h * 0.85 - 8} r="2.5" fill="#3c7fb1" />
      ))}
    </svg>
  );
}
