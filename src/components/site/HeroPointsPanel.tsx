import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { T } from "./NexusCinematicHero";
import panelBg from "@/assets/points-panel-bg.png.asset.json";

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
      className="relative overflow-hidden rounded-[24px]"
      style={{
        backgroundImage: `url(${panelBg.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* darkening veil — image 30% less visible */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />

      <div className="relative grid grid-cols-2 lg:grid-cols-4">
        {points.map((p, i) => (
          <div key={p.title} className="relative px-5 py-6 sm:px-7 sm:py-7">
            {i > 0 && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-[14%] hidden h-[72%] w-px lg:block"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,255,255,0.16) 22%, rgba(255,255,255,0.16) 78%, transparent)",
                }}
              />
            )}
            {i % 2 === 1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-[14%] h-[72%] w-px lg:hidden"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,255,255,0.16) 22%, rgba(255,255,255,0.16) 78%, transparent)",
                }}
              />
            )}
            {i >= 2 && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-[8%] top-0 h-px w-[84%] lg:hidden"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)",
                }}
              />
            )}

            <div
              className="text-[16px] sm:text-[17px] font-bold tracking-[-0.01em]"
              style={{ color: T.text }}
            >
              {p.title}
            </div>
            <p className="mt-1.5 text-[13px] sm:text-[14px] leading-[1.5]" style={{ color: T.text2 }}>
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
