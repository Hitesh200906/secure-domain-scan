import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Crosshair, Clock, Activity } from "lucide-react";
import statsImage from "@/assets/by-the-numbers.png.asset.json";

const stats = [
  { value: 95, suffix: "%", label: "Accuracy Rate", icon: Crosshair },
  { value: 24, suffix: "h", label: "Average Delivery", icon: Clock },
  { value: 99.9, suffix: "%", label: "System Uptime", decimals: 1, icon: Activity },
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
  const rounded = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
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
    <section className="relative isolate overflow-hidden bg-black py-14 sm:py-24">
      {/* Cinematic backdrop */}
      <img
        src={statsImage.url}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.45]"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      <div className="relative mx-auto max-w-6xl px-3 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-[9px] uppercase tracking-[0.35em] text-white/60 sm:text-[11px]"
        >
          By the numbers
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent sm:w-64"
        />

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-center text-2xl font-semibold leading-[1.15] tracking-tight text-white sm:mt-7 sm:text-5xl"
        >
          Engineered for <span className="text-white/45">results.</span>
          <br />
          Measured by <span className="text-white/45">data.</span>
        </motion.h2>

        {/* Cards — overlapping, angled-corner glass panels */}
        <div className="mt-10 flex items-stretch justify-center sm:mt-20">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{ zIndex: 3 - i }}
                className={`group relative w-1/3 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[14px] rounded-bl-[14px] bg-gradient-to-b from-white/[0.18] via-white/[0.06] to-white/[0.14] p-px transition-transform duration-500 hover:-translate-y-2 sm:rounded-tl-[86px] sm:rounded-br-[86px] sm:rounded-tr-[26px] sm:rounded-bl-[26px] ${
                  i > 0 ? "-ml-2 sm:-ml-6" : ""
                }`}
              >
                <div className="flex h-full flex-col items-center rounded-tl-[35px] rounded-br-[35px] rounded-tr-[13px] rounded-bl-[13px] bg-[#000000] px-2 py-6 sm:rounded-tl-[85px] sm:rounded-br-[85px] sm:rounded-tr-[25px] sm:rounded-bl-[25px] sm:px-8 sm:py-12">
                  <motion.span
                    initial={{ scale: 0.75, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black transition-colors duration-300 group-hover:border-white/45 sm:size-16"
                  >
                    <Icon className="size-4 text-white/90 sm:size-7" strokeWidth={1.4} />
                  </motion.span>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.25 + i * 0.12 }}
                    className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent sm:mt-10"
                  />

                  <div className="mt-5 text-center sm:mt-10">
                    <div className="text-[26px] font-bold leading-none tabular-nums tracking-tight text-white sm:text-[68px]">
                      <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                    </div>
                    <div className="mt-2 text-[7px] uppercase tracking-[0.16em] text-white/60 sm:mt-5 sm:text-[13px] sm:tracking-[0.28em]">
                      {s.label}
                    </div>
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 30 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.4 + i * 0.12 }}
                    className="mt-4 h-[2px] rounded-full bg-white/35 sm:mt-9"
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
