import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Shield, AlertTriangle, FileText, Globe2, Building2, Mail, BadgeCheck,
  Clock, ChevronDown, ScanSearch, Bug, Wrench, Link2, Terminal, Crosshair, Gauge,
  Layers, Activity, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import {
  type Scan, type ReportModel, type Vulnerability,
  buildReport, buildVulnerabilities, severityBreakdown, DEMO_REPORT, scoreColor, SEVERITY_COLOR,
} from "@/lib/report-model";

export const Route = createFileRoute("/report/$id")({
  head: () => ({
    meta: [
      { title: "Full Vulnerability Report — Nexefy Sec" },
      { name: "description", content: "Deep technical breakdown of every vulnerability, bug and misconfiguration found on your website, with evidence, payloads and remediation steps." },
      { property: "og:title", content: "Full Vulnerability Report — Nexefy Sec" },
      { property: "og:description", content: "Every finding with severity, CVSS, CWE, OWASP mapping, evidence and remediation guidance." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

const BORDER = "rgba(255,255,255,0.10)";

function ReportPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!user) return;
    api.listScans().then(({ scans }) => setScans((scans as Scan[]) ?? [])).catch(() => setScans([]));
  }, [user]);

  const report = useMemo<ReportModel>(() => {
    const found = scans.find((s) => s.id === id);
    return found ? buildReport(found) : DEMO_REPORT;
  }, [scans, id]);

  const vulns = useMemo(() => buildVulnerabilities(report), [report]);
  const breakdown = useMemo(() => severityBreakdown(vulns), [vulns]);
  const shown = filter === "All" ? vulns : vulns.filter((v) => v.severity === filter);
  const sc = scoreColor(report.score);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-14">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition">
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        {/* HEADER */}
        <header className="mt-6 rounded-2xl border bg-white/[0.02] p-6 sm:p-9" style={{ borderColor: BORDER }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={{ borderColor: BORDER }}>
              <Sparkles className="size-3" /> {report.scanner}
            </span>
            {report.demo && (
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={{ borderColor: BORDER }}>
                <FileText className="size-3" /> Demo report
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]" style={{ borderColor: BORDER, color: sc }}>
              <Activity className="size-3" /> {report.status}
            </span>
          </div>

          <h1 className="mt-5 text-2xl sm:text-4xl font-light tracking-[-0.02em]">Security assessment report</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Target <span className="font-mono text-white/90">{report.target}</span>
            {" · "}Scan ID <span className="font-mono text-white/70">{report.id}</span>
            {mounted ? ` · ${new Date(report.createdAt).toLocaleDateString()}` : ""}
          </p>

          {/* summary cards — mirrors the scanner report summary */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat label="Pages crawled" value={report.pagesCrawled} icon={Layers} />
            <Stat label="Endpoints tested" value={report.endpointsTested} icon={Crosshair} />
            <Stat label="Total findings" value={report.findings} icon={Bug} />
            <Stat label="Critical" value={breakdown[0].count} color={SEVERITY_COLOR.Critical} />
            <Stat label="High" value={breakdown[1].count} color={SEVERITY_COLOR.High} />
            <Stat label="Medium" value={breakdown[2].count} color={SEVERITY_COLOR.Medium} />
          </div>

          <div className="mt-3 grid sm:grid-cols-3 gap-3">
            <Stat label="Security score" value={`${report.score}/100`} color={sc} icon={Gauge} />
            <Stat label="Scan duration" value={report.duration} icon={Clock} />
            <Stat label="Low severity" value={breakdown[3].count} color={SEVERITY_COLOR.Low} />
          </div>

          <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <Meta icon={Globe2} label="Target" value={report.target} />
            <Meta icon={Building2} label="Organisation" value={report.requester.company} />
            <Meta icon={Mail} label="Requested by" value={report.requester.email} />
            <Meta icon={BadgeCheck} label="Verification" value={`${report.requester.verification} · ${report.requester.verified}`} />
          </dl>
        </header>

        {/* SEVERITY DISTRIBUTION */}
        <section className="mt-6 rounded-2xl border bg-white/[0.02] p-6" style={{ borderColor: BORDER }}>
          <h2 className="text-sm font-medium">Severity distribution</h2>
          <div className="mt-4 h-2 w-full rounded-full overflow-hidden flex bg-white/[0.05]">
            {breakdown.filter((b) => b.count > 0).map((b) => (
              <motion.div
                key={b.severity}
                initial={{ width: 0 }}
                animate={{ width: `${(b.count / Math.max(1, vulns.length)) * 100}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{ background: b.color }}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {breakdown.map((b) => (
              <div key={b.severity} className="rounded-xl border bg-black/50 p-4" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{b.severity}</span>
                  <span className="text-lg font-semibold" style={{ color: b.color }}>{b.count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EXECUTIVE SUMMARY */}
        <section className="mt-6 rounded-2xl border bg-white/[0.02] p-6" style={{ borderColor: BORDER }}>
          <h2 className="text-sm font-medium inline-flex items-center gap-2"><Shield className="size-4 text-muted-foreground" /> Executive summary</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            The automated assessment of <span className="text-white/90 font-mono">{report.target}</span> crawled {report.pagesCrawled} pages
            and tested {report.endpointsTested} endpoints in {report.duration}, confirming {vulns.length} distinct issues.
            The overall posture score is <span style={{ color: sc }} className="font-medium">{report.score}/100</span>.
            {breakdown[0].count > 0
              ? ` ${breakdown[0].count} critical issue(s) are directly exploitable by an unauthenticated attacker and can lead to authentication bypass or full account takeover.`
              : " No critical issues were confirmed; the remaining findings are hardening opportunities."}
            {" "}Remediating the critical and high severity items is expected to raise the score above{" "}
            {Math.min(98, report.score + breakdown[0].count * 15 + breakdown[1].count * 8)}.
          </p>
          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            {report.posture.map((p) => (
              <div key={p.label} className="rounded-xl border bg-black/50 p-4" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-mono">{p.value}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.value}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINDINGS */}
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium inline-flex items-center gap-2"><Bug className="size-4 text-muted-foreground" /> Detailed findings</h2>
            <div className="flex flex-wrap gap-1.5">
              {["All", "Critical", "High", "Medium", "Low"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] border transition ${
                    filter === f ? "bg-white text-black border-white" : "border-white/10 text-muted-foreground hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {shown.map((v, i) => <Finding key={v.id} v={v} index={i} mounted={mounted} />)}
            {!shown.length && (
              <div className="rounded-2xl border bg-white/[0.02] p-10 text-center text-xs text-muted-foreground" style={{ borderColor: BORDER }}>
                No findings at this severity.
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border bg-black/60 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" style={{ borderColor: BORDER }}>
          <p className="text-xs text-muted-foreground max-w-xl">
            Re-run a scan after remediation to validate the fixes and refresh your posture score.
          </p>
          <Link to="/scan" className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 text-xs font-medium transition">
            <ScanSearch className="size-4" /> Run a new scan
          </Link>
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Generated by {report.scanner} · AI-powered web vulnerability scanner
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon: Icon }: { label: string; value: string | number; color?: string; icon?: typeof Globe2 }) {
  return (
    <div className="rounded-xl border bg-black/50 p-4" style={{ borderColor: BORDER }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {Icon ? <Icon className="size-3" /> : null} {label}
      </div>
      <div className="mt-1.5 text-2xl font-light" style={{ color: color ?? "#fff" }}>{value}</div>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-black/40 px-3.5 py-3" style={{ borderColor: BORDER }}>
      <dt className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </dt>
      <dd className="mt-1 truncate text-white/90">{value}</dd>
    </div>
  );
}

function Finding({ v, index, mounted }: { v: Vulnerability; index: number; mounted: boolean }) {
  const [open, setOpen] = useState(index === 0);
  const color = SEVERITY_COLOR[v.severity];
  return (
    <div className="rounded-2xl border bg-white/[0.02] overflow-hidden" style={{ borderColor: BORDER, borderLeft: `3px solid ${color}` }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition">
        <span className="mt-1.5 size-2 rounded-full shrink-0" style={{ background: color }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">{v.id}</span>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: `${color}22`, color }}>{v.severity}</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">CVSS {v.cvss}</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{v.cwe}</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{v.owasp}</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{v.status}</span>
          </div>
          <div className="mt-1.5 text-sm text-white/95">{v.title}</div>
          <div className="mt-1 text-[11px] text-muted-foreground font-mono truncate">{v.url}</div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t px-5 py-5 space-y-4 text-[13px] leading-relaxed" style={{ borderColor: BORDER }}>
          <div className="grid sm:grid-cols-3 gap-3">
            <KV label="URL" value={v.url} mono />
            <KV label="Parameter" value={v.parameter} mono />
            <KV label="Payload" value={v.payload} mono />
          </div>

          <Block title="Description" icon={FileText}>{v.description}</Block>
          <Block title="Impact" icon={AlertTriangle}>{v.impact}</Block>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <Terminal className="size-3" /> Evidence
            </div>
            <pre className="mt-2 overflow-x-auto rounded-xl border bg-black/70 p-3.5 text-[11px] font-mono text-white/80 whitespace-pre-wrap" style={{ borderColor: BORDER }}>{v.evidence}</pre>
          </div>

          <Block title="Remediation" icon={Wrench}>{v.remediation}</Block>

          <div className="grid sm:grid-cols-2 gap-3">
            <KV label="AI validation" value={v.aiValidation || "N/A"} />
            <KV label="AI reasoning" value={v.aiReasoning || "N/A"} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Link2 className="size-3" /> {v.references.join(" · ")}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="size-3" /> First seen {mounted ? new Date(v.firstSeen).toLocaleDateString() : ""}</span>
            <span className="inline-flex items-center gap-1.5"><Shield className="size-3" /> {v.category}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border bg-black/40 px-3.5 py-3" style={{ borderColor: BORDER }}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className={`mt-1 break-all text-white/90 text-[12px] ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Block({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3" /> {title}
      </div>
      <p className="mt-1.5 text-muted-foreground">{children}</p>
    </div>
  );
}
