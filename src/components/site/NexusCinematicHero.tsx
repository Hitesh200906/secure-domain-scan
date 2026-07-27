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
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[640px]"
    >
      {/* faint orbital ellipses + starry dots */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <ellipse cx="400" cy="320" rx="360" ry="70" fill="none" stroke="rgba(255,255,255,0.06)" />
          <ellipse cx="400" cy="330" rx="300" ry="52" fill="none" stroke="rgba(167,139,250,0.06)" />
        </svg>
        {[
          { t: "6%", l: "12%" },  { t: "10%", l: "62%" }, { t: "22%", l: "92%" },
          { t: "40%", l: "6%" },  { t: "58%", l: "48%" }, { t: "70%", l: "88%" },
          { t: "84%", l: "20%" }, { t: "18%", l: "40%" },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute h-[3px] w-[3px] rounded-full bg-white/40"
            style={{ top: p.t, left: p.l, opacity: 0.35 + (i % 3) * 0.15 }}
          />
        ))}
      </div>

      {/* Corner icon tiles */}
      <IconTile icon={ShoppingCart} label="Marketplace" style={{ top: "6%",  left: "8%"  }} delay={0.15} />
      <IconTile icon={Users}        label="Communities" style={{ top: "42%", left: "2%"  }} delay={0.30} />
      <IconTile icon={Shield}       label="Security"    style={{ top: "8%",  right: "6%" }} delay={0.20} />
      <IconTile icon={BarChart3}    label="Analytics"   style={{ top: "56%", right: "4%" }} delay={0.35} />

      {/* Central analytics card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute left-1/2 top-[14%] -translate-x-1/2 w-[62%] max-w-[460px]"
      >
        <div
          className="relative rounded-2xl border border-white/[0.08] p-5 sm:p-6 overflow-hidden backdrop-blur-md"
          style={{
            background: "linear-gradient(180deg, rgba(18,14,32,0.72), rgba(8,6,18,0.82))",
            boxShadow: "0 30px 80px -24px rgba(90,36,184,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="mb-4">
            <path d="M4 4 L12 14 L20 4 M4 20 L12 10 L20 20" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div className="grid grid-cols-[auto_1fr] gap-x-5 items-end">
            <div>
              <div className="text-white/60 text-[13px]">Total Revenue</div>
              <div className="mt-1 text-white text-[28px] sm:text-[34px] font-semibold tracking-tight leading-none">$28,450</div>
              <div className="mt-3 inline-flex items-center gap-1 text-emerald-400 text-xs">
                <TrendingUp className="size-3" /> 12.5%
              </div>
            </div>

            <div className="h-[110px] sm:h-[120px] min-w-0">
              <svg viewBox="0 0 240 120" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="lineGrad" x1="0" x2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#7c5cf5" />
                  </linearGradient>
                  <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7c5cf5" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#7c5cf5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 30, 60, 90, 120].map((y) => (
                  <line key={"h" + y} x1="0" x2="240" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
                ))}
                {[0, 60, 120, 180, 240].map((x) => (
                  <line key={"v" + x} x1={x} x2={x} y1="0" y2="120" stroke="rgba(255,255,255,0.05)" />
                ))}
                <path
                  d="M0,95 L20,88 L40,92 L60,74 L80,80 L100,60 L120,66 L140,48 L160,52 L180,34 L200,28 L220,18 L240,10"
                  stroke="url(#lineGrad)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d="M0,95 L20,88 L40,92 L60,74 L80,80 L100,60 L120,66 L140,48 L160,52 L180,34 L200,28 L220,18 L240,10 L240,120 L0,120 Z"
                  fill="url(#fillGrad)"
                />
                <circle cx="240" cy="10" r="3.5" fill="#c4b5fd" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Black sphere on podium */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[62%] max-w-[420px]"
      >
        <div
          className="mx-auto h-[46px] w-full rounded-[50%]"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #1a1a1a 0%, #0a0a0a 55%, #050505 100%)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        />
        <div className="relative -mt-[190px] mx-auto w-[62%] aspect-square">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 32% 28%, #2a2a2a 0%, #101010 40%, #050505 75%, #000 100%)",
              boxShadow: "inset -18px -22px 40px rgba(0,0,0,0.9), inset 18px 22px 30px rgba(255,255,255,0.03), 0 30px 70px -20px rgba(0,0,0,0.9)",
            }}
          />
          <div
            className="absolute left-[-14%] right-[-14%] top-1/2 h-[18%] rounded-[50%] border-2"
            style={{
              borderColor: "#1a1a1a",
              transform: "translateY(-50%) rotateX(72deg) rotate(-14deg)",
              boxShadow: "0 6px 18px -6px rgba(0,0,0,0.8)",
            }}
          />
          <span className="absolute left-[-10%] top-1/2 h-3 w-3 rounded-full bg-neutral-800 border border-neutral-700" style={{ transform: "translateY(-50%)" }} />
          <span className="absolute right-[-8%] top-[46%] h-3 w-3 rounded-full bg-neutral-800 border border-neutral-700" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function IconTile({
  icon: Icon,
  label,
  style,
  delay,
}: {
  icon: typeof ShoppingCart;
  label: string;
  style: React.CSSProperties;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
      className="absolute"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <div
          className="grid place-items-center h-[104px] w-[104px] sm:h-[124px] sm:w-[124px] rounded-[22px] border border-white/[0.08]"
          style={{
            background: "linear-gradient(160deg, rgba(24,20,40,0.85) 0%, rgba(10,8,20,0.9) 60%, rgba(6,4,14,0.95) 100%)",
            boxShadow: "0 24px 50px -22px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <Icon className="size-8 sm:size-9" strokeWidth={1.6} style={{ color: "#a78bfa" }} />
            <div className="text-white/85 text-[13px] sm:text-sm">{label}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
