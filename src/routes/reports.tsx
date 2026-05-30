import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ReportCard } from "@/components/site/ReportShowcase";
import { Download, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Nexus Security" },
      {
        name: "description",
        content:
          "Beautifully structured, executive-ready security reports with CVSS scoring, evidence, and remediation guidance.",
      },
    ],
  }),
  component: ReportsPage,
});

const findings = [
  {
    id: "VLN-2026-0421",
    title: "SQL Injection on /api/v1/orders",
    cwe: "CWE-89",
    cvss: 9.8,
    sev: "Critical",
    color: "oklch(0.65 0.22 25)",
    desc: "User-controlled input concatenated into a raw SQL query allows authenticated extraction of the entire orders table.",
    fix: "Parameterize all queries via prepared statements. Add input validation at the API boundary.",
  },
  {
    id: "VLN-2026-0422",
    title: "Broken Object Level Authorization",
    cwe: "CWE-639",
    cvss: 8.1,
    sev: "High",
    color: "oklch(0.78 0.17 50)",
    desc: "Object IDs in /api/v1/users/{id} are not validated against the requesting principal, allowing IDOR attacks.",
    fix: "Enforce ownership checks server-side. Use opaque IDs and authorize against session principal.",
  },
  {
    id: "VLN-2026-0423",
    title: "S3 bucket misconfigured for public read",
    cwe: "CWE-732",
    cvss: 7.4,
    sev: "High",
    color: "oklch(0.78 0.17 50)",
    desc: "Bucket policy allows s3:GetObject for principal '*'. Indexed objects are reachable via search engines.",
    fix: "Apply principle of least privilege. Use CloudFront signed URLs for public assets.",
  },
];

function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Security reports your board will read"
        description="A live preview of a real Nexus report — from executive summary to per-finding remediation guidance."
      />

      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6">
          <ReportCard />
        </div>
      </section>

      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-[1fr_2fr] gap-10">
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="glass rounded-3xl p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Vulnerability Details
              </div>
              <h3 className="mt-2 text-2xl font-medium tracking-tight">
                {findings.length} prioritized findings
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Each finding includes severity, CVSS, reproducible evidence and a clear
                remediation path your engineers can ship.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition">
                <Download className="size-4" /> Download Full PDF
              </button>
              <Link
                to="/contact"
                className="mt-3 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white"
              >
                Request a custom audit →
              </Link>
            </div>
          </aside>

          <div className="space-y-4">
            {findings.map((f) => (
              <article key={f.id} className="glass rounded-3xl p-7">
                <header className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert
                      className="size-5 mt-0.5 shrink-0"
                      style={{ color: f.color }}
                    />
                    <div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {f.id} · {f.cwe}
                      </div>
                      <h4 className="text-lg font-medium tracking-tight">{f.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] uppercase tracking-widest px-2 py-1 rounded glass"
                      style={{ color: f.color }}
                    >
                      {f.sev}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      CVSS {f.cvss}
                    </span>
                  </div>
                </header>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
                <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="text-[11px] uppercase tracking-widest text-primary">
                    Recommendation
                  </div>
                  <p className="mt-1.5 text-sm text-white/90 leading-relaxed">{f.fix}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
