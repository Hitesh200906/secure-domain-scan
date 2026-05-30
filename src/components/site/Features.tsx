import { motion } from "framer-motion";
import {
  Brain,
  ShieldCheck,
  FileSearch,
  Network,
  Cloud,
  Radar,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Vulnerability Detection",
    desc: "Models trained on millions of CVEs surface unknown attack paths and zero-day patterns in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "OWASP Security Assessment",
    desc: "Full OWASP Top 10 coverage with deep checks for injection, auth, and broken access control flaws.",
  },
  {
    icon: FileSearch,
    title: "Penetration Testing Reports",
    desc: "Executive-grade reports with reproducible steps, evidence and CVSS-scored remediation paths.",
  },
  {
    icon: Network,
    title: "API Security Analysis",
    desc: "Schema-aware fuzzing for REST, GraphQL and gRPC. BOLA, rate limit and auth flow validation.",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure Audits",
    desc: "AWS, GCP and Azure misconfiguration analysis mapped to CIS benchmarks and best practices.",
  },
  {
    icon: Radar,
    title: "Real-Time Threat Intelligence",
    desc: "Live feeds from 40+ sources continuously correlated with your exposed surface and assets.",
  },
];

export function Features() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Capabilities"
          title="Security infrastructure, reimagined"
          description="A complete platform that combines AI reasoning with battle-tested security methodology to keep your stack protected."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden border border-white/[0.06]">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative bg-background p-8 lg:p-10 transition hover:bg-white/[0.02]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center justify-center size-11 rounded-xl glass text-primary group-hover:shadow-[0_0_30px_-4px_oklch(0.86_0.16_200_/0.6)] transition">
                  <f.icon className="size-5" strokeWidth={1.6} />
                </div>
                <h3 className="mt-6 text-lg font-medium text-white tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-gradient">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
