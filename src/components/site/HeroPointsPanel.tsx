import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { T } from "./NexusCinematicHero";

export type HeroPoint = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export function HeroPointsPanel({ points }: { points: HeroPoint[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-[28px]"
      style={{
        background: "#05060A",
        border: `1px solid ${T.border}`,
      }}
    >
      {/* basic geometric facets — flat, no glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 38%), linear-gradient(300deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0) 42%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 14px)",
            maskImage: "linear-gradient(to left, #000 0%, transparent 55%)",
            WebkitMaskImage: "linear-gradient(to left, #000 0%, transparent 55%)",
          }}
        />
      </div>

      <div className="relative grid grid-cols-2 lg:grid-cols-4">
        {points.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="px-6 py-8 sm:px-8 sm:py-10 border-b border-r even:border-r-0 lg:border-b-0 lg:even:border-r lg:last:border-r-0 lg:[&:nth-last-child(-n+2)]:border-b-0 [&:nth-last-child(-n+2)]:border-b-0"
              style={{ borderColor: T.border }}
            >

              <span
                className="inline-flex size-9 items-center justify-center rounded-lg"
                style={{ background: "#0C0E13", border: `1px solid ${T.border}`, color: T.text2 }}
              >
                <Icon className="size-[18px]" />
              </span>
              <div className="mt-4 text-[17px] sm:text-[19px] font-bold tracking-[-0.01em]" style={{ color: T.text }}>
                {p.title}
              </div>
              <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.55]" style={{ color: T.text2 }}>
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>


    </motion.div>
  );
}
