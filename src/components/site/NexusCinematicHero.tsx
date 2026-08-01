import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, ShieldCheck, Zap, Globe, Store } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import imgMarketplace from "@/assets/card-marketplace-v6.png.asset.json";
import imgSecurity from "@/assets/card-security-v10.png.asset.json";
import imgRewards from "@/assets/card-rewards-v9.png.asset.json";
import heroDesk from "@/assets/hero-bg-v6.png.asset.json";

const T = {
  bg: "#000000",
  card: "#000000",
  border: "#1F232D",
  text: "#F5F7FA",
  text2: "#A8ADBB",
  text3: "#6B7080",
  blue: "#4F6BFF",
  navy: "#000080",

};

export function NexusCinematicHero() {
  const { setMode } = useAppMode();

  return (
    <section className="relative w-full overflow-hidden" style={{ background: T.bg }}>
      {/* ambient background image — blended into navbar above and page below */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${heroDesk.url})`,
            opacity: 0.3,
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 12%, #000 34%, #000 62%, rgba(0,0,0,0.4) 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 12%, #000 34%, #000 62%, rgba(0,0,0,0.4) 88%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>



      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 pt-24 sm:pt-28 pb-20">
        {/* ---------- Two-column top ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
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
              className="mt-7 font-semibold tracking-[-0.05em] leading-[0.9] text-[30px] sm:text-[42px] lg:text-[52px]"
              style={{ color: T.text, textShadow: "0 4px 40px rgba(0,0,0,0.8)" }}
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
              The operating system for modern internet business.
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
                  border: `1px solid color-mix(in oklab, ${T.navy} 70%, white)`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 30px -16px ${T.navy}`,
                }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <ShieldCheck className="size-4" />
                Switch to Nexefy Security
                <ArrowUpRight className="size-4 opacity-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

            </motion.div>
          </div>

          {/* right side — 3D revenue card */}
          <div className="hidden lg:flex justify-center">
            <RevenueCard3D />
          </div>
        </div>

        {/* ---------- Feature cards ---------- */}
        <div className="mt-20 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          <FeatureCard index={0} image={imgMarketplace.url} title="Marketplace" desc="Launch branded storefronts." />
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
}: {
  index: number;
  image: string;
  title: string;
  desc: string;
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
      <div className="relative w-full basis-[80%] grow-0 aspect-[16/9]">
        <img
          src={image}
          alt={`${title} preview`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top"
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

function RevenueCard3D() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25 }}
      className="relative w-full max-w-[440px] [perspective:1400px]"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[26px] p-6 sm:p-7 backdrop-blur-xl"
        style={{
          transform: "rotateX(10deg) rotateY(-14deg) rotateZ(1.5deg)",
          transformStyle: "preserve-3d",
          background: "linear-gradient(160deg, rgba(23,25,31,0.92) 0%, rgba(5,6,10,0.95) 60%, rgba(0,0,0,0.98) 100%)",
          border: `1px solid ${T.border}`,
          boxShadow:
            "0 60px 120px -50px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 80px -50px rgba(79,107,255,0.6)",
        }}
      >
        {/* glossy sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px]"
          style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.06) 0%, transparent 45%)" }}
        />

        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(180deg, ${T.blue} 0%, ${T.navy} 100%)`,
            boxShadow: `0 10px 24px -14px ${T.blue}`,
          }}
        >
          <Sparkles className="size-5 text-white" />
        </div>

        <div className="mt-7 text-[13px]" style={{ color: T.text2 }}>Total Revenue</div>
        <div className="mt-1 text-[38px] font-semibold tracking-tight" style={{ color: T.text }}>
          $28,450
        </div>
        <div
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-medium"
          style={{ background: "rgba(16,185,129,0.12)", color: "#34D399" }}
        >
          <ArrowUpRight className="size-3.5" /> 12.5%
        </div>

        {/* chart */}
        <div className="mt-6 h-[120px] w-full rounded-xl" style={{ border: `1px solid ${T.border}`, background: "rgba(0,0,0,0.5)" }}>
          <svg viewBox="0 0 320 120" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.blue} stopOpacity="0.35" />
                <stop offset="100%" stopColor={T.blue} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hrLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7C5CFF" />
                <stop offset="100%" stopColor="#4F6BFF" />
              </linearGradient>
            </defs>
            <path d="M8 104 L56 88 L96 66 L132 78 L172 54 L212 62 L252 34 L312 14 L312 118 L8 118 Z" fill="url(#hrFill)" />
            <motion.path
              d="M8 104 L56 88 L96 66 L132 78 L172 54 L212 62 L252 34 L312 14"
              fill="none"
              stroke="url(#hrLine)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, delay: 0.6, ease: "easeInOut" }}
            />
            <circle cx="312" cy="14" r="4" fill="#7FB2FF" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}
