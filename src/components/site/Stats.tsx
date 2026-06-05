import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Float3D, SectionBackdrop } from "./SectionFx";

const stats = [
  { value: 95, suffix: "%", label: "Accuracy Rate" },
  { value: 24, suffix: "h", label: "Average Delivery" },
  { value: 15000, suffix: "+", label: "Scans Completed" },
  { value: 250000, suffix: "+", label: "Vulnerabilities Detected" },
  { value: 99.9, suffix: "%", label: "System Uptime", decimals: 1 },
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
    <section className="relative py-24 sm:py-32 border-y border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="text-center md:text-left"
            >
              <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient-accent">
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
