import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, Gauge, Radar, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scan/")({
  head: () => ({
    meta: [
      { title: "Choose a Scan — Nexefy Security" },
      { name: "description", content: "Pick the depth of your next website security scan: Starter, Professional or Enterprise assessment." },
      { property: "og:title", content: "Choose a Scan — Nexefy Security" },
      { property: "og:description", content: "Pick the depth of your next website security scan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanChooserPage,
});

const BORDER = "#232629";
const BLUE = "#2563EB";

const PLANS = [
  {
    slug: "starter" as const,
    name: "Starter Scan",
    icon: Gauge,
    credits: "1 credit",
    blurb: "A fast surface-level sweep of a single domain.",
    features: ["Up to 25 pages crawled", "Core OWASP checks", "Headers, TLS & cookies", "Summary report"],
  },
  {
    slug: "professional" as const,
    name: "Professional Scan",
    icon: Radar,
    credits: "15 credits",
    blurb: "Deep crawl with injection, XSS and auth testing.",
    features: ["Unlimited pages & endpoints", "SQLi, XSS & IDOR testing", "AI validation of findings", "Full technical report + remediation"],
    featured: true,
  },
  {
    slug: "enterprise" as const,
    name: "Enterprise Scan",
    icon: ShieldCheck,
    credits: "Custom",
    blurb: "Continuous assessment across every asset you own.",
    features: ["Multi-domain & API coverage", "Authenticated scanning", "Compliance-ready exports", "Dedicated security engineer"],
  },
];

function ScanChooserPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
        <Link to="/dashboard" className="text-[12px] text-muted-foreground hover:text-white transition">← Back to dashboard</Link>
        <h1 className="mt-5 text-2xl sm:text-4xl font-light tracking-[-0.02em]">
          Start a new scan
        </h1>
        <p className="mt-3 max-w-xl text-[13px] sm:text-[15px] text-muted-foreground">
          Choose the assessment depth. You can change the target domain and verification method on the next step.
        </p>

        <div className="mt-8 sm:mt-12 grid gap-4 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative flex flex-col rounded-2xl p-5 sm:p-7"
              style={{
                border: `1px solid ${p.featured ? `${BLUE}66` : BORDER}`,
                background: "#000",
              }}
            >
              {p.featured && (
                <span className="absolute -top-2.5 left-6 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
                  style={{ background: BLUE, color: "#fff" }}>
                  Recommended
                </span>
              )}
              <p.icon className="size-6" style={{ color: p.featured ? BLUE : "#8B98A8" }} />
              <h2 className="mt-4 text-[17px] sm:text-[19px] font-medium">{p.name}</h2>
              <div className="mt-1 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">{p.credits}</div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{p.blurb}</p>

              <ul className="mt-5 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/85">
                    <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: BLUE }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/scan/new"
                search={{ plan: p.slug }}
                className="group mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium transition"
                style={
                  p.featured
                    ? { background: BLUE, color: "#fff" }
                    : { border: `1px solid ${BORDER}`, color: "#fff" }
                }
              >
                Select {p.name.split(" ")[0]}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
