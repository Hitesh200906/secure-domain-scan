import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Shield, AlertTriangle, FileText, Globe2, Building2, Mail, BadgeCheck,
  Clock, ChevronDown, ScanSearch, Bug, Wrench, Link2,
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
      { name: "description", content: "Deep technical breakdown of every vulnerability, bug and misconfiguration found on your website, with evidence and remediation steps." },
      { property: "og:title", content: "Full Vulnerability Report — Nexefy Sec" },
      { property: "og:description", content: "Every finding with severity, CVSS, evidence and remediation guidance." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition">
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        {/* header */}
        <header className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          {report.demo && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <FileText className="size-3" /> Demo report
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Full vulnerability report</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Deep technical assessment of <span className="font-mono text-white/90">{report.target}</span>
            {mounted ? ` · generated ${new Date(report.createdAt).toLocaleDateString()}` : ""}
          </p>

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Security score</div>
              <div className="mt-1 text-3xl font-semibold" style={{ color: scoreColor(report.score) }}>{report.score}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Total findings</div>
              <div className="mt-1 text-3xl font-semibold">{report.findings}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Detailed entries</div>
              <div className="mt-1 text-3xl font-semibold">{vulns.length}</div>
            </div>
          </div>

          <dl className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <Meta icon={Globe2} label="Target" value={report.target} />
            <Meta icon={Building2} label="Organisation" value={report.requester.company} />
            <Meta icon={Mail} label="Requested by" value={report.requester.email} />
            <Meta icon={BadgeCheck} label="Verification" value={`${report.requester.verification} · ${report.requester.verified}`} />
          </dl>
        </header>

        {/* severity summary */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-sm font-medium">Severity distribution</h2>
          <div className="mt-4 grid sm:grid-cols-4 gap-3">
            {breakdown.map((b) => (
              <div key={b.severity} className="rounded-xl border border-white/10 bg-black/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{b.severity}</span>
                  <span className="text-lg font-semibold" style={{ color: b.color }}>{b.count}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${vulns.length ? (b.count / vulns.length) * 100 : 0}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* executive summary */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-sm font-medium inline-flex items-center gap-2"><Shield className="size-4 text-muted-foreground" /> Executive summary</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            The assessment of <span className="text-white/90 font-mono">{report.target}</span> identified {vulns.length} distinct
            issues across application, infrastructure, identity and supply-chain domains. The overall posture score is{" "}
            <span style={{ color: scoreColor(report.score) }} className="font-medium">{report.score}/100</span>.
            {breakdown[0].count > 0
              ? ` ${breakdown[0].count} critical issue(s) require immediate remediation — they are directly exploitable by an unauthenticated attacker and can lead to account takeover or data disclosure.`
              : " No critical issues were confirmed; remaining findings are hardening opportunities."}
            {" "}Fixing the critical and high items is estimated to raise the score above{" "}
            {Math.min(98, report.score + breakdown[0].count * 4 + breakdown[1].count * 2)}.
          </p>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            {report.posture.map((p) => (
              <div key={p.label} className="rounded-xl border border-white/10 bg-black/50 p-4">
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

        {/* findings */}
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
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-xs text-muted-foreground">
                No findings at this severity.
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <p className="text-xs text-muted-foreground max-w-xl">
            Re-run a scan after remediation to validate the fixes and refresh your posture score.
          </p>
          <Link to="/scan/new" search={{ plan: "professional" as const }} className="inline-flex items-center gap-2 rounded-xl bg-white text-black hover:bg-white/90 px-5 py-2.5 text-xs font-medium transition">
            <ScanSearch className="size-4" /> Run a new scan
          </Link>
        </div>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-3">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition">
        <span className="mt-1 size-2 rounded-full shrink-0" style={{ background: color }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">{v.id}</span>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: `${color}22`, color }}>{v.severity}</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">CVSS {v.cvss}</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{v.cwe}</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{v.status}</span>
          </div>
          <div className="mt-1.5 text-sm text-white/95">{v.title}</div>
          <div className="mt-1 text-[11px] text-muted-foreground font-mono truncate">{v.asset}</div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-white/10 px-5 py-5 space-y-4 text-[13px] leading-relaxed">
          <Block title="Description" icon={FileText}>{v.description}</Block>
          <Block title="Impact" icon={AlertTriangle}>{v.impact}</Block>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Evidence</div>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/70 p-3.5 text-[11px] font-mono text-white/80 whitespace-pre-wrap">{v.evidence}</pre>
          </div>
          <Block title="Remediation" icon={Wrench}>{v.remediation}</Block>
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
