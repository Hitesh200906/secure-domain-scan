import { motion } from "framer-motion";
import { ArrowUpRight, Download, ShieldAlert } from "lucide-react";
import { SectionHeader } from "./Features";
import { SectionBackdrop } from "./SectionFx";

const buckets = [
  { label: "Critical", value: 3, color: "oklch(0.65 0.22 25)" },
  { label: "High", value: 8, color: "oklch(0.78 0.17 50)" },
  { label: "Medium", value: 14, color: "oklch(0.85 0.16 90)" },
  { label: "Low", value: 22, color: "oklch(0.75 0.13 180)" },
];

export function ReportShowcase() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <SectionBackdrop variant="grid" opacity={0.1} />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Reports"
          title="Reports your security team will actually read"
          description="Engineered for clarity. Auditable for compliance. Beautiful for stakeholders."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mt-16"
        >
          <ReportCard />
        </motion.div>
      </div>
    </section>
  );
}

export function ReportCard() {
  const total = buckets.reduce((s, b) => s + b.value, 0);
  return (
    <div className="relative rounded-3xl p-px bg-gradient-to-b from-white/15 to-white/[0.02] shadow-[0_30px_80px_-30px_oklch(0.86_0.16_200_/_0.3)]">
      <div className="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.06_0.008_220)] overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            nexus-security.app/reports/rpt_8421
          </div>
          <button className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1.5">
            <Download className="size-3.5" /> PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-px bg-white/[0.05]">
          {/* Left: score + summary */}
          <div className="bg-[oklch(0.06_0.008_220)] p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Security Report
                </div>
                <h3 className="mt-2 text-2xl font-medium tracking-tight">
                  acme-fintech.com
                </h3>
                <div className="mt-1 text-xs font-mono text-muted-foreground">
                  Scan ID rpt_8421 · May 30, 2026
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary glass px-2 py-1 rounded">
                Verified
              </span>
            </div>

            <div className="mt-8 flex items-center gap-8">
              <ScoreRing score={72} />
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Security Score
                </div>
                <div className="mt-1 text-4xl font-semibold tracking-tight text-gradient-accent">
                  72/100
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  +6 since last scan
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-2">
              {buckets.map((b) => (
                <div key={b.label} className="rounded-xl glass p-3">
                  <div
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: b.color }}
                  >
                    {b.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {b.label}
                  </div>
                </div>
              ))}
            </div>

            {/* distribution bar */}
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                Risk distribution · {total} findings
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-white/5">
                {buckets.map((b) => (
                  <div
                    key={b.label}
                    style={{
                      width: `${(b.value / total) * 100}%`,
                      background: b.color,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: findings list */}
          <div className="bg-[oklch(0.05_0.008_220)] p-8">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Top Findings
              </div>
              <button className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1">
                View all <ArrowUpRight className="size-3.5" />
              </button>
            </div>
            <ul className="mt-5 space-y-3">
              {[
                {
                  sev: "Critical",
                  cvss: 9.8,
                  title: "SQL Injection on /api/v1/orders",
                  cwe: "CWE-89",
                },
                {
                  sev: "High",
                  cvss: 8.1,
                  title: "Broken Object Level Authorization",
                  cwe: "CWE-639",
                },
                {
                  sev: "High",
                  cvss: 7.4,
                  title: "S3 bucket misconfiguration",
                  cwe: "CWE-732",
                },
                {
                  sev: "Medium",
                  cvss: 5.3,
                  title: "Outdated TLS suites enabled",
                  cwe: "CWE-326",
                },
                {
                  sev: "Low",
                  cvss: 3.1,
                  title: "Verbose server header disclosure",
                  cwe: "CWE-200",
                },
              ].map((f) => (
                <li
                  key={f.title}
                  className="group flex items-center justify-between gap-4 p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ShieldAlert
                      className="size-4 shrink-0"
                      style={{
                        color:
                          buckets.find((b) => b.label === f.sev)?.color ?? "white",
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{f.title}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {f.cwe} · CVSS {f.cvss}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-widest px-2 py-1 rounded glass"
                    style={{
                      color:
                        buckets.find((b) => b.label === f.sev)?.color ?? "white",
                    }}
                  >
                    {f.sev}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle
        cx={48}
        cy={48}
        r={r}
        stroke="oklch(1 0 0 / 0.08)"
        strokeWidth={6}
        fill="none"
      />
      <motion.circle
        cx={48}
        cy={48}
        r={r}
        stroke="url(#g)"
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        transform="rotate(-90 48 48)"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: offset }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00C2A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
