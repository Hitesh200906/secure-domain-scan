import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, Layers, Lock, Rocket, ShoppingCart, Users, Shield, BarChart3, TrendingUp } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import heroBgAsset from "@/assets/hero-bg.png.asset.json";

type Orb = {
  key: string;
  label: string;
  icon: typeof ShoppingCart;
  // position in %, relative to the scene box
  top: string;
  left: string;
  delay: number;
};

const ORBS: Orb[] = [
  { key: "marketplace", label: "Marketplace", icon: ShoppingCart, top: "8%",  left: "18%", delay: 0.1 },
  { key: "communities", label: "Communities", icon: Users,        top: "48%", left: "2%",  delay: 0.25 },
  { key: "security",    label: "Security",    icon: Shield,       top: "12%", left: "78%", delay: 0.2 },
  { key: "analytics",   label: "Analytics",   icon: BarChart3,    top: "58%", left: "82%", delay: 0.35 },
];

const FEATURES = [
  { icon: Layers,  title: "All-in-One Platform", desc: "Everything you need in one powerful platform." },
  { icon: Rocket,  title: "Built for Growth",    desc: "Scale your business with the right tools and analytics." },
  { icon: Lock,    title: "Secure by Default",   desc: "Enterprise-grade security to protect what matters." },
  { icon: Zap,     title: "Modern & Fast",       desc: "Built for speed, clarity and the future of internet business." },
];

export function NexusCinematicHero() {
  const { setMode } = useAppMode();

  return (
    <section className="relative w-full bg-black">
      {/* Hero */}
      <div className="relative w-full overflow-hidden pt-24 sm:pt-28 pb-14 sm:pb-20">
        {/* background image — dark & subtle */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBgAsset.url})`,
            filter: "blur(6px) saturate(1) brightness(0.55)",
            opacity: 0.28,
            transform: "scale(1.08)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 40%, rgba(90,36,184,0.18) 0%, rgba(0,0,0,0.75) 55%, #000 100%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />

        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-center min-h-[620px]">
            {/* LEFT — copy */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3.5 py-1.5 text-[12px] text-white/80"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 8px #a78bfa" }} />
                All-in-One Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mt-6 font-semibold tracking-[-0.045em] text-white text-[64px] sm:text-[88px] lg:text-[104px] leading-[0.95]"
              >
                <span
                  style={{
                    backgroundImage: "linear-gradient(180deg, #ffffff 0%, #e9e6ff 55%, #b8a8ff 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  NEXEFY
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="mt-5 h-[3px] w-20 origin-left rounded-full"
                style={{ background: "linear-gradient(90deg, #5A24B8, #1F55F5)" }}
              />

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-6 max-w-md text-white/85 text-lg sm:text-xl font-medium leading-snug"
              >
                The operating system for modern internet business.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                <button
                  onClick={() => setMode("nexus")}
                  className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-white font-medium text-[15px] shadow-[0_10px_40px_-8px_rgba(71,48,216,0.7)] transition hover:brightness-110"
                  style={{ background: "linear-gradient(90deg, #5A24B8 0%, #4730D8 42%, #1F55F5 100%)" }}
                >
                  <Sparkles className="size-4" />
                  Switch to Nexefy
                </button>
                <button
                  onClick={() => setMode("security")}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur px-7 py-3.5 text-white font-medium text-[15px] hover:bg-white/[0.08] transition"
                >
                  <ShieldCheck className="size-4" />
                  Switch to Nexefy Security
                </button>
              </motion.div>
            </div>

            {/* RIGHT — orbital scene */}
            <OrbitalScene />
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="relative bg-black pb-16 sm:pb-24 -mt-2">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  className="shrink-0 grid place-items-center h-12 w-12 rounded-xl border border-white/10"
                  style={{ background: "linear-gradient(135deg, rgba(90,36,184,0.22), rgba(31,85,245,0.08))" }}
                >
                  <f.icon className="size-5" style={{ color: "#b8a8ff" }} />
                </div>
                <div>
                  <div className="text-white font-semibold text-[15px]">{f.title}</div>
                  <div className="text-white/55 text-sm leading-snug mt-1">{f.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function OrbitalScene() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-[440px] sm:h-[520px] lg:h-[580px]"
    >
      {/* orbit rings */}
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        <div className="relative w-[92%] h-[70%]">
          <div className="absolute inset-0 rounded-[50%] border border-white/[0.07]" style={{ transform: "rotateX(68deg)" }} />
          <div className="absolute inset-[10%] rounded-[50%] border border-white/[0.05]" style={{ transform: "rotateX(68deg)" }} />
          <div className="absolute inset-[22%] rounded-[50%] border border-white/[0.04]" style={{ transform: "rotateX(68deg)" }} />
        </div>
      </div>

      {/* central analytics card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[74%] max-w-[440px]"
      >
        <div
          className="relative rounded-2xl border border-white/10 p-5 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(20,14,40,0.88), rgba(6,4,18,0.92))",
            boxShadow: "0 30px 80px -20px rgba(71,48,216,0.35), 0 0 0 1px rgba(255,255,255,0.03) inset",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <span
                className="inline-block h-6 w-6 rounded-md"
                style={{ background: "linear-gradient(135deg,#5A24B8,#1F55F5)" }}
              />
              Nexefy
            </div>
            <div className="text-[10px] text-white/40">Live</div>
          </div>
          <div className="mt-4">
            <div className="text-white/55 text-xs">Total Revenue</div>
            <div className="mt-1 flex items-end gap-3">
              <div className="text-white text-2xl sm:text-3xl font-semibold tracking-tight">$28,450</div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs mb-1">
                <TrendingUp className="size-3" /> 12.5%
              </div>
            </div>
          </div>
          {/* mini chart */}
          <div className="mt-4 h-24 sm:h-28">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#5A9DF5" />
                </linearGradient>
                <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#5A24B8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#5A24B8" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
              ))}
              <path d="M0,78 L40,70 L80,72 L120,55 L160,58 L200,40 L240,32 L300,14" stroke="url(#lineGrad)" strokeWidth="2.2" fill="none" />
              <path d="M0,78 L40,70 L80,72 L120,55 L160,58 L200,40 L240,32 L300,14 L300,100 L0,100 Z" fill="url(#fillGrad)" />
              <circle cx="300" cy="14" r="3.5" fill="#a78bfa" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* orbs */}
      {ORBS.map((o) => (
        <motion.div
          key={o.key}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: o.delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ top: o.top, left: o.left }}
          className="absolute"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-white/10"
              style={{
                background: "linear-gradient(180deg, rgba(30,20,60,0.9), rgba(10,8,24,0.9))",
                boxShadow: "0 20px 40px -18px rgba(90,36,184,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <o.icon className="size-6 sm:size-7" style={{ color: "#b8a8ff" }} />
            </div>
            <div className="text-[11px] sm:text-xs text-white/70">{o.label}</div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
