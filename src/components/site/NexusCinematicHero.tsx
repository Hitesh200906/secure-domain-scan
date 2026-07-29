import { motion } from "framer-motion";
import {
  ShoppingCart,
  Users,
  Shield,
  BarChart3,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
  Globe,
  Layers,
} from "lucide-react";
import { useAppMode } from "@/lib/app-mode";

/* ---------- Design tokens (scoped to hero) ---------- */
const T = {
  bg: "#05060A",
  bg2: "#0A0C12",
  card: "#111216",
  cardHi: "#17191F",
  border: "#2A2D36",
  borderHi: "#4A3B8C",
  text: "#F8FAFC",
  text2: "#B6BAC6",
  text3: "#8B90A0",
  primary: "#4F6BFF",
  primaryHi: "#6281FF",
  purple: "#8B5CF6",
  purpleLight: "#A855F7",
  purpleDim: "#6D48E5",
  success: "#34D399",
  planet: "#1B1C20",
  planetShadow: "#090A0D",
  planetHi: "#3A3B40",
  platform: "#15161A",
  chartGrid: "#242833",
  glass: "rgba(255,255,255,0.03)",
};

export function NexusCinematicHero() {
  const { setMode } = useAppMode();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: T.bg }}
    >
      {/* Ambient background glows */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full"
          style={{ background: T.primary, opacity: 0.12, filter: "blur(120px)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[560px] h-[560px] rounded-full"
          style={{ background: T.purple, opacity: 0.10, filter: "blur(150px)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 50%, transparent 65%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-[42%_58%] gap-12 lg:gap-8 items-center min-h-[640px]">
          <HeroCopy onNexefy={() => setMode("nexus")} onSecurity={() => setMode("security")} />
          <div className="relative w-full">
            <OrbitalScene />
          </div>
        </div>

        {/* Bottom feature cards */}
        <BottomFeatures />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* LEFT SIDE                                                           */
/* ------------------------------------------------------------------ */
function HeroCopy({ onNexefy, onSecurity }: { onNexefy: () => void; onSecurity: () => void }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px]"
        style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text2 }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: T.purple, boxShadow: `0 0 10px ${T.purple}` }}
        />
        All-in-One Business Platform
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.08 }}
        className="mt-8 font-semibold tracking-[-0.05em] leading-[0.92] text-[64px] sm:text-[84px] lg:text-[96px]"
        style={{ color: T.text }}
      >
        <span className="block">Build.</span>
        <span className="block">Sell.</span>
        <span
          className="block"
          style={{
            background: `linear-gradient(180deg, #FFFFFF 0%, ${T.purple} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Scale.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="mt-7 max-w-[460px] text-[16px] sm:text-[17px] leading-relaxed"
        style={{ color: T.text2 }}
      >
        Nexefy is the operating system for modern internet business — where
        creators, brands and communities launch, manage and scale everything
        from a single elegant platform.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <button
          onClick={onNexefy}
          className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: T.primary,
            boxShadow: "0 12px 32px -12px rgba(79,107,255,0.6)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.primaryHi)}
          onMouseLeave={(e) => (e.currentTarget.style.background = T.primary)}
        >
          <Sparkles className="size-4" />
          Switch to Nexefy
          <ArrowUpRight className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          onClick={onSecurity}
          className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-medium transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: T.text,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.borderHi)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
        >
          <ShieldCheck className="size-4" style={{ color: T.text2 }} />
          Switch to Nexefy Security
        </button>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RIGHT — Orbital scene with sphere + floating cards                  */
/* ------------------------------------------------------------------ */
function OrbitalScene() {
  return (
    <div className="relative w-full h-[560px] sm:h-[620px] lg:h-[660px]">
      {/* Ambient purple glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 40% at 55% 60%, rgba(139,92,246,0.14) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Faint orbit ellipses behind everything */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 660"
        preserveAspectRatio="none"
      >
        <ellipse cx="400" cy="340" rx="360" ry="80" stroke="rgba(139,92,246,0.14)" strokeWidth="1" fill="none" />
        <ellipse cx="400" cy="360" rx="300" ry="55" stroke="rgba(139,92,246,0.10)" strokeWidth="1" fill="none" />
      </svg>

      {/* Corner icon tiles */}
      <FloatTile
        className="absolute left-[4%] top-[8%]"
        icon={<ShoppingCart className="size-8" style={{ color: T.purple }} strokeWidth={1.75} />}
        label="Marketplace"
        delay={0}
      />
      <FloatTile
        className="absolute right-[4%] top-[10%]"
        icon={<Shield className="size-8" style={{ color: T.purple }} strokeWidth={1.75} />}
        label="Security"
        delay={0.5}
      />
      <FloatTile
        className="absolute left-[6%] bottom-[22%]"
        icon={<Users className="size-8" style={{ color: T.purple }} strokeWidth={1.75} />}
        label="Communities"
        delay={1}
      />
      <FloatTile
        className="absolute right-[6%] bottom-[18%]"
        icon={<BarChart3 className="size-8" style={{ color: T.purple }} strokeWidth={1.75} />}
        label="Analytics"
        delay={1.5}
      />

      {/* Center revenue panel */}
      <RevenuePanel />

      {/* Sphere with orbit + podium */}
      <SpherePodium />
    </div>
  );
}

/* ---------- Floating corner tile ---------- */
function FloatTile({
  className,
  icon,
  label,
  delay = 0,
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.8, delay: 0.2 + delay * 0.15 },
        y: { duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={className}
    >
      <div
        className="flex flex-col items-center justify-center gap-3 w-[130px] h-[130px] rounded-[22px]"
        style={{
          background: `linear-gradient(160deg, ${T.card} 0%, ${T.bg2} 100%)`,
          border: `1px solid ${T.border}`,
          boxShadow:
            "0 20px 50px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {icon}
        <span className="text-[13px]" style={{ color: T.text }}>
          {label}
        </span>
      </div>
    </motion.div>
  );
}

/* ---------- Revenue panel (center top) ---------- */
function RevenuePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { duration: 0.9, delay: 0.3 },
        y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute left-1/2 top-[6%] -translate-x-1/2 w-[62%] max-w-[440px]"
    >
      <div
        className="rounded-[20px] px-5 py-4"
        style={{
          background: `linear-gradient(160deg, rgba(20,20,28,0.9) 0%, rgba(12,12,18,0.9) 100%)`,
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(12px)",
          boxShadow:
            "0 30px 60px -25px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo mark */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mb-3">
          <path d="M4 20 L4 4 L12 14 L20 4 L20 20" stroke={T.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="grid grid-cols-[auto_1fr] gap-4 items-end">
          <div>
            <div className="text-[12px]" style={{ color: T.text2 }}>Total Revenue</div>
            <div className="mt-1 text-[26px] font-semibold" style={{ color: T.text }}>
              $28,450
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px]" style={{ color: T.success }}>
              <span>↑ 12.5%</span>
            </div>
          </div>
          <MiniChart />
        </div>
      </div>
    </motion.div>
  );
}

function MiniChart() {
  return (
    <svg viewBox="0 0 220 90" className="w-full h-[80px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.purple} stopOpacity="0.35" />
          <stop offset="100%" stopColor={T.purple} stopOpacity="0" />
        </linearGradient>
        <pattern id="grid" width="22" height="18" patternUnits="userSpaceOnUse">
          <path d="M 22 0 L 0 0 0 18" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="220" height="90" fill="url(#grid)" />
      <path
        d="M0,70 L20,62 L40,66 L60,54 L80,58 L100,44 L120,48 L140,34 L160,38 L180,24 L200,18 L220,8"
        fill="none"
        stroke={T.purple}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0,70 L20,62 L40,66 L60,54 L80,58 L100,44 L120,48 L140,34 L160,38 L180,24 L200,18 L220,8 L220,90 L0,90 Z"
        fill="url(#chartFill)"
      />
      <circle cx="220" cy="8" r="3" fill={T.purple} />
    </svg>
  );
}

/* ---------- Sphere + orbit ring on podium ---------- */
function SpherePodium() {
  return (
    <div className="absolute left-1/2 bottom-[6%] -translate-x-1/2 w-[360px] h-[280px]">
      {/* Podium */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[320px] h-[54px] rounded-[50%]"
        style={{
          background:
            "radial-gradient(closest-side, #1a1a22 0%, #0d0d12 70%, transparent 100%)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
        }}
      />
      <div
        className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[260px] h-[30px] rounded-[50%]"
        style={{
          background:
            "radial-gradient(closest-side, #22222c 0%, #14141a 70%, transparent 100%)",
        }}
      />

      {/* Sphere */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 bottom-[42px] -translate-x-1/2"
      >
        <div className="relative w-[180px] h-[180px]">
          {/* sphere */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #2a2a34 0%, #16161c 40%, #08080b 80%)",
              boxShadow:
                "inset -20px -30px 60px rgba(0,0,0,0.9), inset 15px 15px 40px rgba(139,92,246,0.05), 0 30px 60px -20px rgba(0,0,0,0.9)",
            }}
          />
          {/* subtle rim highlight */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.06) 0%, transparent 30%)",
            }}
          />

          {/* Orbit ring around sphere */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[70px] rounded-[50%] pointer-events-none"
            style={{
              border: "1.5px solid rgba(180,180,200,0.35)",
              transform: "translate(-50%,-50%) rotate(-14deg)",
              boxShadow: "0 0 20px rgba(139,92,246,0.15)",
            }}
          />
          {/* orbit satellites */}
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: "#2a2a34",
              border: "1px solid rgba(255,255,255,0.2)",
              left: "-14px",
              top: "58%",
              boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
            }}
          />
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: "#2a2a34",
              border: "1px solid rgba(255,255,255,0.2)",
              right: "-10px",
              top: "38%",
              boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BOTTOM feature cards                                                */
/* ------------------------------------------------------------------ */
function BottomFeatures() {
  const items = [
    {
      icon: Store,
      title: "Launch a Store",
      desc: "Set up branded storefronts in minutes with products, payments and payouts.",
    },
    {
      icon: Users,
      title: "Grow Communities",
      desc: "Chats, forums, memberships and events — everything in one place.",
    },
    {
      icon: Zap,
      title: "Automate Workflows",
      desc: "Powerful automations connect your store, community and analytics.",
    },
    {
      icon: Globe,
      title: "Scale Globally",
      desc: "Multi-currency, global CDN and enterprise-grade infrastructure.",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(160deg, ${T.card} 0%, ${T.bg2} 100%)`,
            border: `1px solid ${T.border}`,
            boxShadow: "0 20px 40px -25px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="grid place-items-center h-10 w-10 rounded-xl"
            style={{
              background: "rgba(139,92,246,0.10)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <it.icon className="size-5" style={{ color: T.purple }} />
          </div>
          <div className="mt-4 text-[15px] font-semibold" style={{ color: T.text }}>
            {it.title}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: T.text2 }}>
            {it.desc}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

// Keep referenced symbol to prevent tree-shake surprises in dev
void Layers;
