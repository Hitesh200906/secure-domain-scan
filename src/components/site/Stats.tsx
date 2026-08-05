import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Target, Timer, Activity, ScanLine, ShieldCheck, Bug } from "lucide-react";
import { SectionBackdrop } from "./SectionFx";
import statsPanel from "@/assets/stats-panel.jpg";

const stats = [
  {
    value: 95,
    suffix: "%",
    label: "Accuracy Rate",
    hint: "Validated findings, near-zero noise",
    icon: Target,
    progress: 95,
    color: "var(--green-success)",
  },
  {
    value: 24,
    suffix: "h",
    label: "Average Delivery",
    hint: "Full report turnaround time",
    icon: Timer,
    progress: 80,
    color: "var(--warning-orange)",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "System Uptime",
    decimals: 1,
    icon: Activity,
    progress: 99.9,
    hint: "Continuous monitoring, always on",
    color: "var(--violet-accent)",
  },
  {
    value: 12,
    suffix: "M+",
    label: "Checks Executed",
    hint: "Across apps, APIs and cloud",
    icon: ScanLine,
    progress: 88,
    color: "var(--border-soft)",
  },
];

const highlights = [
  { icon: ShieldCheck, k: "OWASP Top 10", v: "Full coverage", color: "var(--green-success)" },
  { icon: Bug, k: "CVE Corpus", v: "4.2M+ indexed", color: "var(--critical-red)" },
  { icon: Activity, k: "Threat Feeds", v: "40+ live sources", color: "var(--warning-orange)" },
];


function Counter({
  value,
  suffix,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(decimals),
  );

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [inView, mv, value]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v + suffix;
    });
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function Stats() {
  return (
    <section className="relative py-16 sm:py-28 border-y border-white/[0.06] overflow-hidden">
      <SectionBackdrop variant="grid" opacity={0.1} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 sm:gap-14 items-center">
          {/* left: numbers */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                By the numbers
              </div>
              <h2 className="mt-4 text-2xl sm:text-4xl font-semibold tracking-[-0.03em] text-gradient">
                Measured performance, not marketing
              </h2>
              <p className="mt-3 max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
                Every scan is benchmarked against verified exploit data, so the numbers
                you see are the numbers your team can plan around.
              </p>
            </motion.div>

            <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl p-4 sm:p-6 transition-colors duration-300"
                  style={{
                    background: "linear-gradient(180deg, var(--surface-3), var(--surface-1))",
                    border: "1px solid var(--border-hard)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center justify-center size-8 sm:size-9 rounded-lg"
                      style={{
                        background: "var(--surface-4)",
                        border: "1px solid var(--border-soft)",
                        color: s.color,
                      }}
                    >
                      <s.icon className="size-4" strokeWidth={1.6} />
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>

                  <div className="mt-4 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                    <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                  </div>
                  <div className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </div>

                  <div
                    className="mt-3 h-px w-full overflow-hidden rounded-full"
                    style={{ background: "var(--border-hard)" }}
                  >
                    <motion.div
                      className="h-px"
                      style={{ background: s.color, opacity: 0.8 }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.progress}%` }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 1.4, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <p className="mt-3 text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed">
                    {s.hint}
                  </p>
                </motion.div>
              ))}
            </div>

          </div>

          {/* right: visual panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-hard)" }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <motion.img
                src={statsPanel}
                alt="Nexefy security telemetry network visualisation"
                loading="lazy"
                width={1280}
                height={960}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ scale: 1.08 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

              {/* scan sweep */}
              <motion.div
                aria-hidden
                className="absolute left-0 right-0 h-px bg-white/15"
                animate={{ top: ["8%", "88%", "8%"] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative p-4 sm:p-6" style={{ borderTop: "1px solid var(--border-hard)" }}>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {highlights.map((h, i) => (
                  <motion.div
                    key={h.k}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  >
                    <h.icon className="size-3.5 sm:size-4" strokeWidth={1.6} style={{ color: h.color }} />
                    <div className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {h.k}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-white/90">{h.v}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
