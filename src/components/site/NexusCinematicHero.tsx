import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, Layers, Target, Lock } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import heroBgAsset from "@/assets/hero-bg.png.asset.json";
import iconMarketplace from "@/assets/icon-marketplace.png";
import iconCommunities from "@/assets/icon-communities.png";
import iconSecurity from "@/assets/icon-security.png";
import iconBusiness from "@/assets/icon-business.png";

type Corner = {
  key: string;
  label: string;
  sub: string;
  image: string;
  dot: string;
  side: "left" | "right";
  top: boolean;
};

const CORNERS: Corner[] = [
  { key: "marketplace", label: "Marketplace", sub: "Sell anything online", image: iconMarketplace, dot: "#a78bfa", side: "left", top: true },
  { key: "security", label: "Security", sub: "Enterprise grade", image: iconSecurity, dot: "#38bdf8", side: "left", top: false },
  { key: "communities", label: "Communities", sub: "Grow together", image: iconCommunities, dot: "#a78bfa", side: "right", top: true },
  { key: "business", label: "Business", sub: "Manage & grow", image: iconBusiness, dot: "#38bdf8", side: "right", top: false },
];

function CornerCard({ c, delay }: { c: Corner; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-4"
    >
      <motion.img
        src={c.image}
        alt={c.label}
        draggable={false}
        className="h-40 w-40 sm:h-52 sm:w-52 object-contain select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      />
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-5 py-3 min-w-[180px] text-center">
        <div className="flex items-center justify-center gap-2 text-white font-semibold">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />
          {c.label}
        </div>
        <div className="text-xs text-white/50 mt-0.5">{c.sub}</div>
      </div>
    </motion.div>
  );
}

const FEATURES = [
  { icon: Zap, title: "All-in-One Platform", desc: "Everything you need in one place.", color: "#a78bfa" },
  { icon: Layers, title: "Built for Growth", desc: "Scale your business with powerful tools.", color: "#60a5fa" },
  { icon: Target, title: "Modern & Fast", desc: "Blazing fast experience built for the future.", color: "#a78bfa" },
  { icon: Lock, title: "Secure by Default", desc: "Enterprise-grade security you can trust.", color: "#60a5fa" },
];

export function NexusCinematicHero() {
  const { setMode } = useAppMode();

  return (
    <section className="relative w-full bg-black">
      <div className="relative w-full overflow-hidden pt-24 sm:pt-28 pb-10">
        {/* background image (unchanged) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBgAsset.url})`,
            filter: "blur(4px) saturate(1) brightness(0.85)",
            opacity: 0.6,
            transform: "scale(1.08)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.85) 100%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 sm:h-72" style={{ background: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0) 100%)" }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />

        <div className="relative mx-auto max-w-[1500px] px-4 sm:px-8">
          {/* Desktop grid: 4 corner icons + center content */}
          <div className="hidden lg:grid grid-cols-[minmax(220px,1fr)_minmax(520px,720px)_minmax(220px,1fr)] gap-8 items-center min-h-[720px]">
            {/* left column */}
            <div className="flex flex-col items-center justify-between gap-16 py-8">
              <CornerCard c={CORNERS[0]} delay={0.1} />
              <CornerCard c={CORNERS[1]} delay={0.3} />
            </div>

            {/* center */}
            <CenterContent onNexus={() => setMode("nexus")} onSecurity={() => setMode("security")} />

            {/* right column */}
            <div className="flex flex-col items-center justify-between gap-16 py-8">
              <CornerCard c={CORNERS[2]} delay={0.2} />
              <CornerCard c={CORNERS[3]} delay={0.4} />
            </div>
          </div>

          {/* Mobile/tablet stacked */}
          <div className="lg:hidden">
            <CenterContent onNexus={() => setMode("nexus")} onSecurity={() => setMode("security")} />
            <div className="mt-10 grid grid-cols-2 gap-6">
              {CORNERS.map((c, i) => (
                <CornerCard key={c.key} c={c} delay={0.1 + i * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="relative bg-black pb-16 sm:pb-20 -mt-4">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8"
          >
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  className="shrink-0 grid place-items-center h-12 w-12 rounded-xl border border-white/10"
                  style={{ background: `linear-gradient(135deg, ${f.color}22, ${f.color}08)` }}
                >
                  <f.icon className="size-5" style={{ color: f.color }} />
                </div>
                <div>
                  <div className="text-white font-semibold text-[15px]">{f.title}</div>
                  <div className="text-white/55 text-sm leading-snug mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CenterContent({ onNexus, onSecurity }: { onNexus: () => void; onSecurity: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-6 lg:py-0">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white font-semibold tracking-[-0.03em] text-5xl sm:text-6xl lg:text-7xl leading-[1.05]"
      >
        Build. Sell. Scale.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="mt-5 text-lg sm:text-xl text-white font-medium"
      >
        The operating system for internet business.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="mt-5 max-w-xl text-white/70 leading-relaxed text-[15px] sm:text-base"
      >
        Launch digital stores, build thriving communities, sell products, manage members and automate everything from one powerful platform.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-3"
      >
        <button
          onClick={onNexus}
          className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-white font-medium text-[15px] shadow-[0_10px_40px_-8px_rgba(71,48,216,0.7)] transition hover:brightness-110"
          style={{ background: "linear-gradient(90deg, #5A24B8 0%, #4730D8 42%, #1F55F5 100%)" }}
        >
          <Sparkles className="size-4" />
          Switch to Nexefy
        </button>
        <button
          onClick={onSecurity}
          className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md px-7 py-3.5 text-white font-medium text-[15px] hover:bg-white/[0.06] transition"
        >
          <ShieldCheck className="size-4" />
          Switch to Nexefy Security
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-6 inline-flex items-center gap-2 text-white/55 text-sm"
      >
        <ShieldCheck className="size-4" />
        Trusted by creators and businesses worldwide
      </motion.div>
    </div>
  );
}
