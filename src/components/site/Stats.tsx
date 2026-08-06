import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const stats = [
  { value: 95, suffix: "%", label: "Accuracy Rate", color: "#22c55e" },
  { value: 24, suffix: "h", label: "Average Delivery", color: "#eab308" },
  { value: 99.9, suffix: "%", label: "System Uptime", decimals: 1, color: "#22c55e" },
  { value: 12, suffix: "M+", label: "Checks Executed", color: "#ef4444" },
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
    const controls = animate(mv, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
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
    <section className="relative py-14 sm:py-20 border-y border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
        >
          By the numbers
        </motion.h2>

        <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-xl border border-white/[0.08] p-5 sm:p-6 text-center"
              style={{ background: "rgba(0,0,0,0.1)" }}
            >
              <div
                className="text-2xl sm:text-4xl font-semibold tracking-tight"
                style={{ color: s.color }}
              >
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
