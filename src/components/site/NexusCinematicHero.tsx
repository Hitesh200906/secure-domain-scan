import { motion } from "framer-motion";
import {
  ShoppingBag,
  Users,
  ShieldCheck,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  Zap,
  Globe,
  Store,
} from "lucide-react";
import { useAppMode } from "@/lib/app-mode";

/* ---------- Design tokens ---------- */
const T = {
  bg: "#05060A",
  bg2: "#0A0C12",
  card: "#0E1016",
  cardHi: "#14171F",
  border: "#1F232D",
  borderHi: "#2A2F3B",
  text: "#F5F7FA",
  text2: "#A8ADBB",
  text3: "#6B7080",
  // Muted accent colors (used sparingly, one per card)
  accentBlue: "#3B82F6",
  accentViolet: "#8B5CF6",
  accentEmerald: "#10B981",
  accentAmber: "#F59E0B",
  accentRose: "#F43F5E",
};

export function NexusCinematicHero() {
  const { setMode } = useAppMode();

  return (
    <section className="relative w-full overflow-hidden" style={{ background: T.bg }}>
      {/* Ambient background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full"
          style={{ background: T.accentBlue, opacity: 0.08, filter: "blur(140px)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[560px] h-[560px] rounded-full"
          style={{ background: T.accentViolet, opacity: 0.07, filter: "blur(150px)" }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 pt-24 sm:pt-28 pb-20">
        {/* ---------- Copy block ---------- */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em]"
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              color: T.text2,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: T.accentBlue, boxShadow: `0 0 10px ${T.accentBlue}` }}
            />
            All-in-One Business Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="mt-7 font-semibold tracking-[-0.05em] leading-[0.9] text-[64px] sm:text-[92px] lg:text-[112px]"
            style={{ color: T.text }}
          >
            NEXEFY
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 mx-auto max-w-xl text-[15px] sm:text-[17px] leading-relaxed"
            style={{ color: T.text2 }}
          >
            The operating system for modern internet business.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => setMode("nexus")}
              className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(180deg, ${T.accentBlue} 0%, #2857D6 100%)`,
                boxShadow: `0 12px 32px -12px ${T.accentBlue}80`,
              }}
            >
              <Sparkles className="size-4" />
              Switch to Nexefy
              <ArrowUpRight className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <button
              onClick={() => setMode("security")}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-medium transition-all duration-200"
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                color: T.text,
              }}
            >
              <ShieldCheck className="size-4" style={{ color: T.accentEmerald }} />
              Switch to Nexefy Security
            </button>
          </motion.div>
        </div>

        {/* ---------- 3D object cards ---------- */}
        <div className="mt-20 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Object3DCard
            index={0}
            icon={ShoppingBag}
            title="Marketplace"
            desc="Launch branded storefronts."
            accent={T.accentBlue}
          />
          <Object3DCard
            index={1}
            icon={Users}
            title="Communities"
            desc="Chats, forums & memberships."
            accent={T.accentViolet}
          />
          <Object3DCard
            index={2}
            icon={ShieldCheck}
            title="Security"
            desc="AI-powered protection."
            accent={T.accentEmerald}
          />
          <Object3DCard
            index={3}
            icon={BarChart3}
            title="Analytics"
            desc="Real-time revenue insights."
            accent={T.accentAmber}
          />
        </div>

        {/* ---------- Bottom feature strip ---------- */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.25em]"
          style={{ color: T.text3 }}>
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

/* ---------- 3D-style object card ---------- */
function Object3DCard({
  index,
  icon: Icon,
  title,
  desc,
  accent,
}: {
  index: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl p-6 overflow-hidden transition-colors"
      style={{
        background: `linear-gradient(160deg, ${T.card} 0%, ${T.bg2} 100%)`,
        border: `1px solid ${T.border}`,
        boxShadow:
          "0 30px 60px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* corner accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-40 group-hover:opacity-60 transition-opacity"
        style={{ background: accent, filter: "blur(60px)" }}
      />

      {/* 3D floating object (icon on stacked plates) */}
      <div className="relative h-[130px] flex items-center justify-center">
        {/* podium */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-[26px] rounded-[50%]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        {/* rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute w-[120px] h-[120px] rounded-full"
          style={{
            border: `1px dashed ${T.borderHi}`,
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          }}
        />
        {/* floating cube */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 5 + index * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.3,
          }}
          className="relative"
        >
          <div
            className="grid place-items-center w-[72px] h-[72px] rounded-2xl"
            style={{
              background: `linear-gradient(145deg, ${T.cardHi} 0%, ${T.bg} 100%)`,
              border: `1px solid ${T.borderHi}`,
              boxShadow: `0 18px 40px -12px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.6)`,
            }}
          >
            <Icon className="size-8" style={{ color: accent }} strokeWidth={1.6} />
          </div>
          {/* rim highlight */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 40%)",
            }}
          />
        </motion.div>
      </div>

      <div className="mt-5">
        <div className="text-[15px] font-semibold" style={{ color: T.text }}>
          {title}
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: T.text2 }}>
          {desc}
        </p>
      </div>

      {/* bottom accent line */}
      <div
        className="mt-5 h-px w-full opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
        }}
      />
    </motion.div>
  );
}
