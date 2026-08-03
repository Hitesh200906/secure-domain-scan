import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, ShieldCheck, Zap, Globe as GlobeIcon, Store } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import { T, FeatureCard } from "./NexusCinematicHero";
import { SecurityCard } from "./SecurityCard";
import imgMarketplace from "@/assets/card-marketplace-v7.png.asset.json";
import imgSecurity from "@/assets/card-security-v11.png.asset.json";
import imgRewards from "@/assets/card-rewards-v10.png.asset.json";
import heroDesk from "@/assets/hero-bg-v6.png.asset.json";

export function Hero() {
  const { setMode } = useAppMode();

  return (
    <section className="relative w-full overflow-hidden" style={{ background: T.bg }}>
      {/* ambient background image */}
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
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                  animate={{ scale: [1, 3.2, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="relative inline-flex size-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
              System Online
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="mt-7 leading-[0.95] whitespace-nowrap text-[17px] sm:text-[26px] lg:text-[32px]"
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.02em",
                background: `linear-gradient(180deg, #FFFFFF 0%, #C9D2FF 45%, ${T.blue} 105%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 8px 40px rgba(79,107,255,0.35))",
              }}
            >
              NEXEFY SECURITY
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-5 max-w-xl text-[15px] sm:text-[17px] leading-relaxed"
              style={{ color: T.text2 }}
            >
              Detect vulnerabilities before attackers do. Get detailed, actionable security
              reports powered by AI and industry-leading security methodologies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <button
                onClick={() => setMode("security")}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-[14px] font-medium backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25"
                style={{
                  background: "linear-gradient(180deg,rgba(22,24,32,0.85) 0%,rgba(0,0,0,0.85) 100%)",
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <ShieldCheck className="size-4" />
                Switch to Nexefy Security
                <ArrowUpRight className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={() => setMode("nexus")}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-[14px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(180deg, color-mix(in oklab, ${T.navy} 82%, white) 0%, ${T.navy} 55%, color-mix(in oklab, ${T.navy} 78%, black) 100%)`,
                  border: "none",
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.35), 0 10px 30px -16px ${T.navy}`,
                }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Sparkles className="size-4" />
                Switch to Nexefy
                <ArrowUpRight className="size-4 opacity-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </motion.div>
          </div>

          <SecurityCard />
        </div>

        <div className="mt-20 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          <FeatureCard index={0} image={imgMarketplace.url} fit="contain" title="Marketplace" desc="Launch branded storefronts." />
          <FeatureCard index={1} image={imgSecurity.url} title="Security" desc="AI-powered protection." />
          <FeatureCard index={2} image={imgRewards.url} title="Nexefy Rewards" desc="Earn from the clips you create." />
        </div>

        <div className="mt-16 sm:mt-20">
          <HeroPointsPanel
            points={[
              {
                icon: ScanSearch,
                title: "Continuous Scanning",
                desc: "Automated scans across your apps, APIs and dependencies catch new exposures the moment they appear.",
              },
              {
                icon: Bug,
                title: "Prioritised Findings",
                desc: "Every issue is scored by real impact, so your team fixes what actually matters before anything else.",
              },
              {
                icon: FileCheck,
                title: "Actionable Reports",
                desc: "Clear, shareable reports with reproduction steps and remediation guidance your engineers can ship today.",
              },
              {
                icon: ShieldCheck,
                title: "Security, End to End",
                desc: "Discovery, testing, monitoring, alerting and compliance-ready evidence in one place — one dashboard for your whole estate, with history you can prove.",
              },
            ]}
          />
        </div>

        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.25em]"
          style={{ color: T.text3 }}
        >
          <span className="inline-flex items-center gap-2"><ScanSearch className="size-3.5" /> Continuous Scans</span>
          <span>·</span>
          <span className="inline-flex items-center gap-2"><Zap className="size-3.5" /> Real-Time Alerts</span>
          <span>·</span>
          <span className="inline-flex items-center gap-2"><FileCheck className="size-3.5" /> Detailed Reports</span>
          <span>·</span>
          <span className="inline-flex items-center gap-2"><GlobeIcon className="size-3.5" /> Full-Stack Coverage</span>
        </div>
      </div>
    </section>
  );
}
