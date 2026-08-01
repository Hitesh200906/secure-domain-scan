import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Sparkles, ShieldCheck, Zap, Globe, Store } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import imgMarketplace from "@/assets/card-marketplace-v7.png.asset.json";
import imgSecurity from "@/assets/card-security-v11.png.asset.json";
import imgRewards from "@/assets/card-rewards-v10.png.asset.json";
import heroDesk from "@/assets/hero-bg-v6.png.asset.json";

const T = {
  bg: "#000000",
  card: "#000000",
  border: "#1F232D",
  text: "#F5F7FA",
  text2: "#A8ADBB",
  text3: "#6B7080",
  blue: "#4F6BFF",
  navy: "#0000DD",

};

export function NexusCinematicHero() {
  const { setMode } = useAppMode();

  return (
    <section className="relative w-full overflow-hidden" style={{ background: T.bg }}>
      {/* ambient background image — blended into navbar above and page below */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-contain bg-no-repeat"
          style={{
            backgroundImage: `url(${heroDesk.url})`,
            backgroundPosition: "center 22%",
            opacity: 0.4,
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.65) 10%, #000 26%, #000 66%, rgba(0,0,0,0.5) 84%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.65) 10%, #000 26%, #000 66%, rgba(0,0,0,0.5) 84%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 pt-24 sm:pt-28 pb-40 sm:pb-56">

        {/* ---------- Two-column top ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur-md"
              style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${T.border}`, color: T.text2 }}
            >
              <span className="relative flex size-1.5">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full"
                  style={{ background: T.blue }}
                  animate={{ scale: [1, 3.2, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="relative inline-flex size-1.5 rounded-full"
                  style={{ background: T.blue }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
              All-in-One Business Platform
            </motion.div>


            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="mt-7 font-semibold leading-[0.9] text-[42px] sm:text-[62px] lg:text-[78px]"
              style={{
                letterSpacing: "0.14em",
                background: `linear-gradient(180deg, #FFFFFF 0%, #C9D2FF 45%, ${T.blue} 105%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 8px 40px rgba(79,107,255,0.35))",
              }}
            >
              NEXEFY
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-5 max-w-xl text-[15px] sm:text-[17px] leading-relaxed"
              style={{ color: T.text2 }}
            >
              The all-in-one business platform where creators, founders, developers, and teams launch and grow without limits.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <button
                onClick={() => setMode("nexus")}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-[14px] font-medium backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25"
                style={{
                  background: "linear-gradient(180deg,rgba(22,24,32,0.85) 0%,rgba(0,0,0,0.85) 100%)",
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Sparkles className="size-4" />
                Switch to Nexefy
                <ArrowUpRight className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={() => setMode("security")}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-[14px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(180deg, color-mix(in oklab, ${T.navy} 82%, white) 0%, ${T.navy} 55%, color-mix(in oklab, ${T.navy} 78%, black) 100%)`,
                  border: "none",
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.35), 0 10px 30px -16px ${T.navy}`,
                }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <ShieldCheck className="size-4" />
                Switch to Nexefy Security
                <ArrowUpRight className="size-4 opacity-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

            </motion.div>
          </div>

          <RevenueCard />
        </div>


        {/* ---------- Feature cards ---------- */}
        <div className="mt-20 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          <FeatureCard index={0} image={imgMarketplace.url} fit="contain" title="Marketplace" desc="Launch branded storefronts." />
          <FeatureCard index={1} image={imgSecurity.url} title="Security" desc="AI-powered protection." />
          <FeatureCard index={2} image={imgRewards.url} title="Nexefy Rewards" desc="Earn from the clips you create." />
        </div>

        {/* ---------- Bottom feature strip ---------- */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.25em]"
          style={{ color: T.text3 }}
        >
          <span className="inline-flex items-center gap-2"><Store className="size-3.5" /> 12k+ Stores</span>
          <span>·</span>
          <span className="inline-flex items-center gap-2"><Zap className="size-3.5" /> 99.99% Uptime</span>
          <span>·</span>
          <span className="inline-flex items-center gap-2"><Globe className="size-3.5" /> 140 Countries</span>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  index,
  image,
  title,
  desc,
  fit = "cover",
}: {
  index: number;
  image: string;
  title: string;
  desc: string;
  fit?: "cover" | "contain";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative rounded-2xl overflow-hidden flex flex-col backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(0,0,0,0.6)",
        border: `1px solid ${T.border}`,
        boxShadow: "0 24px 60px -30px rgba(0,0,0,0.9)",
      }}
    >
      <div className={`relative w-full basis-[80%] grow-0 ${fit === "contain" ? "aspect-[3/2]" : "aspect-[16/9]"}`}>
        <img
          src={image}
          alt={`${title} preview`}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-top ${fit === "contain" ? "object-contain" : "object-cover"}`}
        />
      </div>

      <div className="basis-[20%] px-5 py-3.5" style={{ background: "rgba(0,0,0,0.7)" }}>
        <div className="text-[16px] sm:text-[17px] font-semibold leading-tight" style={{ color: T.text }}>
          {title}
        </div>
        <p className="mt-1 text-[12.5px] leading-snug" style={{ color: T.text2 }}>
          {desc}
        </p>
      </div>
    </motion.div>
  );
}


function RevenueCard() {
  const points = [4, 5.5, 7, 10, 9.5, 13, 12, 16, 18, 17.5, 22, 24, 23.5, 28, 31];
  const w = 520, h = 260;
  const max = 34;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35 }}
      className="relative w-full max-w-full px-2 py-8 sm:px-6 sm:py-10 lg:pl-8 lg:pr-4"
      style={{ perspective: "1400px" }}
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotateY: [-11, -7, -11], rotateX: [6, 4, 6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[22px] overflow-hidden backdrop-blur-xl origin-center"
        style={{
          transformStyle: "preserve-3d",
          background: "linear-gradient(160deg, #0A0B0F 0%, #000000 100%)",
          border: `1px solid ${T.border}`,
          boxShadow:
            "0 50px 110px -40px rgba(0,0,0,1), -24px 24px 60px -40px rgba(79,107,255,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex justify-end px-4 pt-4">
          <div
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px]"
            style={{ border: `1px solid ${T.border}`, color: T.text2 }}
          >
            This Month
            <span className="text-[9px]">▾</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-4 px-4 pb-5 pt-1">
          <div>
            <div className="text-[10.5px]" style={{ color: T.text2 }}>Total Revenue</div>
            <div className="mt-1 text-[26px] font-semibold tracking-[-0.02em]" style={{ color: T.text }}>
              <AnimatedNumber value={28450} prefix="$" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: "rgba(16,185,129,0.12)", color: "#34D399" }}
              >
                ↑ <AnimatedNumber value={12.5} decimals={1} suffix="%" />
              </span>
              <span className="text-[10px]" style={{ color: T.text2 }}>vs last month</span>
            </div>

            <div className="my-3.5 h-px w-full" style={{ background: T.border }} />

            <div className="text-[10px]" style={{ color: T.text3 }}>Breakdown</div>
            <ul className="mt-2 space-y-1.5">
              {[
                { label: "Subscriptions", value: 16250, dot: "#A855F7" },
                { label: "Sales", value: 8150, dot: "#2563EB" },
                { label: "Tips", value: 4050, dot: "#06B6D4" },
              ].map((r, i) => (
                <motion.li
                  key={r.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.12 }}
                  className="flex items-center justify-between gap-3 text-[11px]"
                >
                  <span className="inline-flex items-center gap-1.5" style={{ color: T.text2 }}>
                    <span className="size-1.5 rounded-full" style={{ background: r.dot }} />
                    {r.label}
                  </span>
                  <span style={{ color: T.text }}>
                    <AnimatedNumber value={r.value} prefix="$" delay={0.7 + i * 0.12} />
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <div className="flex gap-1.5">
              <div className="flex flex-col justify-between py-0.5 text-[8.5px]" style={{ color: T.text3 }}>
                {["32K", "24K", "16K", "8K", "0"].map((t) => <span key={t}>{t}</span>)}
              </div>
              <div className="relative flex-1">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[140px]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="0" x2={w} y1={(i * h) / 4} y2={(i * h) / 4}
                      stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
                  ))}
                  <motion.path
                    d={`${path} L${w},${h} L0,${h} Z`}
                    fill="url(#revFill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 1.2 }}
                  />
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="url(#revLine)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx={w}
                    cy={h - (points[points.length - 1] / max) * h}
                    r={6}
                    fill="#A855F7"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.4, 1], opacity: 1 }}
                    transition={{ duration: 0.6, delay: 2.3 }}
                  />
                </svg>
                <div className="mt-1.5 flex justify-between text-[8.5px]" style={{ color: T.text3 }}>
                  {["May 1", "May 8", "May 15", "May 22", "May 31"].map((d) => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  delay = 0.4,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v: number) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, delay]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("en-US");

  return <span>{prefix}{formatted}{suffix}</span>;
}

