import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Crosshair, Clock, Activity } from "lucide-react";

const stats = [
  { value: 95, suffix: "%", label: "Accuracy Rate", icon: Crosshair },
  { value: 24, suffix: "h", label: "Average Delivery", icon: Clock },
  { value: 99.9, suffix: "%", label: "System Uptime", decimals: 1, icon: Activity },
];

const HEX =
  "polygon(14% 0%, 100% 0%, 100% 86%, 86% 100%, 0% 100%, 0% 14%)";

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
  const rounded = useTransform(mv, (v) => v.toFixed(decimals));

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
    <section className="relative overflow-hidden bg-black py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-[9px] sm:text-[11px] uppercase tracking-[0.35em] text-white/55"
        >
          By the numbers
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-4 h-px w-40 sm:w-64 bg-gradient-to-r from-transparent via-white/35 to-transparent"
        />

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-center text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] text-white"
        >
          Engineered for <span className="text-white/45">results.</span>
          <br />
          Measured by <span className="text-white/45">data.</span>
        </motion.h2>

        <div className="mt-10 sm:mt-16 grid grid-cols-3 gap-2.5 sm:gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ clipPath: HEX }}
                className="group relative bg-white/[0.07] p-px transition-transform duration-500 hover:-translate-y-1"
              >
                <div
                  style={{ clipPath: HEX }}
                  className="relative flex h-full flex-col items-center bg-[#000000] px-2 py-6 sm:px-8 sm:py-12"
                >
                  <span className="flex size-9 sm:size-14 items-center justify-center rounded-full border border-white/15 bg-black">
                    <Icon className="size-3.5 sm:size-6 text-white/85" strokeWidth={1.5} />
                  </span>

                  <div className="mt-5 sm:mt-9 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="mt-5 sm:mt-9 text-center">
                    <div className="text-2xl sm:text-6xl font-bold tracking-tight text-white tabular-nums">
                      <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                    </div>
                    <div className="mt-2 sm:mt-4 text-[7px] sm:text-[12px] uppercase tracking-[0.18em] sm:tracking-[0.28em] text-white/55">
                      {s.label}
                    </div>
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 28 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.35 + i * 0.1 }}
                    className="mt-4 sm:mt-8 h-[2px] rounded-full bg-white/30"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
