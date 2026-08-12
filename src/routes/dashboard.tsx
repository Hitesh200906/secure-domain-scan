import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, Bell, CheckCircle2, Clock,
  CreditCard, Globe2, LayoutDashboard, LogOut, ScanSearch, Settings,
  Shield, TrendingUp, User as UserIcon,
  Zap, ArrowUpRight, ArrowRight, Search, Radar, FileText, Menu, X, UploadCloud,
  Building2, Mail, BadgeCheck, Plus, Server,
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

/* ------------------------------ design tokens ----------------------------- */
const C = {
  base: "#000000",
  surface: "#000000",
  elevated: "#050607",
  border: "#232629",
  text: "#F5F7FA",
  sub: "#8B98A8",
  muted: "#596575",
  blue: "#2563EB",
  cyan: "#22D3EE",
};

const SEV = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#60A5FA",
};
const OK = "#22C55E";

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
      <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>Workspace</div>
      <SidebarButton icon={LayoutDashboard} label="Overview" active={view === "overview"} onClick={() => { setView("overview"); onNav?.(); }} />
      <SidebarButton icon={FileText} label="Scan Reports" active={view === "reports"} badge={scans.length ? String(scans.length) : undefined} onClick={() => { setView("reports"); onNav?.(); }} />
      <SidebarLink to="/scan/new" icon={ScanSearch} label="New Scan" onClick={onNav} />
      <div className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>Account</div>
      <SidebarLink to="/profile" icon={UserIcon} label="Profile" onClick={onNav} />
      <SidebarLink to="/profile" search={{ tab: "credits" }} icon={CreditCard} label="Billing" onClick={onNav} />
      <SidebarLink to="/contact" icon={Settings} label="Support" onClick={onNav} />
    </>
  );

  return (
    <div className="h-screen flex relative overflow-hidden" style={{ background: C.base, color: C.text }}>
      {/* Ambient control-room background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: `radial-gradient(1200px 620px at 22% -10%, rgba(59,130,246,0.10), transparent 60%), radial-gradient(900px 520px at 100% 8%, rgba(34,211,238,0.055), transparent 62%)` }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(to right,#8fb7ff 1px,transparent 1px),linear-gradient(to bottom,#8fb7ff 1px,transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse at 40% 0%, black 20%, transparent 75%)" }} />
      </div>

      {/* Static sidebar */}
      <aside className="hidden lg:flex w-[248px] shrink-0 h-screen flex-col" style={{ borderRight: `1px solid ${C.border}`, background: "#000000", backdropFilter: "blur(14px)" }}>
        <div className="px-5 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <Link to="/" className="flex items-center gap-2.5">
            <img src={nexusLogo} alt="Nexefy" className="size-6 object-contain" />
            <span className="text-[12px] font-semibold tracking-[0.24em]">NEXEFY<span className="ml-1.5" style={{ color: C.muted }}>SEC</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-hidden">
          <NavLinks />
        </nav>
        <div className="p-3 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="rounded-xl p-4" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: C.sub }}>{profile?.plan ?? "starter"} plan</div>
              <Zap className="size-3.5" style={{ color: C.blue }} />
            </div>
            <div className="text-[15px] mt-1.5 font-semibold tabular-nums">{(profile?.credits ?? 0).toLocaleString()}<span className="text-[11px] font-normal ml-1" style={{ color: C.sub }}>credits</span></div>
            <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((profile?.credits ?? 0) / 15) * 100)}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})` }} />
            </div>
            <Link to="/pricing" className="mt-3 inline-flex items-center gap-1 text-[11px] hover:underline" style={{ color: C.blue }}>Upgrade plan <ArrowRight className="size-3" /></Link>
          </div>
          {user && (
            <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-lg text-xs inline-flex items-center gap-2 transition hover:bg-white/[0.04]" style={{ color: C.sub }}>
              <LogOut className="size-3.5" /> Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Scrollable content */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto relative">
        <header className="sticky top-0 z-20" style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setMobileNav(true)} className="lg:hidden size-9 shrink-0 rounded-lg grid place-items-center transition hover:bg-white/[0.05]" style={{ border: `1px solid ${C.border}` }} aria-label="Open menu">
                <Menu className="size-4" />
              </button>
              <div className="min-w-0">
                <h1 className="text-[17px] font-semibold tracking-[-0.01em] truncate">{view === "reports" ? "Scan Reports" : "Overview"}</h1>
                <p className="text-[11.5px] truncate" style={{ color: C.sub }}>
                  {view === "reports" ? "Submitted scans and their reports" : "Security posture across your monitored assets"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-2 text-[11px] rounded-lg px-3 py-1.5" style={{ border: `1px solid ${C.border}`, color: C.sub }}>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: OK, opacity: 0.5 }} />
                  <span className="relative inline-flex size-1.5 rounded-full" style={{ background: OK }} />
                </span>
                All systems operational
                <span className="font-mono tabular-nums" style={{ color: C.muted }}>{mounted && time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs w-52 lg:w-64" style={{ border: `1px solid ${C.border}`, background: "#000000", color: C.sub }}>
                <Search className="size-3.5" />
                <input placeholder="Search assets, findings…" className="bg-transparent outline-none flex-1 min-w-0 text-white placeholder:text-[#596575]" />
                <kbd className="text-[10px] rounded px-1 py-0.5" style={{ border: `1px solid ${C.border}`, color: C.muted }}>⌘K</kbd>
              </div>
              <button className="size-9 rounded-lg grid place-items-center transition hover:bg-white/[0.05]" style={{ border: `1px solid ${C.border}` }} aria-label="Notifications">
                <Bell className="size-4" />
              </button>
              <Link to="/profile" search={{ tab: "general" }} className="hidden sm:grid size-9 rounded-lg place-items-center transition hover:bg-white/[0.05]" style={{ border: `1px solid ${C.border}` }} aria-label="Profile">
                <UserIcon className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        {view === "reports" ? (
          <ReportsSection scans={scans} activeId={activeId} onUpload={uploadReport} mounted={mounted} />
        ) : (
          <Overview report={report} profile={profile} scans={scans} mounted={mounted} onOpenReports={() => setView("reports")} role={role} name={profile?.full_name ?? null} />
        )}
      </div>

      {/* Mobile nav drawer */}
      <div onClick={() => setMobileNav(false)}
        className={`lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity ${mobileNav ? "opacity-100" : "opacity-0 pointer-events-none"}`} />
      <aside className={`lg:hidden fixed left-0 top-0 z-[70] h-full w-72 shadow-2xl flex flex-col transition-transform duration-300 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`} style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <Link to="/" onClick={() => setMobileNav(false)} className="flex items-center gap-2.5">
            <img src={nexusLogo} alt="Nexefy" className="size-5 object-contain" />
            <span className="text-[12px] font-semibold tracking-[0.24em]">NEXEFY<span className="ml-1.5" style={{ color: C.muted }}>SEC</span></span>
          </Link>
          <button onClick={() => setMobileNav(false)} className="size-8 grid place-items-center rounded-full hover:bg-white/10 transition" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks onNav={() => setMobileNav(false)} />
        </nav>
        {user && (
          <div className="p-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-lg text-xs inline-flex items-center gap-2 hover:bg-white/[0.04]" style={{ color: C.sub }}>
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* -------------------------------- primitives ------------------------------ */
function Panel({ className = "", children, glow = false }: { className?: string; children: React.ReactNode; glow?: boolean }) {
  return (
    <section
      className={`group relative rounded-2xl transition-all duration-200 hover:-translate-y-px ${className}`}
      style={{
        border: `1px solid ${C.border}`,
        background: "#000000",
        boxShadow: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 18px 40px -28px rgba(0,0,0,0.9)",
      }}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-x-6 -top-px h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.blue}66, transparent)` }} />
      )}
      {children}
    </section>
  );
}

function PanelHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
        {sub && <p className="text-[11px] mt-0.5 truncate" style={{ color: C.sub }}>{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function LivePill({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.18em] rounded-md px-2 py-1"
      style={{ border: `1px solid ${C.cyan}33`, color: C.cyan, background: "rgba(34,211,238,0.06)" }}>
      {label}
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: C.cyan, opacity: 0.55 }} />
        <span className="relative inline-flex size-1.5 rounded-full" style={{ background: C.cyan }} />
      </span>
    </span>
  );
}

function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = ref.current;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = from + (target - from) * eased;
      ref.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function CountNumber({ value, className = "", style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const v = useCountUp(value);
  return <span className={`tabular-nums ${className}`} style={style}>{Math.round(v).toLocaleString()}</span>;
}

/* -------------------------------- overview -------------------------------- */
function Overview({ report, profile, scans, mounted, onOpenReports, role, name }: {
  report: ReportModel; profile: { plan: string; credits: number } | null; scans: Scan[]; mounted: boolean;
  onOpenReports: () => void; role: string | null | undefined; name: string | null;
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
  const weakest = [...report.posture].sort((a, b) => a.value - b.value)[0];
  const sc = scoreColor(report.score);
  const scoreLabel = report.score >= 80 ? "Strong" : report.score >= 40 ? "Good" : "At risk";

  return (
    <div className="px-4 sm:px-7 py-5 sm:py-6 space-y-5 max-w-[1560px]">
      {/* Hero / welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em]">
              {(mounted ? greeting() : "Welcome back")}{name ? `, ${name.split(" ")[0]}` : ""}
            </h2>
            <RoleBadge role={role as never} size="md" />
          </div>
          <p className="mt-1.5 text-[12.5px]" style={{ color: C.sub }}>
            {report.score >= 70
              ? "Your security environment is looking healthy."
              : "Some areas of your environment need attention."}
          </p>
        </div>
        <Link
          to="/scan/new" search={{ plan: "professional" as const }}
          className="group shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:-translate-y-px"
          style={{ background: C.blue, boxShadow: `0 1px 0 0 rgba(255,255,255,0.22) inset, 0 10px 24px -14px ${C.blue}` }}
        >
          <Plus className="size-4" /> New Scan
        </Link>
      </div>

      {/* Demo banner */}
      {report.demo && (
        <div className="rounded-xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ border: `1px solid ${C.border}`, background: "#000000" }}>
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="size-8 shrink-0 rounded-lg grid place-items-center" style={{ border: `1px solid ${C.border}`, background: C.elevated }}>
              <FileText className="size-3.5" style={{ color: C.blue }} />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium">Demo environment</div>
              <p className="text-[11.5px] mt-0.5" style={{ color: C.sub }}>
                You're currently viewing sample security data. Run a scan to populate your dashboard with real findings.
              </p>
            </div>
          </div>
          <Link to="/scan/new" search={{ plan: "professional" as const }}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11.5px] font-medium transition hover:bg-white/[0.05]"
            style={{ border: `1px solid ${C.border}`, color: C.text }}>
            Run First Scan <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Security score */}
        <KpiCard label="Security Score" icon={Shield} accent={sc} glow>
          <div className="flex items-center gap-4">
            <ScoreRing value={report.score} size={78} stroke={8} compact />
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <CountNumber value={report.score} className="text-[30px] leading-none font-semibold" style={{ color: sc }} />
                <span className="text-[12px]" style={{ color: C.muted }}>/100</span>
              </div>
              <span className="mt-2 inline-flex text-[10px] uppercase tracking-[0.14em] rounded px-1.5 py-0.5"
                style={{ color: sc, border: `1px solid ${sc}44`, background: `${sc}12` }}>{scoreLabel}</span>
            </div>
          </div>
          <p className="mt-3 text-[10.5px]" style={{ color: C.muted }}>Risk-weighted across monitored assets</p>
        </KpiCard>

        {/* Open findings */}
        <KpiCard label="Open Findings" icon={AlertTriangle} accent={SEV.High}>
          <CountNumber value={report.findings} className="text-[30px] leading-none font-semibold" />
          <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
            {risk.map((r, i) => (
              <motion.div key={r.label} initial={{ width: 0 }} animate={{ width: `${(r.val / riskTotal) * 100}%` }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: "easeOut" }} style={{ background: r.color }} />
            ))}
          </div>
          <p className="mt-2 text-[10.5px]" style={{ color: C.muted }}>Open vulnerabilities across assets</p>
        </KpiCard>

        {/* Assets */}
        <KpiCard label="Assets Monitored" icon={Server} accent={C.cyan}>
          <CountNumber value={scans.length || 1} className="text-[30px] leading-none font-semibold" />
          <div className="mt-3 flex items-end gap-[3px] h-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span key={i} initial={{ height: 2 }} animate={{ height: 4 + ((i * 7) % 5) * 4 }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                className="w-full rounded-[1px]"
                style={{ background: i % 3 === 0 ? `${C.cyan}88` : "rgba(255,255,255,0.10)" }} />
            ))}
          </div>
          <p className="mt-2 text-[10.5px]" style={{ color: C.muted }}>Protected assets · {scans.length} scans</p>
        </KpiCard>

        {/* Credits */}
        <KpiCard label="Credits" icon={Zap} accent={C.blue}>
          <CountNumber value={profile?.credits ?? 0} className="text-[30px] leading-none font-semibold" />
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((profile?.credits ?? 0) / 200) * 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }} className="h-full" style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})` }} />
          </div>
          <p className="mt-2 text-[10.5px] capitalize" style={{ color: C.muted }}>Credits remaining · {profile?.plan ?? "starter"} plan</p>
        </KpiCard>
      </div>

      {/* Posture + risk distribution */}
      <div className="grid lg:grid-cols-5 gap-3.5">
        <Panel className="lg:col-span-3" glow>
          <PanelHead
            title="Overall Security Posture"
            sub="Risk-weighted across monitored assets"
            right={<span className="text-[11px] font-mono tabular-nums" style={{ color: sc }}>{report.score} / 100</span>}
          />
          <div className="p-5 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="mx-auto sm:mx-0"><ScoreRing value={report.score} size={132} stroke={9} /></div>
            <div className="space-y-4">
              {report.posture.map((p, i) => {
                const isWeak = weakest && p.label === weakest.label;
                const col = i === 0 ? C.blue : i === 1 ? "#4F7FE8" : C.cyan;
                return (
                  <div key={p.label}>
                    <div className="flex items-baseline justify-between text-[11.5px]">
                      <span className="inline-flex items-center gap-2" style={{ color: C.sub }}>
                        {p.label}
                        {isWeak && <span className="text-[9px] uppercase tracking-[0.14em] rounded px-1.5 py-0.5" style={{ color: SEV.Medium, border: `1px solid ${SEV.Medium}33` }}>Focus</span>}
                      </span>
                      <span className="font-mono tabular-nums">{p.value}</span>
                    </div>
                    <div className="mt-1.5 h-[7px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.value}%` }} transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${col}, ${col}bb)` }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] pt-1" style={{ color: C.muted }}>
                Weakest area: <span style={{ color: C.text }}>{weakest?.label}</span> — prioritise remediation here first.
              </p>
            </div>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHead title="Risk Distribution" sub={`${riskTotal} findings by severity`} />
          <div className="p-5 flex flex-col sm:flex-row items-center gap-5">
            <Donut segments={risk} total={riskTotal} />
            <div className="flex-1 w-full min-w-0">
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2.5">
                {risk.map((r) => (
                  <li key={r.label} className="flex items-center justify-between text-[11.5px]">
                    <span className="inline-flex items-center gap-2" style={{ color: C.sub }}>
                      <span className="size-1.5 rounded-full" style={{ background: r.color }} />{r.label}
                    </span>
                    <span className="font-mono tabular-nums">{r.val}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 pt-3 text-[10.5px] leading-relaxed" style={{ color: C.muted, borderTop: `1px solid ${C.border}` }}>
                <span className="block uppercase tracking-[0.16em] text-[9.5px] mb-1" style={{ color: C.sub }}>Risk posture</span>
                Most findings are concentrated in medium and low severity categories.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Threat activity */}
      <Panel>
        <PanelHead
          title="Threat Activity"
          sub={`Last 24 hours · ${report.demo ? "demo feed" : report.target}`}
          right={<LivePill />}
        />
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {[
              { l: "Blocked", v: blocked, c: OK },
              { l: "Investigating", v: investigating, c: SEV.High },
              { l: "Critical", v: critical, c: SEV.Critical },
            ].map((s) => (
              <div key={s.l} className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] truncate" style={{ color: C.muted }}>{s.l}</div>
                <CountNumber value={s.v} className="mt-1 block text-xl sm:text-2xl font-semibold" style={{ color: s.c }} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <Chart data={report.trend} height={112} />
            <div className="mt-2 flex justify-between text-[9.5px] font-mono" style={{ color: C.muted }}>
              {["24h ago", "18h", "12h", "6h", "now"].map((t) => <span key={t}>{t}</span>)}
            </div>
          </div>
        </div>
      </Panel>

      {/* Recent scans + live feed */}
      <div className="grid lg:grid-cols-3 gap-3.5">
        <Panel className="lg:col-span-2 overflow-hidden">
          <PanelHead
            title="Recent Scans"
            sub={`${scans.length} total this month`}
            right={<button onClick={onOpenReports} className="text-[11px] inline-flex items-center gap-1 transition hover:text-white" style={{ color: C.sub }}>View all <ArrowRight className="size-3" /></button>}
          />
          {scans.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="relative mx-auto size-14 grid place-items-center">
                <span className="absolute inset-0 rounded-full animate-ping" style={{ border: `1px solid ${C.blue}33` }} />
                <span className="absolute inset-2 rounded-full" style={{ border: `1px solid ${C.border}` }} />
                <Radar className="size-5" style={{ color: C.blue }} />
              </div>
              <div className="mt-4 text-[13.5px] font-medium">No scans yet</div>
              <p className="mt-1 text-[11.5px] max-w-sm mx-auto" style={{ color: C.sub }}>
                Start your first security scan to begin building your security history.
              </p>
              <Link to="/scan/new" search={{ plan: "professional" as const }}
                className="mt-4 inline-flex rounded-lg px-4 py-2 text-[11.5px] font-medium text-white transition hover:-translate-y-px"
                style={{ background: C.blue, boxShadow: `0 1px 0 0 rgba(255,255,255,0.2) inset` }}>
                Start New Scan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
                    <th className="text-left font-normal px-5 py-3">Target</th>
                    <th className="text-left font-normal py-3">Plan</th>
                    <th className="text-left font-normal py-3">Status</th>
                    <th className="text-left font-normal py-3">Score</th>
                    <th className="text-right font-normal px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((r) => (
                    <tr key={r.id} className="transition hover:bg-white/[0.02]" style={{ borderTop: `1px solid ${C.border}` }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 rounded-md grid place-items-center" style={{ border: `1px solid ${C.border}`, background: C.elevated }}><Globe2 className="size-3" style={{ color: C.sub }} /></div>
                          <span className="font-mono text-xs truncate max-w-[220px]">{r.target_url}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs capitalize" style={{ color: C.sub }}>{r.plan}</td>
                      <td className="py-3"><StatusPill status={r.status} /></td>
                      <td className="py-3 font-mono text-xs tabular-nums" style={{ color: r.score != null ? scoreColor(r.score) : C.muted }}>{r.score != null ? `${r.score}/100` : "—"}</td>
                      <td className="px-5 py-3 text-right text-xs" style={{ color: C.sub }}>{mounted ? new Date(r.created_at).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHead title="Live Threat Activity" sub="Real-time events across monitored assets" right={<LivePill />} />
          <ul>
            {report.threats.map((t, i) => {
              const sev = sevOrder[i % 4];
              return (
                <motion.li key={t.ip} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: i * 0.07 }}
                  className="px-5 py-3.5 flex items-center justify-between gap-3 transition hover:bg-white/[0.02]"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-7 shrink-0 rounded-md grid place-items-center text-[10px] font-mono"
                      style={{ border: `1px solid ${C.border}`, background: C.elevated, color: C.sub }}>{t.country}</div>
                    <div className="min-w-0">
                      <div className="font-mono text-[12px] truncate">{t.ip}</div>
                      <div className="text-[10.5px] mt-0.5 truncate" style={{ color: C.sub }}>{t.type}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                      style={{ color: SEV[sev], border: `1px solid ${SEV[sev]}40`, background: `${SEV[sev]}0f` }}>
                      <span className="size-1 rounded-full" style={{ background: SEV[sev] }} />{sev}
                    </span>
                    <div className="text-[9.5px] mt-1 font-mono" style={{ color: C.muted }}>{t.ago}</div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
          <div className="px-5 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <Link to="/report/$id" params={{ id: report.id }} className="text-[11px] inline-flex items-center gap-1 transition hover:text-white" style={{ color: C.sub }}>
              View all activity <ArrowRight className="size-3" />
            </Link>
          </div>
        </Panel>
      </div>

      {/* Workspace activity */}
      {scans.length > 0 && (
        <Panel>
          <PanelHead title="Activity" sub="Latest workspace events" right={<Activity className="size-4" style={{ color: C.muted }} />} />
          <ul className="p-5 space-y-3.5">
            {scans.slice(0, 5).map((s) => (
              <li key={s.id} className="flex gap-3">
                <span className="mt-1.5 size-1.5 rounded-full shrink-0"
                  style={{ background: s.status === "completed" ? OK : s.status === "running" ? C.blue : C.muted }} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">Scan {s.status} for <span className="font-mono" style={{ color: C.sub }}>{s.target_url}</span></div>
                  <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{mounted ? new Date(s.created_at).toLocaleString() : ""}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* Security intelligence CTA */}
      <div className="relative overflow-hidden rounded-2xl" style={{ border: `1px solid ${C.border}`, background: "#000000" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(to right,#9dc0ff 1px,transparent 1px),linear-gradient(to bottom,#9dc0ff 1px,transparent 1px)", backgroundSize: "34px 34px", maskImage: "linear-gradient(90deg, transparent, black 40%, transparent)" }} />
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full" style={{ background: `radial-gradient(circle, ${C.blue}22, transparent 65%)` }} />
        <div className="relative px-5 sm:px-7 py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: C.cyan }}>
              <TrendingUp className="size-3" /> Security Intelligence
            </div>
            <h3 className="mt-2 text-[17px] sm:text-[20px] font-semibold tracking-[-0.01em]">Full technical report</h3>
            <p className="mt-1.5 text-[12.5px] max-w-2xl leading-relaxed" style={{ color: C.sub }}>
              Deep-dive into vulnerabilities, CVSS scores, affected assets, reproduction evidence, and remediation guidance for {report.demo ? "the demo target" : report.target}.
            </p>
          </div>
          <Link to="/report/$id" params={{ id: report.id }}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:-translate-y-px"
            style={{ background: C.blue, boxShadow: `0 1px 0 0 rgba(255,255,255,0.22) inset, 0 12px 28px -16px ${C.blue}` }}>
            View Full Technical Report <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, icon: Icon, accent, children, glow }: {
  label: string; icon: typeof Shield; accent: string; children: React.ReactNode; glow?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="relative rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-px"
      style={{
        border: `1px solid ${C.border}`,
        background: "#000000",
        boxShadow: "0 1px 0 0 rgba(255,255,255,0.035) inset, 0 18px 40px -30px rgba(0,0,0,0.9)",
      }}>
      {glow && <div className="pointer-events-none absolute inset-x-5 -top-px h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}77, transparent)` }} />}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>{label}</span>
        <Icon className="size-3.5" style={{ color: accent }} />
      </div>
      <div className="mt-3.5">{children}</div>
    </motion.div>
  );
}

function Donut({ segments, total }: { segments: { label: string; val: number; color: string }[]; total: number }) {
  const r = 46, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative size-[124px] shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {segments.map((s, i) => {
          const frac = s.val / total;
          const dash = frac * c;
          const off = -acc * c;
          acc += frac;
          return (
            <motion.circle key={s.label} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="10"
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={off}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: i * 0.08 }} />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <CountNumber value={total} className="block text-[22px] leading-none font-semibold" />
          <div className="text-[9px] uppercase tracking-[0.16em] mt-1" style={{ color: C.muted }}>Findings</div>
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
    <div className="px-4 sm:px-7 py-5 sm:py-6 space-y-4 max-w-[1560px]">
      <Panel glow>
        <div className="px-5 py-4">
          <div className="text-[13px] font-semibold">Submitted scan reports</div>
          <div className="text-[11.5px] mt-0.5" style={{ color: C.sub }}>
            Every scan you submitted, with full submission details and status. Upload one to the overview dashboard to drive its metrics.
          </div>
        </div>
      </Panel>

      {scans.length === 0 ? (
        <Panel>
          <div className="px-6 py-16 text-center">
            <div className="size-12 mx-auto rounded-xl grid place-items-center" style={{ border: `1px solid ${C.border}`, background: C.elevated }}>
              <FileText className="size-5" style={{ color: C.blue }} />
            </div>
            <div className="mt-4 text-[13.5px] font-medium">No reports submitted yet</div>
            <p className="mt-1 text-[11.5px]" style={{ color: C.sub }}>Once you submit a scan, its report will appear here.</p>
            <Link to="/scan/new" search={{ plan: "professional" as const }}
              className="mt-5 inline-flex rounded-lg px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-px"
              style={{ background: C.blue }}>Submit a scan</Link>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-3.5">
          {scans.map((s) => {
            const r = buildReport(s);
            const active = activeId === s.id;
            return (
              <div key={s.id} className="rounded-2xl p-5 transition-all hover:-translate-y-px"
                style={{
                  border: `1px solid ${active ? `${OK}55` : C.border}`,
                  background: "#000000",
                }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="size-10 rounded-xl grid place-items-center" style={{ border: `1px solid ${C.border}`, background: C.elevated }}>
                      <Globe2 className="size-4" style={{ color: C.blue }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-sm truncate">{s.target_url}</div>
                      <div className="text-[11px] mt-0.5 capitalize" style={{ color: C.sub }}>
                        {s.plan} plan{mounted ? ` · submitted ${new Date(s.created_at).toLocaleString()}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={s.status} />
                    {active && (
                      <span className="text-[9.5px] uppercase tracking-[0.16em] px-2 py-1 rounded inline-flex items-center gap-1"
                        style={{ color: OK, border: `1px solid ${OK}44`, background: `${OK}12` }}>
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

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>Score</div>
                      <div className="text-xl font-semibold tabular-nums" style={{ color: scoreColor(r.score) }}>{r.score}<span className="text-xs" style={{ color: C.muted }}>/100</span></div>
                    </div>
                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>Findings</div>
                      <div className="text-xl font-semibold tabular-nums">{r.findings}</div>
                    </div>
                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>Role</div>
                      <div className="text-sm mt-1">{r.requester.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpload(s.id)}
                    disabled={active}
                    className="rounded-lg px-4 py-2 text-xs font-medium inline-flex items-center gap-2 transition hover:-translate-y-px disabled:translate-y-0"
                    style={active
                      ? { background: "rgba(255,255,255,0.04)", color: C.muted, cursor: "default" }
                      : { background: C.blue, color: "#fff", boxShadow: "0 1px 0 0 rgba(255,255,255,0.2) inset" }}
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
    <div className="rounded-xl px-3 py-2.5" style={{ border: `1px solid ${C.border}`, background: "#000000" }}>
      <div className="text-[9.5px] uppercase tracking-[0.18em] inline-flex items-center gap-1.5" style={{ color: C.muted }}><Icon className="size-3" />{label}</div>
      <div className="text-xs mt-1 truncate capitalize">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const col = status === "completed" ? OK : status === "running" ? C.blue : C.muted;
  return (
    <span className="text-[9.5px] uppercase tracking-[0.16em] px-2 py-1 rounded inline-flex items-center gap-1.5"
      style={{ color: col, border: `1px solid ${col}3d`, background: `${col}0f` }}>
      {status === "completed" ? <CheckCircle2 className="size-3" /> : status === "running" ? <Clock className="size-3 animate-spin" /> : <Clock className="size-3" />}
      {status}
    </span>
  );
}

/* -------------------------------- widgets -------------------------------- */
function SidebarLink({ to, icon: Icon, label, onClick, search }: { to: string; icon: typeof LayoutDashboard; label: string; onClick?: () => void; search?: Record<string, string> }) {
  return (
    <Link to={to} search={search as never} onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition hover:bg-white/[0.04] hover:text-white"
      style={{ color: C.sub }}>
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

function SidebarButton({ icon: Icon, label, active, badge, onClick }: { icon: typeof LayoutDashboard; label: string; active?: boolean; badge?: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition hover:bg-white/[0.04]"
      style={active
        ? { background: "rgba(37,99,235,0.14)", color: C.text, boxShadow: `inset 0 0 0 1px ${C.blue}2e` }
        : { color: C.sub }}>
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r" style={{ background: C.blue }} />}
      <Icon className="size-4" style={active ? { color: C.blue } : undefined} />
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: C.sub }}>{badge}</span>}
    </button>
  );
}

function ScoreRing({ value, size = 132, stroke = 9, compact = false }: { value: number; size?: number; stroke?: number; compact?: boolean }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const col = scoreColor(value);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx="90" cy="90" r={r} stroke={col} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.3, ease: "easeOut" }}
        />
      </svg>
      {!compact && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[30px] leading-none font-semibold tabular-nums" style={{ color: col }}>{value}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] mt-1.5" style={{ color: C.muted }}>Secure</div>
          </div>
        </div>
      )}
      {compact && (
        <div className="absolute inset-0 grid place-items-center">
          <Shield className="size-4" style={{ color: col }} />
        </div>
      )}
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
          <stop offset="0%" stopColor={C.blue} stopOpacity="0.30" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.blue} />
          <stop offset="100%" stopColor={C.cyan} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke="rgba(255,255,255,0.04)" />
      ))}
      <motion.polygon points={area} fill="url(#ca)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }} />
      <motion.polyline points={points} fill="none" stroke="url(#cl)" strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
    </svg>
  );
}
