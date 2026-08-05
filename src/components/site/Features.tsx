import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Brain,
  ShieldCheck,
  FileSearch,
  Network,
  Cloud,
  Radar,
} from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Brain,
    title: "AI Vulnerability Detection",
    desc: "Models trained on millions of CVEs surface unknown attack paths and zero-day patterns in seconds.",
    tone: "blue",
  },
  {
    icon: ShieldCheck,
    title: "OWASP Security Assessment",
    desc: "Full OWASP Top 10 coverage with deep checks for injection, auth, and broken access control flaws.",
    tone: "navy",
  },
  {
    icon: FileSearch,
    title: "Penetration Testing Reports",
    desc: "Executive-grade reports with reproducible steps, evidence and CVSS-scored remediation paths.",
    tone: "blue",
  },
  {
    icon: Network,
    title: "API Security Analysis",
    desc: "Schema-aware fuzzing for REST, GraphQL and gRPC. BOLA, rate limit and auth flow validation.",
    tone: "cyan",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure Audits",
    desc: "AWS, GCP and Azure misconfiguration analysis mapped to CIS benchmarks and best practices.",
    tone: "navy",
  },
  {
    icon: Radar,
    title: "Real-Time Threat Intelligence",
    desc: "Live feeds from 40+ sources continuously correlated with your exposed surface and assets.",
    tone: "purple",
  },
] as const;

const toneColor: Record<string, string> = {
  blue: "var(--brand-blue)",
  navy: "var(--brand-navy)",
  cyan: "var(--brand-cyan)",
  purple: "var(--brand-purple)",
};


function Tilt3DCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const rotateX = useTransform(sy, [-50, 50], [10, -10]);
  const rotateY = useTransform(sx, [-50, 50], [-10, 10]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="relative py-16 sm:py-32 overflow-hidden">



      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Capabilities"
          title="Security infrastructure, reimagined"
          description="A complete platform that combines AI reasoning with battle-tested security methodology to keep your stack protected."
        />

        <div
          className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          style={{ perspective: 1200 }}
        >
          {features.map((f, i) => {
            const c = toneColor[f.tone];
            return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20, rotateX: -8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
            >
              <Tilt3DCard
                className="group relative h-full rounded-2xl p-6 sm:p-8 lg:p-10 transition-colors duration-500 will-change-transform"
                style={{
                  background: "#000000",
                  border: "1px solid var(--line-soft)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${c} 14%, transparent) 0%, transparent 60%)`,
                  }}
                />
                <div
                  className="absolute left-0 right-0 top-0 h-px rounded-t-2xl opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }}
                />
                <div
                  className="relative"
                  style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    whileHover={{ rotateY: 360 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center justify-center size-12 rounded-xl"
                    style={{
                      background: `color-mix(in srgb, ${c} 16%, var(--ink-600))`,
                      border: `1px solid color-mix(in srgb, ${c} 34%, transparent)`,
                      color: c === "var(--brand-navy)" ? "var(--brand-blue)" : c,
                    }}
                  >
                    <f.icon className="size-5" strokeWidth={1.6} />
                  </motion.div>
                  <h3
                    className="mt-6 text-lg font-medium tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {f.desc}
                  </p>
                  <div className="mt-5 h-px w-full" style={{ background: "var(--line-soft)" }}>
                    <motion.div
                      className="h-px"
                      style={{ background: c }}
                      initial={{ width: "12%" }}
                      whileInView={{ width: "52%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.25 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </Tilt3DCard>
            </motion.div>
            );
          })}

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
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
          style={{
            background: "var(--gradient-brand-soft)",
            border: "1px solid color-mix(in srgb, var(--brand-blue) 30%, transparent)",
            color: "var(--text-secondary)",
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: "var(--brand-blue)" }}
          />
          {eyebrow}
        </div>
      )}

      <h2 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-gradient">
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
