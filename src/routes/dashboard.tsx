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
import dashboardHeroBg from "@/assets/dashboard-hero-bg.png.asset.json";
import detailedReportBg from "@/assets/detailed-security-report-v3.png.asset.json";
import icShield from "@/assets/tile-shield.jpg";
import icScan from "@/assets/tile-scan.jpg";
import icServer from "@/assets/tile-server.jpg";
import icLock from "@/assets/tile-lock.jpg";

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
          <PlanCard plan={profile?.plan ?? "starter"} credits={profile?.credits ?? 0} />

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
const FLAG: Record<string, string> = {
  US: "🇺🇸", DE: "🇩🇪", IN: "🇮🇳", SG: "🇸🇬", RU: "🇷🇺", CN: "🇨🇳", BR: "🇧🇷", NL: "🇳🇱",
};
const COUNTRY: Record<string, string> = {
  US: "United States", DE: "Germany", IN: "India", SG: "Singapore",
  RU: "Russia", CN: "China", BR: "Brazil", NL: "Netherlands",
};
const THREAT_KIND: Record<string, string> = {
  "Brute force": "Authentication",
  "SQL injection": "Injection",
  "Port scan": "Reconnaissance",
  "XSS attempt": "Cross-Site Scripting",
  "Credential stuffing": "Authentication",
  "Directory traversal": "Exploitation",
};
const SEV_ORDER: { label: keyof typeof SEV; color: string }[] = [
  { label: "High", color: SEV.High },
  { label: "High", color: SEV.High },
  { label: "Medium", color: SEV.Medium },
  { label: "Medium", color: SEV.Medium },
  { label: "Low", color: OK },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: "#000000", border: `1px solid ${C.border}` }}>
      {children}
    </div>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 rounded-lg px-5 py-3 text-[14px] font-medium transition-all group-hover:bg-white/[0.05] group-hover:-translate-y-px"
      style={{ border: `1px solid ${C.border}`, color: C.text }}>
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </span>
  );
}

function grade(v: number) {
  if (v >= 90) return "A+";
  if (v >= 80) return "A";
  if (v >= 70) return "B";
  if (v >= 55) return "C";
  if (v >= 40) return "D";
  return "F";
}

function ScoreDial({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const S = 240, cx = 120, cy = 120;

  // 270° sweep gauge (from 135° to 405°)
  const START = 135, SWEEP = 270;
  const polar = (r: number, deg: number) => {
    const a = (Math.PI / 180) * deg;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const arc = (r: number, frac: number) => {
    const [x0, y0] = polar(r, START);
    const [x1, y1] = polar(r, START + SWEEP * frac);
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${SWEEP * frac > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  };

  const R = 100;
  const len = (Math.PI * 2 * R) * (SWEEP / 360);

  return (
    <div className="relative shrink-0 mx-auto sm:mx-0 w-[190px] h-[190px] sm:w-[240px] sm:h-[240px]">

      <div
        className="absolute inset-8 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 45%, ${color}12 0%, transparent 70%)` }}
      />

      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="scoreArc" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* fine graduation marks */}
        {Array.from({ length: 46 }, (_, i) => {
          const f = i / 45;
          const deg = START + SWEEP * f;
          const on = f <= pct;
          const major = i % 5 === 0;
          const [x1, y1] = polar(115, deg);
          const [x2, y2] = polar(major ? 105 : 109, deg);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={on ? color : "rgba(255,255,255,0.12)"}
              strokeOpacity={on ? (major ? 0.9 : 0.55) : 1}
              strokeWidth={major ? 1.6 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* track */}
        <path d={arc(R, 1)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} strokeLinecap="round" />

        {/* progress */}
        <motion.path
          d={arc(R, 1)}
          fill="none"
          stroke="url(#scoreArc)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={len}
          initial={{ strokeDashoffset: len }}
          animate={{ strokeDashoffset: len * (1 - pct) }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />

        {/* inner hairline ring */}
        <circle cx={cx} cy={cy} r={84} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em]" style={{ color: C.muted }}>Score</div>
          <div className="flex items-end justify-center gap-1">
            <CountNumber value={value} className="text-[44px] sm:text-[58px] leading-none font-light" style={{ color }} />
            <span className="pb-1 sm:pb-1.5 text-[12px] sm:text-[14px]" style={{ color: C.muted }}>/100</span>
          </div>
          <div
            className="mt-2 sm:mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-medium"
            style={{ border: `1px solid ${color}44`, color, background: `${color}0F` }}
          >
            Grade {grade(value)}
          </div>
        </div>
      </div>

    </div>
  );
}


/* ------------------------------ telemetry strip ----------------------------- */
function TelemetryStrip({ report }: { report: ReportModel }) {
  const items = [
    { label: "Protected Assets", value: `${Math.max(1, Math.round(report.score / 4))}`, sub: "under monitoring", icon: Shield },
    { label: "Threats Neutralized", value: `${report.findings + 12}`, sub: "last 24 hours", icon: Zap },
    { label: "Active Nodes", value: "14", sub: "global edge network", icon: Server },
    { label: "Avg Response", value: "14ms", sub: "mitigation latency", icon: Activity },
  ];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.04) 50%, transparent 100%)` }} />
      </div>
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 divide-x-0 lg:divide-x" style={{ borderColor: C.border }}>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-4 px-5 sm:px-7 py-5 relative">
              <div className="relative">
                <div className="size-10 rounded-xl grid place-items-center" style={{ border: `1px solid ${C.border}`, background: "#000000" }}>
                  <Icon className="size-4.5" style={{ color: C.blue }} />
                </div>
                {i === 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border border-black"
                    style={{ background: OK }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>{item.label}</div>
                <div className="mt-0.5 text-[18px] sm:text-[20px] font-light tracking-tight text-white">{item.value}</div>
                <div className="text-[11px]" style={{ color: C.sub }}>{item.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Overview({ report, profile, scans, mounted, onOpenReports, role, name }: {
  report: ReportModel; profile: { plan: string; credits: number } | null; scans: Scan[]; mounted: boolean;
  onOpenReports: () => void; role: string | null | undefined; name: string | null;
}) {
  void profile; void onOpenReports; void role;
  const sc = scoreColor(report.score);
  const strong = report.score >= 70;
  const threats = report.threats.slice(0, 5);

  return (
    <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-4 max-w-[1560px]">
      {/* HERO */}
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${dashboardHeroBg.url})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.10) 100%)`,
          }}
        />
        <div className="relative z-10 grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="p-7 sm:p-10 flex flex-col justify-center">
            <h2 className="text-[26px] sm:text-[30px] font-light tracking-[-0.02em] leading-tight drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]">
              {mounted ? greeting() : "Welcome back"},
              <br />
              <span className="font-medium" style={{ color: C.blue }}>{name ? name.split(" ")[0] : "there"}</span>
            </h2>
            <p className="mt-5 text-[14px] leading-relaxed max-w-xs drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]" style={{ color: C.sub }}>
              Scan any domain for threats, vulnerabilities and security risks in seconds.
            </p>
            <Link to="/scan/new" search={{ plan: "professional" as const }} className="group mt-7 self-start">
              <GhostButton>Start New Scan</GhostButton>
            </Link>
          </div>
          <div className="hidden md:block min-h-[340px]" />
        </div>
      </Card>

      {/* SECURITY TELEMETRY STRIP — premium status overview */}
      <TelemetryStrip report={report} />

      {/* SECURITY SCORE */}
      <Card className="relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative z-10 grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="p-7 sm:p-10" style={{ borderRight: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 shrink-0 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                  <img src={icShield} alt="" loading="lazy" width={512} height={512} className="size-full object-cover" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium tracking-tight">Security Score</h3>
                  <div className="text-[11.5px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
                    Posture index
                  </div>
                </div>
              </div>
              <span
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]"
                style={{ border: `1px solid ${C.border}`, color: C.sub }}
              >
                <span className="size-1.5 rounded-full" style={{ background: OK }} />
                Live
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-10">
              <ScoreDial value={report.score} color={sc} />
              <div className="min-w-0 flex-1">
                <h4 className="text-[24px] sm:text-[28px] font-semibold tracking-tight leading-tight">
                  {strong ? "Strong security" : "Attention required"}
                </h4>
                <div className="mt-2 text-[15px] sm:text-[16px]" style={{ color: C.sub }}>
                  {strong ? "Your domain is protected and monitored." : "Your domain needs review and remediation."}
                </div>
                <div className="mt-4 h-px w-16" style={{ background: C.blue }} />
                <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed" style={{ color: C.sub }}>
                  Your security posture is {strong ? "strong" : "below target"}. Keep monitoring to stay ahead of threats.
                </p>
                <div className="mt-6 inline-flex items-center gap-4 rounded-xl px-4 py-3.5"
                  style={{ border: `1px solid ${C.border}`, background: "#000000" }}>
                  <div className="size-12 shrink-0 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                    <img src={icLock} alt="" loading="lazy" width={512} height={512} className="size-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-medium" style={{ color: strong ? OK : SEV.High }}>
                      {strong ? "Low Risk" : "Elevated Risk"}
                    </div>
                    <div className="text-[13px]" style={{ color: C.sub }}>
                      {strong ? "No critical threats detected" : "Critical findings require action"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-10 flex flex-col justify-center gap-0">
            <SideStat
              img={icShield}
              title="Vulnerabilities"
              sub="Medium & low severity"
              right={<span className="text-[24px] font-light">{report.findings}</span>}
            />
            <div className="h-px my-6" style={{ background: C.border }} />
            <SideStat img={icScan} title="Scan Frequency" sub={"Every 24 hours\nAutomated schedule"} />
            <div className="h-px my-6" style={{ background: C.border }} />
            <SideStat
              img={icServer}
              title="System Status"
              sub="All systems operational"
              right={<span className="size-3 rounded-full inline-block" style={{ background: OK, boxShadow: `0 0 12px ${OK}` }} />}
            />
          </div>
        </div>
      </Card>


      {/* LIVE THREAT ACTIVITY */}
      <Card>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[18px] font-medium tracking-tight">Live Threat Activity</h3>
            <button onClick={onOpenReports} className="group inline-flex items-center gap-2 text-[13px]" style={{ color: C.blue }}>
              View all <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-5">
            <div className="hidden sm:grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.8fr)] gap-3 sm:gap-4 text-[12px] pb-3" style={{ color: C.muted }}>
              <div className="min-w-0">Threat</div>
              <div className="min-w-0">Location</div>
              <div className="min-w-0">Type</div>
              <div className="min-w-0">Security Affected</div>
              <div className="min-w-0">Time</div>
            </div>
            {threats.map((t, i) => {
              const sev = SEV_ORDER[i % SEV_ORDER.length];
              return (
                <motion.div
                  key={`${t.ip}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.8fr)] gap-3 sm:gap-4 items-center py-3.5"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <div className="min-w-0 text-[12px] sm:text-[13.5px] truncate">{t.type}</div>
                  <div className="min-w-0 text-[12px] sm:text-[13.5px] truncate" style={{ color: C.sub }}>
                    <span className="mr-1.5">{FLAG[t.country] ?? "🏳️"}</span>
                    {COUNTRY[t.country] ?? t.country}
                  </div>
                  <div className="min-w-0 text-[12px] sm:text-[13.5px] truncate" style={{ color: C.sub }}>
                    {THREAT_KIND[t.type] ?? "Anomaly"}
                  </div>
                  <div className="min-w-0 text-[12px] sm:text-[13.5px] truncate">
                    <span className="inline-flex items-center gap-2" style={{ color: sev.color }}>
                      <span className="size-1.5 rounded-full" style={{ background: sev.color }} />
                      {sev.label}
                    </span>
                  </div>
                  <div className="min-w-0 text-[12px] sm:text-[13.5px] truncate" style={{ color: C.sub }}>{t.ago.replace("m ago", " min ago")}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* DETAILED REPORT */}
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${detailedReportBg.url})` }}
        />
        {/* Brackish coating: dark, murky overlay across the whole card */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(2,6,10,0.28)" }}
        />
        {/* Left-side fade: left part is 20% visible, rising toward the right */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.72) 10%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.30) 70%, rgba(0,0,0,0.10) 100%)`,
          }}
        />
        <div className="relative z-10 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="p-7 sm:p-9 flex flex-col justify-center">
            <h3 className="text-[21px] font-normal tracking-[-0.01em] drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]">Detailed Security Report</h3>
            <p className="mt-3 text-[13.5px] leading-relaxed max-w-sm drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]" style={{ color: C.sub }}>
              Get complete security analysis with detailed findings and actionable recommendations.
            </p>
            <Link to="/report/$id" params={{ id: report.id }} className="group mt-6 self-start">
              <GhostButton>View Full Report</GhostButton>
            </Link>
          </div>
          <div className="hidden md:block min-h-[200px]" />
        </div>
      </Card>

      {scans.length === 0 && null}
    </div>
  );
}

function SideStat({ icon: Icon, img, title, sub, right }: {
  icon?: typeof Shield; img?: string; title: string; sub: string; right?: React.ReactNode;
}) {
  return (
    <div className="group flex items-center gap-5">
      <div
        className="size-14 shrink-0 rounded-xl grid place-items-center overflow-hidden transition-transform duration-300 group-hover:-translate-y-0.5"
        style={{ border: `1px solid ${C.border}`, background: "radial-gradient(circle at 50% 30%, rgba(37,99,235,0.10), transparent 70%)" }}
      >
        {img ? (
          <img src={img} alt="" loading="lazy" width={512} height={512} className="size-full object-cover" />
        ) : Icon ? (
          <Icon className="size-5" style={{ color: C.text }} />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15.5px] font-medium">{title}</div>
        <div className="text-[13px] whitespace-pre-line leading-snug" style={{ color: C.sub }}>{sub}</div>
      </div>
      {right}
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

function PlanCard({ plan, credits }: { plan: string; credits: number }) {
  const total = 150000;
  const pct = Math.max(0, Math.min(100, (credits / total) * 100));
  return (
    <div className="rounded-xl p-4" style={{ background: "#000000", border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between gap-2">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.10)`, color: C.text }}>
          {plan}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: "#22c55e" }} />
            <span className="relative inline-flex size-1.5 rounded-full" style={{ background: "#22c55e" }} />
          </span>
          <span className="text-[10px] font-medium" style={{ color: C.muted }}>Active</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: C.sub }}>Credits used</div>
        <div className="mt-1 text-sm font-semibold tabular-nums tracking-tight" style={{ color: C.text }}>
          {credits.toLocaleString()} <span style={{ color: C.muted }}>/ {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-3 h-1 rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-[#22d3ee]" style={{ width: `${pct}%` }} />
      </div>

      <Link
        to="/pricing"
        className="mt-3 group flex items-center justify-between text-[11px] font-medium transition-colors"
        style={{ color: C.cyan }}
      >
        <span>Upgrade plan</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

const navItemBase =
  "group relative w-full flex items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-1.5 text-left transition hover:border-white/25 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]";
const navItemActive = "border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]";

function SidebarLink({ to, icon: Icon, label, onClick, search }: { to: string; icon: typeof LayoutDashboard; label: string; onClick?: () => void; search?: Record<string, string> }) {
  return (
    <Link to={to} search={search as never} onClick={onClick} className={`${navItemBase} border-transparent`}>
      <span className="relative size-7 rounded-lg grid place-items-center shrink-0">
        <Icon className="size-4 text-neutral-300 opacity-60 transition group-hover:opacity-100" />
      </span>
      <span className="relative min-w-0 flex-1 block text-sm whitespace-nowrap text-neutral-200">{label}</span>
    </Link>
  );
}

function SidebarButton({ icon: Icon, label, active, badge, onClick }: { icon: typeof LayoutDashboard; label: string; active?: boolean; badge?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`${navItemBase} ${active ? navItemActive : "border-transparent"}`}>
      <span className="relative size-7 rounded-lg grid place-items-center shrink-0">
        <Icon className={`size-4 transition ${active ? "text-white" : "text-neutral-300 opacity-60 group-hover:opacity-100"}`} />
      </span>
      <span className={`relative min-w-0 flex-1 block text-sm whitespace-nowrap ${active ? "text-white" : "text-neutral-200"}`}>{label}</span>
      {badge && <span className="relative inline text-[10px] rounded-full bg-white/[0.06] px-1.5 py-0.5 text-neutral-300 tabular-nums">{badge}</span>}
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
