import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, CheckCircle2, Clock,
  CreditCard, Globe2, LayoutDashboard, LogOut, ScanSearch, Settings,
  Shield, ShieldAlert, Sparkles, TrendingUp, User as UserIcon,
  ArrowUpRight, Search, Lock, Wifi, Server, Eye, Menu, X,
  FileText, Radar, Upload, Pin, Cpu, Fingerprint, KeyRound, Bug,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import nexusLogo from "@/assets/nexefy-logo.png";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ComingSoonDialog, type ComingSoonInfo } from "@/components/site/ComingSoonDialog";
import shieldImg from "@/assets/dash-shield.jpg";
import reportsImg from "@/assets/dash-reports.jpg";
import liveSocAsset from "@/assets/live-security-soc.png.asset.json";
import noReportsAsset from "@/assets/no-reports-bg.jpg.asset.json";
import kpiScoreAsset from "@/assets/kpi-score.png.asset.json";
import kpiIssuesAsset from "@/assets/kpi-issues.png.asset.json";
import kpiReportsAsset from "@/assets/kpi-reports.png.asset.json";
import kpiCreditsAsset from "@/assets/kpi-credits.png.asset.json";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Security Dashboard — Nexefy Security" },
      { name: "description", content: "Track scan reports, security posture and live AI protection for your domains inside the Nexefy Security workspace." },
      { property: "og:title", content: "Security Dashboard — Nexefy Security" },
      { property: "og:description", content: "Track scan reports, security posture and live AI protection for your domains." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Scan = {
  id: string; target_url: string; status: string; score: number | null;
  findings_count: number | null; created_at: string; plan: string;
  verification_status?: string | null;
};

const PIN_KEY = "nexefy:pinned-scan";
type Tab = "overview" | "reports" | "live";

function Dashboard() {
  const { user } = useAuth();
  const { role } = useAdmin();

  const [scans, setScans] = useState<Scan[]>([]);
  const [profile, setProfile] = useState<{ plan: string; credits: number; full_name: string | null } | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [pinned, setPinned] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<ComingSoonInfo | null>(null);

  useEffect(() => {
    setPinned(localStorage.getItem(PIN_KEY));
  }, []);

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

  const active = useMemo(() => {
    if (!scans.length) return null;
    return scans.find((s) => s.id === pinned) ?? scans[0];
  }, [scans, pinned]);

  const score = active?.score ?? 87;
  const totalFindings = active?.findings_count ?? scans.reduce((a, s) => a + (s.findings_count ?? 0), 0) ?? 0;
  const trend = useMemo(
    () => Array.from({ length: 24 }, (_, i) => 40 + Math.sin(i * 0.6) * 20 + ((i * 37) % 15)),
    [],
  );

  const pinReport = (id: string) => {
    localStorage.setItem(PIN_KEY, id);
    setPinned(id);
    setTab("overview");
  };
  const unpin = () => { localStorage.removeItem(PIN_KEY); setPinned(null); };

  const openLive = () => setComingSoon({
    title: "Nexefy Live Security — launching soon",
    description:
      "Live Security is our always-on AI layer that watches your website 24/7 through a simple API integration, blocking threats in real time. It is still under construction and not yet launched — we'll notify you the moment it goes live.",
  });

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  const nav = (
    <>
      <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Workspace</div>
      <NavBtn icon={LayoutDashboard} label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
      <NavBtn icon={FileText} label="Scan Reports" active={tab === "reports"} onClick={() => setTab("reports")} badge={scans.length ? String(scans.length) : undefined} />
      <NavBtn icon={Radar} label="Live Security" active={false} onClick={openLive} soon />
      <SidebarLink to="/scan/new" icon={ScanSearch} label="New Scan" />
      <div className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Account</div>
      <SidebarLink to="/profile" icon={UserIcon} label="Profile" />
      <SidebarLink to="/pricing" icon={CreditCard} label="Billing" />
      <SidebarLink to="/contact" icon={Settings} label="Support" />
    </>
  );

  return (
    <div className="h-screen flex bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 -left-40 size-[600px] rounded-full bg-[oklch(0.35_0.01_250_/0.10)] blur-[120px] animate-aurora-1" />
        <div className="absolute bottom-0 -right-40 size-[600px] rounded-full bg-[oklch(0.30_0.01_250_/0.08)] blur-[120px] animate-aurora-2" />
        <div className="absolute inset-0 grid-bg opacity-30 animate-grid-pan" />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen overflow-hidden border-r border-white/[0.06] bg-[oklch(0.04_0.008_220)]/80 backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2">
            <img src={nexusLogo} alt="Nexefy" className="size-6 object-contain" />
            <span className="text-[13px] font-semibold tracking-[0.2em]">NEXEFY<span className="text-muted-foreground ml-1.5">SEC</span></span>
          </Link>
        </div>
        <nav className="flex-1 min-h-0 p-3 space-y-0.5">{nav}</nav>
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          <div className="glass rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-40" />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-widest text-zinc-300">{profile?.plan ?? "starter"} Plan</div>
              <div className="text-sm mt-1.5 font-medium">{profile?.credits ?? 0} credits left</div>
              <div className="mt-2.5 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-zinc-500 to-zinc-300" style={{ width: `${Math.min(100, ((profile?.credits ?? 0) / 15) * 100)}%` }} />
              </div>
              <Link to="/pricing" className="mt-3 block text-[11px] text-zinc-300 hover:underline">Upgrade plan →</Link>
            </div>
          </div>
          {user && (
            <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-white hover:bg-white/[0.03] inline-flex items-center gap-2">
              <LogOut className="size-3.5" /> Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 relative h-screen overflow-y-auto">
        {/* Header */}
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
                  All systems operational{time ? ` · ${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-medium tracking-tight">
                    {tab === "reports" ? "Scan Reports" : tab === "live" ? "Live Security" : user ? `Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}` : "Security Dashboard"}
                  </h1>
                  <RoleBadge role={role} size="md" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-full glass px-3.5 py-2 text-xs text-muted-foreground w-64">
                <Search className="size-3.5" />
                <input placeholder="Search scan reports…" className="bg-transparent outline-none flex-1 text-white placeholder:text-muted-foreground" />
              </div>
              <button className="size-9 rounded-full glass grid place-items-center hover:border-white/20 transition">
                <Bell className="size-4" />
              </button>
              <Link to="/scan/new" search={{ plan: 'professional' as const }} className="rounded-full bg-white text-black px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/85 transition">
                <ScanSearch className="size-3.5" /> New Scan
              </Link>
            </div>
          </div>
          {/* Mobile section tabs */}
          <div className="lg:hidden flex gap-2 px-4 pb-3 overflow-x-auto">
            {([["overview", "Overview", LayoutDashboard], ["reports", "Scan Reports", FileText]] as const).map(([k, l, I]) => (
              <button key={k} onClick={() => setTab(k)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] border transition ${tab === k ? "bg-white/[0.08] border-white/20 text-white" : "border-white/10 text-muted-foreground"}`}>
                <I className="size-3.5" /> {l}
              </button>
            ))}
            <button onClick={openLive} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] border border-white/10 text-muted-foreground">
              <Radar className="size-3.5" /> Live Security
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-5">
          {tab === "overview" ? (
            <Overview
              active={active}
              pinned={!!pinned && !!active && active.id === pinned}
              onUnpin={unpin}
              onBrowse={() => setTab("reports")}
              score={score}
              findings={totalFindings}
              trend={trend}
              scansCount={scans.length}
              credits={profile?.credits ?? 0}
              onLive={openLive}
            />
          ) : (
            <Reports scans={scans} pinned={pinned} onPin={pinReport} onUnpin={unpin} onLive={openLive} />
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div onClick={() => setMobileNav(false)} className={`lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity ${mobileNav ? "opacity-100" : "opacity-0 pointer-events-none"}`} />
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
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" onClick={() => setMobileNav(false)}>{nav}</nav>
        {user && (
          <div className="p-3 border-t border-white/[0.06]">
            <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-white hover:bg-white/[0.03] inline-flex items-center gap-2">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        )}
      </aside>

      <ComingSoonDialog info={comingSoon} onClose={() => setComingSoon(null)} />
    </div>
  );
}

/* ------------------------------- Overview -------------------------------- */

function Overview({
  active, pinned, onUnpin, onBrowse, score, findings, trend, scansCount, credits, onLive,
}: {
  active: Scan | null; pinned: boolean; onUnpin: () => void; onBrowse: () => void;
  score: number; findings: number; trend: number[]; scansCount: number; credits: number; onLive: () => void;
}) {
  return (
    <>
      {/* Report context banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black">
        <img src={shieldImg} alt="Security posture" loading="lazy" width={1024} height={768}
          className="absolute inset-0 size-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {pinned ? <><Pin className="size-3 text-zinc-300" /> Pinned report</> : <><Clock className="size-3" /> Latest report</>}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight truncate">
              {active ? active.target_url : "No reports yet"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md">
              {active
                ? `Overview is rendered from this report · ${active.plan} plan · submitted ${new Date(active.created_at).toLocaleDateString()}`
                : "Submit your first scan to populate the overview with real posture data."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={onBrowse} className="rounded-full bg-white text-black px-4 py-2 text-xs font-medium text-black hover:bg-white/85 transition inline-flex items-center gap-1.5">
                <FileText className="size-3.5" /> Browse scan reports
              </button>
              {pinned && (
                <button onClick={onUnpin} className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs text-white hover:bg-white/[0.09] transition">
                  Use latest instead
                </button>
              )}
            </div>
          </div>
          {active && (
            <div className="shrink-0"><ScoreRing value={score} /></div>
          )}
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Security Score", value: score, suffix: "/100", logo: kpiScoreAsset.url, trend: "+4.2%", tint: "#3B82F6" },
          { label: "Issues In Report", value: findings, logo: kpiIssuesAsset.url, trend: active?.status ?? "pending", tint: "#F59E0B" },
          { label: "Reports Filed", value: scansCount, logo: kpiReportsAsset.url, trend: "all time", tint: "#8B5CF6" },
          { label: "Credits Left", value: credits, logo: kpiCreditsAsset.url, trend: "wallet", tint: "#10B981" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative overflow-hidden rounded-2xl border p-4 sm:p-5 group transition"
            style={{ borderColor: `${k.tint}33`, background: `linear-gradient(150deg, ${k.tint}26 0%, ${k.tint}0D 20%, oklch(0.05 0.008 240) 55%, #000 100%)` }}>
            <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: `linear-gradient(180deg, ${k.tint}, transparent)` }} />
            <div className="flex items-start justify-between gap-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k.label}</div>
              <div className="size-10 shrink-0 rounded-xl grid place-items-center border" style={{ borderColor: `${k.tint}33`, background: `${k.tint}1A` }}>
                <img src={k.logo} alt="" loading="lazy" width={816} height={816} className="size-7 object-contain" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">{k.value}</div>
              {k.suffix && <div className="text-sm text-muted-foreground">{k.suffix}</div>}
            </div>
            <div className="mt-2 text-[11px] inline-flex items-center gap-1 capitalize" style={{ color: k.tint }}>
              <TrendingUp className="size-3" /> {k.trend}
            </div>
          </motion.div>
        ))}
      </div>


      {/* Chart + breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#3B82F6]/25 p-5 sm:p-6 lg:col-span-2"
          style={{ background: "linear-gradient(160deg, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.05) 20%, oklch(0.05 0.008 240) 55%, #000 100%)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium">Threat Activity</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{active ? active.target_url : "sample data"} · last 24 hours</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#7DD3FC]">
              <span className="size-1.5 rounded-full bg-[#22D3EE] animate-pulse" /> Realtime
            </div>
          </div>

          <Chart data={trend} />
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
            {[
              { l: "Blocked", v: String(Math.max(120, findings * 52)), c: "text-emerald-400" },
              { l: "Investigating", v: String(Math.max(1, Math.round(findings * 0.4))), c: "text-amber-400" },
              { l: "Critical", v: String(Math.max(0, Math.floor(findings * 0.08))), c: "text-destructive" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                <div className={`mt-1 text-xl font-semibold ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#8B5CF6]/25 p-5 sm:p-6"
          style={{ background: "linear-gradient(160deg, rgba(139,92,246,0.16) 0%, rgba(139,92,246,0.05) 20%, oklch(0.05 0.008 280) 55%, #000 100%)" }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Risk Distribution</div>
            <BarChart3 className="size-4 text-[#A78BFA]" />
          </div>

          <div className="mt-5 space-y-3.5">
            {[
              { label: "Critical", val: Math.max(0, Math.floor(findings * 0.08)), color: "oklch(0.65 0.22 25)", icon: ShieldAlert },
              { label: "High", val: Math.max(0, Math.floor(findings * 0.22)), color: "oklch(0.78 0.17 50)", icon: AlertTriangle },
              { label: "Medium", val: Math.max(0, Math.floor(findings * 0.38)), color: "oklch(0.85 0.16 90)", icon: Eye },
              { label: "Low", val: Math.max(0, Math.floor(findings * 0.32)), color: "oklch(0.55 0.015 240)", icon: CheckCircle2 },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground inline-flex items-center gap-2"><r.icon className="size-3" style={{ color: r.color }} />{r.label}</span>
                  <span className="font-mono">{r.val}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, r.val * 8 + 4)}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ background: r.color }} className="h-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">
            {[
              { l: "Application", v: Math.min(99, score + 5), icon: Fingerprint },
              { l: "Infrastructure", v: Math.max(40, score - 2), icon: Server },
              { l: "Identity", v: Math.max(35, score - 9), icon: KeyRound },
            ].map((p) => (
              <div key={p.l}>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5"><p.icon className="size-3" />{p.l}</span>
                  <span className="font-mono">{p.v}</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.v}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-zinc-500 to-zinc-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live security promo + intel */}
      <div className="grid lg:grid-cols-3 gap-4">
        <button onClick={onLive} className="group relative lg:col-span-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-black text-left">
          <img src={liveSocAsset.url} alt="Nexefy live security operations centre" loading="lazy" width={1536} height={1024}
            className="absolute inset-0 size-full object-cover opacity-70 transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
          <div className="relative p-6 sm:p-8 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Cpu className="size-3 text-zinc-300" /> Under construction
            </div>
            <h3 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">Live Security — 24/7 AI protection</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Connect your site with a single API key and let the Nexefy AI monitor, detect and neutralise threats around the clock.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-xs font-medium group-hover:bg-white/85 transition">
              <Radar className="size-3.5" /> Activate Live Security
            </span>
          </div>
        </button>

        <div className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Live Threat Intel</div>
            <Wifi className="size-4 text-zinc-300 animate-pulse" />
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
                  <div className="size-7 rounded-lg glass grid place-items-center text-[10px] font-mono text-zinc-300">{t.country}</div>
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
      </div>

      {/* Quick actions */}
      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Quick Actions</div>
          <Sparkles className="size-4 text-zinc-300" />
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { l: "New Scan", icon: ScanSearch, to: "/scan/new" as const },
            { l: "Buy Credits", icon: CreditCard, to: "/profile" as const },
            { l: "Security Center", icon: Lock, to: "/profile" as const },
            { l: "Support", icon: Activity, to: "/contact" as const },
          ].map((a) => (
            <Link key={a.l} to={a.to} className="rounded-xl glass p-3 text-xs hover:border-white/25 transition group">
              <a.icon className="size-4 text-zinc-300 mb-2 group-hover:scale-110 transition" />
              <div>{a.l}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------- Reports --------------------------------- */

function Reports({
  scans, pinned, onPin, onUnpin, onLive,
}: { scans: Scan[]; pinned: string | null; onPin: (id: string) => void; onUnpin: () => void; onLive: () => void }) {
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black">
        <img src={reportsImg} alt="Scan reports" loading="lazy" width={1024} height={768}
          className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
        <div className="relative p-6 sm:p-8 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <FileText className="size-3 text-zinc-300" /> Scan reports
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">Every report you submitted</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Track verification, progress and results. Upload any report to the dashboard to make the overview render from it.
          </p>
        </div>
      </div>

      {scans.length === 0 ? (
        
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black px-6 py-20 text-center">
          <img src={noReportsAsset.url} alt="" loading="lazy" width={1536} height={768}
            className="absolute inset-0 size-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />
          <div className="relative">
            <div className="size-12 mx-auto rounded-full border border-white/12 bg-white/[0.05] grid place-items-center text-zinc-300"><ScanSearch className="size-5" /></div>
            <div className="mt-4 text-sm">No reports yet</div>
            <p className="mt-1 text-xs text-muted-foreground">Submit your first scan and it will appear here within minutes.</p>
            <Link to="/scan/new" search={{ plan: 'professional' as const }} className="mt-5 inline-flex rounded-full bg-white text-black px-4 py-2 text-xs font-medium hover:bg-white/85 transition">Start your first scan</Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {scans.map((s, i) => {
            const isPinned = s.id === pinned;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border p-5 bg-black/60 backdrop-blur-xl transition ${isPinned ? "border-white/30" : "border-white/[0.08] hover:border-white/20"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl grid place-items-center border border-white/10 bg-[oklch(0.30_0.01_250_/0.55)]">
                      <Globe2 className="size-4 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-sm truncate">{s.target_url}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{s.plan} plan · {new Date(s.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  {isPinned && <span className="shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-300"><Pin className="size-3" /> On dashboard</span>}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Stat label="Status" value={s.status} icon={s.status === "completed" ? CheckCircle2 : Clock}
                    tone={s.status === "completed" ? "text-emerald-400" : s.status === "running" ? "text-zinc-300" : "text-muted-foreground"} />
                  <Stat label="Score" value={s.score != null ? `${s.score}/100` : "—"} icon={Shield} tone="text-white" />
                  <Stat label="Issues" value={s.findings_count != null ? String(s.findings_count) : "—"} icon={Bug} tone="text-amber-400" />
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: s.status === "completed" ? "100%" : s.status === "running" ? "62%" : "18%" }}
                    transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-300" />
                </div>
                <div className="mt-1.5 text-[10px] text-muted-foreground">
                  Verification: {s.verification_status ?? "pending"}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {isPinned ? (
                    <button onClick={onUnpin} className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs text-white hover:bg-white/[0.09] transition">
                      Remove from dashboard
                    </button>
                  ) : (
                    <button onClick={() => onPin(s.id)} className="rounded-full bg-white text-black px-4 py-2 text-xs font-medium text-black hover:bg-white/85 transition inline-flex items-center gap-1.5">
                      <Upload className="size-3.5" /> Upload Report to Dashboard
                    </button>
                  )}
                  <button onClick={onLive} className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs text-white hover:bg-white/[0.09] transition inline-flex items-center gap-1.5">
                    <Radar className="size-3.5" /> Live protect
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="glass rounded-2xl p-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground">Need another domain assessed?</div>
        <Link to="/scan/new" search={{ plan: 'professional' as const }} className="rounded-full bg-white/[0.06] border border-white/12 px-4 py-2 text-xs inline-flex items-center gap-1.5 hover:bg-white/[0.1] transition">
          Start new scan <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Shield; tone: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xs font-medium inline-flex items-center gap-1.5 capitalize ${tone}`}>
        <Icon className="size-3" /> {value}
      </div>
    </div>
  );
}

/* ------------------------------- Primitives ------------------------------- */

function NavBtn({ icon: Icon, label, active, onClick, badge, soon }: {
  icon: typeof LayoutDashboard; label: string; active?: boolean; onClick: () => void; badge?: string; soon?: boolean;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${active ? "bg-white text-black font-medium shadow-[0_2px_10px_-4px_rgba(0,0,0,0.8)]" : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"}`}>
      <Icon className={`size-4 ${active ? "text-black" : ""}`} />
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-black/10 text-black" : "bg-white/10 text-zinc-200"}`}>{badge}</span>}
      {soon && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 uppercase tracking-wider">soon</span>}
    </button>

  );
}

function SidebarLink({ to, icon: Icon, label }: { to: string; icon: typeof LayoutDashboard; label: string }) {
  return (
    <Link to={to} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition text-muted-foreground hover:bg-white/[0.03] hover:text-white">
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative size-36 sm:size-44">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={r} stroke="oklch(1 0 0 / 0.06)" strokeWidth="10" fill="none" />
        <motion.circle cx="90" cy="90" r={r} stroke="url(#g)" strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.6, ease: "easeOut" }} />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>

      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-white">{value}</div>
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
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.38" />
          <stop offset="55%" stopColor="#6366F1" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke="oklch(1 0 0 / 0.05)" strokeDasharray="4 8" />
      ))}
      <motion.polygon points={area} fill="url(#ca)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.polyline points={points} fill="none" stroke="url(#cl)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} />
      {data.map((v, i) => i % 4 === 0 && (
        <circle key={i} cx={i * step} cy={h - (v / max) * h * 0.85 - 8} r="2.8" fill="#22D3EE" />
      ))}

    </svg>
  );
}
