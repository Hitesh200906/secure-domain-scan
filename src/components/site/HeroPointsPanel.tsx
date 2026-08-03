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
      className="relative overflow-hidden rounded-[26px]"
      style={{
        background: "linear-gradient(180deg,#08090C 0%,#000000 100%)",
        border: `1px solid ${T.border}`,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {points.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="px-6 py-7 sm:px-8 sm:py-9 border-b last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:even:border-r-0"
              style={{
                borderColor: T.border,
                borderRightWidth: i % 2 === 0 ? 2 : 0,
                borderRightStyle: "solid",
              }}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#0C0E13", border: `1px solid ${T.border}`, color: T.text2 }}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: T.text }}>
                    {p.title}
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: T.text2 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
