import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, CheckCircle2, Clock,
  CreditCard, Globe2, LayoutDashboard, LogOut, ScanSearch, Settings,
  Shield, ShieldAlert, ShieldCheck, Sparkles, TrendingUp, User as UserIcon,
  Zap, ArrowUpRight, Search, Lock, Wifi, Server, FileWarning, Eye, Menu, X,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import nexusLogo from "@/assets/nexefy-logo.png";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";


export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Nexefy Sec" }] }),
  component: Dashboard,
});

type Scan = {
  id: string; target_url: string; status: string; score: number | null;
  findings_count: number | null; created_at: string; plan: string;
};

function Dashboard() {
  const { user } = useAuth();
  const { role } = useAdmin();

  const [scans, setScans] = useState<Scan[]>([]);
  const [profile, setProfile] = useState<{ plan: string; credits: number; full_name: string | null } | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.listScans()
      .then(({ scans }) => setScans((scans as Scan[]) ?? []))
      .catch(() => setScans([]));
    api.profile()
      .then(({ profile }) => profile && setProfile(profile))
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    setTime(new Date());
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const completed = scans.filter((s) => s.status === "completed");
  const avgScore = completed.length ? Math.round(completed.reduce((a, s) => a + (s.score ?? 0), 0) / completed.length) : 87;
  const totalFindings = scans.reduce((a, s) => a + (s.findings_count ?? 0), 0) || 24;
  const trend = useMemo(() => Array.from({ length: 24 }, (_, i) => 40 + Math.sin(i * 0.6) * 20 + Math.random() * 15), []);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 -left-40 size-[600px] rounded-full bg-[oklch(0.86_0.16_200_/0.08)] blur-[120px] animate-aurora-1" />
        <div className="absolute bottom-0 -right-40 size-[600px] rounded-full bg-[oklch(0.75_0.13_180_/0.08)] blur-[120px] animate-aurora-2" />
        <div className="absolute inset-0 grid-bg opacity-30 animate-grid-pan" />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[oklch(0.04_0.008_220)]/80 backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2">
            <img src={nexusLogo} alt="Nexefy" className="size-6 object-contain" />
            <span className="text-[13px] font-semibold tracking-[0.2em]">NEXEFY<span className="text-muted-foreground ml-1.5">SEC</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Workspace</div>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Overview" active />
          <SidebarLink to="/scan/new" icon={ScanSearch} label="New Scan" />
          <SidebarLink to="/dashboard" icon={FileWarning} label="Findings" badge={String(totalFindings)} />
          <SidebarLink to="/dashboard" icon={Globe2} label="Assets" />
          <SidebarLink to="/dashboard" icon={Bell} label="Alerts" />
          <div className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Account</div>
          <SidebarLink to="/profile" icon={UserIcon} label="Profile" />
          <SidebarLink to="/pricing" icon={CreditCard} label="Billing" />
          <SidebarLink to="/contact" icon={Settings} label="Support" />
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

      <div className="flex-1 min-w-0 relative">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => setMobileNav(true)}
                className="lg:hidden size-9 shrink-0 rounded-full glass grid place-items-center hover:border-white/20 transition mt-1"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
              <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                </span>
                All systems operational{time ? ` · ${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <h1 className="text-2xl font-medium tracking-tight">{user ? `Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}` : "Security Dashboard"}</h1>
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
              <Link to="/scan/new" search={{ plan: 'professional' as const }} className="rounded-full bg-white text-black px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5 hover:shadow-[0_0_30px_-4px_oklch(0.86_0.16_200_/0.6)] transition">
                <ScanSearch className="size-3.5" /> New Scan
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Security Score", value: avgScore, suffix: "/100", icon: Shield, trend: "+4.2%", glow: true, color: "primary" },
              { label: "Open Findings", value: totalFindings, icon: AlertTriangle, trend: "-12", color: "amber" },
              { label: "Assets Monitored", value: scans.length || 8, icon: Globe2, trend: "+2", color: "secondary" },
              { label: "Credits Left", value: profile?.credits ?? 1, icon: Zap, trend: `${profile?.plan ?? "starter"}`, color: "white" },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-5 relative overflow-hidden group hover:border-white/15 transition">
                <div className="flex items-start justify-between">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k.label}</div>
                  <k.icon className="size-4 text-muted-foreground/60 group-hover:text-primary transition" />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <div className={`text-3xl font-semibold tracking-tight ${k.glow ? "text-gradient-accent" : "text-white"}`}>{k.value}</div>
                  {k.suffix && <div className="text-sm text-muted-foreground">{k.suffix}</div>}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <TrendingUp className="size-3 text-emerald-400" /> {k.trend}
                </div>
                <div className="absolute -bottom-8 -right-8 size-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition" />
              </motion.div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Big chart */}
            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium">Threat Activity</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Last 24 hours · live feed</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Realtime
                </div>
              </div>
              <Chart data={trend} />
              <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
                {[
                  { l: "Blocked", v: "1,247", c: "text-emerald-400" },
                  { l: "Investigating", v: "23", c: "text-amber-400" },
                  { l: "Critical", v: "2", c: "text-destructive" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                    <div className={`mt-1 text-xl font-semibold ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score ring */}
            <div className="glass rounded-2xl p-6 flex flex-col">
              <div className="text-sm font-medium">Overall posture</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Risk-weighted across assets</div>
              <div className="flex-1 grid place-items-center py-4">
                <ScoreRing value={avgScore} />
              </div>
              <div className="space-y-2">
                {[
                  { l: "Application", v: 92 },
                  { l: "Infrastructure", v: 88 },
                  { l: "Identity", v: 79 },
                ].map((p) => (
                  <div key={p.l}>
                    <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">{p.l}</span><span className="font-mono">{p.v}</span></div>
                    <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.v}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent scans + risk distribution */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="glass rounded-2xl overflow-hidden lg:col-span-2">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
                <div>
                  <div className="text-sm font-medium">Recent Scans</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{scans.length} total this month</div>
                </div>
                <Link to="/scan/new" search={{ plan: 'professional' as const }} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  Start new <ArrowUpRight className="size-3" />
                </Link>
              </div>

              {scans.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="size-12 mx-auto rounded-full glass grid place-items-center text-primary">
                    <ScanSearch className="size-5" />
                  </div>
                  <div className="mt-4 text-sm">No scans yet</div>
                  <p className="mt-1 text-xs text-muted-foreground">Run your first security scan in under 60 seconds.</p>
                  <Link to="/scan/new" search={{ plan: 'professional' as const }} className="mt-5 inline-flex rounded-full bg-white text-black px-4 py-2 text-xs font-medium">Start your first scan</Link>
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
                              <div className="size-7 rounded-lg glass grid place-items-center"><Globe2 className="size-3.5 text-primary" /></div>
                              <span className="font-mono text-xs truncate max-w-[200px]">{r.target_url}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-xs capitalize text-muted-foreground">{r.plan}</td>
                          <td className="py-3.5">
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full glass inline-flex items-center gap-1.5 ${
                              r.status === "completed" ? "text-emerald-400"
                              : r.status === "running" ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {r.status === "completed" ? <CheckCircle2 className="size-3" /> : r.status === "running" ? <Clock className="size-3 animate-spin" /> : <Clock className="size-3" />}
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 font-mono text-xs">{r.score != null ? `${r.score}/100` : "—"}</td>
                          <td className="px-6 py-3.5 text-right text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
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
                {[
                  { label: "Critical", val: Math.max(1, Math.floor(totalFindings * 0.08)), color: "oklch(0.65 0.22 25)", icon: ShieldAlert },
                  { label: "High", val: Math.max(1, Math.floor(totalFindings * 0.22)), color: "oklch(0.78 0.17 50)", icon: AlertTriangle },
                  { label: "Medium", val: Math.max(1, Math.floor(totalFindings * 0.38)), color: "oklch(0.85 0.16 90)", icon: Eye },
                  { label: "Low", val: Math.max(1, Math.floor(totalFindings * 0.32)), color: "oklch(0.75 0.13 180)", icon: CheckCircle2 },
                ].map((r) => (
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

          {/* Threat intel + Activity + Quick actions */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Live Threat Intel</div>
                <Wifi className="size-4 text-primary animate-pulse" />
              </div>
              <ul className="mt-4 space-y-3">
                {[
                  { ip: "185.220.101.47", country: "RU", type: "Brute force", time: "2m ago" },
                  { ip: "45.155.205.211", country: "CN", type: "SQL injection", time: "8m ago" },
                  { ip: "23.95.182.94", country: "US", type: "Port scan", time: "14m ago" },
                  { ip: "104.244.78.10", country: "DE", type: "XSS attempt", time: "22m ago" },
                ].map((t) => (
                  <li key={t.ip} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg glass grid place-items-center text-[10px] font-mono text-primary">{t.country}</div>
                      <div>
                        <div className="font-mono">{t.ip}</div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">{t.type}</div>
                      </div>
                    </div>
                    <span className="text-muted-foreground/70 text-[10px]">{t.time}</span>
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
                {(scans.length > 0 ? scans.slice(0, 4) : [
                  { id: "1", status: "completed", target_url: "api.example.com", created_at: new Date(Date.now() - 3600e3).toISOString() },
                  { id: "2", status: "running", target_url: "app.example.com", created_at: new Date(Date.now() - 7200e3).toISOString() },
                  { id: "3", status: "pending", target_url: "auth.example.com", created_at: new Date(Date.now() - 86400e3).toISOString() },
                ] as Scan[]).map((s) => (
                  <li key={s.id} className="flex gap-3">
                    <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${s.status === "completed" ? "bg-emerald-400" : s.status === "running" ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-white/90 truncate">Scan {s.status} for <span className="font-mono">{s.target_url}</span></div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Quick Actions</div>
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { l: "New Scan", icon: ScanSearch, to: "/scan/new" },
                  { l: "Add Asset", icon: Globe2, to: "/scan/new" },
                  { l: "Audit Log", icon: Lock, to: "/dashboard" },
                  { l: "API Keys", icon: Server, to: "/profile" },
                ].map((a) => (
                  <Link key={a.l} to={a.to} className="rounded-xl glass p-3 text-xs hover:border-primary/40 transition group">
                    <a.icon className="size-4 text-primary mb-2 group-hover:scale-110 transition" />
                    <div>{a.l}</div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Compliance</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["SOC 2", "ISO 27001", "GDPR", "PCI DSS"].map((c) => (
                    <span key={c} className="text-[10px] px-2 py-1 rounded-full glass text-muted-foreground">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div
        onClick={() => setMobileNav(false)}
        className={`lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity ${mobileNav ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`lg:hidden fixed left-0 top-0 z-[70] h-full w-72 bg-[oklch(0.04_0.008_220)] border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <Link to="/" onClick={() => setMobileNav(false)} className="flex items-center gap-2.5">
            <img src={nexusLogo} alt="Nexefy" className="size-5 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,.45))" }} />
            <span className="text-[13px] font-semibold tracking-[0.2em]">NEXEFY<span className="text-muted-foreground ml-1.5">SEC</span></span>
          </Link>
          <button onClick={() => setMobileNav(false)} className="size-8 grid place-items-center rounded-full hover:bg-white/10 transition" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" onClick={() => setMobileNav(false)}>
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Workspace</div>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Overview" active />
          <SidebarLink to="/scan/new" icon={ScanSearch} label="New Scan" />
          <SidebarLink to="/dashboard" icon={FileWarning} label="Findings" badge={String(totalFindings)} />
          <SidebarLink to="/dashboard" icon={Globe2} label="Assets" />
          <SidebarLink to="/dashboard" icon={Bell} label="Alerts" />
          <div className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Account</div>
          <SidebarLink to="/profile" icon={UserIcon} label="Profile" />
          <SidebarLink to="/pricing" icon={CreditCard} label="Billing" />
          <SidebarLink to="/contact" icon={Settings} label="Support" />
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

function SidebarLink({ to, icon: Icon, label, active, badge }: { to: string; icon: typeof LayoutDashboard; label: string; active?: boolean; badge?: string }) {
  return (
    <Link to={to} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${active ? "bg-white/[0.06] text-white" : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"}`}>
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{badge}</span>}
    </Link>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative size-44">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={r} stroke="oklch(1 0 0 / 0.06)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="90" cy="90" r={r} stroke="url(#g)" strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.6, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.16 200)" />
            <stop offset="100%" stopColor="oklch(0.75 0.13 180)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl font-semibold text-gradient-accent">{value}</div>
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
          <stop offset="0%" stopColor="oklch(0.86 0.16 200)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.86 0.16 200)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.86 0.16 200)" />
          <stop offset="100%" stopColor="oklch(0.75 0.13 180)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke="oklch(1 0 0 / 0.04)" />
      ))}
      <motion.polygon points={area} fill="url(#ca)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.polyline
        points={points} fill="none" stroke="url(#cl)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeOut" }}
      />
      {data.map((v, i) => i % 4 === 0 && (
        <circle key={i} cx={i * step} cy={h - (v / max) * h * 0.85 - 8} r="2.5" fill="oklch(0.86 0.16 200)" />
      ))}
    </svg>
  );
}
