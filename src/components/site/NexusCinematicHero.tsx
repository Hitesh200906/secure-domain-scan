import { motion } from "framer-motion";
import { ModeToggle } from "./ModeToggle";
import marketplaceAsset from "@/assets/marketplace-world.png.asset.json";
import heroBgAsset from "@/assets/hero-bg.png.asset.json";

/* ================================================================
   HERO — pure black space, twinkling stars, 5 floating "worlds"
   with animated labels + descriptions. Marketplace is live;
   4 more slots are ready for the upcoming images.
   ================================================================ */


/* -------------------- Animated label -------------------- */
function WorldLabel({ text, accent }: { text: string; accent: string }) {
  return (
    <div className="relative inline-flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative"
      >
        <h3
          className="relative whitespace-nowrap text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[0.18em] uppercase text-white"
          style={{
            textShadow: `0 0 24px ${accent}80, 0 0 60px ${accent}40`,
          }}
        >
          {text.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          ))}
        </h3>
        {/* animated underline */}
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -bottom-2 left-0 right-0 mx-auto h-px origin-center"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 12px ${accent}`,
          }}
        />
        {/* shimmer sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <motion.span
            className="absolute inset-y-0 w-1/3 -skew-x-12"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`,
            }}
            animate={{ x: ["-120%", "260%"] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          />
        </span>
      </motion.div>
    </div>
  );
}

/* -------------------- World card -------------------- */
type World = {
  key: string;
  label: string;
  description: string;
  image?: string;
  accent: string;
  delay: number;
};

function WorldCard({ w }: { w: World }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay: w.delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center text-center"
    >
      {/* image area */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-center">
        {w.image ? (
          <motion.img
            src={w.image}
            alt={w.label}
            draggable={false}
            className="max-h-full max-w-full object-contain select-none"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: w.delay }}
          />
        ) : (
          <div
            className="flex h-[70%] w-[70%] items-center justify-center rounded-3xl border border-dashed"
            style={{ borderColor: `${w.accent}55`, background: `${w.accent}0a` }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Coming soon</span>
          </div>
        )}
      </div>

      {/* label */}
      <div className="mt-4 sm:mt-6">
        <WorldLabel text={w.label} accent={w.accent} />
      </div>

      {/* description */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: w.delay + 0.6 }}
        className="mt-4 max-w-xs text-sm sm:text-base text-white/60 leading-relaxed"
      >
        {w.description}
      </motion.p>
    </motion.div>
  );
}

/* -------------------- Hero -------------------- */
const WORLDS: World[] = [
  {
    key: "marketplace",
    label: "Marketplace",
    description:
      "Buy, sell, create and scale — a living marketplace built for internet-native businesses.",
    image: marketplaceAsset.url,
    accent: "#38bdf8",
    delay: 0,
  },
  {
    key: "communities",
    label: "Communities",
    description: "Bring your people together in interconnected, always-on communities.",
    accent: "#a78bfa",
    delay: 0.1,
  },
  {
    key: "business",
    label: "Business",
    description: "Analytics, orders and revenue — everything you need to run the operation.",
    accent: "#facc15",
    delay: 0.2,
  },
];

export function NexusCinematicHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-24 sm:pt-28 pb-16 sm:pb-20">
      {/* Background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBgAsset.url})`,
          filter: "blur(4px) saturate(1.1)",
          opacity: 0.9,
          transform: "scale(1.05)",
        }}
      />
      {/* Subtle vignette for depth without hiding image */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      {/* Top fade into navbar black */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent"
      />
      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
          {WORLDS.map((w) => (
            <WorldCard key={w.key} w={w} />
          ))}
        </div>

        <div className="mt-16 sm:mt-24 flex justify-center">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
