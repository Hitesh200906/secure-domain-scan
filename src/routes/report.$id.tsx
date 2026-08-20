import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Shield, AlertTriangle, FileText, Globe2, Building2, Mail, BadgeCheck,
  Clock, ChevronDown, ScanSearch, Bug, Wrench, Link2, Terminal, Crosshair, Gauge,
  Layers, Activity, Sparkles, Printer, ShieldCheck, Flame, TrendingUp, ListChecks,
  Scale, Fingerprint, Zap, CircleDot,
} from "lucide-react";
import { motion, useInView, useMotionValue, useSpring, useScroll } from "framer-motion";
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
const EASE = [0.16, 1, 0.3, 1] as const;

/* --------------------------------- motion --------------------------------- */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const [val, setVal] = useState(0);
  useEffect(() => { if (inView) mv.set(to); }, [inView, to, mv]);
  useEffect(() => spring.on("change", (v) => setVal(v)), [spring]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

/* --------------------------------- page ----------------------------------- */
function ReportPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const { scrollYProgress } = useScroll();

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

  const maxCvss = useMemo(
    () => vulns.reduce((m, v) => Math.max(m, parseFloat(v.cvss) || 0), 0),
    [vulns],
  );
  const exploitable = vulns.filter((v) => /confirm/i.test(v.aiValidation)).length;
  const openCount = vulns.filter((v) => v.status === "Open").length;
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    vulns.forEach((v) => map.set(v.category, (map.get(v.category) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [vulns]);
  const owaspMap = useMemo(() => {
    const map = new Map<string, number>();
    vulns.forEach((v) => map.set(v.owasp, (map.get(v.owasp) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [vulns]);
  const projected = Math.min(98, report.score + breakdown[0].count * 15 + breakdown[1].count * 8);

  const roadmap = useMemo(() => {
    const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return [...vulns]
      .sort((a, b) => order[a.severity] - order[b.severity] || parseFloat(b.cvss) - parseFloat(a.cvss))
      .slice(0, 6);
  }, [vulns]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* scroll progress */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left"
        style={{ scaleX: scrollYProgress, background: "linear-gradient(90deg,#2563EB,#22D3EE)" }}
      />

      {/* backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-18rem] size-[36rem] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: `radial-gradient(circle, ${sc}22, transparent 65%)` }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-14">
        <div className="flex items-center justify-between gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition">
            <ArrowLeft className="size-3.5" /> Back to dashboard
          </Link>
          <button
            onClick={() => typeof window !== "undefined" && window.print()}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-white hover:bg-white/[0.05] transition"
            style={{ borderColor: BORDER }}
          >
            <Printer className="size-3.5" /> Export / print
          </button>
        </div>

        {/* ============================== HEADER ============================== */}
        <motion.header
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-6 relative overflow-hidden rounded-2xl border bg-white/[0.02] p-6 sm:p-9"
          style={{ borderColor: BORDER }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)" }}
            animate={{ x: ["-40%", "140%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Chip icon={Sparkles}>{report.scanner}</Chip>
            {report.demo && <Chip icon={FileText}>Demo report</Chip>}
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]" style={{ borderColor: BORDER, color: sc }}>
              <motion.span
                className="size-1.5 rounded-full"
                style={{ background: sc }}
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              {report.status}
            </span>
            <Chip icon={Fingerprint}>Confidential</Chip>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h1 className="text-2xl sm:text-4xl font-light tracking-[-0.02em]">Security assessment report</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Target <span className="font-mono text-white/90">{report.target}</span>
                {" · "}Scan ID <span className="font-mono text-white/70">{report.id}</span>
                {mounted ? ` · ${new Date(report.createdAt).toLocaleDateString()}` : ""}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
                <Pill color={SEVERITY_COLOR.Critical}>{breakdown[0].count} critical</Pill>
                <Pill color={SEVERITY_COLOR.High}>{breakdown[1].count} high</Pill>
                <Pill color={SEVERITY_COLOR.Medium}>{breakdown[2].count} medium</Pill>
                <Pill color={SEVERITY_COLOR.Low}>{breakdown[3].count} low</Pill>
                <Pill color="#fff">{exploitable} confirmed exploitable</Pill>
              </div>
            </div>
            <div className="hidden lg:block" />
          </div>

          {/* summary cards */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat label="Pages crawled" value={<Counter to={report.pagesCrawled} />} icon={Layers} />
            <Stat label="Endpoints tested" value={<Counter to={report.endpointsTested} />} icon={Crosshair} />
            <Stat label="Total findings" value={<Counter to={report.findings} />} icon={Bug} />
            <Stat label="Highest CVSS" value={<Counter to={maxCvss} decimals={1} />} icon={Flame} color={SEVERITY_COLOR.Critical} />
            <Stat label="Open issues" value={<Counter to={openCount} />} icon={CircleDot} />
            <Stat label="Score" value={<><Counter to={report.score} />/100</>} icon={Gauge} color={sc} />
          </div>

          <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <Meta icon={Globe2} label="Target" value={report.target} />
            <Meta icon={Building2} label="Organisation" value={report.requester.company} />
            <Meta icon={Mail} label="Requested by" value={report.requester.email} />
            <Meta icon={BadgeCheck} label="Verification" value={`${report.requester.verification} · ${report.requester.verified}`} />
          </dl>
        </motion.header>

        {/* ========================= RISK POSTURE ============================ */}
        <Reveal className="mt-6">
          <section className="rounded-2xl border bg-white/[0.02] p-6" style={{ borderColor: BORDER }}>
            <SectionTitle icon={Scale} title="Risk posture" sub="Severity distribution, exposure surface and projected score after remediation" />

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {breakdown.map((b, i) => {
                const severityMeta: Record<string, { icon: typeof AlertTriangle; label: string; desc: string }> = {
                  Critical: { icon: Flame, label: "Critical", desc: "Immediate remediation required" },
                  High: { icon: AlertTriangle, label: "High", desc: "Address within 72 hours" },
                  Medium: { icon: ShieldAlert, label: "Medium", desc: "Schedule remediation soon" },
                  Low: { icon: ShieldCheck, label: "Low", desc: "Hardening opportunity" },
                };
                const meta = severityMeta[b.severity] ?? { icon: Shield, label: b.severity, desc: "" };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={b.severity}
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.25 } }}
                    className="group relative overflow-hidden rounded-2xl border bg-black/60 p-4"
                    style={{ borderColor: `rgba(255,255,255,0.08)` }}
                  >
                    {/* top accent line */}
                    <div
                      className="absolute inset-x-0 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${b.color}, transparent)` }}
                    />
                    {/* subtle glow on hover */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${b.color}18, transparent 60%)` }}
                    />

                    <div className="relative flex items-start justify-between">
                      <div
                        className="flex size-9 items-center justify-center rounded-xl border bg-black/80"
                        style={{ borderColor: `${b.color}40` }}
                      >
                        <Icon className="size-4" style={{ color: b.color }} />
                      </div>
                      <span className="text-2xl font-semibold tracking-tight" style={{ color: b.color }}>
                        <Counter to={b.count} />
                      </span>
                    </div>

                    <div className="relative mt-4">
                      <div className="text-sm font-medium text-white">{meta.label}</div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{meta.desc}</div>
                    </div>

                    <div className="relative mt-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(b.count / Math.max(1, vulns.length)) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: b.color, boxShadow: `0 0 12px ${b.color}55` }}
                      />
                    </div>

                    <div className="relative mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{((b.count / Math.max(1, vulns.length)) * 100).toFixed(0)}% of total</span>
                      <span className="font-mono">{b.count}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-3">
              <div className="rounded-xl border bg-black/40 p-5" style={{ borderColor: BORDER }}>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Affected categories</div>
                <div className="mt-3 space-y-3">
                  {categories.map(([cat, n], i) => (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-white/85">{cat}</span>
                        <span className="font-mono text-muted-foreground">{n}</span>
                      </div>
                      <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(n / vulns.length) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
                          className="h-full rounded-full bg-[#2563EB]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-black/40 p-5" style={{ borderColor: BORDER }}>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">OWASP Top 10 mapping</div>
                <ul className="mt-3 space-y-2">
                  {owaspMap.map(([o, n]) => (
                    <li key={o} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[12px]" style={{ borderColor: BORDER }}>
                      <span className="truncate text-white/85">{o}</span>
                      <span className="shrink-0 rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px]">{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              {report.posture.map((p, i) => (
                <div key={p.label} className="rounded-xl border bg-black/50 p-4" style={{ borderColor: BORDER }}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-mono"><Counter to={p.value} /></span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: EASE, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ========================= EXECUTIVE SUMMARY ======================== */}
        <Reveal className="mt-6">
          <section className="rounded-2xl border bg-white/[0.02] p-6" style={{ borderColor: BORDER }}>
            <SectionTitle icon={Shield} title="Executive summary" sub="Non-technical overview for stakeholders" />
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              The automated assessment of <span className="text-white/90 font-mono">{report.target}</span> crawled{" "}
              {report.pagesCrawled} pages and tested {report.endpointsTested} endpoints, confirming{" "}
              <span className="text-white/90">{vulns.length}</span> distinct issues across{" "}
              {categories.length} categories. The overall posture score is{" "}
              <span style={{ color: sc }} className="font-medium">{report.score}/100</span>.
              {breakdown[0].count > 0
                ? ` ${breakdown[0].count} critical issue(s) are directly exploitable by an unauthenticated attacker and can lead to authentication bypass or full account takeover.`
                : " No critical issues were confirmed; the remaining findings are hardening opportunities."}
              {" "}Of all findings, {exploitable} were validated by exploit reproduction rather than signature matching, which removes false-positive uncertainty for those items.
            </p>

            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <KeyTakeaway
                icon={Flame}
                color={SEVERITY_COLOR.Critical}
                label="Immediate risk"
                value={`${breakdown[0].count + breakdown[1].count} issue(s)`}
                note="Critical and high severity items requiring action within 72 hours."
              />
              <KeyTakeaway
                icon={ShieldCheck}
                color="#22C55E"
                label="Validated"
                value={`${exploitable}/${vulns.length}`}
                note="Findings proven by the scanner reproducing a working exploit."
              />
              <KeyTakeaway
                icon={TrendingUp}
                color="#22D3EE"
                label="Projected score"
                value={`${projected}/100`}
                note="Expected posture once critical and high findings are remediated."
              />
            </div>

            {/* score trajectory */}
            <div className="mt-5 rounded-xl border bg-black/40 p-5" style={{ borderColor: BORDER }}>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <span>Score trajectory after remediation</span>
                <span className="font-mono">{report.score} → {projected}</span>
              </div>
              <div className="relative mt-4 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${projected}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: EASE }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "linear-gradient(90deg,#2563EB,#22D3EE)" }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${report.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: sc }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Current</span><span>Projected</span>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ======================= REMEDIATION ROADMAP ======================== */}
        <Reveal className="mt-6">
          <section className="rounded-2xl border bg-white/[0.02] p-6" style={{ borderColor: BORDER }}>
            <SectionTitle icon={ListChecks} title="Remediation roadmap" sub="Prioritised by severity, CVSS and exploitability" />
            <ol className="mt-5 relative border-l pl-6 space-y-5" style={{ borderColor: BORDER }}>
              {roadmap.map((v, i) => {
                const c = SEVERITY_COLOR[v.severity];
                const sla = v.severity === "Critical" ? "24 hours" : v.severity === "High" ? "72 hours" : v.severity === "Medium" ? "14 days" : "Next cycle";
                return (
                  <motion.li
                    key={v.id}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease: EASE, delay: i * 0.07 }}
                    className="relative"
                  >
                    <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full ring-4 ring-black" style={{ background: c }} />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                      <span className="text-[13px] text-white/95">{v.title}</span>
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: `${c}22`, color: c }}>{v.severity}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Fix within <span className="text-white/80">{sla}</span> · CVSS {v.cvss} · {v.remediation}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </section>
        </Reveal>

        {/* ============================== FINDINGS ============================ */}
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={Bug} title="Detailed findings" sub={`${shown.length} of ${vulns.length} shown`} />
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

        {/* ============================ METHODOLOGY =========================== */}
        <Reveal className="mt-6">
          <section className="rounded-2xl border bg-white/[0.02] p-6" style={{ borderColor: BORDER }}>
            <SectionTitle icon={Activity} title="Methodology & scope" sub="How this assessment was performed" />
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { t: "Discovery", d: `Recursive crawl of ${report.pagesCrawled} pages, sitemap parsing and form enumeration.` },
                { t: "Enumeration", d: `${report.endpointsTested} endpoints fingerprinted for framework, headers and auth surface.` },
                { t: "Active testing", d: "Injection, access-control, authentication and misconfiguration probes with safe payloads." },
                { t: "AI validation", d: "Each candidate is re-tested and reasoned over to eliminate false positives." },
              ].map((s, i) => (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                  className="rounded-xl border bg-black/50 p-4"
                  style={{ borderColor: BORDER }}
                >
                  <div className="text-[10px] font-mono text-muted-foreground">0{i + 1}</div>
                  <div className="mt-1.5 text-[13px] text-white/90">{s.t}</div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{s.d}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              Testing was non-destructive and rate-limited. Findings marked <span className="text-white/80">Confirmed</span> were
              reproduced end-to-end; unconfirmed items are reported with the observed indicator and require manual triage.
              This report does not constitute a formal penetration test attestation.
            </p>
          </section>
        </Reveal>

        <Reveal className="mt-8">
          <div className="rounded-2xl border bg-black/60 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" style={{ borderColor: BORDER }}>
            <p className="text-xs text-muted-foreground max-w-xl">
              Re-run a scan after remediation to validate the fixes and refresh your posture score.
            </p>
            <Link to="/scan" className="group inline-flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 text-xs font-medium transition">
              <ScanSearch className="size-4 transition group-hover:rotate-12" /> Run a new scan
            </Link>
          </div>
        </Reveal>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Generated by {report.scanner} · AI-powered web vulnerability scanner
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- pieces ---------------------------------- */
function Chip({ icon: Icon, children }: { icon: typeof Globe2; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={{ borderColor: BORDER }}>
      <Icon className="size-3" /> {children}
    </span>
  );
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1" style={{ borderColor: BORDER, color }}>
      <span className="size-1.5 rounded-full" style={{ background: color }} /> {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, sub }: { icon: typeof Globe2; title: string; sub?: string }) {
  return (
    <div>
      <h2 className="text-sm font-medium inline-flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" /> {title}
      </h2>
      {sub ? <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function KeyTakeaway({ icon: Icon, color, label, value, note }: { icon: typeof Globe2; color: string; label: string; value: string; note: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-xl border bg-black/50 p-4" style={{ borderColor: BORDER }}>
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3" style={{ color }} /> {label}
      </div>
      <div className="mt-1.5 text-xl font-light" style={{ color }}>{value}</div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{note}</p>
    </motion.div>
  );
}

function Stat({ label, value, color, icon: Icon }: { label: string; value: React.ReactNode; color?: string; icon?: typeof Globe2 }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="rounded-xl border bg-black/50 p-4" style={{ borderColor: BORDER }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {Icon ? <Icon className="size-3" /> : null} {label}
      </div>
      <div className="mt-1.5 text-2xl font-light" style={{ color: color ?? "#fff" }}>{value}</div>
    </motion.div>
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
  const cvss = parseFloat(v.cvss) || 0;
  const major = v.severity === "Critical" || v.severity === "High";
  const sla = v.severity === "Critical" ? "24h" : v.severity === "High" ? "72h" : v.severity === "Medium" ? "14d" : "Backlog";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.3) }}
      className="relative rounded-2xl border bg-white/[0.02] overflow-hidden"
      style={{ borderColor: BORDER, borderLeft: `3px solid ${color}` }}
    >
      {major && (
        <span className="absolute right-4 top-4 hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.16em]" style={{ background: `${color}1f`, color }}>
          <Zap className="size-2.5" /> Priority
        </span>
      )}
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/[0.03] transition">
        <motion.span
          className="mt-1.5 size-2 rounded-full shrink-0"
          style={{ background: color }}
          animate={major ? { boxShadow: [`0 0 0 0 ${color}55`, `0 0 0 6px ${color}00`] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">{v.id}</span>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: `${color}22`, color }}>{v.severity}</span>
            <Tag>CVSS {v.cvss}</Tag>
            <Tag>{v.cwe}</Tag>
            <Tag>{v.owasp}</Tag>
            <Tag>{v.status}</Tag>
            <Tag>SLA {sla}</Tag>
          </div>
          <div className="mt-1.5 text-sm text-white/95">{v.title}</div>
          <div className="mt-1 text-[11px] text-muted-foreground font-mono truncate">{v.url}</div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="h-1 w-full max-w-[220px] rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(cvss / 10) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: EASE }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{cvss.toFixed(1)}/10</span>
          </div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="border-t px-5 py-5 space-y-4 text-[13px] leading-relaxed"
          style={{ borderColor: BORDER }}
        >
          <div className="grid sm:grid-cols-3 gap-3">
            <KV label="URL" value={v.url} mono />
            <KV label="Parameter" value={v.parameter} mono />
            <KV label="Payload" value={v.payload} mono />
          </div>

          <Block title="Description" icon={FileText}>{v.description}</Block>
          <Block title="Business impact" icon={AlertTriangle}>{v.impact}</Block>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <Terminal className="size-3" /> Evidence
            </div>
            <pre className="mt-2 overflow-x-auto rounded-xl border bg-black/70 p-3.5 text-[11px] font-mono text-white/80 whitespace-pre-wrap" style={{ borderColor: BORDER }}>{v.evidence}</pre>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <Crosshair className="size-3" /> Reproduction
            </div>
            <pre className="mt-2 overflow-x-auto rounded-xl border bg-black/70 p-3.5 text-[11px] font-mono text-white/70 whitespace-pre-wrap" style={{ borderColor: BORDER }}>
{v.reproduction && v.reproduction !== "N/A"
  ? v.reproduction
  : `1. Send a request to ${v.url}\n2. Set the "${v.parameter}" value to: ${v.payload}\n3. Observe: ${v.evidence}`}
            </pre>
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
            <span className="inline-flex items-center gap-1.5"><Gauge className="size-3" /> Remediation SLA {sla}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{children}</span>;
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
