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
      className="relative overflow-hidden rounded-[22px]"
      style={{
        background: "linear-gradient(180deg,#0A0B0F 0%,#000000 100%)",
        border: `1px solid ${T.border}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {points.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="px-4 py-5 sm:px-5 sm:py-6 border-b border-r even:border-r-0 lg:border-b-0 lg:even:border-r lg:last:border-r-0 lg:[&:nth-last-child(-n+2)]:border-b-0 [&:nth-last-child(-n+2)]:border-b-0"
              style={{ borderColor: T.border }}
            >

              <span
                className="inline-flex size-8 items-center justify-center rounded-lg"
                style={{ background: "#0C0E13", border: `1px solid ${T.border}`, color: T.text2 }}
              >
                <Icon className="size-4" />
              </span>
              <div className="mt-3 text-[13.5px] font-semibold tracking-[-0.01em]" style={{ color: T.text }}>
                {p.title}
              </div>
              <p className="mt-1 text-[12px] leading-[1.45]" style={{ color: T.text2 }}>
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

    </motion.div>
  );
}
