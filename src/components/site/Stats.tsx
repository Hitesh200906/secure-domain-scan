import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Target, Clock, ShieldCheck } from "lucide-react";
import accuracyAsset from "@/assets/stat-accuracy-bg.png.asset.json";
import deliveryAsset from "@/assets/stat-delivery-bg.png.asset.json";
import uptimeAsset from "@/assets/stat-uptime-bg.png.asset.json";

const imgAccuracy = accuracyAsset.url;
const imgDelivery = deliveryAsset.url;
const imgUptime = uptimeAsset.url;

const stats = [
  {
    value: 95,
    suffix: "%",
    label: "Accuracy Rate",
    color: "#3b82f6",
    icon: Target,
    image: imgAccuracy,
  },
  {
    value: 24,
    suffix: "h",
    label: "Average Delivery",
    color: "#7c5cff",
    icon: Clock,
    image: imgDelivery,
  },
  {
    value: 99.9,
    suffix: "%",
    label: "System Uptime",
    decimals: 1,
    color: "#22c55e",
    icon: ShieldCheck,
    image: imgUptime,
  },
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
    <section className="relative py-14 sm:py-20 border-y border-white/[0.06] bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
        >
          By the numbers
        </motion.h2>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black p-5 sm:p-7 min-h-[190px] sm:min-h-[260px] flex flex-col"
              >
                <img
                  src={s.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  width={800}
                  height={600}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="relative flex flex-col h-full">
                  <span
                    className="inline-flex size-10 sm:size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
                  >
                    <Icon className="size-4 sm:size-5" strokeWidth={1.8} style={{ color: s.color }} />
                  </span>

                  <div className="mt-auto pt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 18, scale: 0.94 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="text-3xl sm:text-5xl font-semibold tracking-tight text-white"
                    >
                      <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                    </motion.div>
                    <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60">
                      {s.label}
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: 44 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.3 + i * 0.08 }}
                      className="mt-4 h-[3px] rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
