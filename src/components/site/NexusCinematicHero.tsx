import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { ShoppingBag, Users, ShieldCheck, Sparkles, BarChart3 } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import heroBgAsset from "@/assets/hero-bg.png.asset.json";

/* ================================================================
   NEXEFY HERO — premium, minimal, cinematic.
   Keeps the existing blurred background image and ModeToggle buttons.
   ================================================================ */

type Feature = {
  key: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;      // primary neon
  secondary: string;   // secondary accent
  col: number;         // 1..5 grid column
  delay: number;
};

const FEATURES: Feature[] = [
  { key: "communities", label: "Communities", Icon: Users,       accent: "#a78bfa", secondary: "#60a5fa", col: 1, delay: 0.92 },
  { key: "ai",          label: "AI Tools",    Icon: Sparkles,    accent: "#38bdf8", secondary: "#a78bfa", col: 2, delay: 1.28 },
  { key: "marketplace", label: "Marketplace", Icon: ShoppingBag, accent: "#60a5fa", secondary: "#a78bfa", col: 3, delay: 0.80 },
  { key: "security",    label: "Security",    Icon: ShieldCheck, accent: "#22d3ee", secondary: "#818cf8", col: 4, delay: 1.04 },
  { key: "business",    label: "Business",    Icon: BarChart3,   accent: "#818cf8", secondary: "#38bdf8", col: 5, delay: 1.16 },
];

/* -------------------- Glass world illustration -------------------- */
function GlassWorld({ f, floatDelay }: { f: Feature; floatDelay: number }) {
  return (
    <motion.div
      className="relative aspect-square w-full max-w-[168px] mx-auto"
      animate={{ y: [0, -6, 0], rotate: [-1, 1, -1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
    >
      {/* soft aura */}
      <div
        className="absolute -inset-6 rounded-full blur-2xl opacity-60"
        style={{
          background: `radial-gradient(closest-side, ${f.accent}55, transparent 70%)`,
        }}
      />
      {/* metallic ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 140deg, rgba(255,255,255,0.35), rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.25) 55%, rgba(255,255,255,0.02) 80%, rgba(255,255,255,0.35))",
          padding: "1px",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* glass sphere */}
      <div
        className="absolute inset-[6%] rounded-full overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${f.accent}66 0%, ${f.secondary}33 35%, rgba(10,12,24,0.85) 70%, rgba(4,6,14,0.95) 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -30px 60px rgba(0,0,0,0.55), 0 20px 40px -20px ${f.accent}55`,
          backdropFilter: "blur(6px)",
        }}
      >
        {/* orbit line */}
        <div
          className="absolute inset-[14%] rounded-full border"
          style={{ borderColor: `${f.accent}30` }}
        />
        <div
          className="absolute inset-[26%] rounded-full border"
          style={{ borderColor: `${f.secondary}25` }}
        />
        {/* neon highlight */}
        <div
          className="absolute -top-3 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full blur-2xl"
          style={{ background: `${f.accent}` , opacity: 0.5 }}
        />
        {/* specular */}
        <div className="absolute top-[10%] left-[18%] h-1/3 w-1/2 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute top-[8%] left-[22%] h-3 w-8 rounded-full bg-white/70 blur-[2px] rotate-[-20deg]" />
        {/* icon */}
        <div className="absolute inset-0 grid place-items-center">
          <div
            className="grid place-items-center rounded-2xl p-3"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: `0 0 24px ${f.accent}66, inset 0 0 12px rgba(255,255,255,0.08)`,
              backdropFilter: "blur(6px)",
            }}
          >
            <f.Icon className="size-8 text-white" />
          </div>
        </div>
        {/* rim light */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `inset 0 0 30px ${f.accent}55`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* -------------------- Feature slot with label -------------------- */
function FeatureSlot({ f, parallaxScale = 1 }: { f: Feature; parallaxScale?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: f.delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
      style={{ gridColumn: f.col }}
    >
      <div style={{ transform: `translate3d(0,0,0) scale(${parallaxScale})` }}>
        <GlassWorld f={f} floatDelay={f.col * 0.3} />
      </div>
      <div
        className="mt-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white"
        style={{ textShadow: `0 0 12px ${f.accent}80` }}
      >
        {f.label}
      </div>
    </motion.div>
  );
}

/* -------------------- Floating particles -------------------- */
function Particles() {
  const dots = Array.from({ length: 22 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const left = (i * 137.5) % 100;
        const top = (i * 53.7) % 100;
        const size = 1 + ((i * 13) % 3);
        const dur = 8 + ((i * 7) % 10);
        const delay = (i * 0.4) % 6;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              opacity: 0.25,
              filter: "blur(0.5px)",
            }}
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.55, 0.15] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
          />
        );
      })}
    </div>
  );
}

/* -------------------- Hero -------------------- */
export function NexusCinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const smy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  const bgX = useTransform(smx, (v) => v * 5);
  const bgY = useTransform(smy, (v) => v * 5);
  const glowX = useTransform(smx, (v) => v * 8);
  const glowY = useTransform(smy, (v) => v * 8);
  const worldX = useTransform(smx, (v) => v * 12);
  const worldY = useTransform(smy, (v) => v * 12);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      mx.set(nx);
      my.set(ny);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [mx, my]);

  return (
    <section ref={containerRef} className="relative w-full bg-black overflow-hidden">
      {/* Background image (kept) */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
        className="absolute inset-0"
        style={{ x: bgX, y: bgY }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBgAsset.url})`,
            filter: "blur(3px) saturate(1.15)",
            transform: "scale(1.06)",
          }}
        />
        {/* soft top blend to navbar */}
        <div
          className="absolute inset-x-0 top-0 h-56 sm:h-72"
          style={{
            background:
              "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.92) 25%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      </motion.div>

      {/* Ambient glows */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{ x: glowX, y: glowY }}
      >
        <div
          className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 h-[720px] w-[720px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.28), transparent 65%)" }}
        />
        <div
          className="absolute right-[8%] top-[38%] h-[520px] w-[520px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.22), transparent 65%)" }}
        />
        <div
          className="absolute left-[6%] top-[55%] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18), transparent 65%)" }}
        />
      </motion.div>

      <Particles />

      {/* Content */}
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24">
        {/* Feature worlds */}
        <motion.div style={{ x: worldX, y: worldY }}>
          <div className="grid grid-cols-5 gap-x-3 sm:gap-x-8 gap-y-6 max-w-[1180px] mx-auto">
            {FEATURES.map((f) => (
              <FeatureSlot key={f.key} f={f} />
            ))}
          </div>
        </motion.div>

        {/* Headline block */}
        <div className="relative mt-14 sm:mt-20 text-center">
          {/* soft glow behind heading */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[820px] max-w-[95vw] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, rgba(96,165,250,0.18), rgba(168,85,247,0.10) 45%, transparent 70%)",
              opacity: 0.9,
            }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-[44px] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[88px] font-semibold tracking-[-0.045em]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #e6efff 55%, #9ec2ff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 60px rgba(96,165,250,0.15)",
            }}
          >
            THE HOME OF
            <br />
            INTERNET BUSINESS.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.75 }}
            className="relative mx-auto mt-6 sm:mt-8 max-w-[720px] text-sm sm:text-base md:text-lg text-white/65 leading-relaxed"
          >
            Discover thousands of communities, courses, AI tools, digital products and business software.
            Launch your own business in minutes. One platform. Infinite possibilities.
          </motion.p>

          {/* Buttons (kept) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.95 }}
            className="relative mt-8 sm:mt-10 flex justify-center"
            style={{ gap: 18 }}
          >
            <ModeToggle />
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.15 }}
            className="relative mt-14 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
          >
            {[
              { v: "120K+", l: "Creators" },
              { v: "$250M+", l: "Sales" },
              { v: "80+", l: "Countries" },
              { v: "99.9%", l: "Uptime" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center"
                style={{
                  backdropFilter: "blur(14px)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 40px -20px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  className="text-2xl sm:text-3xl font-semibold tracking-tight"
                  style={{
                    backgroundImage: "linear-gradient(180deg, #dbeafe, #60a5fa)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {s.v}
                </div>
                <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/55">
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
}
