import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { T } from "./NexusCinematicHero";
const panelBg = { url: "/images/points-panel-bg.png" };

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
      className="relative overflow-hidden rounded-[14px] sm:rounded-[24px]"
      style={{
        backgroundImage: `url(${panelBg.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* darkening veil — image 30% less visible */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />

      <div className="relative grid grid-cols-4">
        {points.map((p, i) => (
          <div key={p.title} className="relative px-2 py-3 sm:px-7 sm:py-7">
            {i > 0 && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-[14%] h-[72%] w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,255,255,0.16) 22%, rgba(255,255,255,0.16) 78%, transparent)",
                }}
              />
            )}

            <div
              className="text-[9.5px] sm:text-[17px] font-bold leading-tight tracking-[-0.01em]"
              style={{ color: T.text }}
            >
              {p.title}
            </div>
            <p className="mt-1 sm:mt-1.5 text-[8px] sm:text-[14px] leading-[1.35] sm:leading-[1.5]" style={{ color: T.text2 }}>
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
