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
      <div className="relative grid grid-cols-2 lg:grid-cols-4">
        {points.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="px-5 py-6 sm:px-7 sm:py-7">
              <span
                className="inline-flex size-8 items-center justify-center rounded-lg"
                style={{ background: "rgba(0,0,0,0.45)", color: T.text2 }}
              >
                <Icon className="size-[17px]" />
              </span>
              <div
                className="mt-3 text-[16px] sm:text-[17px] font-bold tracking-[-0.01em]"
                style={{ color: T.text }}
              >
                {p.title}
              </div>
              <p className="mt-1.5 text-[13px] sm:text-[14px] leading-[1.5]" style={{ color: T.text2 }}>
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
